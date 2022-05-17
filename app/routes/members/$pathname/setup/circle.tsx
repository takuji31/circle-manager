import { Link } from "@remix-run/react";
import { CheckCircleIcon } from "@heroicons/react/solid";
import { ActionFunction, Form, redirect, useActionData } from "remix";
import { prisma } from "~/db.server";
import { ActiveCircleKey, PathnameParams } from "~/schema/member";
import { classNames } from "~/lib";
import { z } from "zod";
import { Params } from "react-router";
import { notFound } from "~/response.server";
import { useSingUpData } from "~/routes/members/$pathname/setup";
import { useState } from "react";
import { RadioGroup } from "@headlessui/react";
import { Circles } from "@/model";
import { sendAdminNotificationMessage } from "@/discord";
import { updateMemberSignUpCircle } from "~/model/signup.server";
import { Grid, Button } from "@mui/material";

type ActionData = Awaited<ReturnType<typeof getActionData>>;

const circleSchema = z.object({
  circle: ActiveCircleKey,
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

  const result = circleSchema.safeParse(data);

  if (!result.success) {
    return {
      error: result.error.name ? "サークルを選択してください" : undefined,
    };
  }

  const { circle } = result.data;

  await updateMemberSignUpCircle({ memberId: member.id, circleKey: circle });

  throw redirect(`/members/${pathname}/setup/completed`);
};

export const action: ActionFunction = async ({ request, params }) => {
  return await getActionData(request, params);
};

const fanCounts: Record<ActiveCircleKey, string> = {
  Saikyo: "ノルマ：1億人/月",
  Shin: "ノルマ：2000万人/月、稼働目標：4000万人/月",
  Ha: "ノルマ：2000万人/月",
};

export default function MemberPathnameSetupRoot() {
  const { member, signUp, basePath } = useSingUpData();
  const actionData = useActionData<ActionData>();
  const error = actionData?.error;

  const [circleKey, setCircleKey] = useState(signUp?.circleKey);

  return (
    <div className="max-w-full">
      <Form method="post" className="space-y-6">
        <div>
          <RadioGroup value={circleKey} name="circle" onChange={setCircleKey}>
            <RadioGroup.Label className="text-base font-medium text-gray-900">
              サークルを選択
            </RadioGroup.Label>

            <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-3 sm:gap-x-4">
              {Circles.activeCircles.map((circle) => (
                <RadioGroup.Option
                  key={circle.key}
                  value={circle.key}
                  className={({ checked, active }) =>
                    classNames(
                      checked ? "border-transparent" : "border-gray-300",
                      active ? "border-indigo-500 ring-2 ring-indigo-500" : "",
                      "relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none"
                    )
                  }
                >
                  {({ checked, active }) => (
                    <>
                      <div className="flex flex-1">
                        <div className="flex flex-col">
                          <RadioGroup.Label
                            as="span"
                            className="block text-sm font-medium text-gray-900"
                          >
                            {circle.name}
                          </RadioGroup.Label>
                          <RadioGroup.Description
                            as="span"
                            className="mt-1 flex items-center text-sm text-gray-500"
                          >
                            {fanCounts[circle.key as ActiveCircleKey]}
                          </RadioGroup.Description>
                        </div>
                      </div>
                      <CheckCircleIcon
                        className={classNames(
                          !checked ? "invisible" : "",
                          "h-5 w-5 text-indigo-600"
                        )}
                        aria-hidden="true"
                      />
                      <div
                        className={classNames(
                          active ? "border" : "border-2",
                          checked ? "border-indigo-500" : "border-transparent",
                          "pointer-events-none absolute -inset-px rounded-lg"
                        )}
                        aria-hidden="true"
                      />
                    </>
                  )}
                </RadioGroup.Option>
              ))}
            </div>
          </RadioGroup>
          <p className="mt-2 text-sm text-red-600">{error}</p>
        </div>
        <div>
          <p className="mt-4 text-sm">
            加入予定のサークルを選択してください。事前に運営メンバーに連絡している加入予定のサークル以外を選択した場合には加入できない場合がありますのでご注意ください。
          </p>
          <p className="text-base leading-6 text-gray-500"></p>
        </div>
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
              to={`${basePath}/trainer_id`}
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
  );
}
