import { config } from 'dotenv';
import { DbTableData } from '../model/db';
import { prisma } from '../database';
import * as fs from 'fs/promises';

config();

namespace global {
  declare interface BigInt {
    toJSON: () => string;
  }
}

(async () => {
  const data: DbTableData = {
    members: await prisma.member.findMany({
      orderBy: [
        { circleKey: 'asc' },
        { circleRole: 'asc' },
        { joinedAt: 'asc' },
      ],
    }),
    monthCircles: await prisma.monthCircle.findMany({
      orderBy: [
        { year: 'asc' },
        { month: 'asc' },
        { currentCircleKey: 'asc' },
        { state: 'asc' },
      ],
    }),
    monthSurveys: await prisma.monthSurvey.findMany({
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
    }),
    monthSurveyAnswers: await prisma.monthSurveyAnswer.findMany({
      orderBy: [{ year: 'asc' }, { month: 'asc' }, { memberId: 'asc' }],
    }),
    signUps: await prisma.signUp.findMany({ orderBy: [{ id: 'asc' }] }),
    memberFanCounts: await prisma.memberFanCount.findMany({
      orderBy: [
        { date: 'asc' },
        { member: { circleKey: 'asc' } },
        { member: { circleRole: 'asc' } },
        { member: { joinedAt: 'asc' } },
      ],
    }),
    circleFanCounts: await prisma.circleFanCount.findMany({
      orderBy: [{ date: 'asc' }, { circle: 'asc' }],
    }),
    personalChannels: await prisma.personalChannel.findMany({
      orderBy: { id: 'asc' },
    }),
  };

  // https://stackoverflow.com/questions/62539236/how-to-parse-a-json-data-type-bigint-in-typescript
  await fs.writeFile(
    './data.json',
    JSON.stringify(
      data,
      function replacer(key: string, value: any): any {
        if (typeof value === 'bigint') {
          return { __bigintval__: value.toString() };
        }
        return value;
      },
      2
    )
  );
})().catch((e) => console.error(e));
