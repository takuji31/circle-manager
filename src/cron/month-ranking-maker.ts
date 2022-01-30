import { config } from 'dotenv';
import { CreateNextMonthCirclesDocument } from '../graphql/generated/type';
import { sendAdminNotificationMessage } from '../discord/admin';
import { stringify } from 'csv-stringify/sync';
import { createUrqlClient } from '../graphql/client/serverside';

config();

(async () => {
  const isProduction = process.env.NODE_ENV == 'production';

  const urql = createUrqlClient();

  const monthCircles = (
    await urql.mutation(CreateNextMonthCirclesDocument).toPromise()
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
