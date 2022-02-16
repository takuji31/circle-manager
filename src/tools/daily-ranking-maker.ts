import { Circles } from './../model/circle';
import { config } from 'dotenv';
import { prisma } from '../database';
import { Guild, nextMonthInt, thisMonth } from '../model';
import { stringify } from 'csv-stringify/sync';
import { createDiscordRestClient } from '../discord';
import { Routes } from 'discord-api-types/v9';
import {
  CircleKey,
  CircleRole,
  Member,
  MemberFanCount,
  MonthCircle,
  MonthSurveyAnswerValue,
} from '@prisma/client';
import { monthCircleStateLabel } from '../model/month_circle';
import { dayjs } from '../model/date';
import { Dayjs } from 'dayjs';

config();

(async () => {
  const { year, month } = thisMonth();
  const nextMonth = nextMonthInt();

  const monthSurvey = await prisma.monthSurvey.findFirst({
    where: nextMonth,
  });

  const now = dayjs();
  const useMonthSurveyAnswer =
    monthSurvey != null && now.isAfter(monthSurvey.expiredAt);

  const groupBy = await prisma.memberFanCount.groupBy({
    _max: {
      date: true,
    },
    by: ['circle'],
    where: {
      date: {
        gte: now.startOf('month').toDate(),
        lt: now
          .startOf('month')
          .add(dayjs.duration({ months: 1 }))
          .toDate(),
      },
    },
  });

  let memberFanCounts: Array<
    MemberFanCount & {
      member: (Member & { monthCircles: Array<MonthCircle> }) | null;
    }
  > = [];
  const circleToUpdatedAt: Record<CircleKey, Dayjs | null> = {
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

    circleToUpdatedAt[circle] = dayjs(date);

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
                monthSurveyAnswer: {
                  some: {
                    ...nextMonth,
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
              where: nextMonth,
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
              updatedAt ? updatedAt.format('L') : '更新なし'
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
                const monthCircleState =
                  fanCount.member?.monthCircles[0]?.state;
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
