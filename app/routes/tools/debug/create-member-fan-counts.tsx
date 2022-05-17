import { Circles, LocalDate, Period } from "@circle-manager/shared/model";
import { MemberFanCountSource } from "@prisma/client";
import type { ActionFunction } from "remix";
import { json } from "remix";
import { prisma } from "~/db.server";

export const action: ActionFunction = async () => {
  if (process.env.NODE_ENV != "development") {
    throw new Response("Cannot call in production", { status: 400 });
  }
  const circles = Circles.activeCircles;
  const randomFanCounts = [
    0, 10000, 50000, 200000, 500000, 800000, 900000, 1000000, 1200000, 2000000,
    3000000, 5000000, 10000000,
  ];
  const today = LocalDate.today();
  const firstDayOfThisMonth = LocalDate.firstDayOfThisMonth();
  const lastDayOfPreviousMonth = LocalDate.firstDayOfThisMonth().minusDays(1);
  const days = Period.between(lastDayOfPreviousMonth, today).days();

  for (const circle of circles) {
    const members = await prisma.member.findMany({
      where: { circleKey: circle.key },
    });
    await prisma.memberFanCount.deleteMany({
      where: {
        circleKey: circle.key,
        date: {
          gte: lastDayOfPreviousMonth.toUTCDate(),
          lte: today.toUTCDate(),
        },
      },
    });
    await prisma.$transaction([
      prisma.memberFanCount.createMany({
        data: members.map((m) => {
          return {
            memberId: m.id,
            total: 0,
            monthlyTotal: 0,
            circleKey: circle.key,
            date: lastDayOfPreviousMonth.toUTCDate(),
            source: MemberFanCountSource.Manual,
          };
        }),
      }),
      // eslint-disable-next-line no-loop-func
      ...members.flatMap((member) => {
        const transactions = [];
        let totalFanCount = 0;
        for (let i = 0; i < days; i++) {
          const day = firstDayOfThisMonth.plusDays(i);
          const fanCount =
            randomFanCounts[Math.floor(Math.random() * randomFanCounts.length)];
          totalFanCount += fanCount;
          transactions.push(
            prisma.memberFanCount.create({
              data: {
                date: day.toUTCDate(),
                memberId: member.id,
                circleKey: circle.key,
                source: MemberFanCountSource.Manual,
                total: BigInt(totalFanCount),
                monthlyTotal: BigInt(totalFanCount),
              },
            })
          );
        }
        return transactions;
      }),
    ]);
  }

  return json(
    {
      start: lastDayOfPreviousMonth.toJSON(),
      end: today.toJSON(),
      days,
      memberFanCounts: await prisma.memberFanCount
        .findMany({
          where: {
            date: {
              gte: lastDayOfPreviousMonth.toUTCDate(),
              lte: today.toUTCDate(),
            },
          },
          orderBy: [
            {
              circleKey: "asc",
            },
            {
              member: {
                circleRole: "asc",
              },
            },
            {
              member: {
                joinedAt: "asc",
              },
            },
          ],
        })
        .then((list) =>
          list.map(({ total, monthlyTotal, ...member }) => ({
            ...member,
            total: parseInt(total.toString()),
            monthlyTotal: parseInt(total.toString()),
          }))
        ),
    },
    200
  );
};
