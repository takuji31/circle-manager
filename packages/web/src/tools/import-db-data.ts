import { config } from 'dotenv';
import { DbTableData } from '@circle-manager/shared/model';
import { prisma } from '@circle-manager/shared/database';
import * as fs from 'fs/promises';

config();

(async () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('This script only run development environment');
  }
  // https://stackoverflow.com/questions/62539236/how-to-parse-a-json-data-type-bigint-in-typescript
  const data: DbTableData = JSON.parse(
    await fs.readFile('./data.json', 'utf-8'),
    function reviver(key: string, value: any): any {
      if (
        value != null &&
        typeof value === 'object' &&
        '__bigintval__' in value
      ) {
        return BigInt(value['__bigintval__']);
      }
      return value;
    }
  ) as DbTableData;

  await prisma.member.deleteMany({});
  await prisma.monthCircle.deleteMany({});
  await prisma.monthSurvey.deleteMany({});
  await prisma.monthSurveyAnswer.deleteMany({});
  await prisma.signUp.deleteMany({});
  await prisma.memberFanCount.deleteMany({});
  await prisma.circleFanCount.deleteMany({});
  await prisma.personalChannel.deleteMany({});

  await prisma.member.createMany({
    data: data.members,
    skipDuplicates: true,
  });
  await prisma.monthCircle.createMany({
    data: data.monthCircles,
    skipDuplicates: true,
  });
  await prisma.monthSurvey.createMany({
    data: data.monthSurveys,
    skipDuplicates: true,
  });
  await prisma.monthSurveyAnswer.createMany({
    data: data.monthSurveyAnswers,
    skipDuplicates: true,
  });
  await prisma.signUp.createMany({
    data: data.signUps,
    skipDuplicates: true,
  });
  await prisma.memberFanCount.createMany({
    data: data.memberFanCounts,
    skipDuplicates: true,
  });
  await prisma.circleFanCount.createMany({
    data: data.circleFanCounts,
    skipDuplicates: true,
  });
  await prisma.personalChannel.createMany({
    data: data.personalChannels,
    skipDuplicates: true,
  });
})().catch((e) => console.error(e));
