import { Link, Outlet } from "@remix-run/react";
import { CheckIcon } from "@heroicons/react/solid";
import type { MetaFunction } from "@remix-run/node";
import type { LoaderFunction } from "remix";
import { useLoaderData, useLocation } from "remix";
import { prisma } from "~/db.server";
import { PathnameParams } from "~/schema/member";
import { notFound } from "~/response.server";
import { useMatchesData } from "~/utils";
import { useMemo } from "react";
import { Typography } from "@mui/material";

const StepId = {
  name: "name",
  trainerId: "trainerId",
  circle: "circle",
  completed: "completed",
} as const;
// eslint-disable-next-line @typescript-eslint/no-redeclare
type StepId = typeof StepId[keyof typeof StepId];

const steps = [
  { id: StepId.name, name: "トレーナー名登録", path: "/" },
  {
    id: StepId.trainerId,
    name: "トレーナーID登録",
    path: "/trainer_id",
  },
  {
    id: StepId.circle,
    name: "サークル選択",
    path: "/circle",
  },
  {
    id: StepId.completed,
    name: "完了",
    path: "/completed",
  },
];

type LoaderData = Awaited<ReturnType<typeof getLoaderData>>;

export const meta: MetaFunction = ({ data }) => {
  return {
    title: "加入申請 - ウマ娘愛好会",
  };
};

const getLoaderData = async (pathname: string) => {
  const memberOrNull = await prisma.member.findFirst({
    where: { pathname },
    include: { signUp: true },
  });
  if (!memberOrNull) {
    throw notFound();
  }
  const { signUp, ...member } = memberOrNull;
  return {
    member: member,
    signUp: signUp,
    basePath: `/members/${member.pathname}/setup`,
  };
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const { pathname } = PathnameParams.parse(params);
  return getLoaderData(pathname);
};

export default function MemberPathnameSetupRoot() {
  const { basePath } = useLoaderData<LoaderData>();
  const location = useLocation();
  const currentStepIdx = useMemo(
    () =>
      steps.findIndex(
        (step) => location.pathname === `${basePath}${step.path}`
      ),
    [basePath, location]
  );

  return (
    <div className="space-y-4 px-2 py-4 sm:px-4 md:px-6">
      <div>
        <h1 className="text-xl">加入申請</h1>
        <p className="mt-2 text-sm">
          ウマ娘愛好会グループへようこそ！
          <br />
          ここでは加入のために必要な情報を入力していただきます。
        </p>
        <p className="text-sm">
          全て完了しないと加入申請が受け付けられませんのでご注意ください。
        </p>
      </div>
      <nav aria-label="Progress">
        <ol
          role="list"
          className="divide-y divide-gray-300 rounded-md border border-gray-300 md:flex md:divide-y-0"
        >
          {steps.map((step, stepIdx) => {
            const to = `${basePath}${step.path}`;
            return (
              <li key={step.id} className="relative md:flex md:flex-1">
                {stepIdx < currentStepIdx ? (
                  <Link to={to} className="group flex w-full items-center">
                    <span className="flex items-center px-6 py-4 text-sm font-medium">
                      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 group-hover:bg-indigo-800 dark:bg-indigo-500 dark:group-hover:bg-indigo-600">
                        <CheckIcon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                      </span>
                      <span className="ml-4">
                        <Typography variant="subtitle2">{step.name}</Typography>
                      </span>
                    </span>
                  </Link>
                ) : stepIdx == currentStepIdx ? (
                  <div
                    className="flex items-center px-6 py-4 text-sm font-medium"
                    aria-current="step"
                  >
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-indigo-600">
                      <Typography variant="subtitle2" color="primary">
                        {stepIdx + 1}
                      </Typography>
                    </span>
                    <Typography variant="subtitle2" color="primary" ml={2}>
                      {step.name}
                    </Typography>
                  </div>
                ) : (
                  <div className="group flex items-center">
                    <span className="flex items-center px-6 py-4 text-sm font-medium">
                      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300">
                        <Typography variant="subtitle2" color="text.disabled">
                          {stepIdx + 1}
                        </Typography>
                      </span>
                      <Typography
                        variant="subtitle2"
                        color="text.disabled"
                        ml={2}
                      >
                        {step.name}
                      </Typography>
                    </span>
                  </div>
                )}

                {stepIdx !== steps.length - 1 ? (
                  <>
                    {/* Arrow separator for lg screens and up */}
                    <div
                      className="absolute top-0 right-0 hidden h-full w-5 md:block"
                      aria-hidden="true"
                    >
                      <svg
                        className="h-full w-full text-gray-300"
                        viewBox="0 0 22 80"
                        fill="none"
                        preserveAspectRatio="none"
                      >
                        <path
                          d="M0 -2L20 40L0 82"
                          vectorEffect="non-scaling-stroke"
                          stroke="currentcolor"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </>
                ) : null}
              </li>
            );
          })}
        </ol>
      </nav>
      <Outlet />
    </div>
  );
}

export const useSingUpData = () => {
  const data = useMatchesData(`routes/members/$pathname/setup`);
  return data as LoaderData;
};
