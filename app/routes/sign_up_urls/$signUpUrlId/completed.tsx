import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import React from "react";
import { authenticator } from "~/auth.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await authenticator.isAuthenticated(request);
  if (!user) {
    throw redirect(`/sign_up_urls/${params.signUpUrlId}/`);
  }
  return null;
};

export default function MemberPathnameSetupRoot() {
  return (
    <div className="max-w-full">
      <div>
        <p className="mt-4 text-sm">
          入力お疲れ様でした、加入申請を受け付けました。この画面を閉じてDiscordに戻ってください。
        </p>
        <p className="text-base leading-6 text-gray-500"></p>
      </div>
    </div>
  );
}
