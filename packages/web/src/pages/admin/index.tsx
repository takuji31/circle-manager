import type { NextPage } from 'next';
import * as React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Table,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import useUser from '../../hooks/user';
import {
  LinearProgress,
  Stack,
  TableContainer,
  TableHead,
  TableBody,
  TableCell,
} from '@mui/material';
import {
  AdminTopDocument,
  CreateNextMonthSurveyDocument,
  UpdateSignUpDocument,
} from '../../graphql/generated/type';
import { useMemo } from 'react';
import Link from '../../components/link';
import { LoadingCheckBox } from '../../components/loading_checkbox';
import { MonthSurveyAnswerValue } from '@prisma/client';
import { useMutation, useQuery } from 'urql';
import {
  DateFormats,
  ZonedDateTime,
  ZoneId,
} from '@circle-manager/shared/model';
import { withUrqlClient } from '../../graphql/client';

const AdminHome: NextPage = (props) => {
  const { user, status } = useUser();
  if (status == 'loading') {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Stack p={2} spacing={4}>
      <AdminTopContent />
    </Stack>
  );
};

const AdminTopContent = () => {
  const [{ data }] = useQuery({ query: AdminTopDocument });
  const [{ fetching: creating, error: mutationError }, mutation] = useMutation(
    CreateNextMonthSurveyDocument
  );
  const thisMonth = data?.thisMonth;
  const nextMonth = data?.nextMonth;
  const answers = data?.nextMonth.survey?.monthSurveyAnswers;
  const circleIdToMemberCount: Array<{
    value: MonthSurveyAnswerValue;
    count: number;
  }> = useMemo(() => {
    if (!answers) {
      return [];
    } else {
      return [
        ...[
          MonthSurveyAnswerValue.Saikyo,
          MonthSurveyAnswerValue.Umamusume,
          MonthSurveyAnswerValue.Leave,
          MonthSurveyAnswerValue.Ob,
          MonthSurveyAnswerValue.None,
        ].map((value) => ({
          value,
          count: answers.filter((answer) => answer.value == value).length,
        })),
      ];
    }
  }, [answers]);
  const expiredAtString = useMemo(() => {
    const expiredAt = data?.nextMonth?.survey?.expiredAt as string;
    if (!expiredAt) {
      return null;
    } else {
      const date = ZonedDateTime.parse(expiredAt).withZoneSameInstant(
        ZoneId.SYSTEM
      );
      return date.format(DateFormats.dateTime);
    }
  }, [data?.nextMonth?.survey?.expiredAt]);

  const [open, setOpen] = React.useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    mutation()
      .then(() => {})
      .finally(() => {
        setOpen(false);
      });
  };
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h5">管理メニュー</Typography>
      </Grid>
      <Grid item xs={12} lg={6}>
        <Typography variant="h6">加入申請</Typography>
        {data?.signUps && !!data.signUps.length && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>名前</TableCell>
                  <TableCell>サークル</TableCell>
                  <TableCell>トレーナーID</TableCell>
                  <TableCell>勧誘送信済み</TableCell>
                  <TableCell>加入済み</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.signUps.map((signUp) => {
                  return (
                    <TableRow key={`signup_${signUp.id}`}>
                      <TableCell>{signUp.member.name}</TableCell>
                      <TableCell>{signUp?.circle?.name}</TableCell>
                      <TableCell>
                        {signUp.member.trainerId ?? '未入力'}
                      </TableCell>
                      <TableCell>
                        <InvitedCheckBox
                          invited={signUp.invited}
                          memberId={signUp.member.id}
                        />
                      </TableCell>
                      <TableCell>
                        <JoinedCheckBox
                          joined={signUp.joined}
                          memberId={signUp.member.id}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {data?.signUps && !data.signUps.length && (
          <Typography variant="body1">加入申請はありません</Typography>
        )}
      </Grid>
      <Grid item xs={12} lg={6}>
        {nextMonth && (
          <>
            <Stack spacing={2}>
              <Typography variant="h6">在籍希望アンケート</Typography>
              {!nextMonth.survey && (
                <>
                  <Typography variant="body1">まだ開始していません</Typography>
                  <Button onClick={() => handleClickOpen()}>開始する</Button>
                  <Dialog
                    fullScreen={fullScreen}
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="responsive-dialog-title"
                  >
                    <DialogTitle id="responsive-dialog-title">確認</DialogTitle>
                    <DialogContent>
                      <DialogContentText>
                        在籍希望アンケートを開始しますか？
                      </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                      <Button
                        disabled={creating}
                        autoFocus
                        onClick={() => setOpen(false)}
                      >
                        やめる
                      </Button>
                      <Button
                        disabled={creating}
                        onClick={handleClose}
                        autoFocus
                      >
                        開始する
                      </Button>
                    </DialogActions>
                  </Dialog>
                </>
              )}
              {nextMonth.survey && (
                <>
                  <Typography variant="body1">
                    開始済み(期限: {expiredAtString ?? ''})
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>サークル</TableCell>
                          <TableCell>回答数/最大人数</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {circleIdToMemberCount.map(({ value, count }) => {
                          return (
                            <TableRow
                              key={`month_survey_answer_count_${value}`}
                            >
                              <TableCell>
                                {value == MonthSurveyAnswerValue.Saikyo
                                  ? '西京ファーム'
                                  : value == MonthSurveyAnswerValue.Umamusume
                                  ? 'ウマ娘愛好会'
                                  : value == MonthSurveyAnswerValue.Leave
                                  ? '脱退'
                                  : value == MonthSurveyAnswerValue.Ob
                                  ? '脱退(Discord残留)'
                                  : '未回答'}
                              </TableCell>
                              <TableCell>
                                {count}{' '}
                                {value == MonthSurveyAnswerValue.Saikyo &&
                                  '/ 30'}
                                {value == MonthSurveyAnswerValue.Umamusume &&
                                  '/ 60'}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        <TableRow>
                          <TableCell>回答済み合計</TableCell>
                          <TableCell>
                            {
                              nextMonth.survey.monthSurveyAnswers.filter(
                                (answer) =>
                                  answer.value &&
                                  answer.value != MonthSurveyAnswerValue.None
                              ).length
                            }{' '}
                            / {nextMonth.survey.monthSurveyAnswers.length}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </Stack>
          </>
        )}
      </Grid>
      <Grid item xs={12} lg={6}>
        <Stack spacing={2}>
          <Typography variant="h6">移籍表</Typography>
          {nextMonth && (
            <Link
              href={`/admin/month_circles/${nextMonth.year}/${nextMonth.month}`}
            >
              {nextMonth.year}年{nextMonth.month}月
            </Link>
          )}
          {thisMonth && (
            <Link
              href={`/admin/month_circles/${thisMonth.year}/${thisMonth.month}`}
            >
              {thisMonth.year}年{thisMonth.month}月
            </Link>
          )}
        </Stack>
      </Grid>
    </Grid>
  );
};

const InvitedCheckBox: (props: {
  invited: boolean;
  memberId: string;
}) => JSX.Element = ({ invited, memberId }) => {
  const [{ fetching }, mutation] = useMutation(UpdateSignUpDocument);
  return (
    <LoadingCheckBox
      checked={invited}
      loading={fetching}
      onCheckChanged={(checked) => mutation({ memberId, invited: checked })}
    />
  );
};

const JoinedCheckBox: (props: {
  joined: boolean;
  memberId: string;
}) => JSX.Element = ({ joined, memberId }) => {
  const [{ fetching }, mutation] = useMutation(UpdateSignUpDocument);
  return (
    <LoadingCheckBox
      checked={joined}
      loading={fetching}
      onCheckChanged={(checked) => mutation({ memberId, joined: checked })}
    />
  );
};

export default withUrqlClient()(AdminHome);
