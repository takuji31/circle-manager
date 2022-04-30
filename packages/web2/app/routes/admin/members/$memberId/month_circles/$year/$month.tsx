import { monthCircleStateLabel } from "@circle-manager/shared/model";
import { RadioGroup, Switch } from "@headlessui/react";
import { MonthCircleState } from "@prisma/client";
import { useState } from "react";
import { Params } from "react-router";
import { ActionFunction, LoaderFunction, useActionData } from "remix";
import { Form, useLoaderData, useSubmit, useTransition } from "remix";
import { json } from "remix";
import invariant from "tiny-invariant";
import { adminOnly } from "~/auth/loader";
import { prisma } from "~/db.server";
import { classNames } from "~/lib";

type LoaderData = Awaited<ReturnType<typeof getLoaderData>>;

const getLoaderData = async ({
  memberId,
  year,
  month,
}: {
  memberId: string;
  year: number;
  month: number;
}) => {
  return prisma.member
    .findFirst({
      where: { id: memberId },
      include: { monthCircles: { where: { year, month }, skip: 0, take: 1 } },
    })
    .then((member) => {
      if (!member) {
        throw new Error("Not Found");
      }
      return {
        member,
        monthCircle: member.monthCircles[0] ?? null,
        year,
        month,
      };
    });
};

const getParams = (params: Params<string>) => {
  const { memberId, year, month } = params;
  invariant(memberId, "memberId required");
  invariant(year, "year required");
  invariant(month, "month required");
  return { memberId, year: parseInt(year), month: parseInt(month) };
};

export const loader: LoaderFunction = adminOnly(async ({ params }) => {
  const { memberId, year, month } = getParams(params);
  return json(
    await getLoaderData({
      memberId,
      year,
      month,
    })
  );
});

type ActionData = {};

export const action: ActionFunction = async ({ request, params }) => {
  const { memberId, year, month } = getParams(params);
  const formData = await request.formData();
  const locked =
    formData.get("locked") != undefined ? !!formData.get("locked") : undefined;
  const state = formData.get("state") as MonthCircleState;
  console.log("%s", { memberId, year, month, locked, state });
  const member = await prisma.member.findFirst({ where: { id: memberId } });
  if (!member) throw new Error("Not Found");
  if (!state) throw new Error("State cannot null");
  if (!Object.values(MonthCircleState).includes(state))
    throw new Error(`Unknown state ${state}`);

  await prisma.monthCircle.upsert({
    where: {
      year_month_memberId: {
        year,
        month,
        memberId,
      },
    },
    create: {
      memberId,
      year,
      month,
      currentCircleKey: member.circleKey,
      state,
      locked,
    },
    update: {
      state,
      locked,
    },
  });
  return null;
};

export default function AdminMemberMonthCircle() {
  const { member, monthCircle, year, month } = useLoaderData() as LoaderData;
  const submit = useSubmit();
  const transition = useTransition();

  const handleSubmit = ({
    state,
    locked,
  }: {
    state?: MonthCircleState;
    locked?: boolean;
  }) => {
    submit(
      {
        state: state ?? monthCircle?.state,
        locked: locked ?? monthCircle?.locked ? "locked" : "",
      },
      {
        replace: true,
        method: "post",
        encType: "application/x-www-form-urlencoded",
      }
    );
  };

  return (
    <div className="flex flex-col space-y-4">
      <div>
        <h3 className="text-lg font-medium leading-6 ">{`${member.name}さんの${year}年${month}月サークル`}</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
          サークルを変更します。
        </p>
      </div>
      <Form
        method="post"
        onChange={(event) => submit(event.currentTarget, { replace: true })}
      >
        <div className="flex flex-col justify-start space-y-4">
          <RadioGroup
            value={monthCircle?.state}
            onChange={(state) => {
              handleSubmit({ state });
            }}
            className="mt-2"
            name="state"
          >
            <RadioGroup.Label className="sr-only">
              サークルを選択
            </RadioGroup.Label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Object.values(MonthCircleState).map((state) => (
                <RadioGroup.Option
                  key={state}
                  value={state}
                  className={({ active, checked }) =>
                    classNames(
                      state
                        ? "cursor-pointer focus:outline-none"
                        : "cursor-not-allowed opacity-25",
                      active ? "ring-2 ring-indigo-500 ring-offset-2" : "",
                      checked
                        ? "border-transparent bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-600  dark:hover:bg-primary-700"
                        : "border-gray-200 bg-white text-black hover:bg-gray-50 dark:bg-gray-700 dark:text-white  dark:hover:bg-gray-600",
                      "text-md flex items-center justify-center rounded-md border py-3 px-3 font-medium sm:flex-1"
                    )
                  }
                  disabled={!state}
                >
                  <RadioGroup.Label as="p">
                    {monthCircleStateLabel(state)}
                  </RadioGroup.Label>
                </RadioGroup.Option>
              ))}
            </div>
          </RadioGroup>
          <div className="flex space-x-4">
            <Switch.Group as="div" className="flex items-center">
              <Switch
                id="switch-locked"
                disabled={
                  transition.state == "submitting" || monthCircle == null
                }
                checked={monthCircle?.locked ?? false}
                onChange={(locked) => {
                  handleSubmit({ locked });
                }}
                className={classNames(
                  monthCircle?.locked
                    ? "bg-secondary-600 dark:bg-secondary-500"
                    : "bg-gray-200 dark:bg-gray-700",
                  "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                )}
              >
                <span
                  aria-hidden="true"
                  className={classNames(
                    monthCircle?.locked ? "translate-x-5" : "translate-x-0",
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                  )}
                />
              </Switch>
              <Switch.Label as="span" className="ml-3 cursor-pointer">
                変更をロックする(ランキング作成時に上書きされなくなります)
              </Switch.Label>
            </Switch.Group>
          </div>
        </div>
      </Form>
    </div>
  );
}
