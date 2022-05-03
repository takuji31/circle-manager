import { Link } from "@remix-run/react";
import { CheckIcon, ExclamationCircleIcon } from "@heroicons/react/solid";
import { MetaFunction } from "@remix-run/node";
import {
  ActionFunction,
  Form,
  LoaderFunction,
  redirect,
  useActionData,
  useLoaderData,
} from "remix";
import { prisma } from "~/db.server";
import {
  ActiveCircleKey,
  PathnameParams,
  TrainerId,
  TrainerName,
} from "~/schema/member";
import { classNames } from "~/lib";
import { z } from "zod";
import { Params } from "react-router";
import { notFound } from "~/response.server";
import { MemberWithSignUp, updateMemberName } from "~/model/member.server";
import { useSingUpData } from "~/routes/members/pathname.$pathname/setup";

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
  throw redirect(`/members/pathname/${pathname}/setup/trainer_id`);
};

export const action: ActionFunction = async ({ request, params }) => {
  return await getActionData(request, params);
};

export default function MemberPathnameSetupRoot() {
  const { member, signUp, basePath } = useSingUpData();
  const actionData = useActionData<ActionData>();
  const error = actionData?.error?.name?._errors?.join("/");

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
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              トレーナー名
            </label>
            <div className="mt-1 rounded-md shadow-sm">
              <input
                type="text"
                name="name"
                id="name"
                autoComplete="organization"
                defaultValue={member.name}
                className={classNames(
                  error
                    ? "border-red-300 pr-10 text-red-900 placeholder-red-300 focus:border-red-500 focus:outline-none focus:ring-red-500"
                    : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500",
                  "block w-full rounded-md py-3 px-4 shadow-sm "
                )}
              />
              {error && (
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <ExclamationCircleIcon
                    className="h-5 w-5 text-red-500"
                    aria-hidden="true"
                  />
                </div>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-500">
              ゲーム内のトレーナー名とは必ず「完全一致」にしてください。
            </p>
            <p className="mt-2 text-sm text-red-600" id="email-error">
              {error}
            </p>
          </div>
          <div className="flex flex-col-reverse justify-center gap-2 sm:grid-cols-2 sm:flex-row sm:justify-end sm:gap-4">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-1/2"
            >
              次へ
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
