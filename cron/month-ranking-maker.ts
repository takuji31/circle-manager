import { config } from "dotenv";
import { sendAdminNotificationMessage } from "@/discord";
import { stringify } from "csv-stringify/sync";
import {
  Circles,
  LocalDate,
  monthCircleStateLabel,
  nextMonthInt,
  ZonedDateTime,
} from "@/model";
import { prisma } from "@/database";
import {
  CircleKey,
  CircleRole,
  MonthCircleState,
  MonthSurveyAnswerValue,
} from "@prisma/client";

config();

(async () => {
  const { year, month } = nextMonthInt();
  const now = ZonedDateTime.nowJST();

  const monthSurvey = await prisma.monthSurvey.findFirst({
    where: {
      year,
      month,
      expiredAt: {
        lte: now.toDate(),
      },
    },
  });
  if (!monthSurvey) {
    throw new Error(`Month survey of ${year}/${month} not completed yet`);
  }

  const noRankingMembers = await prisma.member.findMany({
    include: {
      monthSurveyAnswer: {
        where: {
          year,
          month,
        },
        take: 1,
      },
    },
    where: {
      monthCircles: {
        none: {
          year,
          month,
          locked: true,
        },
      },
      monthSurveyAnswer: {
        some: {
          year,
          month,
          value: {
            in: ["Leave", "Ob", "None", "Saikyo"],
          },
        },
      },
    },
  });

  const leaders = await prisma.member.findMany({
    where: {
      circleRole: CircleRole.Leader,
      monthSurveyAnswer: {
        some: {
          year,
          month,
          value: {
            notIn: ["Leave", "Ob", "None", "Saikyo"],
          },
        },
      },
    },
  });

  const lockedMembers = await prisma.member.findMany({
    include: {
      monthCircles: {
        where: {
          year,
          month,
        },
        take: 1,
      },
    },
    where: {
      monthCircles: {
        some: {
          year,
          month,
          locked: true,
        },
      },
    },
  });

  const totalMemberCount = (
    await prisma.monthSurveyAnswer.aggregate({
      _count: {
        id: true,
      },
      where: {
        year,
        month,
        value: MonthSurveyAnswerValue.Umamusume,
      },
    })
  )._count.id;
  const newMembers = 60 - totalMemberCount;
  const newMembersPerCircle = Math.floor(newMembers / 2);
  const remainderNewMembers = newMembers % 2;
  const maxMemberCount: Record<Exclude<CircleKey, "Saikyo" | "Jo">, number> = {
    Shin:
      30 -
      leaders.filter((m) => m.circleKey == CircleKey.Shin).length -
      lockedMembers.filter(
        (m) => m.monthCircles[0].state == MonthCircleState.Shin
      ).length -
      newMembersPerCircle,

    Ha:
      30 -
      leaders.filter((m) => m.circleKey == CircleKey.Ha).length -
      lockedMembers.filter(
        (m) => m.monthCircles[0].state == MonthCircleState.Ha
      ).length -
      newMembersPerCircle -
      (remainderNewMembers > 0 ? 1 : 0),
  };

  console.log("Max member count %s", maxMemberCount);

  const rankingMembers = (
    await prisma.member.findMany({
      include: {
        fanCounts: {
          where: {
            date: {
              gte: LocalDate.firstDayOfThisMonth().toUTCDate(),
              lt: LocalDate.firstDayOfNextMonth().toUTCDate(),
            },
          },
          orderBy: {
            date: "desc",
          },
          take: 1,
        },
      },
      where: {
        circleRole: {
          not: CircleRole.Leader,
        },
        monthSurveyAnswer: {
          some: {
            year,
            month,
            value: MonthSurveyAnswerValue.Umamusume,
          },
        },
        monthCircles: {
          none: {
            year,
            month,
            locked: true,
          },
        },
      },
    })
  ).sort((a, b) => {
    console.log("%s %s", a, b);
    return parseInt(
      (
        (b.fanCounts[0]?.avg ?? BigInt(0)) - (a.fanCounts[0]?.avg ?? BigInt(0))
      ).toString()
    );
  });

  await prisma.$transaction([
    prisma.monthCircle.deleteMany({
      where: {
        year,
        month,
        locked: false,
      },
    }),
    prisma.monthCircle.createMany({
      data: noRankingMembers.map(
        ({ id: memberId, circleKey, monthSurveyAnswer: [{ value }] }) => ({
          memberId,
          year,
          month,
          locked: false,
          state:
            value == "Saikyo"
              ? MonthCircleState.Saikyo
              : value == "Leave"
              ? MonthCircleState.Leaved
              : value == "None"
              ? MonthCircleState.Kicked
              : MonthCircleState.OB,
          currentCircleKey: circleKey,
        })
      ),
      skipDuplicates: true,
    }),
    prisma.monthCircle.createMany({
      data: leaders.map(({ id: memberId, circleKey }) => ({
        memberId,
        year,
        month,
        locked: false,
        state: circleKey!,
        currentCircleKey: circleKey,
      })),
      skipDuplicates: true,
    }),
    prisma.monthCircle.createMany({
      data: rankingMembers.map(({ id: memberId, circleKey }, idx) => ({
        memberId,
        year,
        month,
        locked: false,
        // TODO: 稼働目標の考慮
        state:
          idx < maxMemberCount.Shin
            ? MonthCircleState.Shin
            : idx < maxMemberCount.Shin + maxMemberCount.Ha
            ? MonthCircleState.Ha
            : MonthCircleState.OB,
        currentCircleKey: circleKey,
      })),
      skipDuplicates: true,
    }),
  ]);

  const monthCircles = await prisma.monthCircle.findMany({
    where: {
      year,
      month,
      member: {
        leavedAt: null,
      },
    },
    include: {
      member: true,
    },
    // TODO: 最適なソート順
    orderBy: [
      {
        currentCircleKey: "asc",
      },
      {
        member: {
          circleRole: "asc",
        },
      },
      {
        state: "asc",
      },
      {
        member: {
          joinedAt: "asc",
        },
      },
    ],
  });

  const csv = stringify([
    [
      "メンバーID",
      "トレーナー名",
      "トレーナーID",
      "今月のサークル",
      "来月の在籍",
    ],
    ...monthCircles.map(
      ({ member: { id, name, trainerId }, currentCircleKey, state }) => [
        id,
        name,
        trainerId,
        currentCircleKey
          ? Circles.findByCircleKey(currentCircleKey).name
          : "OB",
        monthCircleStateLabel(state),
      ]
    ),
  ]);

  await sendAdminNotificationMessage(
    `${year}年${month}月のサークルメンバーを確定しました。`,
    [
      {
        name: "members.csv",
        data: Buffer.from(csv, "utf-8"),
      },
    ]
  );
})();
