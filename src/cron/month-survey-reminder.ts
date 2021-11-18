import { Circles } from './../model/circle';
import { nextMonth } from './../model/year_month';
import { prisma } from './../database/prisma';
import { config } from 'dotenv';
import { sendDirectMessagesIfPossible } from '../discord/message';

config();

(async () => {
  const isProduction = process.env.NODE_ENV == 'production';
  const month = nextMonth();
  const members = await prisma.member.findMany({
    where: {
      circle: {
        is: {
          selectableByUser: true,
        },
      },
      leavedAt: null,
      OR: [
        {
          monthCircles: {
            none: { ...month },
          },
        },
        {
          monthCircles: {
            some: {
              ...month,
              circleId: Circles.specialIds.noAnswer,
            },
          },
        },
      ],
    },
  });
  const messages: Array<string> = [];
  await sendDirectMessagesIfPossible(
    members,
    () => {
      return `在籍希望アンケートが未回答です。期限までに必ず`;
    },
    (
      `在籍希望アンケートの未回答者へのリマインダー送信結果 ${
        !isProduction ? '(テスト)' : ''
      }\n    ` + messages.join('\n    ')
    ).trim(),
    false
  );
})();
