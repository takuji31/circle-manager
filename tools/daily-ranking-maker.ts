import { Circles } from '@/model';
import { config } from 'dotenv';
import { prisma } from '@/database';
import {
  Guild,
  nextMonthInt,
  thisMonthInt,
} from '@/model';
import { stringify } from 'csv-stringify/sync';
import { createDiscordRestClient } from '@/discord';
import { Routes } from 'discord-api-types/v9';
import {
  CircleKey,
  CircleRole,
  Member,
  UmastagramMemberFanCount,
  MonthCircle,
  MonthSurveyAnswerValue,
} from '@prisma/client';
import { monthCircleStateLabel } from '@/model';
import {
  LocalDate,
  ZonedDateTime,
  DateFormats,
} from '@/model';

config();

(async () => {
  const { year, month } = thisMonthInt();
  const nextMonth = nextMonthInt();

  const monthSurvey = await prisma.monthSurvey.findFirst({
    where: nextMonth,
  });

  const now = ZonedDateTime.nowJST();
  const useMonthSurveyAnswer =
    monthSurvey != null &&
    now.isAfter(ZonedDateTime.fromDate(monthSurvey.expiredAt));

  const groupBy = await prisma.umastagramMemberFanCount.groupBy({
    _max: {
      date: true,
    },
    by: ['circle'],
    where: {
      date: {
        gte: LocalDate.firstDayOfThisMonth().toUTCDate(),
        lt: LocalDate.firstDayOfNextMonth().toUTCDate(),
      },
    },
  });

  let memberFanCounts: Array<
    UmastagramMemberFanCount & {
      member: (Member & { monthCircles: Array<MonthCircle> }) | null;
    }
  > = [];
  const circleToUpdatedAt: Record<CircleKey, LocalDate | null> = {
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

    circleToUpdatedAt[circle] = LocalDate.fromUTCDate(date);

    if (!useMonthSurveyAnswer && circle == CircleKey.Saikyo) {
      continue;
    }

    const fanCounts = await prisma.umastagramMemberFanCount.findMany({
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
          .filter((entry) => entry[1] != null)
          .map((entry) => {
            const [key, updatedAt] = entry;
            return `${Circles.findByCircleKey(key as CircleKey).name} : ${
              updatedAt ? updatedAt.format(DateFormats.ymd) : '更新なし'
            }`;
          })
          .join('\n'),
    },
    files: [
      {
        name: 'ranking.csv',
        data: Buffer.from(
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
              .sort((a, b) => parseInt((b.avg - a.avg).toString()))
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
