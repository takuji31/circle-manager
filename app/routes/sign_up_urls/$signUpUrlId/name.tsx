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
import { setNameToSignUpUrl } from "~/model/signup.server";
import { notFound } from "~/response.server";
import { useSingUpUrlData } from "~/routes/sign_up_urls/$signUpUrlId";
import { TrainerName } from "~/schema/member";
import { SignUpUrlIdParams } from "~/schema/signup.server";

type ActionData = Awaited<ReturnType<typeof getActionData>>;

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await authenticator.isAuthenticated(request);
  if (!user) {
    throw redirect(`/sign_up_urls/${params.signUpUrlId}/`);
  }
  return null;
};

const getActionData = async (request: Request, params: Params<string>) => {
  const { signUpUrlId } = SignUpUrlIdParams.parse(params);
  const data = Object.fromEntries(await request.formData());

  const signUpUrl = await prisma.signUpUrl.findUnique({
    where: { id: signUpUrlId },
  });

  if (!signUpUrl) {
    throw notFound();
  }

  const result = z
    .object({
      name: TrainerName,
    })
    .safeParse(data);

  if (!result.success) {
    return {
      error: result.error.format(),
    };
  }
  if (result.success) {
    await setNameToSignUpUrl({ signUpUrlId, trainerName: result.data.name });
  }
  throw redirect(`/sign_up_urls/${signUpUrlId}/trainer_id`);
};

export const action: ActionFunction = async ({ request, params }) => {
  return await getActionData(request, params);
};

export default function SignUpUrlsName() {
  const { basePath, signUpUrl, user } = useSingUpUrlData();
  const actionData = useActionData<ActionData>();
  const error = actionData?.error?.name?._errors?.join("/");
  const [name, setName] = useState(signUpUrl.name);

  return (
    <Stack spacing={2} p={2}>
      <Card>
        <CardHeader
          title="トレーナー名登録"
          subheader="ファン数記録、連絡、移籍といった各種手続きやコミュニケーションのためにDiscordのサーバー内ニックネームとして設定します。"
        />
        <CardContent>
          <Form method="post">
            <Stack spacing={6}>
              <TextField
                id="name"
                label="トレーナー名"
                fullWidth
                value={name}
                onChange={(event) => setName(event.currentTarget.value)}
                error={!!error}
                helperText={
                  error
                    ? error
                    : "ゲーム内のトレーナー名とは必ず「完全一致」にしてください。完全一致でないとファン数が記録されなくなることがあります。"
                }
                name="name"
              />
              <ButtonGrid>
                <ButtonGridItem>
                  <Button variant="contained" type="submit" className="w-full">
                    次へ
                  </Button>
                </ButtonGridItem>
                <ButtonGridItem>
                  <Button
                    component={Link}
                    to={`${basePath}/`}
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
