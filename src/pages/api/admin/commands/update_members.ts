import { getSession } from "next-auth/react";
import { Guild } from "./../../../../model/guild";
import { RESTGetAPIGuildMembersResult, Routes } from "discord-api-types/v9";
import { NextApiRequest, NextApiResponse } from "next";
import { createDiscordRestClient } from "../../../../discord";
import prisma from "../../../../prisma";
import { CircleRole } from ".prisma/client";

interface Result {}

export default async (
  req: NextApiRequest,
  res: NextApiResponse<Result | string>
) => {
  const session = await getSession({ req });
  if (!session?.isAdmin) {
    res.status(403).send("Forbidden");
    return;
  }
  const rest = createDiscordRestClient();
  const cirdleIds = (
    await prisma.circle.findMany({
      orderBy: {
        id: "asc",
      },
    })
  ).map((circle) => circle.id);

  if (req.method == "POST") {
    const members = (await rest.get(
      `${Routes.guildMembers(Guild.id)}?limit=1000`
    )) as RESTGetAPIGuildMembersResult;
    prisma.$transaction(
      members
        .filter((member) => !member.user?.bot && member.user)
        .map((member) => {
          const user = member.user!;
          const circleIdOrNull = member.roles.filter(
            (role) => cirdleIds.indexOf(role) != -1
          )[0];
          const circleRole = member.roles.includes(Guild.roleId.leader)
            ? CircleRole.Leader
            : member.roles.includes(Guild.roleId.subLeader)
            ? CircleRole.SubLeader
            : CircleRole.Member;
          return prisma.member.upsert({
            where: {
              id: user.id,
            },
            create: {
              id: user.id,
              name: member.nick ?? user.username,
              circleId: circleIdOrNull,
              circleRole: circleRole,
              joinedAt: member.joined_at,
            },
            update: {
              name: member.nick ?? user.username,
              circleId: circleIdOrNull,
              circleRole: circleRole,
              joinedAt: member.joined_at,
            },
          });
        })
    );
    res.status(200).send({});
  } else {
    res.status(400).send("Not supported");
  }
};
