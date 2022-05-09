import { prisma } from "~/db.server";
import type { LocalDate } from "@circle-manager/shared/model";
import { Circles, Guild } from "@circle-manager/shared/model";
import { createDiscordRestClient } from "@circle-manager/shared/discord";
import type { RESTPatchAPIGuildMemberJSONBody } from "discord-api-types/v9";
import { Routes } from "discord-api-types/rest/v9";
import type { ActiveCircleKey } from "~/schema/member";

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

export const getCircleMembers = async ({
  circleKey,
}: {
  circleKey: ActiveCircleKey;
}) => {
  return prisma.member.findMany({
    where: { circleKey },
    orderBy: [{ circleRole: "asc" }, { joinedAt: "asc" }],
  });
};

type GetMemberParams = { id: string } | { pathname: string };
export type MemberWithSignUp = NonNullable<
  Awaited<ReturnType<typeof getMemberWithSignUp>>
>;
export const getMemberWithSignUp = async (params: GetMemberParams) => {
  return await prisma.member.findFirst({
    where: params,
    include: { signUp: true },
  });
};

export const updateMemberName = async ({
  memberId,
  name,
}: {
  memberId: string;
  name: string;
}) => {
  const rest = createDiscordRestClient();
  const body: RESTPatchAPIGuildMemberJSONBody = {
    nick: name,
  };
  return await rest.patch(Routes.guildMember(Guild.id, memberId), {
    body,
  });
};
