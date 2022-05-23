import { prisma } from "@/database";
import type { CircleId } from "@/model";
import { Circles, Guild } from "@/model";
import { CircleRole, MemberStatus } from "@prisma/client";
import type { GuildMember, PartialGuildMember } from "discord.js";

export const updateMemberRoleEvent = async (
  oldMember: PartialGuildMember | GuildMember,
  newMember: GuildMember
) => {
  if (process.env.NODE_ENV != "production") return;
  if (newMember.user.bot) {
    // Botは未加入である必要はないので未加入ロールは即削除する
    if (newMember.roles.cache.has(Guild.roleIds.notJoined)) {
      await newMember.roles.remove(Guild.roleIds.notJoined);
    }
    return;
  }

  const activeCircleIds = Circles.activeCircles.map((c) => c.id);
  if (newMember.roles.cache.hasAny(...activeCircleIds)) {
    const role = newMember.roles.cache
      .filter((_, key) => activeCircleIds.includes(key as CircleId))
      .first()!;
    const circle = Circles.findByRawId(role.id)!;
    await prisma.member.update({
      where: { id: newMember.id },
      data: {
        circleKey: circle.key,
      },
    });
  } else {
    await prisma.member.update({
      where: { id: newMember.id },
      data: {
        circleKey: null,
        status: newMember.roles.cache.has(Guild.roleIds.notJoined)
          ? MemberStatus.NotJoined
          : newMember.roles.cache.has(Guild.roleIds.ob)
          ? MemberStatus.OB
          : undefined,
      },
    });
  }

  if (newMember.roles.cache.has(Guild.roleIds.leader)) {
    await prisma.member.update({
      where: { id: newMember.id },
      data: { circleRole: CircleRole.Leader },
    });
  } else if (newMember.roles.cache.has(Guild.roleIds.subLeader)) {
    await prisma.member.update({
      where: { id: newMember.id },
      data: { circleRole: CircleRole.SubLeader },
    });
  } else {
    await prisma.member.update({
      where: { id: newMember.id },
      data: { circleRole: CircleRole.Member },
    });
  }
};
