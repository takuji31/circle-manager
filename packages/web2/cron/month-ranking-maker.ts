import { config } from "dotenv";
import { CreateNextMonthCirclesDocument } from "../../web/src/graphql/generated/type";
import { sendAdminNotificationMessage } from "@circle-manager/shared/discord";
import { stringify } from "csv-stringify/sync";
import { createUrqlClient } from "../../web/src/graphql/client/serverside";
import { monthCircleStateLabel } from "@circle-manager/shared/model";

config();

(async () => {
  const urql = createUrqlClient();

  const response = await urql
    .mutation(CreateNextMonthCirclesDocument)
    .toPromise();
  const monthCircles = response.data?.createNextMonthCircles;

  if (!monthCircles) {
    throw new Error(
      "Cannot create month circle. error:" + response.error?.message
    );
  }

  const csv = stringify([
    [
      "メンバーID",
      "トレーナー名",
      "トレーナーID",
      "今月のサークル",
      "来月の在籍",
    ],
    ...monthCircles.monthCircles.map(
      ({ member: { id, name, trainerId }, currentCircle, state }) => [
        id,
        name,
        trainerId,
        currentCircle?.name ?? "OB",
        monthCircleStateLabel(state),
      ]
    ),
  ]);

  await sendAdminNotificationMessage(
    `${monthCircles.year}年${monthCircles.month}月のサークルメンバーを確定しました。`,
    [
      {
        name: "members.csv",
        data: Buffer.from(csv, "utf-8"),
      },
    ]
  );
})();
