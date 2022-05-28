import type { SessionUser } from "@/model";
import { Circles, LocalDate } from "@/model";
import { ref, uploadBytes } from "@firebase/storage";
import { UploadIcon, XIcon } from "@heroicons/react/solid";
import { Edit } from "@mui/icons-material";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Grid,
  IconButton,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import type { ActionFunction, DataFunctionArgs, LoaderFunction } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useSubmit, useTransition } from "@remix-run/react";
import numeral from "numeral";
import React, { useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { atom, useRecoilState } from "recoil";
import { z } from "zod";
import { requireAdminUser } from "~/auth/loader.server";
import { AdminBody } from "~/components/admin/body";
import AdminHeader from "~/components/admin/header";
import AdminHeaderActions from "~/components/admin/header/actions";
import AdminHeaderTitle from "~/components/admin/header/title";
import { storage } from "~/lib/firebase.client";
import { dateToYMD } from "~/model/date.server";

import { getCircleMembers } from "~/model/member.server";
import {
  getCircleFanCount,
  getCircleMemberFanCounts,
  parseTsv,
  publishCircleFanCount,
} from "~/model/member_fan_count.server";
import type { ScreenShotMemberFanCount } from "~/model/screen_shot.server";
import {
  cloudStoragePathPrefix,
  deleteScreenShot,
  getScreenShots,
  parseScreenShots,
  setMemberIdToMemberFanCount,
  uploadScreenShots,
} from "~/model/screen_shot.server";
import { localStorageEffect } from "~/recoil";
import { YMD } from "~/schema/date";
import { ActiveCircleKey } from "~/schema/member";

const ActionMode = z.enum([
  "uploadScreenShot",
  "deleteScreenShot",
  "parseImages",
  "setMemberId",
  "pasteTsv",
  "publish",
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
  parseScreenShots: Awaited<ReturnType<typeof parseScreenShots>>;
};
type Member = Awaited<ReturnType<typeof getCircleMembers>>[0];

const paramsSchema = z.intersection(
  z.object({
    circleKey: ActiveCircleKey,
  }),
  YMD,
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
      z.string().min(1, "テキストが貼り付けられていません"),
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
  const circleFanCount = await getCircleFanCount({
    date,
    circleKey,
  });
  const pathPrefix = cloudStoragePathPrefix(circleKey, date);

  return {
    ...dateToYMD(date),
    circle,
    screenShots,
    members,
    memberFanCounts,
    circleFanCount,
    cloudStoragePathPrefix: pathPrefix,
  };
};

export const loader: LoaderFunction = async (args) => {
  return await getLoaderData(args);
};

const getActionData = async ({ request, params }: DataFunctionArgs) => {
  const user = await requireAdminUser(request);
  const { year, month, day, circleKey } = paramsSchema.parse(params);
  const date = LocalDate.of(year, month, day);
  const rawFormData = await request.formData();
  const formData = Object.fromEntries(rawFormData);
  console.log(formData);
  const { mode } = actionQuerySchema.parse(formData);

  switch (mode) {
    case ActionMode.enum.uploadScreenShot: {
      const paths = rawFormData.getAll("paths") as Array<string>;
      return {
        uploadScreenShot: await uploadScreenShotAction({
          paths,
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
      return {
        parseScreenShots: await parseScreenShots({ circleKey, date }),
      };
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
    case ActionMode.enum.publish: {
      await publishCircleFanCount({ circleKey, date });
      break;
    }
  }
  return null;
};

const uploadScreenShotAction = async ({
  paths,
  circleKey,
  date,
  user,
}: {
  paths: Array<string>;
  circleKey: ActiveCircleKey;
  date: LocalDate;
  user: SessionUser;
}) => {
  const result = uploadSchema.safeParse({ paths });

  if (!result.success) {
    return {
      error: result.error.format()?.paths?._errors?.join("/"),
    };
  } else {
    const { paths } = result.data;
    await uploadScreenShots({
      paths,
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
  paths: z.array(z.string()).max(10).min(1, "スクリーンショットが1枚もアップロードされていません"),
});

export const action: ActionFunction = async (args) => {
  return await getActionData(args);
};

export default function AdminCircleFanCounts() {
  const { year, month, day, circle, memberFanCounts } =
    useLoaderData<LoaderData>();
  const [tabId, setTabId] = useRecoilState(tabIdState);

  const transition = useTransition();

  return (
    <div>
      <AdminHeader>
        <AdminHeaderTitle
          title={`${circle.name}のファン数 - ${year}/${month}/${day}`}
        />
        <AdminHeaderActions>
          <Form method="post" replace>
            <input type="hidden" name="mode" value={ActionMode.enum.publish} />
            <Button
              type="submit"
              variant="contained"
              disabled={
                !!transition.submission ||
                !memberFanCounts.length ||
                !memberFanCounts.filter((m) => m.memberId).length
              }
            >
              公開して通知
            </Button>
          </Form>
        </AdminHeaderActions>
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
      <StatusCard />
      <ScreenShotCard tabId={tabId} />
      <PasteCard tabId={tabId} />
      <ManualFormCard tabId={tabId} />
      <EditCard />
    </Stack>
  );
};

const StatusCard = () => {
  const { memberFanCounts, circleFanCount } = useLoaderData<LoaderData>();
  const unknownMemberFanCounts = useMemo(
    () => memberFanCounts.filter((m) => !m.memberId).length,
    [memberFanCounts],
  );
  const knownMemberFanCounts = useMemo(
    () => memberFanCounts.filter((m) => m.memberId).length,
    [memberFanCounts],
  );
  return (
    <Card>
      <CardHeader
        title="公開状態"
        subheader="公開すると連絡チャンネルにURLが通知されます。"
      />
      <CardContent>
        <Stack spacing={2}>
          {circleFanCount ? (
            <Typography variant="body1">公開済み</Typography>
          ) : !memberFanCounts.length ? (
            <Alert variant="filled" severity="error">
              ファン数が1件も入力されていません。最低1件は入力がないと公開できません。
            </Alert>
          ) : (
            <Alert variant="filled" severity="info">
              公開できます。
            </Alert>
          )}
          {!!unknownMemberFanCounts && (
            <Alert variant="filled" severity="warning">
              不明なメンバーのファン数記録が{unknownMemberFanCounts}
              件あります。紐付けていないファン数は公開されずサークルごとの集計にも含まれません。
            </Alert>
          )}
          {knownMemberFanCounts != 30 && (
            <Alert variant="filled" severity="warning">
              ファン数記録が{knownMemberFanCounts}件あります。メンバー数に対してファン数が不足している場合は追加、超過している場合は不要な記録を削除してください。
            </Alert>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

const ScreenShotCard = ({ tabId }: { tabId: TabId }) => {
  const { screenShots, members, cloudStoragePathPrefix } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const transition = useTransition();
  const [uploading, setUploading] = useState(false);

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
                <React.Fragment key={ss.id}>
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
                </React.Fragment>
              );
            })}
        </Grid>
      ) : (
        <div className="p-4">
          <p>アップロード済みのスクリーンショットはありません</p>
        </div>
      )}
      {uploading ? (<Box p={4} alignItems="center" flexDirection="column" display="flex">
        <CircularProgress variant="indeterminate" />
      </Box>) : screenShots.length < 10 ? (
        <div>
          <FileUploadInput
            onDrop={(files) => {
              setUploading(true);
              const time = new Date().getTime();
              Promise.allSettled(
                files.map((file, idx) => {
                  const fileName = `${time}_${idx}.png`;
                  const fileRef = ref(storage, `${cloudStoragePathPrefix}${fileName}`);
                  return uploadBytes(fileRef, file);
                }),
              ).then((results) => {
                const formData = new FormData();
                formData.set("mode", ActionMode.enum.uploadScreenShot);
                for (const result of results) {
                  if (result.status == "rejected") {
                    console.log(result.reason);
                  } else {
                    formData.append("paths", result.value.ref.fullPath);
                  }
                }
                submit(formData, { method: "post", replace: true });
              }).finally(() => setUploading(false));
            }}
          />
          <p>{actionData?.uploadScreenShot?.error}</p>
        </div>
      ) : null}
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
            id="tsv"
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
  const transition = useTransition();
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [".png"],
    },
    onDrop,
    disabled: transition.submission != null,
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
            { method: "post", replace: true },
          );
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={`${memberFanCount.order + 1}人目 (名: ${memberFanCount.parsedName}, ファン数：${
            memberFanCount.total
          })`}
        />
      )}
    />
  );
}
