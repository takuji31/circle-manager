export const Guild = {
  id: process.env.DISCORD_GUILD_ID as string,
  roleIds: {
    leader: process.env.CIRCLE_LEADER_ROLE_ID as string,
    subLeader: process.env.CIRCLE_SUB_LEADER_ROLE_ID as string,
    circleIds: [
      '863398236474834944', // シン
      '870950796479594556', // 破
      '863398725920227339', // 序
      '902440950176034816', // 未加入
    ],
  },
  channelIds: {
    notification: '897467813428617227',
  },
  messageIds: {
    circleSelect: '902466218890510347',
  },
};
