import { useState } from "react";
import { Switch } from "@headlessui/react";
import { classNames } from "~/lib";
import {
  ActionFunction,
  Form,
  LoaderFunction,
  useActionData,
  useLoaderData,
} from "remix";
import { CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/solid";
import invariant from "tiny-invariant";
import { z } from "zod";
import { prisma } from "~/db.server";
import { PathnameParams, TrainerId } from "~/schema/member";
import { notFound } from "~/response.server";

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

  return (
    <div className="overflow-hidden bg-white py-16 px-4 sm:px-6 lg:px-8 lg:py-24">
      <div className="relative mx-auto max-w-xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            トレーナーID登録
          </h2>
          <p className="mt-4 text-lg leading-6 text-gray-500">
            加入手続きやグループ内移籍のためにトレーナーID登録が必要です。
          </p>
        </div>
        {actionData?.success && (
          <div className="mt-4 rounded-md bg-green-50 p-4">
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
        <div className="mt-8">
          <Form
            method="post"
            className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8"
          >
            <div className="sm:col-span-2">
              <label
                htmlFor="trainerId"
                className="block text-sm font-medium text-gray-700"
              >
                トレーナーID
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <input
                  type="text"
                  name="trainerId"
                  id="trainerId"
                  autoComplete="organization"
                  defaultValue={member.trainerId ?? undefined}
                  className={classNames(
                    actionData?.error?.trainerId
                      ? "border-red-300 pr-10 text-red-900 placeholder-red-300 focus:border-red-500 focus:outline-none focus:ring-red-500"
                      : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500",
                    "block w-full rounded-md py-3 px-4 shadow-sm "
                  )}
                />
                {actionData?.error?.trainerId && (
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
                {actionData?.error?.trainerId &&
                  actionData?.error?.trainerId?._errors?.join("/")}
              </p>
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                登録
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
