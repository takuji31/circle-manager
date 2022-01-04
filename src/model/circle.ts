import { CircleKey } from '@prisma/client';

const isProduction = process.env.NODE_ENV == 'production';

export function isCircleId(id: string): id is CircleId {
  for (const circleId of Object.values(CircleId)) {
    if (circleId == id) {
      return true;
    }
  }
  return false;
}

export const Circles = {
  maxMembers: 30,
  specialIds: {
    noAnswer: '9999999999999999999',
    leave: '7777777777777777777',
    ob: '889835308189900810',
    kick: '8888888888888888888',
    notJoined: '902440950176034816',
  },

  findByCircleKey(key: CircleKey): Circle {
    switch (key) {
      case CircleKey.Saikyo:
        return Circle.saikyo;
      case CircleKey.Shin:
        return Circle.shin;
      case CircleKey.Ha:
        return Circle.ha;
      case CircleKey.Jo:
        return Circle.jo;
    }
  },

  findByRawId(id: string): Circle | null {
    if (!isCircleId(id)) {
      return null;
    } else {
      return this.findById(id);
    }
  },

  findById(circleId: CircleId): Circle {
    switch (circleId) {
      case CircleId.saikyo:
        return Circle.saikyo;
      case CircleId.shin:
        return Circle.shin;
      case CircleId.ha:
        return Circle.ha;
      case CircleId.jo:
        return Circle.jo;
    }
  },
};

export const CircleId = {
  saikyo: '908304060640276520', // 西京ファーム
  shin: '863398236474834944', // シン
  ha: '870950796479594556', // 破
  jo: '863398725920227339', // 序
} as const;

export type CircleId = typeof CircleId[keyof typeof CircleId];

interface ICircle {
  id: CircleId;
  key: CircleKey;
  name: string;
  notificationChannelId: string;
}

const Saikyo: ICircle = {
  id: CircleId.saikyo,
  key: CircleKey.Saikyo,
  name: '西京ファーム',
  notificationChannelId: isProduction
    ? '911553699434881064'
    : '927518449884876841',
} as const;

const Shin: ICircle = {
  id: CircleId.shin,
  key: CircleKey.Shin,
  name: 'シン・ウマ娘愛好会',
  notificationChannelId: isProduction
    ? '860387060706574402'
    : '927518500950519848',
} as const;

const Ha: ICircle = {
  id: CircleId.ha,
  key: CircleKey.Ha,
  name: 'ウマ娘新愛好会:破',
  notificationChannelId: isProduction
    ? '871221691496431727'
    : '927518539106103348',
} as const;

const Jo: ICircle = {
  id: CircleId.jo,
  key: CircleKey.Jo,
  name: 'ウマ娘新愛好会:序',
  notificationChannelId: isProduction
    ? '860387101417406474'
    : '927518571318378496',
} as const;

export const Circle = {
  saikyo: Saikyo, // 西京ファーム
  shin: Shin, // シン
  ha: Ha, // 破
  jo: Jo, // 序
} as const;
export type Circle = typeof Circle[keyof typeof Circle];

const specialName: { [key: string]: string } = {
  '889835308189900810': '脱退(Discord残留)',
};

export const getCircleName = (circle: { id: string; name: string }) => {
  return specialName[circle.id] ?? circle.name;
};

export const isLeaveCircle = (circle: { id: string }) => {
  return (
    circle.id == Circles.specialIds.leave || circle.id == Circles.specialIds.ob
  );
};

export const shouldLeaveGuild = (circle: { id: string }) => {
  return (
    circle.id == Circles.specialIds.leave ||
    circle.id == Circles.specialIds.kick
  );
};
