import type { NextPage } from 'next';
import * as React from 'react';
import {
  Box,
  Container,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
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
} from '../apollo';
import { LoadingButton } from '@mui/lab';
import { useMemo } from 'react';
import { Temporal } from 'proposal-temporal';

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
        <Container maxWidth="md">
          <Stack p={2} spacing={4}>
            <TopContent user={user} />
            {user.isAdmin && <AdminTopContent />}
          </Stack>
        </Container>
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
  const { data, loading, error } = useAdminTopQuery();
  const [mutation, { loading: creating, error: mutationError }] =
    useCreateNextMonthSurveyMutation();
  const thisMonth = data?.thisMonth;
  const nextMonth = data?.nextMonth;
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
    <Stack spacing={2}>
      <Typography variant="h5">管理メニュー</Typography>
      <Typography variant="h6">加入申請</Typography>
      {data?.signUps && (
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
                  <TableCell>{signUp.invited}</TableCell>
                  <TableCell>{signUp.joined}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </TableContainer>
      )}
      {data?.signUps && !data.signUps.length && (
        <Typography variant="body1">加入申請はありません</Typography>
      )}
      {thisMonth && (
        <>
          <Typography variant="h6">
            今月({thisMonth.year}年{thisMonth.month}月)の状況
          </Typography>
        </>
      )}
      {nextMonth && (
        <>
          <Typography variant="h6">
            今月({nextMonth.year}年{nextMonth.month}月)の状況
          </Typography>

          <Stack spacing={2}>
            <List>
              <ListItem>
                <ListItemText>在籍希望アンケート</ListItemText>
              </ListItem>
              {!nextMonth.survey && (
                <>
                  <ListItem>
                    <ListItemText>まだ開始していません</ListItemText>
                  </ListItem>
                  <ListItem>
                    <ListItemButton onClick={() => mutation().then()}>
                      開始する
                    </ListItemButton>
                  </ListItem>
                </>
              )}
              {nextMonth.survey && (
                <>
                  <ListItem>
                    <ListItemText>
                      開始済み(期限: {expiredAtString ?? ''})
                    </ListItemText>
                  </ListItem>
                  <ListItem>
                    <ListItemText>
                      回答済み {nextMonth.survey.answeredMembers.length}/
                      {data.siteMetadata.activeMembers}
                    </ListItemText>
                  </ListItem>
                </>
              )}
            </List>
          </Stack>
        </>
      )}
    </Stack>
  );
};

export default Home;
