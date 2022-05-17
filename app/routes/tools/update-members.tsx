import { createDiscordRestClient } from "@circle-manager/shared/discord";
import { Circles, Guild } from "@circle-manager/shared/model";
import { CircleRole, MemberStatus } from "@prisma/client";
import type { RESTGetAPIGuildMembersResult } from "discord-api-types/v9";
import { Routes } from "discord-api-types/v9";
import type { ActionFunction } from "remix";
import invariant from "tiny-invariant";
import { prisma } from "~/db.server";

invariant(process.env.ADMIN_API_SECRET, "ADMIN_API_SECRET required");

export const action: ActionFunction = async ({ request }) => {
  const header = request.headers.get("X-CIRCLE-MANAGER-AUTH");

  if (header != process.env.ADMIN_API_SECRET) {
    throw new Response("Forbidden", { status: 403 });
  }

  const rest = createDiscordRestClient();
  const circleIds = Circles.activeCircles.map((circle) => circle.id as string);

  const members = (
    (await rest.get(
      `${Routes.guildMembers(Guild.id)}?limit=1000`
    )) as RESTGetAPIGuildMembersResult
  ).filter((member) => !member.user?.bot && member.user);

  // 既に脱退しているが状態が更新されていないメンバーを脱退したことにする
  await prisma.member.updateMany({
    where: {
      id: {
        notIn: [...members.map((member) => member.user?.id!)],
      },
      status: MemberStatus.Joined,
    },
    data: {
      status: MemberStatus.Leaved,
      circleKey: null,
      circleRole: CircleRole.Member,
    },
  });

  // 既に脱退しているがjoinedAtが記録されていないメンバーは今離脱したことにする
  await prisma.member.updateMany({
    where: {
      id: {
        notIn: [...members.map((member) => member.user?.id!)],
      },
      status: MemberStatus.Leaved,
      leavedAt: null,
    },
    data: {
      leavedAt: new Date(),
      circleKey: null,
      circleRole: CircleRole.Member,
    },
  });

  for (const member of members) {
    const user = member.user!;
    const circleIdOrNull = member.roles.filter(
      (role) => circleIds.indexOf(role) != -1
    )[0];
    const isOb = member.roles.includes(Guild.roleIds.ob);
    const isNotJoined = member.roles.includes(Guild.roleIds.notJoined);
    const circle =
      !isOb && !isNotJoined && circleIdOrNull
        ? Circles.findByRawId(circleIdOrNull)
        : null;
    const status = isOb
      ? MemberStatus.OB
      : isNotJoined
      ? MemberStatus.NotJoined
      : circle != null
      ? MemberStatus.Joined
      : MemberStatus.NotJoined;
    const circleRole = member.roles.includes(Guild.roleIds.leader)
      ? CircleRole.Leader
      : member.roles.includes(Guild.roleIds.subLeader)
      ? CircleRole.SubLeader
      : CircleRole.Member;

    await prisma.member.upsert({
      select: null,
      where: {
        id: user.id,
      },
      create: {
        id: user.id,
        name: member.nick ?? user.username,
        circleKey: circle?.key ?? null,
        circleRole: circleRole,
        joinedAt: member.joined_at,
        status,
      },
      update: {
        name: member.nick ?? user.username,
        circleKey: circle?.key ?? null,
        circleRole: circleRole,
        joinedAt: member.joined_at,
        status,
      },
    });
  }

  await prisma.member.updateMany({
    where: {
      leavedAt: { not: null },
    },
    data: {
      circleKey: null,
    },
  });

  return prisma.member.findMany({
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
  });
};
