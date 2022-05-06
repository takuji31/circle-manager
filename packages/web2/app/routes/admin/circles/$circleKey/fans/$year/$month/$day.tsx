import AdminHeader from "~/components/admin/header";
import AdminHeaderTitle from "~/components/admin/header/title";
import { z } from "zod";
import { ActiveCircleKey } from "~/schema/member";
import { YMD } from "~/schema/date";
import type { DataFunctionArgs, LoaderFunction } from "@remix-run/node";
import { Circles, LocalDate } from "@circle-manager/shared/model";
import { dateToYMD } from "~/model/date.server";
import type { ActionFunction } from "remix";
import { Form, useActionData, useLoaderData, useSubmit } from "remix";
import React, { createRef, useCallback } from "react";
import { AdminBody } from "~/components/admin/body";
import Dropzone, { useDropzone } from "react-dropzone";
import { UploadIcon, XIcon } from "@heroicons/react/solid";
import { deleteScreenShot, uploadScreenShot } from "~/model/screen_shot.server";
import {
  createFileUploadHandler,
  parseMultipartFormData,
} from "~/lib/form.server";
import type { DataFunctionArgsWithUser } from "~/auth/loader";
import { adminOnly, adminOnlyAction } from "~/auth/loader";
import { prisma } from "~/db.server";

const ActionMode = z.enum([
  "uploadScreenShot",
  "deleteScreenShot",
  "parseImages",
]);

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
  const screenShots = await prisma.screenShot.findMany({
    where: { date: date.toUTCDate(), circleKey },
    orderBy: {
      updatedAt: "asc",
    },
  });
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

  const submit = useSubmit();
  return (
    <div>
      <AdminHeader>
        <AdminHeaderTitle
          title={`${circle.name}のファン数 - ${year}/${month}/${day}`}
        />
      </AdminHeader>
      <AdminBody>
        <div className="grid grid-cols-1 gap-2">
          {screenShots
            .filter((ss) => !!ss.url)
            .map((ss) => {
              return (
                <div className="flex flex-row">
                  <div className="relative h-full w-1/3">
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
                  <div className="flex-1 bg-red-600"></div>
                </div>
              );
            })}
        </div>
        {screenShots.length < 10 && (
          <div className="mt-4">
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
