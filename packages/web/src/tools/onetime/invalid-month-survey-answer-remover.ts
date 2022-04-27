import { config } from 'dotenv';
import { prisma } from 'database';
import { nextMonthInt } from 'model';
import { MemberStatus, MonthSurveyAnswerValue } from '@prisma/client';

config();

(async () => {
  const nextMonth = nextMonthInt();

  const where = {
    ...nextMonth,
    OR: [
      {
        member: {
          circleKey: null,
        },
      },
      {
        member: {
          status: {
            in: [
              MemberStatus.Kicked,
              MemberStatus.Leaved,
              MemberStatus.NotJoined,
            ],
          },
        },
      },
      {
        member: {
          status: MemberStatus.OB,
        },
        value: MonthSurveyAnswerValue.None,
      },
    ],
  };

  const monthSurvey = await prisma.monthSurveyAnswer.findMany({
    where,
    include: { member: true },
  });

  console.log(monthSurvey);

  await prisma.monthSurveyAnswer.deleteMany({ where });
})();
