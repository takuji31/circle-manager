import { ContentCopy } from "@mui/icons-material";
import { Button, Card, CardContent, CardHeader, List, ListItem, ListItemText, Stack, Typography } from "@mui/material";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { Form, useLoaderData, useSubmit, useTransition } from "@remix-run/react";
import { useConfirm } from "material-ui-confirm";
import React, { useMemo, useRef, useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import invariant from "tiny-invariant";
import { requireAdminUser } from "~/auth/loader.server";
import AdminHeader from "~/components/admin/header";
import AdminHeaderActions from "~/components/admin/header/actions";
import AdminHeaderCircleSwitch from "~/components/admin/header/circle_switch";
import AdminHeaderTitle from "~/components/admin/header/title";
import { getNotJoinedSignUps, inviteMember, joinMember } from "~/model/signup.server";
import { useUser } from "~/utils";

type LoaderData = Awaited<ReturnType<typeof getLoaderData>>;
type SignUp = Awaited<ReturnType<typeof getNotJoinedSignUps>>[0];

const getLoaderData = async () => {
  return {
    signUps: {
      notInvited: await getNotJoinedSignUps({ invited: false }),
      invited: await getNotJoinedSignUps({ invited: true }),
    },
  };
};

export const loader: LoaderFunction = async () => await getLoaderData();

export const action: ActionFunction = async ({ request }) => {
  await requireAdminUser(request);
  const formData = await request.formData();
  const memberId = formData.get("memberId") as string;
  const invited = !!formData.get("invited");
  const joined = !!formData.get("joined");

  invariant(memberId, "memberId cannot null");

  if (invited) {
    await inviteMember({ memberId });
  }

  if (joined) {
    await joinMember({ memberId });
  }
  return null;
};

export default function AdminSignUps() {
  const { signUps } = useLoaderData<LoaderData>();
  const user = useUser();

  const [showOnlyMyCircle, setShowOnlyMyCircle] = useState(true);

  const [invitedSignUps, notInvitedSignUps] = useMemo(
    () => [
      signUps.invited.filter(
        (signUp) =>
          !showOnlyMyCircle ||
          (user.circleKey && user.circleKey === signUp.circleKey),
      ),
      signUps.notInvited.filter(
        (signUp) =>
          !showOnlyMyCircle ||
          (user.circleKey && user.circleKey === signUp.circleKey),
      ),
    ],
    [signUps, showOnlyMyCircle, user.circleKey],
  );
  return (
    <div>
      <AdminHeader>
        <AdminHeaderTitle title="加入申請" />
        <AdminHeaderActions>
          <AdminHeaderCircleSwitch
            checked={showOnlyMyCircle}
            onChange={setShowOnlyMyCircle}
          />
        </AdminHeaderActions>
      </AdminHeader>
      <Stack spacing={{ xs: 4, sm: 8 }} px={{ xs: 2, sm: 4, md: 6 }} py={4}>
        <Card>
          <CardHeader
            title="勧誘待ち"
            subheader="サークルの「サークルメニュー」→「メンバー勧誘」→「勧誘」の画面でトレーナーIDを貼り付けて勧誘を行ってください。"
          />
          {notInvitedSignUps.length ? (
            <List>
              {notInvitedSignUps.map((signUp) => (
                <NotInvitedListItem key={signUp.id} signUp={signUp} />
              ))}
            </List>
          ) : (
            <CardContent>
              <Typography variant="body1">勧誘待ちはありません</Typography>
            </CardContent>
          )}
        </Card>
        <Card>
          <CardHeader title="加入待ち" />
          {invitedSignUps.length ? (
            <List>
              {invitedSignUps.map((signUp) => (
                <InvitedListItem key={signUp.id} signUp={signUp} />
              ))}
            </List>
          ) : (
            <CardContent>
              <Typography variant="body1">加入待ちはありません</Typography>
            </CardContent>
          )}
        </Card>
      </Stack>
    </div>
  );
}

const InvitedListItem: React.FC<{ signUp: SignUp }> = ({ signUp }) => {
  const transition = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const submit = useSubmit();
  const confirm = useConfirm();
  return (
    <ListItem>
      <ListItemText
        primary={signUp.member.name}
        secondary={signUp.circle?.name ?? "未選択"}
      />
      <li className="py-4">
        <div className="flex items-center space-x-4">
          <div className="flex flex-row items-center space-x-2">
            <Button
              disabled={transition.state == "submitting"}
              variant="contained"
              size="small"
              onClick={() =>
                confirm({
                  title: "確認",
                  description:
                    "加入済みにしてメンバーのロールを更新します、実行するとリストから消えますので必ず加入が済んだことを確認してください。",
                }).then(() => {
                  const form = formRef.current;
                  if (form) {
                    submit(form);
                  }
                })
              }
            >
              加入済みにする
            </Button>
            <Form method="post" ref={formRef}>
              <input name="memberId" type="hidden" value={signUp.member.id} />
              <input name="joined" type="hidden" value="joined" />
            </Form>
          </div>
        </div>
      </li>
    </ListItem>
  );
};

const NotInvitedListItem: React.FC<{ signUp: SignUp }> = ({ signUp }) => {
  const [copied, setCopied] = useState(false);
  const transition = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const submit = useSubmit();
  const confirm = useConfirm();
  return (
    <ListItem
      secondaryAction={
        <Stack direction="row" spacing={2} alignItems="center">
          {signUp.member.trainerId ? (
            <CopyToClipboard
              text={signUp.member.trainerId}
              onCopy={() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1000);
              }}
            >
              {copied ? (
                <Typography variant="body2" py={4}>
                  コピーしました
                </Typography>
              ) : (
                <Button
                  variant="text"
                  type="button"
                  size="small"
                  startIcon={<ContentCopy />}
                >
                  トレーナーIDをコピー
                </Button>
              )}
            </CopyToClipboard>
          ) : (
            <Typography color="text.disabled">トレーナーID未入力</Typography>
          )}
          <Button
            variant="contained"
            disabled={transition.state == "submitting"}
            size="small"
            onClick={() =>
              confirm({
                title: "確認",
                description:
                  "メンバーに勧誘した旨通知されるので、必ず勧誘を行ったことを確認してください。",
              }).then(() => {
                const form = formRef.current;
                if (form) {
                  submit(form);
                }
              })
            }
          >
            勧誘済みにする
          </Button>
          <Form method="post" ref={formRef}>
            <input name="memberId" type="hidden" value={signUp.member.id} />
            <input name="invited" type="hidden" value="invited" />
          </Form>
        </Stack>
      }
    >
      <ListItemText
        primary={signUp.member.name}
        secondary={signUp.circle?.name ?? "未選択"}
      />
    </ListItem>
  );
};
