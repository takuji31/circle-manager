import { prisma } from "~/db.server";
import type { LocalDate } from "@circle-manager/shared/model";
import { Circles } from "@circle-manager/shared/model";

const monthSurveyAnswerInclude = (date?: LocalDate) => {
  if (!date) {
    return {};
  }
  const year = date.year();
  const month = date.monthValue();
  return {
    monthSurveyAnswer: {
      where: { year, month },
      skip: 0,
      take: 1,
    },
  };
};

const monthCircleInclude = (date?: LocalDate) => {
  if (!date) {
    return {};
  }
  const year = date.year();
  const month = date.monthValue();
  return {
    monthCircles: {
      where: { year, month },
      skip: 0,
      take: 1,
    },
  };
};

export const getJoinedMembers = ({
  monthSurveyDate,
  monthCircleDate,
}: {
  monthSurveyDate?: LocalDate;
  monthCircleDate?: LocalDate;
} = {}) => {
  const include = {
    ...monthSurveyAnswerInclude(monthSurveyDate),
    ...monthCircleInclude(monthCircleDate),
  };
  return Promise.all([
    prisma.member.findMany({
      include,
      where: {
        leavedAt: null,
        circleKey: { not: null },
      },
      orderBy: [
        {
          circleKey: "asc",
        },
        {
          circleRole: "asc",
        },
        {
          joinedAt: "asc",
        },
      ],
    }),
    prisma.member.findMany({
      include,
      where: {
        leavedAt: null,
        circleKey: null,
      },
      orderBy: [
        {
          status: "asc",
        },
      ],
    }),
  ]).then(([circleMembers, nonCircleMembers]) =>
    [circleMembers, nonCircleMembers]
      .flatMap((v) => v)
      .map((member) => {
        return {
          ...member,
          circle: member.circleKey
            ? Circles.findByCircleKey(member.circleKey)
            : null,
        };
      })
  );
};
