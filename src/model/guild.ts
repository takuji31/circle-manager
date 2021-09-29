export const Guild: { id: string; circles: Array<string> } = {
  id: process.env.DISCORD_GUILD_ID as string,
  circles: process.env.CIRCLE_ROLE_IDS?.split(",") as Array<string>,
};
