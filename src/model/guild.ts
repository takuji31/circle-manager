export const Guild: {
  id: string;
  roleId: { leader: string; subLeader: string };
  messageIds: {
    circleSelect: string;
  };
} = {
  id: process.env.DISCORD_GUILD_ID as string,
  roleId: {
    leader: process.env.CIRCLE_LEADER_ROLE_ID as string,
    subLeader: process.env.CIRCLE_SUB_LEADER_ROLE_ID as string,
  },
  messageIds: {
    circleSelect: '902466218890510347',
  },
};
