import AdminHeader from "~/components/admin/header";
import AdminHeaderTitle from "~/components/admin/header/title";
import { z } from "zod";
import { ActiveCircleKey } from "~/schema/member";
import { YMD } from "~/schema/date";
import type { DataFunctionArgs, LoaderFunction } from "@remix-run/node";
import { Circles, LocalDate, SessionUser } from "@/model";
import { dateToYMD } from "~/model/date.server";
import type { ActionFunction } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useSubmit,
  useTransition,
} from "@remix-run/react";
import React, { useState } from "react";
import { AdminBody } from "~/components/admin/body";
import { useDropzone } from "react-dropzone";
import { UploadIcon, XIcon } from "@heroicons/react/solid";
import type { ScreenShotMemberFanCount } from "~/model/screen_shot.server";
import { setMemberIdToMemberFanCount } from "~/model/screen_shot.server";
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
import { classNames } from "~/lib";

import { getCircleMembers } from "~/model/member.server";
import { Autocomplete, Box, Tabs, TextField } from "@mui/material";
import { Tab } from "@mui/material";
import { Card } from "@mui/material";
import { CardHeader } from "@mui/material";
import { Grid } from "@mui/material";
import { Button } from "@mui/material";
import { Stack } from "@mui/material";
import { CardContent } from "@mui/material";
import {
  getCircleMemberFanCounts,
  parseTsv,
} from "~/model/member_fan_count.server";
import { Table } from "@mui/material";
import { TableHead } from "@mui/material";
import { TableRow } from "@mui/material";
import { TableCell } from "@mui/material";
import { TableBody } from "@mui/material";
import { IconButton } from "@mui/material";
import { Edit } from "@mui/icons-material";
import numeral from "numeral";
import { atom, useRecoilState } from "recoil";
import { localStorageEffect } from "~/recoil";

const ActionMode = z.enum([
  "uploadScreenShot",
  "deleteScreenShot",
  "parseImages",
  "setMemberId",
  "pasteTsv",
]);

const TabId = z.enum(["ScreenShot", "Tsv", "Manual"]);
// eslint-disable-next-line @typescript-eslint/no-redeclare
type TabId = z.infer<typeof TabId>;

export const tabIdState = atom<TabId>({
  key: "memberFanCount_tabId",
  default: TabId.enum.ScreenShot,
  effects: [localStorageEffect<TabId>("memberFanCount_tabId")],
});
const tabs = [
  { id: TabId.enum.ScreenShot, name: "スクリーンショット" },
  { id: TabId.enum.Tsv, name: "まとめて貼り付け" },
  { id: TabId.enum.Manual, name: "手入力" },
];

type LoaderData = Awaited<ReturnType<typeof getLoaderData>>;
type ActionData = {
  uploadScreenShot?: Awaited<ReturnType<typeof uploadScreenShotAction>>;
  pasteTsv: Awaited<ReturnType<typeof pasteTsvAction>>;
};
type Member = Awaited<ReturnType<typeof getCircleMembers>>[0];

const paramsSchema = z.intersection(
  z.object({
    circleKey: ActiveCircleKey,
  }),
  YMD
);
const actionQuerySchema = z.object({
  mode: ActionMode.default(ActionMode.enum.uploadScreenShot),
});
const setMemberIdSchema = z.object({
  memberId: z.string(),
  memberFanCountId: z.string(),
});

const schema = {
  pasteTsv: z.object({
    tsv: z.preprocess(
      (s) => (s as string).trim(),
      z.string().min(1, "テキストが貼り付けられていません")
    ),
  }),
};

