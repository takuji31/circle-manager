import { Circles } from './../model/circle';
import { config } from 'dotenv';
import { prisma } from '../database';
import { Guild, JST, nextMonth, nextMonthInt, thisMonth } from '../model';
import { stringify } from 'csv-stringify/sync';
import { createDiscordRestClient } from '../discord';
import { Routes } from 'discord-api-types/v9';
import { Temporal } from 'proposal-temporal';
import {
  CircleKey,
  CircleRole,
  Member,
  MemberFanCount,
  MonthCircle,
  MonthCircleState,
  MonthSurveyAnswerValue,
} from '@prisma/client';
import { toPlainDate } from '../model/date';
import { monthCircleStateLabel } from '../model/month_circle';

config();

(async () => {
  const { year, month } = thisMonth();
  const { year: nextMonthYear, month: nextMonthMonth } = nextMonthInt();

  const today = Temporal.now.plainDateISO(JST);

  const monthSurvey = await prisma.monthSurvey.findFirst({
    where: { year: nextMonthYear.toString(), month: nextMonthMonth.toString() },
  });

  const useMonthSurveyAnswer =
    monthSurvey != null &&
    Temporal.PlainDate.compare(today, toPlainDate(monthSurvey.expiredAt)) > 0;

  const groupBy = await prisma.memberFanCount.groupBy({
    _max: {
      date: true,
    },
    by: ['circle'],
    where: {
      date: {
        gte: new Date(
          Temporal.PlainDate.from({
            year: parseInt(year),
            month: parseInt(month),
            day: 1,
          }).toString()
        ),
        lt: new Date(
          Temporal.PlainDate.from({
            year: nextMonthYear,
            month: nextMonthMonth,
            day: 1,
          }).toString()
        ),
      },
    },
  });

  let memberFanCounts: Array<
    MemberFanCount & {
      member: (Member & { monthCircles: Array<MonthCircle> }) | null;
    }
  > = [];
  const circleToUpdatedAt: Record<CircleKey, Temporal.PlainDate | null> = {
    Saikyo: null,
    Shin: null,
    Ha: null,
    Jo: null,
  };
  for (const group of groupBy) {
    const date = group._max.date;
    const circle = group.circle;
    if (!date) {
      continue;
    }

    const updatedAt = Temporal.PlainDate.from({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    });
    circleToUpdatedAt[circle] = updatedAt;

    if (!useMonthSurveyAnswer && circle == CircleKey.Saikyo) {
      continue;
    }

    const fanCounts = await prisma.memberFanCount.findMany({
      where: {
        date,
        circle,
        ...(useMonthSurveyAnswer
          ? {
              member: {
                MonthSurveyAnswer: {
                  some: {
                    year: nextMonthYear.toString(),
                    month: nextMonthMonth.toString(),
                    value: MonthSurveyAnswerValue.Umamusume,
                  },
                },
              },
            }
          : {}),
      },
      include: {
        member: {
          include: {
            monthCircles: {
              where: {
                year: nextMonthYear,
                month: nextMonthMonth,
              },
              take: 1,
            },
          },
        },
      },
    });
    memberFanCounts.push(...fanCounts);
  }

  const rest = createDiscordRestClient();

  let rankingNumber = 1;
  await rest.post(Routes.channelMessages(Guild.channelIds.admin), {
    body: {
      content:
        `${year}年${month}月のランキング\n\n各サークルの最終更新日` +
        Object.entries(circleToUpdatedAt)
          .map((entry) => {
            const [key, updatedAt] = entry;
            return `${Circles.findByCircleKey(key as CircleKey).name} : ${
              updatedAt ? updatedAt.toLocaleString('ja-JP') : '更新なし'
            }`;
          })
          .join('\n'),
    },
    attachments: [
      {
        fileName: 'ranking.csv',
        rawBuffer: Buffer.from(
          stringify([
            [
              '順位',
              'ランキング制対象内順位',
              'トレーナー名',
              'メンバー情報不明',
              '現在のサークル',
              '予測ファン数',
              '来月のサークル(確定)',
            ],
            ...memberFanCounts
              //TODO: int
              .sort((a, b) => parseInt((b.predicted - a.predicted).toString()))
              .map((fanCount, idx) => {
                let ranking: number;
                if (fanCount.member?.circleRole == CircleRole.Leader) {
                  ranking = 0;
                } else {
                  ranking = rankingNumber++;
                }
                const monthCircleState = fanCount.member?.monthCircles[0].state;
                return [
                  idx + 1,
                  ranking,
                  fanCount.member?.name ?? fanCount.name,
                  fanCount.member == null,
                  Circles.findByCircleKey(fanCount.circle).name,
                  fanCount.predicted.toString(),
                  monthCircleState
                    ? monthCircleStateLabel(monthCircleState)
                    : '未確定',
                ];
              }),
          ]),
          'utf-8'
        ),
      },
    ],
  });
})();
