import type { ActionFunction } from "remix";
import { Form, redirect, useActionData } from "remix";
import { prisma } from "~/db.server";
import { PathnameParams, TrainerId } from "~/schema/member";
import { z } from "zod";
import type { Params } from "react-router";
import { notFound } from "~/response.server";
import { useSingUpData } from "~/routes/members/pathname.$pathname/setup";
import { Link } from "@remix-run/react";
import { Button, Grid, TextField } from "@mui/material";
import { useState } from "react";

type ActionData = Awaited<ReturnType<typeof getActionData>>;

const trainerIdSchema = z.object({
  trainerId: TrainerId,
});

const getActionData = async (request: Request, params: Params<string>) => {
  const { pathname } = PathnameParams.parse(params);
  const data = Object.fromEntries(await request.formData());

  const member = await prisma.member.findFirst({
    where: { pathname },
    include: { signUp: true },
  });

  if (!member) {
    throw notFound();
  }

  const result = trainerIdSchema.safeParse(data);
  if (!result.success) {
    return {
      error: result.error.format(),
    };
  }
  const { trainerId } = result.data;
  await prisma.member.update({ where: { id: member.id }, data: { trainerId } });
  throw redirect(`/members/pathname/${pathname}/setup/circle`);
};

export const action: ActionFunction = async ({ request, params }) => {
  return await getActionData(request, params);
};

export default function MemberPathnameSetupRoot() {
  const { member, basePath } = useSingUpData();
  const actionData = useActionData<ActionData>();
  const error = actionData?.error?.trainerId?._errors?.join("/");

  const [trainerId, setTrainerId] = useState(member.trainerId);

  return (
    <div className="max-w-full">
      <div>
        <p className="mt-4 text-sm">
          加入手続きやグループ内移籍のためにトレーナーID登録が必要です。勧誘時にメンバーにトレーナーIDを共有している場合も必ずここで入力してください。
        </p>
        <p className="text-base leading-6 text-gray-500"></p>
      </div>
      <div className="mt-4">
        <Form method="post" className="space-y-6">
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
          <Grid
            container
            direction="row-reverse"
            justifyItems={{ xs: "center", sm: "end" }}
            spacing={2}
          >
            <Grid item xs={12} sm={6}>
              <Button variant="contained" type="submit" className="w-full">
                次へ
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                component={Link}
                to={`${basePath}/`}
                variant="contained"
                type="submit"
                className="w-full"
              >
                戻る
              </Button>
            </Grid>
          </Grid>
        </Form>
      </div>
    </div>
  );
}
