import AdminHeader from "~/components/admin/header";
import AdminHeaderTitle from "~/components/admin/header/title";
import { z } from "zod";
import { ActiveCircleKey } from "~/schema/member";
import { YMD } from "~/schema/date";
import type { DataFunctionArgs, LoaderFunction } from "@remix-run/node";
import { Circles, LocalDate } from "@circle-manager/shared/model";
import { dateToYMD } from "~/model/date.server";
import type { ActionFunction } from "remix";
import {
  Form,
  useActionData,
  useLoaderData,
  useSubmit,
  useTransition,
} from "remix";
import React, { Fragment, useMemo, useState } from "react";
import { AdminBody } from "~/components/admin/body";
import { useDropzone } from "react-dropzone";
import { UploadIcon, XIcon } from "@heroicons/react/solid";
import {
  ScreenShotMemberFanCount,
  setMemberIdToMemberFanCount,
} from "~/model/screen_shot.server";
import {
  deleteScreenShot,
  getScreenShots,
  parseScreenShots,
  uploadScreenShot,
} from "~/model/screen_shot.server";
import {
  createFileUploadHandler,
  parseMultipartFormData,
} from "~/lib/form.server";
import type { DataFunctionArgsWithUser } from "~/auth/loader";
import { adminOnly, adminOnlyAction } from "~/auth/loader";
import Card from "~/components/card";
import CardHeader from "~/components/card_header";
import { classNames } from "~/lib";

import { CheckIcon, SelectorIcon } from "@heroicons/react/solid";
import { Listbox, Transition } from "@headlessui/react";
import { getCircleMembers } from "~/model/member.server";

const ActionMode = z.enum([
  "uploadScreenShot",
  "deleteScreenShot",
  "parseImages",
  "setMemberId",
]);

const TabId = z.enum(["ScreenShot", "Tsv", "Manual"]);

const tabs = [
  { id: TabId.enum.ScreenShot, name: "スクリーンショット" },
  { id: TabId.enum.Tsv, name: "まとめて貼り付け" },
  { id: TabId.enum.Manual, name: "手入力" },
];

type LoaderData = Awaited<ReturnType<typeof getLoaderData>>;
type ActionData = Awaited<ReturnType<typeof getActionData>>;
type Member = Awaited<ReturnType<typeof getCircleMembers>>[0];
type ScreenShot = Awaited<ReturnType<typeof getScreenShots>>[0];

const paramsSchema = z.intersection(
  z.object({
    circleKey: ActiveCircleKey,
  }),
  YMD
);
const actionQuerySchema = z.object({
  mode: ActionMode.default(ActionMode.enum.uploadScreenShot),
});

const getLoaderData = async ({ params }: DataFunctionArgs) => {
  const { year, month, day, circleKey } = paramsSchema.parse(params);
  const circle = Circles.findByCircleKey(circleKey);
  const date = LocalDate.of(year, month, day);
  const screenShots = await getScreenShots({ date, circleKey });
  const members = await getCircleMembers({ circleKey });
  return {
    ...dateToYMD(date),
    circle,
    screenShots,
    members,
  };
};

export const loader: LoaderFunction = adminOnly(async (args) => {
  return await getLoaderData(args);
});

const setMemberIdSchema = z.object({
  memberId: z.string(),
  memberFanCountId: z.string(),
});

const getActionData = async ({
  request,
  params,
  user,
}: DataFunctionArgsWithUser) => {
  const { year, month, day, circleKey } = paramsSchema.parse(params);
  const date = LocalDate.of(year, month, day);
  const uploadHandler = createFileUploadHandler({
    maxFileSize: 10_000_000,
  });
  const formData = Object.fromEntries(
    await parseMultipartFormData(request, uploadHandler)
  );
  console.log(formData);
  const { mode } = actionQuerySchema.parse(formData);

  switch (mode) {
    case ActionMode.enum.uploadScreenShot: {
      const result = uploadSchema.safeParse(formData);

      if (!result.success) {
        return {
          error: result.error.format(),
        };
      } else {
        const { screenShotFile } = result.data;
        await uploadScreenShot({
          screenShotFile,
          circleKey,
          date,
          uploaderId: user.id,
        });
        return {};
      }
    }
    case ActionMode.enum.deleteScreenShot: {
      const id = z.string().parse(formData.id);
      console.log("Deleting screenShot %s", id);
      await deleteScreenShot({ id });
    }
    case ActionMode.enum.parseImages: {
      await parseScreenShots({ circleKey, date });
    }
    case ActionMode.enum.setMemberId: {
      const { memberId, memberFanCountId } = setMemberIdSchema.parse(formData);
      await setMemberIdToMemberFanCount({ memberId, memberFanCountId });
    }
  }
  return null;
};

