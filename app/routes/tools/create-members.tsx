import { createDiscordRestClient } from "@/discord";
import { Circle, Circles, Guild } from "@/model";
import { CircleRole, MemberStatus } from "@prisma/client";
import type { ActionFunction } from "@remix-run/node";
import type { RESTGetAPIGuildMembersResult } from "discord-api-types/v9";
import { Routes } from "discord-api-types/v9";
import invariant from "tiny-invariant";
import { prisma } from "~/db.server";
import { notFound } from "~/response.server";

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
      `${Routes.guildMembers(Guild.id)}?limit=1000`,
    )) as RESTGetAPIGuildMembersResult
  ).filter((member) => !member.user?.bot && member.user).map(member => {
    const circleIdOrNull = member.roles.filter(
      (role) => circleIds.indexOf(role) != -1,
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

    return { ...member, id: member.user!.id, circle, status, circleRole };
  });

  const obMembers = members.filter(member => member.roles.includes(Guild.roleIds.ob));
  await prisma.member.updateMany({
    where: { id: { in: obMembers.map(member => member.id) } },
    data: { status: MemberStatus.OB },
  });

  const notJoinedMembers = members.filter(member => member.roles.includes(Guild.roleIds.notJoined));
  await prisma.member.updateMany({
    where: { id: { in: notJoinedMembers.map(member => member.id) } },
    data: { status: MemberStatus.NotJoined },
  });

  const circles = Object.values(Circle);

  for (const circle of circles) {
    const circleMembers = members.filter(member => member.circle != null && member.circle.key == circle.key);
    await prisma.member.updateMany({
      where: { id: { in: circleMembers.map(member => member.id) } },
      data: { circleKey: circle.key },
    });
  }


  const dbMembers = await prisma.member.findMany({
    where: { id: { in: members.map(m => m.user!.id) } },
    orderBy: [{ id: "asc" }],
  });

  const creatingMembers = [];
  for (const member of members) {
    const dbMember = dbMembers.filter(dbm => dbm.id == member.id)[0];
    const user = member.user!;
    if (!dbMember) {
      creatingMembers.push({
        id: member.id,
        name: member.nick ?? user.username,
        circleKey: member.circle?.key ?? null,
        circleRole: member.circleRole,
        joinedAt: member.joined_at,
        status: member.status,
      });
    }
  }

  await prisma.member.createMany({ data: creatingMembers, skipDuplicates: true });

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

export const loader = () => {
  return notFound();
};
