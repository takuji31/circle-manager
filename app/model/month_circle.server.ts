import type { LocalDate } from "@/model/date";
import { prisma } from "~/db.server";
import { MonthCircleState } from "@prisma/client";
import { Circles, isCircleKey } from "@/model";

export type MonthCircle = Awaited<ReturnType<typeof fetchMonthCircles>>[0];

const fetchMonthCircles = async ({
  year,
  month,
}: {
  year: number;
  month: number;
}) => {
  return await prisma.monthCircle
    .findMany({
      where: { year, month },
      include: { member: true },
      orderBy: [
        {
          state: "asc",
        },
        {
          currentCircleKey: "asc",
        },
        {
          member: { joinedAt: "asc" },
        },
      ],
    })
    .then((list) => {
      return list
        .filter((item) => item.state != item.currentCircleKey)
        .map((item) => {
          const { member, ...monthCircle } = item;
          return {
            ...monthCircle,
            circle: isCircleKey(monthCircle.state)
              ? Circles.findByCircleKey(monthCircle.state)
              : null,
            member: {
              ...member,
              circle: member.circleKey
                ? Circles.findByCircleKey(member.circleKey)
                : null,
            },
          };
        });
    });
};

export const getMonthCircles = async ({
  year,
  month,
}: {
  year: number;
  month: number;
}) => {
  const monthCircles = await fetchMonthCircles({ year, month });

  const kicked = (m: MonthCircle) => m.currentCircleKey == null || m.kicked;
  const noCircleMember = (m: MonthCircle) =>
    m.state == MonthCircleState.Kicked ||
    m.state == MonthCircleState.Leaved ||
    m.state == MonthCircleState.OB;
  const leavingMember = (m: MonthCircle) =>
    m.state == MonthCircleState.Kicked || m.state == MonthCircleState.Leaved;

  return {
    notKicked: monthCircles.filter((m) => !kicked(m)),
    notInvited: monthCircles.filter((m) => !m.invited && !noCircleMember(m)),
    notJoined: monthCircles.filter(
      (m) => kicked(m) && m.invited && !m.joined && !noCircleMember(m)
    ),
    notDiscordKicked: monthCircles.filter(
      (m) => kicked(m) && leavingMember(m) && m.member.leavedAt == null
    ),
    completed: monthCircles.filter(
      (m) =>
        kicked(m) &&
        ((leavingMember(m) && m.member.leavedAt != null) ||
          m.state == MonthCircleState.OB ||
          (m.invited && m.joined))
    ),
  };
};
