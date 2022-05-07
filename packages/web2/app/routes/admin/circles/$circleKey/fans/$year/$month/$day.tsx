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
import React, { useState } from "react";
import { AdminBody } from "~/components/admin/body";
import { useDropzone } from "react-dropzone";
import { UploadIcon, XIcon } from "@heroicons/react/solid";
import {
  deleteScreenShot,
  parseScreenShots,
  uploadScreenShot,
} from "~/model/screen_shot.server";
import {
  createFileUploadHandler,
  parseMultipartFormData,
} from "~/lib/form.server";
import type { DataFunctionArgsWithUser } from "~/auth/loader";
import { adminOnly, adminOnlyAction } from "~/auth/loader";
import { prisma } from "~/db.server";
import Card from "~/components/card";
import CardHeader from "~/components/card_header";
import { classNames } from "~/lib";

const ActionMode = z.enum([
  "uploadScreenShot",
  "deleteScreenShot",
  "parseImages",
]);

const TabId = z.enum(["ScreenShot", "Tsv", "Manual"]);

const tabs = [
  { id: TabId.enum.ScreenShot, name: "スクリーンショット" },
  { id: TabId.enum.Tsv, name: "まとめて貼り付け" },
  { id: TabId.enum.Manual, name: "手入力" },
];

type LoaderData = Awaited<ReturnType<typeof getLoaderData>>;
type ActionData = Awaited<ReturnType<typeof getActionData>>;

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
  const screenShots = await prisma.screenShot
    .findMany({
      where: { date: date.toUTCDate(), circleKey },
      include: {
        parseResult: true,
        resultMembers: {
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        updatedAt: "asc",
      },
    })
    .then((screenShots) =>
      screenShots.map((ss) => {
        const { resultMembers, ...screenShot } = ss;
        return {
          ...screenShot,
          resultMembers: resultMembers.map((m) => {
            const { count, ...member } = m;
            return {
              ...member,
              count: parseInt(count.toString()),
            };
          }),
        };
      })
    );
  return {
    ...dateToYMD(date),
    circle,
    screenShots,
  };
};

export const loader: LoaderFunction = adminOnly(async (args) => {
  return await getLoaderData(args);
});

const getActionData = async ({
  request,
  params,
  user,
}: DataFunctionArgsWithUser) => {
  const { year, month, day, circleKey } = paramsSchema.parse(params);
  const circle = Circles.findByCircleKey(circleKey);
  const date = LocalDate.of(year, month, day);
  const { mode } = actionQuerySchema.parse(
    Object.fromEntries(new URL(request.url).searchParams)
  );

  switch (mode) {
    case ActionMode.enum.uploadScreenShot: {
      const uploadHandler = createFileUploadHandler({
        maxFileSize: 10_000_000,
      });
      const formData = await parseMultipartFormData(request, uploadHandler);

      const result = uploadSchema.safeParse(Object.fromEntries(formData));

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
      const id = z.string().parse((await request.formData()).get("id"));
      console.log("Deleting screenShot %s", id);
      await deleteScreenShot({ id });
    }
    case ActionMode.enum.parseImages: {
      await parseScreenShots({ circleKey, date });
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
  const { year, month, day, circle, screenShots } = useLoaderData<LoaderData>();
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
            <Form
              id="parseImagesForm"
              method="post"
              action={`?mode=${ActionMode.enum.parseImages}`}
            />

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
                  screenShots.filter((ss) => !ss.parseResult).length == 0
                    ? "再度解析する(非推奨)"
                    : "解析する"}
                </button>
              </div>
            </div>
          </CardHeader>
          {screenShots.length ? (
            <div className="grid grid-cols-1 gap-2">
              {screenShots
                .filter((ss) => !!ss.url)
                .map((ss) => {
                  return (
                    <div className="flex flex-row" key={ss.id}>
                      <div className="relative h-full w-1/3 p-2">
                        <img src={ss.url!} alt="" className="h-full w-full" />
                        <Form
                          method="post"
                          action={`?mode=${ActionMode.enum.deleteScreenShot}`}
                        >
                          <input type="hidden" name="id" value={ss.id} />
                          <button type="submit">
                            <XIcon className="absolute top-0 right-0 h-8 w-8 rounded-full bg-black text-white" />
                          </button>
                        </Form>
                      </div>
                      <div className="flex-1 border-l px-2">
                        <ul>
                          {ss.resultMembers.map((m) => {
                            return (
                              <li key={m.order}>
                                {m.name}: {m.count}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
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
