import { LocalDate, TemporalAdjusters } from "@circle-manager/shared/model";
import type { CircleKey } from "@prisma/client";
import { MemberFanCountSource } from "@prisma/client";
import { prisma } from "~/db.server";
import type { ActiveCircleKey } from "~/schema/member";
import { getCircleMembers } from "./member.server";

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
      list.map(({ total, monthlyTotal, ...m }) => {
        return {
          ...m,
          total: parseInt(total.toString()),
          monthlyTotal: parseInt(monthlyTotal.toString()),
        };
      })
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
  const lastDayOfPreviousMonth = date
    .with(TemporalAdjusters.firstDayOfMonth())
    .minusDays(1);
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
      memberFanCounts.map(({ memberId, parsedName }) => [parsedName, memberId])
    ),
    ...Object.fromEntries(members.map((m) => [m.name, m.id])),
  };

  const groupBy = await prisma.memberFanCount.groupBy({
    by: ["memberId"],
    _min: {
      date: true,
      // totalが減ることは基本的にありえないので一番小さいtotalが一番古い日付のtotalということにしている
      total: true,
    },
    where: {
      date: {
        gte: lastDayOfPreviousMonth.toUTCDate(),
        lt: date.toUTCDate(),
      },
      circleKey,
    },
  });
  const memberIdToFirstFanCount: Record<
    string,
    { count: number | null; date: LocalDate }
  > = Object.fromEntries(
    groupBy.map((g) => {
      return [
        g.memberId,
        {
          count: g._min.total ? parseInt(g._min.total.toString()) : null,
          date: g._min.date ? LocalDate.fromUTCDate(g._min.date) : date,
        },
      ];
    })
  );

  return await prisma.$transaction(
    memberAndFanCounts.map(([parsedName, total], order) => {
      const memberId = memberNameToMemberId[parsedName];
      const firstFanCount = memberId ? memberIdToFirstFanCount[memberId] : null;
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
          monthlyTotal: firstFanCount?.count ? total - firstFanCount?.count : 0,
          total,
        },
      });
    })
  );
}
