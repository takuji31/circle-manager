import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Stack,
  TextField,
} from "@mui/material";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import React, { useState } from "react";
import type { Params } from "react-router";
import { z } from "zod";
import { authenticator } from "~/auth.server";
import ButtonGrid from "~/components/form/button-grid";
import ButtonGridItem from "~/components/form/button-grid-item";
import { prisma } from "~/db.server";
import { completeSignUp } from "~/model/signup.server";
import { notFound } from "~/response.server";
import { useSingUpUrlData } from "~/routes/sign_up_urls/$signUpUrlId";
import { TrainerId } from "~/schema/member";
import { SignUpUrlIdParams } from "~/schema/signup.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await authenticator.isAuthenticated(request);
  if (!user) {
    throw redirect(`/sign_up_urls/${params.signUpUrlId}/`);
  }
  return null;
};

type ActionData = Awaited<ReturnType<typeof getActionData>>;

const getActionData = async (request: Request, params: Params<string>) => {
  const { signUpUrlId } = SignUpUrlIdParams.parse(params);
  const data = Object.fromEntries(await request.formData());

  const user = await authenticator.isAuthenticated(request);

  if (!user) {
    throw redirect(`/sign_up_urls/${signUpUrlId}/`);
  }

  const signUpUrl = await prisma.signUpUrl.findUnique({
    where: { id: signUpUrlId },
  });

  if (!signUpUrl) {
    throw notFound();
  }

  const result = z
    .object({
      trainerId: TrainerId,
    })
    .safeParse(data);

  if (!result.success) {
    return {
      error: result.error.format(),
    };
  }

  if (result.success) {
    const { trainerId } = result.data;
    await completeSignUp({ signUpUrlId, trainerId, user });
  }
  throw redirect(`/sign_up_urls/${signUpUrlId}/completed`);
};

export const action: ActionFunction = async ({ request, params }) => {
  return await getActionData(request, params);
};

export default function SignUpUrlsTrainerId() {
  const { basePath, signUpUrl, user } = useSingUpUrlData();
  const actionData = useActionData<ActionData>();
  const error = actionData?.error?.trainerId?._errors?.join("/");
  const [trainerId, setTrainerId] = useState(signUpUrl.trainerId);

  return (
    <Stack spacing={2} p={2}>
      <Card>
        <CardHeader
          title="トレーナーID登録"
          subheader="加入手続きやグループ内移籍のためにトレーナーID登録が必要です。勧誘時にメンバーにトレーナーIDを共有している場合も必ずここで入力してください。"
        />
        <CardContent>
          <Form method="post">
            <Stack spacing={6}>
              <TextField
                id="trainerId"
                label="トレーナーID"
                fullWidth
                value={trainerId}
                onChange={(event) => setTrainerId(event.currentTarget.value)}
                error={!!error}
                helperText={
                  error
                    ? error
                    : "ゲームの「メニュー」→「プロフィール/トレーナー名刺」→「IDコピー」でコピーされた値を貼り付けてください。"
                }
                name="trainerId"
              />
              <ButtonGrid>
                <ButtonGridItem>
                  <Button variant="contained" type="submit" className="w-full">
                    登録してDiscordサーバーに参加する
                  </Button>
                </ButtonGridItem>
                <ButtonGridItem>
                  <Button
                    component={Link}
                    to={`${basePath}/name`}
                    type="submit"
                    className="w-full"
                  >
                    戻る
                  </Button>
                </ButtonGridItem>
              </ButtonGrid>
            </Stack>
          </Form>
        </CardContent>
      </Card>
    </Stack>
  );
}
