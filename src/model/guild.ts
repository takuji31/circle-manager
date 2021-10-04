export const Guild: {
  id: string;
  circles: Array<string>;
  roleId: { leader: string; subLeader: string };
} = {
  id: process.env.DISCORD_GUILD_ID as string,
  circles: process.env.CIRCLE_ROLE_IDS?.split(",") as Array<string>,
  roleId: {
    leader: process.env.CIRCLE_LEADER_ROLE_ID as string,
    subLeader: process.env.CIRCLE_SUB_LEADER_ROLE_ID as string,
  },
};
