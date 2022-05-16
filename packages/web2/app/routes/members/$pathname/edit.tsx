import { classNames } from "~/lib";
import type { ActionFunction, LoaderFunction } from "remix";
import { Form, useActionData, useLoaderData } from "remix";
import { CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/solid";
import invariant from "tiny-invariant";
import { z } from "zod";
import { prisma } from "~/db.server";
import { PathnameParams, TrainerId } from "~/schema/member";
import { notFound } from "~/response.server";
import { Box, Stack } from "@mui/material";
import { Typography } from "@mui/material";
import { Card } from "@mui/material";
import { CardHeader } from "@mui/material";
import { Container } from "@mui/material";
import { CardContent } from "@mui/material";
import { TextField } from "@mui/material";
import { error } from "console";
import { useState } from "react";
import { Button } from "@mui/material";

type LoaderData = Awaited<ReturnType<typeof getLoaderData>>;

const getLoaderData = async (pathname: string) => {
  const member = await prisma.member.findFirst({ where: { pathname } });
  if (!member) {
    throw notFound();
  }
  return { member };
};

export const loader: LoaderFunction = async ({ params: { pathname } }) => {
  invariant(pathname, "Pathname required");

  return getLoaderData(pathname);
};

type SchemaParseResult = ReturnType<typeof schema.safeParse>;
type ActionData = Awaited<ReturnType<typeof getActionData>>;

const getActionData = async (result: SchemaParseResult, pathname: string) => {
  if (result.success) {
    const { trainerId } = result.data;
    await prisma.member.update({ where: { pathname }, data: { trainerId } });
    return { success: true };
  } else {
    return {
      error: result.error.format(),
    };
  }
};

export const action: ActionFunction = async ({ request, params }) => {
  const data = Object.fromEntries(await request.formData());
  const { pathname } = PathnameParams.parse(params);
  const result = schema.safeParse(data);
  return getActionData(result, pathname);
};

const schema = z.object({
  trainerId: TrainerId,
});

export default function MemberPathnameEdit() {
  const { member } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();

  const [trainerId, setTrainerId] = useState(member.trainerId);

  return (
    <Container>
      <Box p={2}>
        <Card>
          <CardHeader
            title="トレーナーID登録"
            subheader="加入手続きやグループ内移籍のためにトレーナーID登録が必要です。"
          />
          <CardContent>
            <Stack spacing={4}>
              {actionData?.success && (
                <div className="rounded-md bg-green-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <CheckCircleIcon
                        className="h-5 w-5 text-green-400"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        更新しました。画面を閉じてDiscordに戻ってください。
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <Form method="post" replace={true}>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    id="trainerId"
                    name="trainerId"
                    label="トレーナーID"
                    value={trainerId}
                    error={!!actionData?.error?.trainerId}
                    onChange={(event) =>
                      setTrainerId(event.currentTarget.value)
                    }
                    helperText={
                      actionData?.error?.trainerId
                        ? actionData?.error?.trainerId?._errors?.join("/")
                        : "ゲームの「メニュー」→「プロフィール/トレーナー名刺」→「IDコピー」でコピーされた値を貼り付けてください。"
                    }
                  />
                  <Button variant="contained" type="submit">
                    登録
                  </Button>
                </Stack>
              </Form>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
