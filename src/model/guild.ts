const Channels = {
  all: '839400642664595508', // 全体連絡用
  circleSelect: '889836038221099038', // サークル選択
  botNotification: '897467813428617227', // bot通知用
  botTest: '879703761562529832', // bot実験用
};

const isProduction = process.env.NODE_ENV == 'production';

export const Guild = {
  id: '839400642664595506',
  roleIds: {
    leader: '894446042991452170',
    subLeader: '894446097232191488',
    circleIds: [
      '908304060640276520', // 西京ファーム
      '863398236474834944', // シン
      '870950796479594556', // 破
      '863398725920227339', // 序
      '902440950176034816', // 未加入
    ],
  },
  channelIds: {
    all: isProduction ? Channels.all : Channels.botTest,
    admin: isProduction ? Channels.botNotification : Channels.botTest,
    circleSelect: isProduction ? Channels.circleSelect : Channels.botTest,
    commandExecutor: '908319798700703794',
  },
  messageIds: {
    circleSelect: isProduction ? '908362316339359774' : '908316632995209256',
  },
};