const uploadSchema = z.object({
  screenShotFile: z
    .any()
    .transform((file) => file as File)
    .superRefine((val, ctx) => {
      if (!val) {
        ctx.addIssue({
          code: z.ZodIssueCode.invalid_type,
          expected: "object",
          received: "undefined",
          fatal: true,
          message: "スクリーンショットがアップロードされていません",
        });
        return;
      }
      console.log(val);
      if (val.type != "image/png") {
        ctx.addIssue({
          code: z.ZodIssueCode.invalid_type,
          expected: "object",
          received: "undefined",
          fatal: true,
          message: "スクリーンショットはPNG形式のみサポートしています。",
        });
      }
    }),
});

export const action: ActionFunction = adminOnlyAction(async (args) => {
  return await getActionData(args);
});

export default function AdminCircleFanCounts() {
  const { year, month, day, circle, screenShots, members } =
    useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const transition = useTransition();
  const [tabId, setTabId] = useState(TabId.enum.ScreenShot);

  const submit = useSubmit();
  return (
    <div>
      <AdminHeader>
        <AdminHeaderTitle
          title={`${circle.name}のファン数 - ${year}/${month}/${day}`}
        />
      </AdminHeader>
      <div>
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">
            Select a tab
          </label>
          {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
          <select
            id="tabs"
            name="tabs"
            className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            defaultValue={TabId.enum.ScreenShot}
          >
            {tabs.map((tab) => (
              <option key={tab.name}>{tab.name}</option>
            ))}
          </select>
        </div>
        <div className="hidden sm:block">
          <div className="border-b border-gray-200 px-2 sm:px-4 lg:px-6">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  type="button"
                  key={tab.name}
                  onClick={() => setTabId(tab.id)}
                  className={classNames(
                    tab.id == tabId
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                    "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium"
                  )}
                  aria-current={tab.id == tabId ? "page" : undefined}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
      <AdminBody>
        <Card
          className={classNames(tabId != TabId.enum.ScreenShot ? "hidden" : "")}
        >
          <CardHeader>
            <Form id="parseImagesForm" method="post">
              <input
                type="hidden"
                name="mode"
                value={ActionMode.enum.parseImages}
              />
            </Form>

            <div className="-ml-4 -mt-2 flex flex-wrap items-center justify-between sm:flex-nowrap">
              <div className="ml-4 mt-2">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  アップロード済みのスクリーンショット
                </h3>
                <p className="mt-2 max-w-4xl text-sm text-gray-500">
                  10枚までアップロードできます。
                </p>
              </div>
              <div className="ml-4 mt-2 flex-shrink-0">
                <button
                  type="submit"
                  className="relative inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  form="parseImagesForm"
                  disabled={
                    screenShots.length == 0 || transition.state == "submitting"
                  }
                >
                  {screenShots.length > 0 &&
                  screenShots.filter((ss) => !ss.fanCounts.length).length == 0
                    ? "再度解析する(非推奨)"
                    : "解析する"}
                </button>
              </div>
            </div>
          </CardHeader>
          {screenShots.length ? (
            <div className="grid grid-cols-1 justify-items-stretch md:grid-cols-2">
              {screenShots
                .filter((ss) => !!ss.url)
                .map((ss) => {
                  return (
                    <>
                      <div className="relative p-2">
                        <img src={ss.url!} alt="" className="h-full w-full" />
                        <Form method="post">
                          <input
                            type="hidden"
                            name="mode"
                            value={ActionMode.enum.deleteScreenShot}
                          />

                          <input type="hidden" name="id" value={ss.id} />
                          <button type="submit">
                            <XIcon className="absolute top-0 right-0 h-8 w-8 rounded-full bg-black text-white" />
                          </button>
                        </Form>
                      </div>
                      <div className="flex flex-col justify-end px-2 md:border-l">
                        <div className="grid basis-full grid-flow-col grid-rows-3 md:basis-1/2">
                          {ss.fanCounts.map((m) => {
                            return (
                              <div key={m.id}>
                                <MemberSelectListbox
                                  members={members}
                                  memberFanCount={m}
                                />
                              </div>
                            );
                          })}
                          <div></div>
                        </div>
                      </div>
                    </>
                  );
                })}
            </div>
          ) : (
            <div className="p-4">
              <p>アップロード済みのスクリーンショットはありません</p>
            </div>
          )}
          {screenShots.length < 10 && (
            <div>
              <FileUploadInput
                onDrop={(files) => {
                  console.log(files);
                  const [file] = files;
                  const formData = new FormData();
                  formData.set("screenShotFile", file, file.name);
                  submit(formData!, {
                    replace: true,
                    method: "post",
                    encType: "multipart/form-data",
                  });
                }}
              />
              <p>{actionData?.error?.screenShotFile?._errors.join("/")}</p>
            </div>
          )}
        </Card>
      </AdminBody>
    </div>
  );
}

interface FileUploadInputProps {
  onDrop: (files: File[]) => void;
}
const FileUploadInput: React.FC<FileUploadInputProps> = ({ onDrop }) => {
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [".png"],
    },
    onDrop,
  });
  return (
    <div
      className="flex w-full items-center justify-center"
      {...getRootProps()}
    >
      <label
        htmlFor="dropzone-file"
        className="dark:hover:bg-bray-800 flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <UploadIcon className="mb-3 h-10 w-10 text-gray-400" />
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold">このエリアをクリック</span>{" "}
            またはドラッグ＆ドロップでアップロード
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            PNG形式のみ。最大10枚。
          </p>
        </div>
        <input
          id="dropzone-file"
          type="file"
          className="hidden"
          name="screenShotFile"
          {...getInputProps()}
        />
      </label>
    </div>
  );
};

