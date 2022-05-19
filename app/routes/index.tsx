import { Box, Button, Typography } from "@mui/material";
import React from "react";
import { Form, Link } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
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
      <Typography variant="body1">
        サークルに加入されていません、加入については運営メンバーへお問い合わせください。
      </Typography>
    );
  }
  return <LoggedInTop />;
}

const NoLoginTop: React.FC = () => {
  return (
    <Box p={4}>
      <div className="h-full min-h-full px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
        <div className="mx-auto max-w-max">
          <main className="sm:flex">
            <Typography variant="h1" color="primary">
              403
            </Typography>
            <div className="sm:ml-6">
              <div className="sm:border-l sm:border-gray-200 sm:pl-6">
                <Typography variant="h1">ログインされていません</Typography>
                <Typography variant="caption" className="mt-1">
                  このページを見るにはログインが必須です。
                </Typography>
              </div>
              <div className="mt-10 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6">
                <Form method="post" action="/api/auth/discord">
                  <Button
                    type="submit"
                    variant="contained"
                    className="inline-flex items-center "
                  >
                    Discordでログイン
                  </Button>
                </Form>
              </div>
            </div>
          </main>
        </div>
      </div>
    </Box>
  );
};

const LoggedInTop: React.FC = () => {
  const user = useOptionalUser();
  return (
    <Box>
      <div className="mx-auto max-w-7xl py-12 px-4 text-center sm:px-6 lg:py-16 lg:px-8">
        <Typography variant="h1">
          <span className="block">メンバー向けのページは準備中です。</span>
        </Typography>
        <div className="mt-8 flex justify-center">
          {user?.isAdmin && (
            <Button component={Link} variant="contained" to="/admin/">
              管理画面へ
            </Button>
          )}

          <div className="ml-3 inline-flex">
            <Form action="/auth/logout" method="post">
              <Button variant="text" type="submit">
                ログアウト
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </Box>
  );
};
