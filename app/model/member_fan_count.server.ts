import { sendMessageToChannel } from "@/discord";
import { Circles, DateFormats, LocalDate, Period, TemporalAdjusters } from "@/model";
import { DateTimeFormatter } from "@js-joda/core";
import type { CircleKey } from "@prisma/client";
import { MemberFanCountSource } from "@prisma/client";
import type { ChartData } from "chart.js";
import _ from "lodash";
import { prisma } from "~/db.server";
import type { ActiveCircleKey } from "~/schema/member";
import { getDatesFrom } from "./date.server";
import { getCircleMembers } from "./member.server";

export async function getCircleFanCount({
  date,
  circleKey,
}: {
  date: LocalDate;
  circleKey: CircleKey;
}) {
  return await prisma.circleFanCount
    .findFirst({
      where: { date: date.toUTCDate(), circleKey },
    })
    .then((circleFanCount) => {
      if (!circleFanCount) {
        return null;
      } else {
        const { total, avg, predicted, predictedAvg, ...c } = circleFanCount;
        return {
          ...c,
          total: parseInt(total.toString()),
          avg: parseInt(avg.toString()),
          predicted: parseInt(predicted.toString()),
          predictedAvg: parseInt(predictedAvg.toString()),
        };
      }
    });
}

export async function getCircleFanCountGraph({
  date,
  circleKey,
}: {
  date: LocalDate;
  circleKey: CircleKey;
}) {
  const firstDayOfMonth = date.firstDayOfMonth();
  const lastDayOfPreviousMonth = firstDayOfMonth.minusDays(1);
  const circleFanCount = await getCircleFanCount({
    date,
    circleKey,
  });
  if (!circleFanCount) {
    return null;
  }

  const graphMemberIds = await prisma.memberFanCount.findMany({
    where: { circleKey, date: date.toUTCDate(), memberId: { not: null } },
    select: { memberId: true },
  }).then(list => list.map(m => m.memberId).filter(id => id != null) as string[]);

  const thisMonthMemberFanCounts = _.chain(
    await prisma.memberFanCount.findMany({
      where: {
        circleKey,
        memberId: { in: graphMemberIds },
        date: {
          gte: lastDayOfPreviousMonth.toUTCDate(),
          lte: date.toUTCDate(),
        },
      },
      include: {
        member: true,
      },
    }),
  )
    .groupBy((m) => m.memberId)
    .mapValues((l) =>
      _.orderBy(l, (m) => m.date.getTime(), "desc").map(
        ({ total, monthlyAvg, monthlyTotal, ...m }, idx, list) => {

          const beforeFanCount = list[idx + 1];
          const diffFromBefore = beforeFanCount && beforeFanCount.monthlyTotal != null ? parseInt((monthlyTotal! - beforeFanCount?.monthlyTotal!).toString()) : null;
          return {
            ...m,
            total: parseInt(total.toString()),
            monthlyTotal:
              monthlyTotal != null ? parseInt(monthlyTotal.toString()) : null,
            monthlyAvg:
              monthlyAvg != null ? parseInt(monthlyAvg.toString()) : null,
            diffFromBefore,
            beforeRecordedAt: beforeFanCount?.date ? LocalDate.fromUTCDate(beforeFanCount.date).format(DateFormats.ymd) : null,
          };
        },
      ),
    )
    .values()
    .orderBy((l) => l[0].monthlyTotal, "desc")
    .value();

  const memberFanCounts = thisMonthMemberFanCounts.map((l) => l[0]);

  const labels = getDatesFrom({
    start: date,
    period: Period.between(date, date.firstDayOfMonth()).minusDays(2),
  })
    .map((d) => {
      return `${d.month}/${d.day}`;
    })
    .reverse();
  const totalGraphData: ChartData<"line", { x: string; y: number; }[]> = {
    datasets: thisMonthMemberFanCounts.map((fans, idx) => {
      const first = fans[0];
      return {
        label: first.member?.name,
        data: fans.map((m) => {
          return {
            x: LocalDate.fromUTCDate(m.date).format(DateTimeFormatter.ofPattern("M/d")),
            y: m.monthlyTotal!,
          };
        }).reverse(),
      };
    }),
    labels,
  };

  const diffGraphData: ChartData<"line", { x: string; y: number; }[]> = {
    datasets: thisMonthMemberFanCounts.map((fans) => {
      const first = fans[0];
      return {
        label: first.member?.name,
        data: fans.map((m) => {
          return {
            x: LocalDate.fromUTCDate(m.date).format(DateTimeFormatter.ofPattern("M/d")),
            y: m.monthlyTotal!,
          };
        }).reverse(),
      };
    }),
    labels,
  };

  return { circleFanCount, memberFanCounts, thisMonthMemberFanCounts, totalGraphData, diffGraphData };
}

