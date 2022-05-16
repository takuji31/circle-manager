import type { ActionFunction } from "remix";
import { Form, redirect, useActionData } from "remix";
import { prisma } from "~/db.server";
import { PathnameParams, TrainerName } from "~/schema/member";
import { z } from "zod";
import type { Params } from "react-router";
import { notFound } from "~/response.server";
import { updateMemberName } from "~/model/member.server";
import { useSingUpData } from "~/routes/members/$pathname/setup";
import { TextField } from "@mui/material";
import { useState } from "react";
import { Grid } from "@mui/material";
import { Button } from "@mui/material";

type ActionData = Awaited<ReturnType<typeof getActionData>>;

const schema = z.object({
  name: TrainerName,
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

  const result = schema.safeParse(data);
  if (!result.success) {
    return {
      error: result.error.format(),
    };
  }
  if (
    result.success &&
    member.name != result.data.name &&
    process.env.NODE_ENV == "production"
  ) {
    await updateMemberName({ memberId: member.id, name: result.data.name });
  }
  throw redirect(`/members/${pathname}/setup/trainer_id`);
};

export const action: ActionFunction = async ({ request, params }) => {
  return await getActionData(request, params);
};

export default function MemberPathnameSetupRoot() {
  const { member, signUp, basePath } = useSingUpData();
  const actionData = useActionData<ActionData>();
  const error = actionData?.error?.name?._errors?.join("/");
  const [name, setName] = useState(member.name);

  return (
    <div className="max-w-full">
      <div>
        <p className="mt-4 text-sm">
          ファン数記録、連絡、移籍といった各種手続きやDiscordサーバー内での円滑なコミュニケーションのためにトレーナー名をDiscordサーバーニックネームとして登録します。
        </p>
        <p className="text-base leading-6 text-gray-500"></p>
      </div>
      <div className="mt-4">
        <Form method="post" className="space-y-6">
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
                : "ゲーム内のトレーナー名とは必ず「完全一致」にしてください。"
            }
            name="name"
          />
          <Grid
            container
            direction="row-reverse"
            justifyItems={{ xs: "center", sm: "end" }}
          >
            <Grid item xs={12} sm={6}>
              <Button variant="contained" type="submit" className="w-full">
                次へ
              </Button>
            </Grid>
          </Grid>
        </Form>
      </div>
    </div>
  );
}
