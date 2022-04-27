import { Guild } from "./../../model/guild";
import { prisma } from "@circle-manager/database";
import { GuildMember, PartialGuildMember, TextChannel } from "discord.js";

export const updateMemberNicknameEvent = async (
  oldMember: PartialGuildMember | GuildMember,
  newMember: GuildMember
) => {
  if (process.env.NODE_ENV != "production") return;
  const member = await prisma.member.findUnique({
    where: { id: oldMember.id },
  });
  if (!member) {
    return;
  }
  const newName = newMember.nickname ?? newMember.user.username;
  if (member.name != newName) {
    await prisma.member.update({
      where: { id: member.id },
      data: { name: newName },
    });
    const channel = (newMember.guild.channels.cache.get(
      Guild.channelIds.admin
    ) ??
      (await newMember.guild.channels.fetch(
        Guild.channelIds.admin
      ))) as TextChannel;
    if (channel) {
      await channel.send(
        `\`${member.name}\` さんがニックネームを \`${newName}\` に変更しました。`
      );
    }
  }
};
