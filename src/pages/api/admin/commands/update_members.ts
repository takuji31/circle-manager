import { Guild } from "./../../../../model/guild";
import { RESTGetAPIGuildMembersResult, Routes } from "discord-api-types/v9";
import { NextApiRequest, NextApiResponse } from "next";
import { createDiscordRestClient } from "../../../../discord";
import { prisma } from "../../../../prisma";

interface Result {}

export default async (
  req: NextApiRequest,
  res: NextApiResponse<Result | string>
) => {
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
          return prisma.member.upsert({
            where: {
              id: user.id,
            },
            create: {
              id: user.id,
              name: member.nick ?? user.username,
              circleId: circleIdOrNull,
              joinedAt: member.joined_at,
            },
            update: {
              name: member.nick ?? user.username,
              circleId: circleIdOrNull,
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
