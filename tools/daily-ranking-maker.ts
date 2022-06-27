import { prisma } from "@/database";
import { createDiscordRestClient } from "@/discord";
import {
  Circles,
  DateFormats,
  Guild,
  LocalDate,
  monthCircleStateLabel,
  nextMonthInt,
  thisMonthInt,
  ZonedDateTime,
} from "@/model";
import type { Member, MemberFanCount, MonthCircle } from "@prisma/client";
import { CircleKey, CircleRole } from "@prisma/client";
import { stringify } from "csv-stringify/sync";
import { Routes } from "discord-api-types/v9";
import { config } from "dotenv";

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

  const groupBy = await prisma.memberFanCount.groupBy({
    _max: {
      date: true,
    },
    by: ["circleKey"],
    where: {
      date: {
        gte: LocalDate.firstDayOfThisMonth().toUTCDate(),
        lt: LocalDate.firstDayOfNextMonth().toUTCDate(),
      },
    },
  });

  let memberFanCounts: Array<MemberFanCount & {
    member: (Member & { monthCircles: Array<MonthCircle> }) | null;
  }> = [];
  const circleToUpdatedAt: Record<CircleKey, LocalDate | null> = {
    Saikyo: null,
    Shin: null,
    Ha: null,
    Jo: null,
  };
  for (const group of groupBy) {
    const date = group._max.date;
    const circleKey = group.circleKey;
    if (!date) {
      continue;
    }

    circleToUpdatedAt[circleKey] = LocalDate.fromUTCDate(date);

    if (!useMonthSurveyAnswer && circleKey == CircleKey.Saikyo) {
      continue;
    }

    const fanCounts = await prisma.memberFanCount.findMany({
      where: {
        date,
        circleKey,
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
    memberFanCounts.push(...fanCounts.filter(fanCount => {
      const state = fanCount.member?.monthCircles.at(0)?.state;
      return !useMonthSurveyAnswer || state == "Shin" || state == "Ha";
    }));
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
              updatedAt ? updatedAt.format(DateFormats.ymd) : "更新なし"
            }`;
          })
          .join("\n"),
    },
    files: [
      {
        name: "ranking.csv",
        data: Buffer.from(
          stringify([
            [
              "順位",
              "ランキング制対象内順位",
              "トレーナー名",
              "メンバー情報不明",
              "現在のサークル",
              "月間獲得ファン数",
              "来月のサークル(確定)",
            ],
            ...memberFanCounts
              //TODO: int
              .sort((a, b) => parseInt(((b.monthlyAvg ?? 0n) - (a.monthlyAvg ?? 0n)).toString()))
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
                  fanCount.member?.name ?? fanCount.parsedName,
                  fanCount.member == null,
                  Circles.findByCircleKey(fanCount.circleKey).name,
                  // TODO: 予測ファン数に戻す
                  fanCount.monthlyTotal?.toString(),
                  monthCircleState
                    ? monthCircleStateLabel(monthCircleState)
                    : "未確定",
                ];
              }),
          ]),
          "utf-8",
        ),
      },
    ],
  });
})();
