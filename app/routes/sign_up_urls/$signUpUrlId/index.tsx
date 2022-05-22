import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Stack,
  Typography,
} from "@mui/material";
import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import React, { useMemo } from "react";
import invariant from "tiny-invariant";
import { authenticator } from "~/auth.server";
import ButtonGrid from "~/components/form/button-grid";
import ButtonGridItem from "~/components/form/button-grid-item";
import { setNameToSignUpUrl } from "~/model/signup.server";
import { useSingUpUrlData } from "~/routes/sign_up_urls/$signUpUrlId";
import { SignUpUrlIdParams } from "~/schema/signup.server";

export const action: ActionFunction = async ({ request, params }) => {
  const { signUpUrlId } = SignUpUrlIdParams.parse(params);
  const user = await authenticator.isAuthenticated(request);
  invariant(user, "Login required");
  await setNameToSignUpUrl({ signUpUrlId, trainerName: user.name });
  return redirect(`/sign_up_urls/${signUpUrlId}/name`);
};

export default function SignUpUrlsIndex() {
  const { basePath, baseUrl, user } = useSingUpUrlData();
  const loginAction = useMemo(() => {
    const url = new URL("/api/auth/discord", baseUrl);
    url.searchParams.set("returnTo", `${basePath}/`);
    return url.href.replace(baseUrl, "");
  }, [basePath]);
  const logoutAction = useMemo(() => {
    const url = new URL("/auth/logout", baseUrl);
    url.searchParams.set("returnTo", `${basePath}/`);
    return url.href.replace(baseUrl, "");
  }, [basePath]);
  return (
    <Stack spacing={2} p={2}>
      <Card>
        <CardHeader
          title="ログイン"
          subheader="加入申請を続ける前にDiscordへのログインが必要です。加入申請完了後に自動的にDiscordサーバーへ招待されます。"
          action={
            <>
              {user ? (
                <Stack spacing={2} direction="row" alignItems="center">
                  <Typography variant="h6">{user.name}さん</Typography>
                  <Form action={logoutAction} method="post">
                    <Button type="submit">ログアウト</Button>
                  </Form>
                </Stack>
              ) : (
                <Form action={loginAction} method="post">
                  <Button type="submit" variant="contained">
                    Discordでログイン
                  </Button>
                </Form>
              )}
            </>
          }
        />
        <CardContent>
          <Stack spacing={2}>
            <ButtonGrid>
              <ButtonGridItem>
                <Form method="post">
                  <Button
                    variant="contained"
                    type="submit"
                    className="w-full"
                    disabled={user == null}
                  >
                    次へ
                  </Button>
                </Form>
              </ButtonGridItem>
            </ButtonGrid>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
