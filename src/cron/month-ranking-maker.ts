import { config } from 'dotenv';
import { CreateNextMonthCirclesDocument } from '../graphql/generated/type';
import { sendAdminNotificationMessage } from '../discord/admin';
import { stringify } from 'csv-stringify/sync';
import { createUrqlClient } from '../graphql/client/serverside';
import { monthCircleStateLabel } from '../model/month_circle';

config();

(async () => {
  const urql = createUrqlClient();

  const response = await urql
    .mutation(CreateNextMonthCirclesDocument)
    .toPromise();
  const monthCircles = response.data?.createNextMonthCircles;

  if (!monthCircles) {
    throw new Error(
      'Cannot create month circle. error:' + response.error?.message
    );
  }

  const csv = stringify([
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
        monthCircleStateLabel(state),
      ]
    ),
  ]);

  await sendAdminNotificationMessage(
    `${monthCircles.year}年${monthCircles.month}月のサークルメンバーを確定しました。`,
    [
      {
        fileName: 'members.csv',
        rawBuffer: Buffer.from(csv, 'utf-8'),
      },
    ]
  );
})();
