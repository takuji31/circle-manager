import { prisma } from '@/database';
import { config } from 'dotenv';
import { sendDirectMessagesIfPossible } from '@/discord';
import { MonthSurveyAnswerValue } from '@prisma/client';
import {
  DateFormats,
  nativeJs,
  ZonedDateTime,
  ZoneId,
  nextMonthInt,
} from '@/model';

config();

(async () => {
  const isProduction = process.env.NODE_ENV == 'production';
  const month = nextMonthInt();
  const members = await prisma.member.findMany({
    where: {
      circleKey: {
        not: null,
      },
      leavedAt: null,
      monthSurveyAnswer: {
        some: {
          ...month,
          value: MonthSurveyAnswerValue.None,
        },
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
  const expiredAt = ZonedDateTime.from(
    nativeJs(monthSurvey.expiredAt, ZoneId.of('Asia/Tokyo'))
  ).format(DateFormats.dateWithHour);
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
