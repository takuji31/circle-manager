import { ExclamationCircleIcon } from "@heroicons/react/solid";
import {
  ActionFunction,
  Form,
  redirect,
  useActionData,
  useLoaderData,
} from "remix";
import { prisma } from "~/db.server";
import { PathnameParams, TrainerId } from "~/schema/member";
import { classNames } from "~/lib";
import { z } from "zod";
import { Params } from "react-router";
import { notFound } from "~/response.server";
import { useSingUpData } from "~/routes/members/pathname.$pathname/setup";
import { Link } from "@remix-run/react";

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
          <div>
            <label
              htmlFor="trainerId"
              className="block text-sm font-medium text-gray-700"
            >
              トレーナーID
            </label>
            <div className="mt-1 rounded-md shadow-sm">
              <input
                type="text"
                name="trainerId"
                id="trainerId"
                autoComplete="organization"
                defaultValue={member.trainerId ?? undefined}
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
              ゲームの「メニュー」→「プロフィール/トレーナー名刺」→「IDコピー」でコピーされた値を貼り付けてください。
            </p>
            <p className="mt-2 text-sm text-red-600" id="email-error">
              {error}
            </p>
          </div>
          <div className="flex flex-col-reverse justify-center gap-2 sm:grid-cols-2 sm:flex-row sm:justify-end sm:gap-4">
            <Link
              to={`${basePath}/`}
              className="inline-flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-1/2"
            >
              戻る
            </Link>
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
