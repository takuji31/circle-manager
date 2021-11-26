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
    include: {
      monthCircles: {
        include: {
          circle: true,
        },
        where: {
          ...month,
        },
      },
    },
    where: {
      leavedAt: null,
      monthCircles: {
        some: { ...month },
      },
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
    (member) => {
      const circleName = member.monthCircles[0]?.circle?.name;
      if (!circleName) {
        throw new Error('No circle');
      }
      return `※このメッセージは自動送信です。\n\nあなたの来月の在籍希望は「${circleName}」です。\n変更がある場合は期限(${expiredAt})までに在籍希望アンケートに回答し直してください。\n期限を過ぎた場合ご希望に添えない可能性があります。\n\nよろしくお願いします。`;
    },
    (
      `在籍希望確認通知の送信結果 ${!isProduction ? '(テスト)' : ''}\n    ` +
      messages.join('\n    ')
    ).trim()
  );
})();
