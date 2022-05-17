import { config } from "dotenv";
import { sendDirectMessagesIfPossible } from "@/discord";
import { Circles, isCircleKey, nextMonthInt } from "@/model";
import { prisma } from "@/database";
import { MonthCircleState } from "@prisma/client";

config();

(async () => {
  const isProduction = process.env.NODE_ENV == "production";

  const { year, month } = nextMonthInt();

  const monthCircles = await prisma.monthCircle
    .findMany({
      where: {
        year,
        month,
        member: {
          leavedAt: null,
        },
      },
      include: {
        member: true,
      },
    })
    .then((monthCircles) =>
      monthCircles.map((m) => {
        const circle = isCircleKey(m.state)
          ? Circles.findByCircleKey(m.state)
          : null;
        return {
          ...m,
          circle,
        };
      })
    );

  await sendDirectMessagesIfPossible(
    monthCircles.map(({ circle, member, state }) => ({
      ...member,
      state,
      circle,
    })),
    (member) => {
      const state = member.state;
      if (isCircleKey(state)) {
        const circle = Circles.findByCircleKey(state);
        return `※このメッセージは自動送信です。

あなたの来月のサークルは「${circle.name}」です。
移籍になる場合は1日5時以降に移籍元サークルから除名され、移籍先サークルから勧誘されます。
除名/勧誘時にはDMで通知しますのでお待ちください。
また、このメッセージが送信されている場合でもノルマ未達により除名となる可能性はあります。

引き続きよろしくお願いします。`;
      } else if (state == MonthCircleState.Leaved) {
        return `※このメッセージは自動送信です。

サークル脱退について承りました。
1日5時以降にサークルから除名されます。
急いで脱退したいが次のサークルに加入する予定はない、あるいは24時間以上後という方以外は除名をお待ちください。
除名の際にはDMで通知します。

Discordからは3日後くらいを目処に削除しますので、挨拶等ある方はそれまでに済ませていただければと思います。
もし再び当サークルに所属したくなった場合はお知らせください、状況次第ですが対応させていだたきます。

当サークルを選んでいただき、ありがとうございました。新天地での活躍をお祈りします。`;
      } else if (state == MonthCircleState.OB) {
        return `※このメッセージは自動送信です。

サークル脱退について承りました。
1日5時以降にサークルから除名されます。
急いで脱退したいが次のサークルに加入する予定はない、あるいは24時間以上後という方以外は除名をお待ちください。
除名の際にはDMで通知します。

当サークルを選んでいただき、ありがとうございました。引き続きDiscordでもよろしくお願いします。`;
      } else if (state == MonthCircleState.Kicked) {
        return `※このメッセージは自動送信です。

あなたは今月の除名対象です。
1日5時以降にサークルから除名されます。
基本的に除名は取消しませんが、異議申し立てがある場合は運営メンバーまでお願いします。
`;
      }
      throw new Error(`Unknown state ${state}`);
    },
    `来月のサークル通知の送信結果 ${!isProduction ? "(テスト)" : ""}\n`
  );
})();
