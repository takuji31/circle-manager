import { use } from "@circle-manager/shared/model";
import { useOptionalUser } from "~/utils";

export default function Index() {
  const user = useOptionalUser();
  if (!user) {
    return <p className="text-base">ログインしてください</p>;
  } else if (!user.isMember) {
    return (
      <p className="text-base">
        サークルに加入されていません、加入については運営メンバーへお問い合わせください。
      </p>
    );
  } else if (!user.isAdmin) {
    return <p className="text-base">メンバー向けのページは準備中です。</p>;
  }
  return (
    <p className="block p-4 text-base">上部のメニューを選択してください。</p>
  );
}