const getLoaderData = async ({ params }: DataFunctionArgs) => {
  const { year, month, day, circleKey } = paramsSchema.parse(params);
  const circle = Circles.findByCircleKey(circleKey);
  const date = LocalDate.of(year, month, day);
  const screenShots = await getScreenShots({ date, circleKey });
  const members = await getCircleMembers({ circleKey });
  const memberFanCounts = await getCircleMemberFanCounts({ date, circleKey });
  return {
    ...dateToYMD(date),
    circle,
    screenShots,
    members,
    memberFanCounts,
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
  const date = LocalDate.of(year, month, day);
  const uploadHandler = createFileUploadHandler({
    maxPartSize: 10_000_000,
  });
  const formData = Object.fromEntries(
    await parseMultipartFormData(request, uploadHandler)
  );
  console.log(formData);
  const { mode } = actionQuerySchema.parse(formData);

  switch (mode) {
    case ActionMode.enum.uploadScreenShot: {
      return {
        uploadScreenShot: await uploadScreenShotAction({
          formData,
          circleKey,
          date,
          user,
        }),
      };
    }
    case ActionMode.enum.deleteScreenShot: {
      const id = z.string().parse(formData.id);
      await deleteScreenShot({ id });
      break;
    }
    case ActionMode.enum.parseImages: {
      await parseScreenShots({ circleKey, date });
      break;
    }
    case ActionMode.enum.setMemberId: {
      const { memberId, memberFanCountId } = setMemberIdSchema.parse(formData);
      await setMemberIdToMemberFanCount({ memberId, memberFanCountId });
      break;
    }
    case ActionMode.enum.pasteTsv: {
      return {
        pasteTsv: await pasteTsvAction({
          formData,
          circleKey,
          date,
          user,
        }),
      };
    }
  }
  return null;
};

const uploadScreenShotAction = async ({
  formData,
  circleKey,
  date,
  user,
}: {
  formData: Record<string, any>;
  circleKey: ActiveCircleKey;
  date: LocalDate;
  user: SessionUser;
}) => {
  const result = uploadSchema.safeParse(formData);

  if (!result.success) {
    return {
      error: result.error.format()?.screenShotFile?._errors?.join("/"),
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
};

const pasteTsvAction = async ({
  formData,
  circleKey,
  date,
  user,
}: {
  formData: Record<string, any>;
  circleKey: ActiveCircleKey;
  date: LocalDate;
  user: SessionUser;
}) => {
  const result = schema.pasteTsv.safeParse(formData);
  if (!result.success) {
    return {
      error: result.error.format().tsv?._errors?.join("/"),
    };
  } else {
    const { tsv } = result.data;
    await parseTsv({ circleKey, date, tsv });
    return {};
  }
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
  const { year, month, day, circle } = useLoaderData<LoaderData>();
  const [tabId, setTabId] = useRecoilState(tabIdState);

  return (
    <div>
      <AdminHeader>
        <AdminHeaderTitle
          title={`${circle.name}のファン数 - ${year}/${month}/${day}`}
        />
      </AdminHeader>
      <div>
        <Tabs
          variant="fullWidth"
          value={tabId}
          onChange={(_, value) => setTabId(value)}
        >
          {tabs.map((tab) => (
            <Tab key={tab.name} value={tab.id} label={tab.name} />
          ))}
        </Tabs>
      </div>
      <AdminBody>
        <AdminCircleFanCountsContent tabId={tabId} />
      </AdminBody>
    </div>
  );
}

const AdminCircleFanCountsContent = ({ tabId }: { tabId: TabId }) => {
  return (
    <Stack spacing={4}>
      <ScreenShotCard tabId={tabId} />
      <PasteCard tabId={tabId} />
      <ManualFormCard tabId={tabId} />
      <EditCard />
    </Stack>
  );
};

const ScreenShotCard = ({ tabId }: { tabId: TabId }) => {
  const { screenShots, members } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const transition = useTransition();

  const submit = useSubmit();
  return (
    <Card className={tabId != TabId.enum.ScreenShot ? "hidden" : ""}>
      <CardHeader
        title="アップロード済みのスクリーンショット"
        subheader="10枚までアップロードできます。"
        action={
          <>
            <Form id="parseImagesForm" method="post">
              <input
                type="hidden"
                name="mode"
                value={ActionMode.enum.parseImages}
              />
            </Form>
            <Button
              variant="contained"
              type="submit"
              form="parseImagesForm"
              disabled={
                screenShots.length == 0 || transition.state == "submitting"
              }
            >
              {screenShots.length > 0 &&
              screenShots.filter((ss) => !ss.fanCounts.length).length == 0
                ? "再度解析する(非推奨)"
                : "解析する"}
            </Button>
          </>
        }
      />
      {screenShots.length ? (
        <Grid container>
          {screenShots
            .filter((ss) => !!ss.url)
            .map((ss) => {
              return (
                <>
                  <Grid item xs={12} md={6} p={2}>
                    <Box position="relative">
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
                    </Box>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    md={6}
                    p={2}
                    container
                    direction="column-reverse"
                  >
                    <Grid
                      item
                      xs={12}
                      md={6}
                      spacing={4}
                      container
                      direction="column"
                    >
                      {ss.fanCounts.map((m) => {
                        return (
                          <Grid item xs={4} key={m.id}>
                            <MemberSelectListbox
                              members={members}
                              memberFanCount={m}
                            />
                          </Grid>
                        );
                      })}
                      <div></div>
                    </Grid>
                  </Grid>
                </>
              );
            })}
        </Grid>
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
          <p>{actionData?.uploadScreenShot?.error}</p>
        </div>
      )}
    </Card>
  );
};

const PasteCard = ({ tabId }: { tabId: TabId }) => {
  const [tsv, setTsv] = useState("");
  const actionData = useActionData<ActionData>();
  return (
    <Form method="post" replace>
      <input type="hidden" name="mode" value={ActionMode.enum.pasteTsv} />
      <Card className={tabId != TabId.enum.Tsv ? "hidden" : ""}>
        <CardHeader
          title="まとめて貼り付け"
          subheader="この形式で記録すると当日のサークルファン数が全て上書きされます。一部修正には手入力を使ってください。"
          action={
            <Button type="submit" variant="contained">
              記録
            </Button>
          }
        />
        <CardContent>
          <TextField
            name="tsv"
            multiline
            fullWidth
            maxRows={30}
            value={tsv}
            onChange={(e) => setTsv(e.currentTarget.value)}
            error={!!actionData?.pasteTsv?.error}
            helperText={actionData?.pasteTsv?.error ?? null}
            placeholder={"例)\ntakuji31    1234567890\ntakuji32    2345678901"}
          />
        </CardContent>
      </Card>
    </Form>
  );
};

const ManualFormCard = ({ tabId }: { tabId: TabId }) => {
  return (
    <Card className={tabId != TabId.enum.Manual ? "hidden" : ""}>
      <CardHeader
        title="手入力"
        subheader="手動でファン数を入力できます。入力したら必ず「保存」を押してください。押さないと記録されません。"
      />
    </Card>
  );
};

const EditCard = () => {
  const { memberFanCounts } = useLoaderData<LoaderData>();
  return (
    <Card>
      <CardHeader
        title="編集"
        subheader="他の記録方法で記録したファン数を編集できます。"
      />
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>トレーナー名</TableCell>
            <TableCell>当月ファン数 (総獲得ファン数)</TableCell>
            <TableCell>記録元</TableCell>
            <TableCell>記録時の名前</TableCell>
            <TableCell>アクション</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {memberFanCounts.map((m) => {
            return (
              <TableRow key={m.id}>
                <TableCell>{m.member?.name ?? "(不明なメンバー)"}</TableCell>
                <TableCell>
                  {numeral(m.monthlyTotal).format("0,0")} (
                  {numeral(m.total).format("0,0")})
                </TableCell>
                <TableCell>
                  {m.source == "ScreenShot"
                    ? "スクリーンショット"
                    : m.source == "Paste"
                    ? "まとめて貼り付け"
                    : "手入力"}
                </TableCell>
                <TableCell>{m.parsedName ?? "(なし)"}</TableCell>
                <TableCell>
                  <IconButton>
                    <Edit />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
};

interface FileUploadInputProps {
  onDrop: (files: File[]) => void;
}
const FileUploadInput: React.FC<FileUploadInputProps> = ({ onDrop }) => {
  const { getRootProps, getInputProps } = useDropzone({
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
  return (
    <Autocomplete
      disablePortal
      id={`combo-box-${memberFanCount.id}`}
      disabled={transition.state == "submitting"}
      options={members}
      getOptionLabel={(m) => m.name}
      value={members.find((m) => m.id == memberFanCount.memberId) ?? null}
      sx={{ width: 300 }}
      onChange={(_, member) => {
        if (member) {
          submit(
            {
              memberId: member.id,
              memberFanCountId: memberFanCount.id,
              mode: ActionMode.enum.setMemberId,
            },
            { method: "post", replace: true }
          );
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={`${memberFanCount.order + 1}人目 (ファン数：${
            memberFanCount.total
          })`}
        />
      )}
    />
  );
}
