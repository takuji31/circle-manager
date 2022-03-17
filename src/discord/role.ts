import { Routes } from 'discord-api-types/v9';
import { createDiscordRestClient } from '.';
import { Guild } from '../model';

export const setMemberCircleRole = async (memberId: string, roleId: string) => {
  const rest = createDiscordRestClient();
  const roleIds = Guild.roleIds.circleIds;
  const removingIds = roleIds.filter((id) => id != roleId);

  for (const id of removingIds) {
    await rest.delete(Routes.guildMemberRole(Guild.id, memberId, id));
  }

  await rest.put(Routes.guildMemberRole(Guild.id, memberId, roleId));
};
