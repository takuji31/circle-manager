import type { GetServerSideProps, NextPage } from 'next';
import * as React from 'react';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Grid,
  TableRow,
  Typography,
} from '@mui/material';
import Layout from '../components/layout';
import useUser from '../hooks/user';
import {
  LinearProgress,
  Stack,
  TableContainer,
  TableHead,
  TableBody,
  TableCell,
} from '@mui/material';
import { nextMonth, thisMonth, UserWithSession } from '../model';
import MemberMonthCircle from '../components/member_month_circle';
import {
  useAdminTopQuery,
  useCreateNextMonthSurveyMutation,
  useMemberMonthCirclesQuery,
  useUpdateSignUpMutation,
} from '../apollo';
import { useMemo } from 'react';
import { Temporal } from 'proposal-temporal';
import Link from '../components/link';
import { ssrAdminMembers, ssrAdminTop } from '../apollo/page';

const Home: NextPage = (props) => {
  const { user, status } = useUser();
  return (
    <Layout>
      {status == 'loading' && (
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
        </Box>
      )}
      {status == 'unauthenticated' && (
        <Box p={2}>
          <Typography variant="body1">
            Discordでログインを押してDiscordのアカウントでログインしてください。
          </Typography>
        </Box>
      )}
      {status == 'authenticated' && !user?.isMember && (
        <Box p={2}>
          <Typography variant="body1">
            サークルメンバーではありません、サークル加入についてはサークルメンバーまでご連絡ください。
          </Typography>
        </Box>
      )}
      {status == 'authenticated' && user && user?.isMember && (
        <Stack p={2} spacing={4}>
          {/* <TopContent user={user} /> */}
          {user.isAdmin && <AdminTopContent />}
        </Stack>
      )}
    </Layout>
  );
};

interface TopContentProps {
  user: UserWithSession;
}

const TopContent = ({ user }: TopContentProps) => {
  const { data, loading, error } = useMemberMonthCirclesQuery({
    variables: {
      memberId: user.id,
    },
  });
  const member = data?.member;
  const circles = data?.circles;
  return (
    <>
      {status == 'loading' && (
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
        </Box>
      )}
      {member && circles && (
        <Stack spacing={2}>
          <MemberMonthCircle
            memberId={user.id}
            monthCircle={member.thisMonthCircle}
            circles={circles}
            canEdit={false}
            {...thisMonth()}
          />
          <MemberMonthCircle
            memberId={user.id}
            monthCircle={member.nextMonthCircle}
            circles={circles}
            canEdit={true}
            {...nextMonth()}
          />
        </Stack>
      )}
    </>
  );
};

const AdminTopContent = () => {
  const { data } = ssrAdminTop.usePage();
  const [mutation, { loading: creating, error: mutationError }] =
    useCreateNextMonthSurveyMutation();
  const thisMonth = data?.thisMonth;
  const nextMonth = data?.nextMonth;
  const circles = data?.circles;
  const answers = data?.nextMonth.survey?.answers;
  const circleIdToMemberCount: { [id: string]: number } = useMemo(() => {
    if (!circles || !answers) {
      return {};
    } else {
      const data: { [id: string]: number } = {};

      circles.forEach((circle) => {
        data[circle.id] = answers.filter(
          (answer) => answer?.circle?.id == circle.id
        ).length;
      });

      return data;
    }
  }, [circles, answers]);
  const expiredAtString = useMemo(() => {
    const expiredAt = data?.nextMonth?.survey?.expiredAt as string;
    if (!expiredAt) {
      return null;
    } else {
      const zonedDateTime = Temporal.Instant.from(expiredAt).toZonedDateTime({
        timeZone: 'Asia/Tokyo',
        calendar: 'iso8601',
      });
      return zonedDateTime.toLocaleString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    }
  }, [data?.nextMonth?.survey?.expiredAt]);
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h5">管理メニュー</Typography>
      </Grid>
      <Grid item xs={12} lg={6}>
        <Typography variant="h6">加入申請</Typography>
        {data?.signUps && !!data.signUps.length && (
          <TableContainer>
            <TableHead>
              <TableCell>名前</TableCell>
              <TableCell>サークル</TableCell>
              <TableCell>トレーナーID</TableCell>
              <TableCell>勧誘送信済み</TableCell>
              <TableCell>加入済み</TableCell>
            </TableHead>
            <TableBody>
              {data.signUps.map((signUp) => {
                return (
                  <TableRow key={`signup_${signUp.id}`}>
                    <TableCell>{signUp.member.name}</TableCell>
                    <TableCell>{signUp.circle.name}</TableCell>
                    <TableCell>{signUp.member.trainerId ?? '未入力'}</TableCell>
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
                  <Button onClick={() => mutation().then()}>開始する</Button>
                </>
              )}
              {nextMonth.survey && (
                <>
                  <Typography variant="body1">
                    開始済み(期限: {expiredAtString ?? ''})
                  </Typography>
                  <TableContainer>
                    <TableHead>
                      <TableRow>
                        <TableCell>サークル</TableCell>
                        <TableCell>回答数/最大人数</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {circles &&
                        circles.map((circle) => {
                          return (
                            <TableRow
                              key={`month_survey_answer_count_${circle.id}`}
                            >
                              <TableCell>{circle.name}</TableCell>
                              <TableCell>
                                {circleIdToMemberCount[circle.id] ?? 0} / 30
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      <TableRow>
                        <TableCell>回答済み合計</TableCell>
                        <TableCell>
                          {nextMonth.survey.answers.length}/
                          {data.siteMetadata.activeMembers}
                        </TableCell>
                      </TableRow>
                    </TableBody>
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
  const [mutation, { loading }] = useUpdateSignUpMutation();
  return (
    <LoadingCheckBox
      checked={invited}
      loading={loading}
      onCheckChanged={(checked) =>
        mutation({ variables: { memberId, invited: checked } })
      }
    />
  );
};

const JoinedCheckBox: (props: {
  joined: boolean;
  memberId: string;
}) => JSX.Element = ({ joined, memberId }) => {
  const [mutation, { loading }] = useUpdateSignUpMutation();
  return (
    <LoadingCheckBox
      checked={joined}
      loading={loading}
      onCheckChanged={(checked) =>
        mutation({ variables: { memberId, joined: checked } })
      }
    />
  );
};

const LoadingCheckBox: (props: {
  checked: boolean;
  loading: boolean;
  onCheckChanged: (checked: boolean) => void;
}) => JSX.Element = ({ checked, loading, onCheckChanged }) => {
  if (loading) {
    return <CircularProgress />;
  }
  return (
    <Checkbox
      checked={checked}
      onChange={(e) => {
        onCheckChanged(e.target.checked);
      }}
    />
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await ssrAdminMembers.getServerPage();
};

export default Home;
