import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { NextPage } from 'next';
import { ParsedUrlQuery } from 'querystring';
import React, { useMemo, useState } from 'react';
import {
  CircleKey,
  CircleRole,
  MonthCircleState,
  MonthSurveyDocument,
  UpdateMonthCircleDocument,
  UpdateMonthCircleMutationInput,
} from '../../../../graphql/generated/type';
import { LoadingCheckBox } from '../../../../components/loading_checkbox';
import { useMutation, useQuery } from 'urql';
import {
  getServerSidePropsWithUrql,
  withUrqlClient,
} from '../../../../graphql/client';
import { DateFormats, ZonedDateTime } from '../../../../model/date';
import useUser from '../../../../hooks/user';
import { check } from 'prettier';
import Layout from '../../../../components/layout';

interface Props {
  year: string;
  month: string;
}

export const MonthCircleList: NextPage<Props> = ({ year, month }) => {
  const [{ data, error }] = useQuery({
    query: MonthSurveyDocument,
    variables: { year: parseInt(year), month: parseInt(month) },
  });
  const { user } = useUser();
  const [onlyForMe, setOnlyForMe] = useState(false);
  const [filterCompleted, setFilterCompleted] = useState(false);
  const monthSurvey = data?.monthSurvey;
  const monthCircleFilter = (monthCircle: {
    member: { circleKey: CircleKey | null };
  }) => {
    return !onlyForMe && monthCircle.member.circleKey == user?.circleKey;
  };
  if (error) {
    return <p>{error.message}</p>;
  } else if (!monthSurvey) {
    return <p></p>;
  }

  return (
    <Layout title={`${monthSurvey.year}年${monthSurvey.month}月の移籍表`}>
      <Stack p={2} spacing={4}>
        <Stack spacing={4} direction="row">
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={onlyForMe}
                  onChange={(e) => setOnlyForMe(e.target.checked)}
                />
              }
              label="関係するものだけ表示"
            />
            <FormHelperText id="only-for-me-checkbox-helper-text">
              自分がやれるタスクだけ表示します。
            </FormHelperText>
          </FormGroup>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filterCompleted}
                  onChange={(e) => setFilterCompleted(e.target.checked)}
                />
              }
              label="完了済みを非表示"
            />
            <FormHelperText id="only-for-me-checkbox-helper-text">
              完了しているものを非表示にします
            </FormHelperText>
          </FormGroup>
        </Stack>

        <Typography variant="h6">移籍</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>名前</TableCell>
                <TableCell>現サークル</TableCell>
                <TableCell>移籍先</TableCell>
                <TableCell>トレーナーID</TableCell>
                <TableCell>除名済み</TableCell>
                <TableCell>勧誘済み</TableCell>
                <TableCell>加入済み</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {monthSurvey.move
                .filter(
                  (monthCircle) =>
                    !onlyForMe ||
                    (user?.role == CircleRole.Leader &&
                      monthCircle.currentCircle?.key == user?.circleKey) ||
                    ((user?.role == CircleRole.Leader ||
                      user?.role == CircleRole.SubLeader) &&
                      (monthCircle.state as string) ==
                        (user?.circleKey as string))
                )
                .filter(
                  (monthCircle) => !filterCompleted || !monthCircle.joined
                )
                .map((monthCircle) => {
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
                          disabled={monthCircle.joined}
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
          </Table>
        </TableContainer>

        <Typography variant="h6">脱退予定者</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>名前</TableCell>
                <TableCell>現サークル</TableCell>
                <TableCell>除名済み</TableCell>
                <TableCell>Discord残留</TableCell>
                <TableCell>Discord脱退</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {monthSurvey.leave
                .filter(
                  (monthCircle) =>
                    !onlyForMe ||
                    (user?.role == CircleRole.Leader &&
                      monthCircle.currentCircle?.key == user?.circleKey)
                )
                .filter(
                  (monthCircle) => !filterCompleted || !monthCircle.kicked
                )
                .map((monthCircle) => {
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
          </Table>
        </TableContainer>
        <Typography variant="h6">除名者(未回答含む)</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>名前</TableCell>
                <TableCell>現サークル</TableCell>
                <TableCell>除名済み</TableCell>
                <TableCell>Discord脱退</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {monthSurvey.kick
                .filter(
                  (monthCircle) =>
                    !onlyForMe ||
                    (user?.role == CircleRole.Leader &&
                      monthCircle.currentCircle?.key == user?.circleKey)
                )
                .filter(
                  (monthCircle) => !filterCompleted || !monthCircle.kicked
                )
                .map((monthCircle) => {
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
          </Table>
        </TableContainer>
      </Stack>
    </Layout>
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
  const [afterChecked, setAfterChecked] = useState(checked);
  const [{ fetching }, mutation] = useMutation(UpdateMonthCircleDocument);
  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
    mutation({
      data: {
        ...variablesBuilder(afterChecked),
      },
    })
      .then(() => {})
      .catch((error) => {
        console.log('error: %s', error);
      })
      .finally(() => setOpen(false));
  };
  return (
    <>
      {confirmation && (
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          aria-labelledby="responsive-dialog-title"
        >
          <DialogTitle id="responsive-dialog-title">確認</DialogTitle>
          <DialogContent>{confirmation}</DialogContent>
          <DialogActions>
            <Button
              disabled={fetching}
              autoFocus
              onClick={() => setOpen(false)}
            >
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
            setAfterChecked(checked);
            setOpen(true);
          } else {
            mutation({
              data: {
                ...variablesBuilder(checked),
              },
            })
              .then(() => {})
              .catch((error) => {
                console.log('error: %s', error);
              })
              .finally(() => setOpen(false));
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

export default withUrqlClient({ ssr: false })(MonthCircleList);
