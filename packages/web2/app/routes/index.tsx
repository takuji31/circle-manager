import React from "react";
import { Form, LoaderFunction } from "remix";
import { redirect } from "remix";
import { authenticator } from "~/auth.server";
import { useOptionalUser } from "~/utils";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request);
  return user?.isAdmin ? redirect("/admin/") : null;
};

export default function Index() {
  const user = useOptionalUser();
  if (!user) {
    return <NoLoginTop />;
  } else if (!user.isMember) {
    return (
      <p className="text-base">
        サークルに加入されていません、加入については運営メンバーへお問い合わせください。
      </p>
    );
  }
  return <LoggedInTop />;
}

const NoLoginTop: React.FC = () => {
  return (
    <>
      <div className="min-h-full bg-white px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
        <div className="mx-auto max-w-max">
          <main className="sm:flex">
            <p className="text-4xl font-extrabold text-indigo-600 sm:text-5xl">
              403
            </p>
            <div className="sm:ml-6">
              <div className="sm:border-l sm:border-gray-200 sm:pl-6">
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                  ログインされていません
                </h1>
                <p className="mt-1 text-base text-gray-500">
                  このページを見るにはログインが必須です。
                </p>
              </div>
              <div className="mt-10 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6">
                <Form method="post" action="/api/auth/discord">
                  <button
                    type="submit"
                    className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Discordでログイン
                  </button>
                </Form>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

const LoggedInTop: React.FC = () => {
  const user = useOptionalUser();
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl py-12 px-4 text-center sm:px-6 lg:py-16 lg:px-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          <span className="block">メンバー向けのページは準備中です。</span>
        </h2>
        <div className="mt-8 flex justify-center">
          {user?.isAdmin && (
            <div className="inline-flex rounded-md shadow">
              <a
                href="/admin/"
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-5 py-3 text-base font-medium text-white hover:bg-indigo-700"
              >
                管理画面へ
              </a>
            </div>
          )}

          <div className="ml-3 inline-flex">
            <Form action="/auth/logout" method="post">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-100 px-5 py-3 text-base font-medium text-indigo-700 hover:bg-indigo-200"
              >
                ログアウト
              </button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};
