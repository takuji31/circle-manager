import { Circles } from './../model/circle';
import { nextMonth } from './../model/year_month';
import { prisma } from './../database/prisma';
import { config } from 'dotenv';
import { sendDirectMessagesIfPossible } from '../discord/message';
import { Temporal } from 'proposal-temporal';

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
  const monthSurvey = await prisma.monthSurvey.findUnique({
    where: { year_month: month },
  });
  if (!monthSurvey) {
    return;
  }
  const messages: Array<string> = [];
  const expiredAt = Temporal.Instant.fromEpochMilliseconds(
    monthSurvey.expiredAt.getTime()
  )
    .toZonedDateTime({
      timeZone: 'Asia/Tokyo',
      calendar: 'iso8601',
    })
    .toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
      hour: 'numeric',
    });
  await sendDirectMessagesIfPossible(
    members,
    () => {
      return `※このメッセージは自動送信です。\n\n在籍希望アンケートが未回答です。期限(${expiredAt})までに必ず回答してください。回答がない場合は除名となります！\n\nよろしくお願いします。`;
    },
    (
      `在籍希望アンケートの未回答者へのリマインダー送信結果 ${
        !isProduction ? '(テスト)' : ''
      }\n    ` + messages.join('\n    ')
    ).trim()
  );
})();
