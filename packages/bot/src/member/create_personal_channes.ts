import { Guild, Permissions, TextChannel } from "discord.js";
import { prisma } from "database";
import { ReactionHandlerWithData } from "../types";
import { Guild as _Guild } from "../../model/guild";

export const createPersonalChannel: ReactionHandlerWithData<Guild> = async (
  reaction,
  user,
  _,
  guild
) => {
  await reaction.users.remove(user.id);

  const member = await prisma.member.findFirst({ where: { id: user.id } });

  if (!member) {
    return;
  }

  let channel: TextChannel | null = null;

  const personalChannel = await prisma.personalChannel.findFirst({
    where: { id: user.id },
  });
  if (personalChannel) {
    channel = reaction.client.channels.resolve(
      personalChannel.channelId
    ) as TextChannel | null;
  }
  if (!channel) {
    channel = await guild.channels.create(
      member.name + (process.env.NODE_ENV == "development" ? "_TEST" : ""),
      {
        type: "GUILD_TEXT",
        parent: _Guild.categoryIds.personalChannel,
        permissionOverwrites: [
          {
            id: guild.id,
            deny: [Permissions.FLAGS.VIEW_CHANNEL],
          },
        ],
      }
    );
  }
  channel.permissionOverwrites.set([
    {
      id: guild.id,
      deny: [Permissions.FLAGS.VIEW_CHANNEL],
    },
    {
      id: user.id,
      allow: [
        Permissions.FLAGS.VIEW_CHANNEL,
        Permissions.FLAGS.MANAGE_MESSAGES,
      ],
    },
    {
      id: _Guild.roleIds.personalChannelViewer,
      allow: [Permissions.FLAGS.VIEW_CHANNEL],
    },
  ]);
  await prisma.personalChannel.upsert({
    where: { id: member.id },
    create: {
      id: member.id,
      channelId: channel.id,
    },
    update: {
      channelId: channel.id,
    },
  });

  await user.send(
    `個人チャンネルを開設しました。あなたの個人チャンネルは <#${channel.id}> です。`
  );
};
