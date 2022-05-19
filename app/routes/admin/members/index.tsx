import {
  circleRoleLabel,
  LocalDate,
  memberStatusLabel,
  monthCircleStateLabel,
  monthSurveyAnswerLabel,
} from "@/model";
import React, { useState } from "react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link as RemixLink } from "@remix-run/react";
import { adminOnly } from "~/auth/loader";
import { getJoinedMembers } from "~/model/member.server";
import { CopyToClipboard } from "react-copy-to-clipboard";
import {
  ClipboardCheckIcon,
  ClipboardCopyIcon,
} from "@heroicons/react/outline";
import {
  Box,
  Card,
  CardHeader,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Link,
  MenuItem,
  Menu,
} from "@mui/material";
import { Scrollbar } from "~/mui/components/scrollbar";
import { MoreVert } from "@mui/icons-material";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import { Typography } from "@mui/material";

type LoaderData = {
  members: Awaited<ReturnType<typeof getLoaderData>>;
  year: number;
  month: number;
};

const getLoaderData = async () => {
  const firstDayOfNextMonth = LocalDate.firstDayOfNextMonth();
  return await getJoinedMembers({
    monthSurveyDate: firstDayOfNextMonth,
    monthCircleDate: firstDayOfNextMonth,
  });
};

export const loader: LoaderFunction = adminOnly(async () => {
  const firstDayOfNextMonth = LocalDate.firstDayOfNextMonth();
  return json<LoaderData>({
    members: await getLoaderData(),
    year: firstDayOfNextMonth.year(),
    month: firstDayOfNextMonth.monthValue(),
  });
});

export default function AdminMemberList() {
  const { members, year, month } = useLoaderData() as LoaderData;
  return (
    <Box p={3}>
      <Card>
        <CardHeader title="メンバー一覧" />
        <Divider />
        <Scrollbar>
          <Table sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow>
                {/* <TableCell sortDirection="desc">
                  <Tooltip enterDelay={300} title="Sort">
                    <TableSortLabel active direction="desc">
                      Number
                    </TableSortLabel>
                  </Tooltip>
                </TableCell> */}
                <TableCell>トレーナー名</TableCell>
                <TableCell className="hidden lg:table-cell">サークル</TableCell>
                <TableCell className="hidden sm:table-cell">役職</TableCell>
                <TableCell>トレーナーID</TableCell>
                <TableCell>来月の在籍希望</TableCell>
                <TableCell>来月のサークル</TableCell>
                <TableCell>
                  <span className="sr-only">アクション</span>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {members.map((member) => {
                const answer = member.monthSurveyAnswer[0];
                const monthCircle = member.monthCircles[0];
                const circle =
                  member.circle?.name ?? memberStatusLabel(member.status);
                const circleRole = member.circle
                  ? circleRoleLabel(member.circleRole)
                  : "";
                return (
                  <TableRow hover key={member.id}>
                    <TableCell>
                      {member.name}
                      <dl className="font-normal lg:hidden">
                        <dt className="sr-only">サークル</dt>
                        <dd className="mt-1">
                          <Typography variant="caption">{circle}</Typography>
                        </dd>
                        <dt className="sr-only sm:hidden">役職</dt>
                        <dd className="mt-1 truncate sm:hidden">
                          <Typography variant="caption">
                            {circleRole}
                          </Typography>
                        </dd>
                      </dl>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {circle}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {circleRole}
                    </TableCell>
                    <TableCell>
                      <span className="inline">
                        {member.trainerId}
                        {member.trainerId && (
                          <CopyTrainerIdButton trainerId={member.trainerId} />
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      {answer?.value
                        ? monthSurveyAnswerLabel(answer.value)
                        : "対象外"}
                    </TableCell>
                    <TableCell>
                      <Link
                        component={RemixLink}
                        to={`/admin/members/${member.id}/month_circles/${year}/${month}`}
                      >
                        {monthCircle?.state
                          ? monthCircleStateLabel(monthCircle.state)
                          : "未確定"}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <PopupState variant="popover" popupId="demo-popup-menu">
                        {(popupState) => (
                          <React.Fragment>
                            <IconButton {...bindTrigger(popupState)}>
                              <MoreVert />
                            </IconButton>
                            <Menu {...bindMenu(popupState)}>
                              <RemixLink
                                to={`/members/${member.pathname}/setup`}
                              >
                                <MenuItem onClick={popupState.close}>
                                  加入申請URLを開く
                                </MenuItem>
                              </RemixLink>
                              <RemixLink
                                to={`/members/${member.pathname}/edit`}
                              >
                                <MenuItem onClick={popupState.close}>
                                  トレーナーID登録URLを開く
                                </MenuItem>
                              </RemixLink>
                            </Menu>
                          </React.Fragment>
                        )}
                      </PopupState>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Scrollbar>
      </Card>
    </Box>
  );
}

const CopyTrainerIdButton: React.FC<{ trainerId: string }> = ({
  trainerId,
}) => {
  const [copied, setCopied] = useState(false);
  return (
    <CopyToClipboard
      text={trainerId}
      onCopy={() => {
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      }}
    >
      {copied ? (
        <ClipboardCheckIcon className="h-5 w-5" />
      ) : (
        <ClipboardCopyIcon className="h-5 w-5" />
      )}
    </CopyToClipboard>
  );
};
