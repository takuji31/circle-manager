import { monthCircleStateLabel } from "@/model";
import { Button, Card, CardContent, CardHeader, List, ListItem, ListItemText, Stack, Typography } from "@mui/material";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { Form, useLoaderData, useSubmit, useTransition } from "@remix-run/react";
import { useConfirm } from "material-ui-confirm";
import React, { useMemo, useRef, useState } from "react";
import type { Params } from "react-router";
import invariant from "tiny-invariant";
import { AdminBody } from "~/components/admin/body";
import AdminHeader from "~/components/admin/header";
import AdminHeaderActions from "~/components/admin/header/actions";
import AdminHeaderCircleSwitch from "~/components/admin/header/circle_switch";
import AdminHeaderTitle from "~/components/admin/header/title";
import CopyTrainerIdButton from "~/components/copy-trainer-id-button";
import type { MonthCircle } from "~/model/month_circle.server";
import { getMonthCircles, inviteMember, joinMember, kickDiscordMember, kickMember } from "~/model/month_circle.server";
import { YearAndMonth } from "~/schema/date";
import { useUser } from "~/utils";

type LoaderData = Awaited<ReturnType<typeof getLoaderData>>;

const getLoaderData = async ({ params }: { params: Params<string> }) => {
  const { year, month } = YearAndMonth.parse(params);
  return {
    year,
    month,
    monthCircles: await getMonthCircles({ year, month }),
  };
};

export const loader: LoaderFunction = async ({ request, params }) => await getLoaderData({ params },
);

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const monthCircleId = formData.get("monthCircleId");
  invariant(monthCircleId && typeof monthCircleId == "string", "monthCircleId required");
  if (formData.get("kicked")) {
    await kickMember({ monthCircleId });
  } else if (formData.get("invited")) {
    await inviteMember({ monthCircleId });
  } else if (formData.get("joined")) {
    await joinMember({ monthCircleId });
  } else if (formData.get("kickDiscord")) {
    await kickDiscordMember({ monthCircleId });
  }
  return null;
};

