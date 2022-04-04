import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { NextPage } from 'next';
import { ParsedUrlQuery } from 'querystring';
import React, { ReactElement, useMemo, useState } from 'react';
import {
  MonthCircleState,
  MonthSurveyDocument,
  UpdateMonthCircleDocument,
  UpdateMonthCircleMutationInput,
} from '../../../../graphql/generated/type';
import { AdminLayout } from '../../../../components/admin_filter';
import { LoadingCheckBox } from '../../../../components/loading_checkbox';
import { useMutation, useQuery } from 'urql';
import {
  getServerSidePropsWithUrql,
  withUrqlClient,
} from '../../../../graphql/client';
import { JsxElement } from 'typescript';
import { DateFormats, ZonedDateTime } from '../../../../model/date';

interface Props {
  year: string;
  month: string;
}

export const MonthCircleList: NextPage<Props> = ({ year, month }) => {
  const [{ data, error }] = useQuery({
    query: MonthSurveyDocument,
    variables: { year: parseInt(year), month: parseInt(month) },
  });
  const monthSurvey = data?.monthSurvey;
  if (error) {
    return <p>{error.message}</p>;
  } else if (!monthSurvey) {
    return <p></p>;
  }

  return (
    <AdminLayout title={`${monthSurvey.year}年${monthSurvey.month}月の移籍表`}>
      <Stack p={2} spacing={4}>
        <Typography variant="h6">移籍</Typography>
        <TableContainer>
          <TableHead>
            <TableCell>名前</TableCell>
            <TableCell>現サークル</TableCell>
            <TableCell>移籍先</TableCell>
            <TableCell>トレーナーID</TableCell>
            <TableCell>除名済み</TableCell>
            <TableCell>勧誘済み</TableCell>
            <TableCell>加入済み</TableCell>
          </TableHead>
          <TableBody>
            {monthSurvey.move.map((monthCircle) => {
              return (
                <TableRow key={monthCircle.id}>
                  <TableCell>{monthCircle.member.name}</TableCell>
                  <TableCell>{monthCircle.currentCircle?.name}</TableCell>
                  <TableCell>{monthCircle.circle?.name}</TableCell>
                  <TableCell>{monthCircle.member.trainerId}</TableCell>
                  <TableCell>
                    <MonthCircleStateCheckbox
                      checked={monthCircle.kicked}
                      disabled={monthCircle.kicked && monthCircle.invited}
                      variablesBuilder={(kicked) => ({
                        id: monthCircle.id,
                        kicked,
                      })}
                    />
                  </TableCell>
                  <TableCell>
                    <MonthCircleStateCheckbox
                      checked={monthCircle.invited}
                      disabled={!monthCircle.kicked || monthCircle.joined}
                      variablesBuilder={(invited) => ({
                        id: monthCircle.id,
                        invited,
                      })}
                    />
                  </TableCell>
                  <TableCell>
                    <MonthCircleStateCheckbox
                      checked={monthCircle.joined}
                      disabled={!monthCircle.kicked || !monthCircle.invited}
                      variablesBuilder={(joined) => ({
                        id: monthCircle.id,
                        joined,
                      })}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </TableContainer>
        <Typography variant="h6">脱退予定者</Typography>
        <TableContainer>
          <TableHead>
            <TableCell>名前</TableCell>
            <TableCell>現サークル</TableCell>
            <TableCell>除名済み</TableCell>
            <TableCell>Discord残留</TableCell>
            <TableCell>Discord脱退</TableCell>
          </TableHead>
          <TableBody>
            {monthSurvey.leave.map((monthCircle) => {
              return (
                <TableRow key={monthCircle.id}>
                  <TableCell>{monthCircle.member.name}</TableCell>
                  <TableCell>{monthCircle.currentCircle?.name}</TableCell>
                  <TableCell>
                    <MonthCircleStateCheckbox
                      checked={monthCircle.kicked}
                      disabled={monthCircle.kicked && monthCircle.invited}
                      variablesBuilder={(kicked) => ({
                        id: monthCircle.id,
                        kicked,
                      })}
                    />
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      checked={monthCircle.state == MonthCircleState.Ob}
                    />
                  </TableCell>
                  <TableCell>
                    <MemberLeavedMessage
                      leavedAt={monthCircle.member.leavedAt}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </TableContainer>
        <Typography variant="h6">除名者(未回答含む)</Typography>
        <TableContainer>
          <TableHead>
            <TableCell>名前</TableCell>
            <TableCell>現サークル</TableCell>
            <TableCell>除名済み</TableCell>
            <TableCell>Discord脱退</TableCell>
          </TableHead>
          <TableBody>
            {monthSurvey.kick.map((monthCircle) => {
              return (
                <TableRow key={monthCircle.id}>
                  <TableCell>{monthCircle.member.name}</TableCell>
                  <TableCell>{monthCircle.currentCircle?.name}</TableCell>
                  <TableCell>
                    <MonthCircleStateCheckbox
                      checked={monthCircle.kicked}
                      disabled={monthCircle.kicked && monthCircle.invited}
                      variablesBuilder={(kicked) => ({
                        id: monthCircle.id,
                        kicked,
                      })}
                      confirmation={
                        <>
                          <DialogContentText>
                            {monthCircle.member.name}
                            さんをDiscordからBANします。
                          </DialogContentText>
                          <DialogContentText>
                            - 1日の5時を過ぎましたか？
                          </DialogContentText>
                          <DialogContentText>
                            - サークルから除名しましたか？
                          </DialogContentText>
                          <DialogContentText>
                            - 除名取消ではありませんか？
                          </DialogContentText>
                        </>
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <MemberLeavedMessage
                      leavedAt={monthCircle.member.leavedAt}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </TableContainer>
      </Stack>
    </AdminLayout>
  );
};

const MemberLeavedMessage: React.FC<{
  leavedAt: string | null | undefined;
}> = ({ leavedAt }) => {
  const leavedAtString = useMemo(() => {
    if (!leavedAt) {
      return null;
    }
    return ZonedDateTime.fromDate(new Date(leavedAt)).format(
      DateFormats.dateTime
    );
  }, [leavedAt]);
  return <>{leavedAt ? `脱退済み(${leavedAtString})` : '未'}</>;
};

interface Confirmation {
  message: string;
}

const MonthCircleStateCheckbox = ({
  checked,
  disabled,
  variablesBuilder,
  confirmation,
}: {
  checked: boolean;
  disabled?: boolean;
  variablesBuilder: (checked: boolean) => UpdateMonthCircleMutationInput;
  confirmation?: React.ReactElement<any, any>;
}) => {
  const [{ fetching }, mutation] = useMutation(UpdateMonthCircleDocument);
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);
  return (
    <>
      {confirmation && (
        <Dialog
          open={open}
          onClose={() => {
            setOpen(false);
          }}
          aria-labelledby="responsive-dialog-title"
        >
          <DialogTitle id="responsive-dialog-title">確認</DialogTitle>
          <DialogContent>{confirmation}</DialogContent>
          <DialogActions>
            <Button disabled={fetching} autoFocus onClick={handleClose}>
              いいえ
            </Button>
            <Button disabled={fetching} onClick={handleClose} autoFocus>
              はい
            </Button>
          </DialogActions>
        </Dialog>
      )}
      <LoadingCheckBox
        checked={checked}
        loading={fetching}
        disabled={disabled}
        onCheckChanged={(checked) => {
          if (confirmation && checked) {
            setOpen(true);
          } else {
            mutation({
              data: {
                ...variablesBuilder(checked),
              },
            });
          }
        }}
      />
    </>
  );
};

interface PathParams extends ParsedUrlQuery {
  year: string;
  month: string;
}

export const getServerSideProps = getServerSidePropsWithUrql<Props, PathParams>(
  async ({ params }, urql, ssr) => {
    const year = params?.year as string;
    const month = params?.month as string;

    await urql
      .query(MonthSurveyDocument, {
        year: parseInt(year),
        month: parseInt(month),
      })
      .toPromise();

    return {
      props: {
        year,
        month,
        urqlState: ssr.extractData(),
      },
    };
  }
);

export default withUrqlClient(false)(MonthCircleList);
