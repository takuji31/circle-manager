import { sendDirectMessageIfPossible } from "@/discord";
import type { Circle } from "@/model";
import type { Member } from "@prisma/client";

export const sendWelcomeMessage = async (member: Member) => {
  await sendDirectMessageIfPossible(
    member,
    `ウマ娘愛好会グループへようこそ。加入に際して以下の手順を行ってください。
1. サーバールールの確認画面がでてくるので、確認して同意してください。送信を押しても先に進めない場合はDiscordのアプリが最新かどうか確認してください。
2. <#889833366126465044> を確認してください。
3. <#865547736233279508> で挨拶をお願いします。
4. ゲーム内のサークルはリーダーかサブリーダーから勧誘が来ますので、お待ちください。

不明な点がありましたら <#870289174232702986> で気軽に質問してください！

それではこれからよろしくお願いします。`
  );
};

const JoinReasons = ["signUp", "move"] as const;
export type JoinReason = typeof JoinReasons[number];

export const sendInvitedMessage = async (
  member: Member,
  fromCircle: Circle,
  reason: JoinReason
) => {
  await sendDirectMessageIfPossible(
    member,
    `${fromCircle.name}から勧誘を送信しました。
前のサークルから除名され次第、勧誘を承認してサークルに加入してください。
また、加入時にサークルのメンバー一覧を開いて自分のファン数が写るようにスクリーンショットを撮影して <#870289174232702986> に貼り付けてください。\n` +
      (reason == "signUp"
        ? "それではこれからよろしくお願いします！"
        : "引き続きよろしくお願いします。")
  );
};

const KickReasons = ["move", "leave", "kick"] as const;
export type KickReason = typeof KickReasons[number];

export const sendKickedMessage = async (
  member: Member,
  fromCircle: Circle,
  kickReason: KickReason
) => {
  let message: string;
  if (kickReason == "move") {
    message = `${fromCircle.name}から除名しました。
移籍先のサークルからの勧誘をお待ちください。
勧誘が既に来ている場合はすぐに加入できます。`;
  } else if (kickReason == "leave") {
    message = `${fromCircle.name}から除名しました。
Discord残留の方は引き続きよろしくお願いします。
Discordからも脱退される方は3日以内にお願いします。Discord残留に変更されたい方は運営メンバーにお知らせください。
当サークルに在籍いただきありがとうございました！`;
  } else {
    message = `${fromCircle.name}から除名しました。
除名のためDiscordからも脱退とさせていだたきます。
当サークルに在籍いただきありがとうございました！`;
  }
  await sendDirectMessageIfPossible(member, message);
};