export async function getCircleMemberFanCounts({
  date,
  circleKey,
}: {
  date: LocalDate;
  circleKey: CircleKey;
}) {
  return await prisma.memberFanCount
    .findMany({
      where: { date: date.toUTCDate(), circleKey },
      include: { member: true },
      orderBy: [{ monthlyTotal: "desc" }],
    })
    .then((list) =>
      list.map(({ total, monthlyTotal, monthlyAvg, ...m }) => {
        return {
          ...m,
          total: parseInt(total.toString()),
          monthlyTotal: monthlyTotal ? parseInt(monthlyTotal.toString()) : null,
          monthlyAvg: monthlyAvg ? parseInt(monthlyAvg.toString()) : null,
        };
      }),
    );
}

interface ParseTsvParams {
  circleKey: ActiveCircleKey;
  date: LocalDate;
  tsv: string;
}

export async function parseTsv({ circleKey, date, tsv }: ParseTsvParams) {
  const parsedTsv: Array<ParsedMemberNameAndFanCount> = tsv
    .split(/\r?\n/)
    .map((line, lineIdx) => {
      const [name, count] = line.split(/\s{2,}/, 2);
      if (!name || count === undefined) {
        throw new Error(`Broken line "${line} at line ${lineIdx + 1}"`);
      }
      let countInt;
      try {
        countInt = parseInt(count);
      } catch (e) {
        throw new Error(`Broken line "${line} at line ${lineIdx + 1}"`);
      }
      return [name, countInt];
    });
  await parseMemberNameAndFanCount({
    circleKey,
    date,
    memberAndFanCounts: parsedTsv,
    source: { type: MemberFanCountSource.Paste },
  });
}

export type ParsedMemberNameAndFanCount = [string, number];

export interface ParseMemberNameAndFanCountParams {
  circleKey: ActiveCircleKey;
  date: LocalDate;
  source:
    | {
    type: "Paste";
  }
    | {
    type: "ScreenShot";
    screenShotId: string;
  };
  memberAndFanCounts: Array<ParsedMemberNameAndFanCount>;
}

export async function parseMemberNameAndFanCount({
  circleKey,
  date,
  memberAndFanCounts,
  source,
}: ParseMemberNameAndFanCountParams) {
  console.log(memberAndFanCounts);
  const members = await getCircleMembers({ circleKey });
  const memberFanCounts = (
    await prisma.memberFanCount.findMany({
      select: {
        memberId: true,
        parsedName: true,
      },
      where: {
        memberId: { in: members.map((m) => m.id) },
        source: MemberFanCountSource.ScreenShot,
      },
      distinct: ["memberId"],
      orderBy: [
        {
          date: "desc",
        },
      ],
    })
  ).filter((m) => m.memberId && m.parsedName);

  const memberNameToMemberId: Record<string, string> = {
    ...Object.fromEntries(
      memberFanCounts.map(({ memberId, parsedName }) => [parsedName, memberId]),
    ),
    ...Object.fromEntries(members.map((m) => [m.name, m.id])),
  };

  return await prisma.$transaction(
    memberAndFanCounts.map(([parsedName, total], order) => {
      const memberId = memberNameToMemberId[parsedName];
      return prisma.memberFanCount.create({
        data: {
          date: date.toUTCDate(),
          circleKey,
          order,
          source: source.type,
          screenShotId:
            source.type == "ScreenShot" ? source.screenShotId : undefined,
          memberId,
          parsedName,
          total,
        },
      });
    }),
  );
}

interface PublishCircleFanCountParams {
  circleKey: CircleKey;
  date: LocalDate;
}

