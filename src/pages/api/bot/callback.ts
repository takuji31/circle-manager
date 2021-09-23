import { createDiscordRestClient } from "../../../discord";
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { PrismaClient } from "@prisma/client";
import { NextApiHandler } from "next";
import { RESTGetAPIGuildResult, Routes } from "discord-api-types/v9";

const prisma = new PrismaClient();

const handler: NextApiHandler = async (req, res) => {
  const guildId = req.query.guild_id as string;
  if (guildId == null) {
    res.redirect(`/guilds/`);
  } else {
    const restClient = createDiscordRestClient(
      process.env.DISCORD_BOT_TOKEN as string
    );
    const guild = (await restClient.get(
      Routes.guild(guildId)
    )) as RESTGetAPIGuildResult;
    await prisma.guild.upsert({
      where: {
        id: guildId,
      },
      create: {
        id: guildId,
        name: guild.name,
      },
      update: {
        name: guild.name,
      },
    });
    res.redirect(`/guilds/${guildId}/roles`);
  }
};

export default handler;