export default function AdminMonthCircles() {
  const { year, month, monthCircles } = useLoaderData<LoaderData>();
  const user = useUser();
  const transition = useTransition();

  const [showOnlyMyCircle, setShowOnlyMyCircle] = useState(true);

  const {
    notKicked,
    notInvited,
    notJoined,
    notDiscordKicked,
    completed,
  }: typeof monthCircles = useMemo(() => {
    const filterBeforeKick = (m: MonthCircle) =>
      !showOnlyMyCircle || m.currentCircleKey == user.circleKey;
    const filterAfterKick = (m: MonthCircle) =>
      !showOnlyMyCircle || m.state == user.circleKey;
    return {
      notKicked: monthCircles.notKicked.filter(filterBeforeKick),
      notInvited: monthCircles.notInvited.filter(filterAfterKick),
      notJoined: monthCircles.notJoined.filter(filterAfterKick),
      notDiscordKicked: monthCircles.notDiscordKicked,
      completed: monthCircles.completed,
    };
  }, [monthCircles, showOnlyMyCircle]);

  return (
    <>
      <AdminHeader>
        <AdminHeaderTitle title={`${year}年${month}月の移籍表`} />
        <AdminHeaderActions>
          <AdminHeaderCircleSwitch
            checked={showOnlyMyCircle}
            onChange={setShowOnlyMyCircle}
          />
        </AdminHeaderActions>
      </AdminHeader>
      <AdminBody>
        <Stack spacing={{ xs: 4, sm: 8 }}>
          <Card>
            <CardHeader title="除名待ち" subheader="1日5時以降に除名してください。" />
            <CardContent>
              {notKicked.length ? (
                <List>
                  {notKicked.map((signUp) => (
                    <NotKickedListItem key={signUp.id} monthCircle={signUp} />
                  ))}
                </List>
              ) : (
                <Typography variant="body1">勧誘待ちはありません</Typography>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader
              title="勧誘待ち"
              subheader="サークルの「サークルメニュー」→「メンバー勧誘」→「勧誘」の画面でトレーナーIDを貼り付けて勧誘を行ってください。"
            />
            <CardContent>
              {notInvited.length ? (
                <List>
                  {notInvited.map((monthCircle) => (
                    <NotInvitedListItem key={monthCircle.id} monthCircle={monthCircle} />
                  ))}
                </List>
              ) : (
                <Typography variant="body1">勧誘待ちはありません</Typography>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader title="加入待ち" />
            <CardContent>
              {notJoined.length ? (
                <List>
                  {notJoined.map((signUp) => (
                    <NotJoinedListItem key={signUp.id} monthCircle={signUp} />
                  ))}
                </List>
              ) : (
                <Typography variant="body1">加入待ちはありません</Typography>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader title="Discord脱退待ち" />
            <CardContent>
              {notDiscordKicked.length ? (
                <List>
                  {notDiscordKicked.map((signUp) => (
                    <NotDiscordLeavedListItem key={signUp.id} monthCircle={signUp} />
                  ))}
                </List>
              ) : (
                <Typography variant="body1">加入待ちはありません</Typography>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader title="完了済み" />
            <CardContent>
              {completed.length ? (
                <List>
                  {completed.map((signUp) => (
                    <CompletedListItem key={signUp.id} monthCircle={signUp} />
                  ))}
                </List>
              ) : (
                <Typography variant="body1">加入待ちはありません</Typography>
              )}
            </CardContent>
          </Card>
        </Stack>
      </AdminBody>
    </>
  );
}


const NotKickedListItem: React.FC<{ monthCircle: MonthCircle }> = ({ monthCircle }) => {
  const transition = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const submit = useSubmit();
  const confirm = useConfirm();
  return (
    <MonthCircleListItem
      monthCircle={monthCircle}
      actions={
        <>
          <Button
            variant="contained"
            disabled={transition.state == "submitting"}
            size="small"
            onClick={() =>
              confirm({
                title: "確認",
                description:
                  "メンバーに除名した旨通知されるので、必ず除名を行ったことを確認してください。また、サークル除名対象者はDiscord即時BANされます。間違いでないか確認してください。",
              }).then(() => {
                const form = formRef.current;
                if (form) {
                  submit(form);
                }
              })
            }
          >
            除名済みにする
          </Button>
          <Form method="post" ref={formRef} replace>
            <input name="monthCircleId" type="hidden" value={monthCircle.id} />
            <input name="kicked" type="hidden" value="kicked" />
          </Form>
        </>
      }
    />
  );
};

const NotInvitedListItem: React.FC<{ monthCircle: MonthCircle }> = ({ monthCircle }) => {
  const transition = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const submit = useSubmit();
  const confirm = useConfirm();
  return (
    <MonthCircleListItem
      monthCircle={monthCircle}
      actions={
        <Stack direction="row" spacing={2} alignItems="center">
          {monthCircle.member.trainerId ? (
            <CopyTrainerIdButton trainerId={monthCircle.member.trainerId} />
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
          <Form method="post" ref={formRef} replace>
            <input name="monthCircleId" type="hidden" value={monthCircle.id} />
            <input name="invited" type="hidden" value="invited" />
          </Form>
        </Stack>
      }
    />
  );
};

const NotJoinedListItem: React.FC<{ monthCircle: MonthCircle }> = ({ monthCircle }) => {
  const transition = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const submit = useSubmit();
  const confirm = useConfirm();
  return (
    <MonthCircleListItem monthCircle={monthCircle} actions={
      <>
        <Button
          variant="contained"
          disabled={transition.state == "submitting"}
          size="small"
          onClick={() =>
            confirm({
              title: "確認",
              description:
                "加入済みにしてメンバーのロールを更新します、やり直せませんので必ず加入が済んだことを確認してください。",
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
        <Form method="post" ref={formRef} replace>
          <input name="monthCircleId" type="hidden" value={monthCircle.id} />
          <input name="joined" type="hidden" value="joined" />
        </Form>
      </>
    } />
  );
};

const NotDiscordLeavedListItem: React.FC<{ monthCircle: MonthCircle }> = ({ monthCircle }) => {
  const transition = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const submit = useSubmit();
  const confirm = useConfirm();
  return (
    <MonthCircleListItem
      monthCircle={monthCircle}
      actions={
        <>
          <Button
            variant="contained"
            disabled={transition.state == "submitting"}
            size="small"
            onClick={() =>
              confirm({
                title: "確認",
                description:
                  "Discordから追放されます、3日間は本人の自主脱退を待って4日0時以降に押すことを推奨します。",
              }).then(() => {
                const form = formRef.current;
                if (form) {
                  submit(form);
                }
              })
            }
          >
            Discordから追放する
          </Button>
          <Form method="post" ref={formRef} replace>
            <input name="monthCircleId" type="hidden" value={monthCircle.id} />
            <input name="kickDiscord" type="hidden" value="kickDiscord" />
          </Form>
        </>
      }
    />
  );
};

const CompletedListItem: React.FC<{ monthCircle: MonthCircle }> = ({ monthCircle }) => {
  return <MonthCircleListItem monthCircle={monthCircle} />;
};

const MonthCircleListItem: React.FC<{ monthCircle: MonthCircle, actions?: React.ReactNode }> = ({
  monthCircle,
  actions,
}) => {
  return (
    <ListItem secondaryAction={actions} disableGutters>
      <ListItemText
        primary={monthCircle.member.name}
        secondary={`${monthCircle.currentCircle?.name ?? "OB"} => ${monthCircleStateLabel(monthCircle.state)} ${monthCircle.member.leavedAtString ? ` 脱退済み (${monthCircle.member.leavedAtString})` : ""}`}
      />
    </ListItem>
  );
};

