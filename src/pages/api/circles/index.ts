import { RESTGetAPIGuildRolesResult, Routes } from "discord-api-types";
import { NextApiHandler } from "next";
import { createDiscordRestClient } from "../../../discord";
import { Circle } from "../../../model/circle";
import { Guild } from "../../../model/guild";
import { prisma } from "../../../prisma";

export interface APICircles {
  circles: Array<Circle>;
}

export const handler: NextApiHandler<APICircles> = async (req, res) => {
  const hasCircles = await prisma.circle.count();
  if (!hasCircles) {
    const rest = createDiscordRestClient();
    const roles = (await rest.get(
      Routes.guildRoles(Guild.id)
    )) as RESTGetAPIGuildRolesResult;
    await prisma.circle.createMany({
      data: roles
        .filter((role) => Guild.circles.indexOf(role.id) != -1)
        .map((role) => {
          return {
            id: role.id,
            name: role.name,
          };
        }),
      skipDuplicates: true,
    });
  }

  const circles = await prisma.circle.findMany({
    orderBy: {
      createdAt: "asc",
    },
  });
  res.send({
    circles: circles.map((circle) => {
      return {
        id: circle.id,
        name: circle.name,
      };
    }),
  });
};
