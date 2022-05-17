import { monthCircleStateLabel } from "@circle-manager/shared/model";
import { MonthCircleState } from "@prisma/client";
import type { Params } from "react-router";
import type { ActionFunction, LoaderFunction } from "remix";
import { Form, useLoaderData, useSubmit, useTransition } from "remix";
import { json } from "remix";
import invariant from "tiny-invariant";
import { adminOnly } from "~/auth/loader";
import { prisma } from "~/db.server";
import { classNames } from "~/lib";
import AdminHeader from "~/components/admin/header";
import AdminHeaderTitle from "~/components/admin/header/title";
import {
  FormControlLabel,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { AdminBody } from "~/components/admin/body";

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
      <AdminHeader>
        <AdminHeaderTitle
          title={`${member.name}さんの${year}年${month}月サークル`}
        />
        <Typography color="text.disabled" variant="caption">
          サークルを変更します。
        </Typography>
      </AdminHeader>
      <AdminBody>
        <Form method="post" className="mx-4 space-y-2 sm:mx-6 md:mx-8">
          <ToggleButtonGroup
            value={monthCircle?.state}
            exclusive
            onChange={(_, state) => {
              handleSubmit({ state });
            }}
          >
            {Object.values(MonthCircleState).map((state) => (
              <ToggleButton key={state} value={state}>
                {monthCircleStateLabel(state)}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <FormControlLabel
            control={
              <Switch
                checked={monthCircle?.locked}
                onChange={(_, locked) => {
                  handleSubmit({ locked });
                }}
              />
            }
            label="変更をロックする(ランキング作成時に上書きされなくなります)"
          />
        </Form>
      </AdminBody>
    </div>
  );
}