import type { NextPage } from 'next';
import * as React from 'react';
import { Box, Typography } from '@mui/material';
import Layout from '../components/layout';
import useUser from '../hooks/user';
import { CircularProgress, LinearProgress, Stack } from '@mui/material';
import { nextMonth, thisMonth, UserWithSession } from '@circle-manager/model';
import { MemberMonthCircle } from '../components/member_month_circle';
import { useMemberMonthCirclesQuery } from '../apollo';

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
        <TopContent user={user} />
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
    <Box p={2}>
      {!data && loading && <CircularProgress />}
      {member && circles && (
        <Stack spacing={2}>
          <MemberMonthCircle
            memberId={user.id}
            {...thisMonth()}
            monthCircle={member.thisMonthCircle}
            circles={circles}
            canEdit={false}
          />
          <MemberMonthCircle
            memberId={user.id}
            {...nextMonth()}
            monthCircle={member.nextMonthCircle}
            circles={circles}
            canEdit={true}
          />
        </Stack>
      )}
    </Box>
  );
};

export default Home;
