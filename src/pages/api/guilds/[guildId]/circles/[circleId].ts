import { RESTGetAPIGuildRolesResult, Routes } from "discord-api-types/v9";
import { NextApiHandler } from "next";
import { createDiscordRestClient } from "../../../../../discord";
import { prisma } from "../../../../../prisma";

export interface Circle {
  id: string;
  name: string | null;
}

const handler: NextApiHandler<Circle | string> = async (req, res) => {
  const circleId = req.query.circleId as string;
  const guildId = req.query.guildId as string;
  if (!circleId && !guildId) {
    res.status(400).send("Bad Response");
    return;
  }
  const restClient = createDiscordRestClient();
  const roles = (await restClient.get(
    Routes.guildRoles(guildId)
  )) as RESTGetAPIGuildRolesResult;
  const role = roles.filter((r) => r.id == circleId)[0];
  if (!role) {
    res.status(404).send("Not Found");
    return;
  }
  if (req.method == "POST") {
    const circle = await prisma.circle.create({
      data: {
        id: circleId,
        guildId: guildId,
        name: role.name,
      },
    });
    res.send(circle);
  }
};

export default handler;
