import { CircleId } from './circle';

const isProduction = process.env.NODE_ENV == 'production';

const Channels = {
  all: '839400642664595508', // 全体連絡用
  botNotification: '897467813428617227', // bot通知用
  botTest: '879703761562529832', // bot実験用
  random: '881516282023936050', // ウマ娘雑談
} as const;

export const Guild = {
  id: '839400642664595506',
  roleIds: {
    leader: '894446042991452170',
    subLeader: '894446097232191488',
    circleIds: [
      CircleId.saikyo,
      CircleId.shin,
      CircleId.ha,
      CircleId.jo,
      '902440950176034816', // 未加入
      '889835308189900810', // OB
    ],
    ob: '889835308189900810',
    notJoined: '902440950176034816',
  },
  channelIds: {
    all: isProduction ? Channels.all : Channels.botTest,
    admin: isProduction ? Channels.botNotification : Channels.botTest,
    random: isProduction ? Channels.random : Channels.botTest,
    commandExecutor: '908319798700703794',
  },
} as const;
