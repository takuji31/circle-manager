import { createDiscordRestClient } from "@/discord";
import { Circles, Guild } from "@/model";
import { CircleRole, MemberStatus } from "@prisma/client";
import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
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

  const dbMembers = await prisma.member.findMany({
    where: { id: { in: members.map(m => m.user!.id) } },
    orderBy: [{ id: "asc" }],
  });

  const transactions = [];
  for (const member of members) {
    const dbMember = dbMembers.filter(dbm => dbm.id == member.id)[0];
    const user = member.user!;
    if (dbMember) {
      const name = member.nick ?? user.username;
      const joinedAt = new Date(member.joined_at);
      if (dbMember.name != name || dbMember.joinedAt != joinedAt || dbMember.circleRole != member.circleRole) {
        transactions.push(prisma.member.update({
            select: null,
            where: { id: member.id },
            data: {
              name,
              joinedAt,
              circleRole: member.circleRole,
            },
          }),
        );
      }
    }
  }

  await prisma.$transaction(transactions);

  return json({ status: "ok", created: transactions.length });
};

export const loader = () => {
  return notFound();
};