interface MemberSelectComboBoxProps {
  members: Array<Member>;
  memberFanCount: ScreenShotMemberFanCount;
}
function MemberSelectListbox({
  members,
  memberFanCount,
}: MemberSelectComboBoxProps) {
  const transition = useTransition();
  const submit = useSubmit();
  const currentMember = useMemo(() => {
    if (
      transition.submission &&
      transition.submission.method == "POST" &&
      transition.submission.formData.get("mode") ==
        ActionMode.enum.setMemberId &&
      transition.submission.formData.get("memberFanCountId") ==
        memberFanCount.id
    ) {
      const memberId = transition.submission.formData.get("memberId");
      return (
        (memberId ? members.find((m) => m.id == memberId) : null) ??
        memberFanCount.member
      );
    } else {
      return memberFanCount.member;
    }
  }, [members, memberFanCount, transition]);
  return (
    <Listbox
      value={memberFanCount.member?.id}
      disabled={transition.state == "submitting"}
      onChange={(value) => {
        if (value) {
          submit(
            {
              memberId: value,
              memberFanCountId: memberFanCount.id,
              mode: ActionMode.enum.setMemberId,
            },
            { method: "post", replace: true }
          );
        }
      }}
    >
      {({ open }) => (
        <>
          <Listbox.Label className="block text-sm font-medium text-gray-700">
            {memberFanCount.order + 1}人目 (ファン数：{memberFanCount.total})
          </Listbox.Label>
          <div className="relative mt-1">
            <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
              <span className="block truncate">
                {currentMember?.name ?? "不明"}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <SelectorIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {members.map((member) => (
                  <Listbox.Option
                    key={member.id}
                    className={({ active }) =>
                      classNames(
                        active ? "bg-indigo-600 text-white" : "text-gray-900",
                        "relative cursor-default select-none py-2 pl-3 pr-9"
                      )
                    }
                    value={member.id}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={classNames(
                            selected ? "font-semibold" : "font-normal",
                            "block truncate"
                          )}
                        >
                          {member.name}
                        </span>

                        {selected ? (
                          <span
                            className={classNames(
                              active ? "text-white" : "text-indigo-600",
                              "absolute inset-y-0 right-0 flex items-center pr-4"
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  );
}
