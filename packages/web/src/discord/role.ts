import { Routes } from 'discord-api-types/v9';
import { createDiscordRestClient } from '.';
import { Guild } from '../model';

export const setMemberCircleRole = async (
  memberId: string,
  roleId: string | null,
  force: boolean = false
) => {
  if (process.env.NODE_ENV != 'production' && !force) {
    throw new Error('Update role ignored in develop');
  }
  const rest = createDiscordRestClient();
  const roleIds = Guild.roleIds.circleIds;
  const removingIds = roleIds.filter((id) => id != roleId);

  for (const id of removingIds) {
    await rest.delete(Routes.guildMemberRole(Guild.id, memberId, id));
  }

  if (roleId != null) {
    await rest.put(Routes.guildMemberRole(Guild.id, memberId, roleId));
  }
};