export async function calculateMonthlyTotalFanCounts({
  circleKey,
  date,
}: PublishCircleFanCountParams) {
  const lastDayOfPreviousMonth = date
    .with(TemporalAdjusters.firstDayOfMonth())
    .minusDays(1);
  const members = await prisma.member.findMany({
    where: { circleKey },
    include: {
      memberFanCounts: {
        where: {
          date: {
            gte: lastDayOfPreviousMonth.toUTCDate(),
            lte: date.toUTCDate(),
          },
        },
        orderBy: [
          {
            date: "asc",
          },
        ],
        take: 1,
      },
    },
  });

  const memberIdToFirstFanCount: Record<string,
    { count: number | null; date: LocalDate } | null> = Object.fromEntries(
    members.map((member) => {
      const fanCount = member.memberFanCounts[0];
      return [
        member.id,
        !fanCount
          ? null
          : {
            count: parseInt(fanCount.total.toString()),
            date: LocalDate.fromUTCDate(fanCount.date),
          },
      ];
    }),
  );

  console.log(memberIdToFirstFanCount);

  const memberFanCounts = await prisma.memberFanCount.findMany({
    where: { circleKey, date: date.toUTCDate(), memberId: { not: null } },
  });

  const transactions = [];

  for (const { memberId, total } of memberFanCounts) {
    if (memberId) {
      const firstFanCount = memberIdToFirstFanCount[memberId];
      const monthlyTotal =
        firstFanCount?.count != null
          ? total - BigInt(firstFanCount.count)
          : 0n;
      const days = firstFanCount?.date
        ? Period.between(firstFanCount.date, date).days() + 1
        : 1;
      const monthlyAvg = monthlyTotal / BigInt(days);
      console.log(`memberId: ${memberId} ${monthlyTotal} ${monthlyAvg}`);
      transactions.push(
        prisma.memberFanCount.update({
          where: {
            memberId_circleKey_date: {
              memberId,
              circleKey,
              date: date.toUTCDate(),
            },
          },
          data: {
            monthlyTotal,
            monthlyAvg,
          },
        }),
      );
    }
  }

  await prisma.$transaction(transactions);
}

export async function publishCircleFanCount({
  circleKey,
  date,
}: PublishCircleFanCountParams) {
  await calculateMonthlyTotalFanCounts({ circleKey, date });

  const memberFanCounts = await prisma.memberFanCount.findMany({
    where: { circleKey, date: date.toUTCDate(), memberId: { not: null } },
  });

  if (!memberFanCounts.length) {
    throw new Error("ファン数が1件も記録されていません。");
  }

  // if (
  //   memberFanCounts.filter(
  //     (m) => !m.memberId || m.monthlyTotal == null || m.monthlyAvg == null,
  //   ).length
  // ) {
  //   throw new Error(
  //     "不明なメンバーのファン数記録があります。全ての記録にメンバーを紐付けなければ公開できません。",
  //   );
  // }
  //
  const daysLeftInMonth = BigInt(
    Period.between(date, date.with(TemporalAdjusters.lastDayOfMonth())).days(),
  );
  const memberCount = BigInt(memberFanCounts.length);

  const total = memberFanCounts.reduce((v, m) => {
    return v + m.monthlyTotal!;
  }, 0n);
  const avg = total / memberCount;
  const predicted = memberFanCounts.reduce((v, m) => {
    return v + m.monthlyTotal! + m.monthlyAvg! * daysLeftInMonth;
  }, 0n);
  const predictedAvg = predicted / memberCount;

  const circleFanCount = await prisma.circleFanCount.upsert({
    where: { circleKey_date: { circleKey, date: date.toUTCDate() } },
    create: {
      circleKey,
      date: date.toUTCDate(),
      total,
      avg,
      predicted,
      predictedAvg,
    },
    update: { total, avg, predicted, predictedAvg },
  });

  const circle = Circles.findByCircleKey(circleKey);
  await sendMessageToChannel({
    channelId: circle.notificationChannelId,
    message: `${date.format(
      DateFormats.ymd,
    )}のファン数を更新しました。以下のURLから確認できます。 ${
      process.env.BASE_URL
    }/circles/${circleKey}/fans/${date.year()}/${date.monthValue()}/${date.dayOfMonth()}`,
  });

  return circleFanCount;
}
