import { createDiscordRestClient, sendInvitedMessage, sendKickedMessage, setMemberCircleRole } from "@/discord";
import { Circles, DateFormats, Guild, isCircleKey } from "@/model";
import { ZonedDateTime } from "@js-joda/core";
import type { Member, MonthCircle as PrismaMonthCircle} from "@prisma/client";
import { CircleRole, MonthCircleState } from "@prisma/client";
import { Routes } from "discord-api-types/v9";
import { prisma } from "~/db.server";
import { logger } from "~/lib/logger";

export type MonthCircle = Awaited<ReturnType<typeof convertToMonthCircle>>;

function convertToMonthCircle(item: PrismaMonthCircle & { member: Member }) {
  const { member, currentCircleKey, ...monthCircle } = item;
  return {
    ...monthCircle,
    currentCircleKey,
    currentCircle: currentCircleKey ? Circles.findByCircleKey(currentCircleKey) : null,
    circle: isCircleKey(monthCircle.state)
      ? Circles.findByCircleKey(monthCircle.state)
      : null,
    member: {
      ...member,
      circle: member.circleKey
        ? Circles.findByCircleKey(member.circleKey)
        : null,
      leavedAtString: member.leavedAt ? ZonedDateTime.fromDate(member.leavedAt).format(DateFormats.dateTime) : null,
    },
  };
}

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
        .map(convertToMonthCircle);
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
      (m) => kicked(m) && m.invited && !m.joined && !noCircleMember(m),
    ),
    notDiscordKicked: monthCircles.filter(
      (m) => kicked(m) && leavingMember(m) && m.member.leavedAt == null,
    ),
    completed: monthCircles.filter(
      (m) =>
        kicked(m) &&
        ((leavingMember(m) && m.member.leavedAt != null) ||
          m.state == MonthCircleState.OB ||
          (m.invited && m.joined)),
    ),
  };
};

async function findMonthCircleById(id: string) {
  return await prisma.monthCircle.findFirst(({
    where: { id },
    include: { member: true },
    rejectOnNotFound: true,
  })).then(convertToMonthCircle);
}

export const kickMember = async ({ monthCircleId }: { monthCircleId: string }) => {
  const monthCircle = await findMonthCircleById(monthCircleId);
  if (!monthCircle.currentCircleKey) {
    throw new Error("OBはキック不要です、このエラーが出る時は開発者まで連絡ください。");
  }
  try {
    if (monthCircle.state == "Leaved" || monthCircle.state == "Kicked") {
      await setMemberCircleRole(monthCircle.member.id, null);
    } else if (monthCircle.state == "OB") {
      await setMemberCircleRole(monthCircle.member.id, Guild.roleIds.ob);
    }
  } catch (e) {
    logger.warn(e);
  }
  try {
    const circle = Circles.findByCircleKey(monthCircle.currentCircleKey);
    // TODO: 除名済みで宙ぶらりんになってるメンバーに専用のロールをつけたい
    await sendKickedMessage(
      monthCircle.member,
      circle,
      isCircleKey(monthCircle.state) ? "move" :
        monthCircle.state == MonthCircleState.Kicked ? "kick" : "leave",
    );
  } catch (e) {
    logger.warn(e);
  }

  if (monthCircle.state == "Kicked" && process.env.NODE_ENV == "production") {
    const rest = createDiscordRestClient();
    try {
      await rest.put(Routes.guildBan(Guild.id, monthCircle.member.id), {
        headers: {
          "X-Audit-Log-Reason": encodeURI(`サークル除名による自動BAN`),
        },
      });
    } catch (e) {
      logger.warn(e);
    }
  }

  return await prisma.monthCircle.update({
    where: { id: monthCircleId },
    data: { kicked: true },
  });
};

export const inviteMember = async ({ monthCircleId }: { monthCircleId: string }) => {
  const monthCircle = await findMonthCircleById(monthCircleId);
  if (!monthCircle || !monthCircle.circle) {
    throw new Error("脱退者は勧誘できません。このエラーが出る時は開発者まで連絡ください。");
  }
  try {
    await sendInvitedMessage(monthCircle.member, monthCircle.circle, "move");
  } catch (e) {
    logger.warn(e);
  }
  return await prisma.monthCircle.update({
    where: { id: monthCircleId },
    data: { invited: true },
  });
};

export const joinMember = async ({ monthCircleId }: { monthCircleId: string }) => {
  const monthCircle = await findMonthCircleById(monthCircleId);
  if (!monthCircle || !monthCircle.circle) {
    throw new Error("脱退者は加入済みにできません。このエラーが出る時は開発者まで連絡ください。");
  }
  try {
    await setMemberCircleRole(monthCircle.member.id, monthCircle.circle.id);
  } catch (e) {
    logger.warn(e);
  }

  await prisma.member.update({
    where: { id: monthCircle.member.id },
    data: { circleKey: monthCircle.circle.key },
  });
  return await prisma.monthCircle.update({
    where: { id: monthCircleId },
    data: { joined: true },
  });
};

export async function kickDiscordMember({ monthCircleId }: { monthCircleId: string }) {
  const monthCircle = await findMonthCircleById(monthCircleId);
  if (monthCircle.state != "Leaved") {
    throw new Error("脱退者以外はキック不要です、このエラーが出る時は開発者まで連絡ください。");
  }
  if (process.env.NODE_ENV == "production") {
    const rest = createDiscordRestClient();
    try {
      await rest.delete(Routes.guildMember(Guild.id, monthCircle.member.id), {
        headers: {
          "X-Audit-Log-Reason": encodeURI(`サークル脱退のため自動追放`),
        },
      });
    } catch (e) {
      logger.warn(e);
    }
  }

  return await prisma.member.update({
    where: { id: monthCircle.member.id },
    data: { circleKey: null, circleRole: CircleRole.Member, leavedAt: new Date() },
  });
}
