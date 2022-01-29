import { config } from 'dotenv';
import { sendDirectMessagesIfPossible } from '../discord/message';
import { monthSurveyAnswerLabel } from '../model/month_survey_answer';
import { createServerSideApolloClient } from '../apollo/serverside';
import {
  CreateNextMonthCirclesDocument,
  MonthCircleState,
} from '../graphql/generated/type';
import { Circles, isCircleKey } from '../model';
import { sendAdminNotificationMessage } from '../discord/admin';
import { stringify } from 'csv-stringify/sync';

config();

(async () => {
  const isProduction = process.env.NODE_ENV == 'production';

  const appoloClient = createServerSideApolloClient();

  const monthCircles = (
    await appoloClient.mutate({
      mutation: CreateNextMonthCirclesDocument,
    })
  ).data?.createNextMonthCircles;

  if (!monthCircles) {
    throw new Error('Cannot create month circle.');
  }

  stringify([
    [
      'メンバーID',
      'トレーナー名',
      'トレーナーID',
      '今月のサークル',
      '来月の在籍',
    ],
    ...monthCircles.monthCircles.map(
      ({ member: { id, name, trainerId }, currentCircle, state }) => [
        id,
        name,
        trainerId,
        currentCircle?.name ?? 'OB',
        state,
      ]
    ),
  ]);

  await sendAdminNotificationMessage(
    `${monthCircles.year}年${monthCircles.month}月のサークルメンバーを確定しました。`,
    [
      {
        fileName: 'members.csv',
        rawBuffer: Buffer.from('', 'utf-8'),
      },
    ]
  );
})();
