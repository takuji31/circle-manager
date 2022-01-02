import { Member } from '@prisma/client';
import { sendDirectMessageIfPossible } from '../message';

export const sendSetupMessage = async (member: Member) => {
  const setupUrl = `${process.env.BASE_URL}/members/${member.pathname}/setup`;
  await sendDirectMessageIfPossible(
    member,
    `ウマ娘愛好会グループへようこそ。以下の手順に従って加入手続きを行ってください。
1. サーバールールの確認画面がでてくるので、確認して同意してください。送信を押しても先に進めない場合はDiscordのアプリが最新かどうか確認してください。
2. 次のリンクを開いて必要な情報を入力してください。 ${setupUrl}
3. <#889833366126465044> を確認してください。
4. <#865547736233279508> で挨拶をお願いします。
5. ゲーム内のサークルはリーダーかサブリーダーから勧誘が来ますので、お待ちください。

不明な点がありましたら <#870289174232702986> で気軽に質問してください！

それではこれからよろしくお願いします。`
  );
};
