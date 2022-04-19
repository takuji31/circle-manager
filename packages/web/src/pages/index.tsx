import type { NextPage } from 'next';
import * as React from 'react';
import { Box, Typography } from '@mui/material';
import useUser from '../hooks/user';
import { LinearProgress, Stack } from '@mui/material';
import { withUrqlClient } from '../graphql/client';

const Home: NextPage = () => {
  const { user, status } = useUser();
  if (status == 'loading') {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  } else if (status == 'unauthenticated') {
    return (
      <Box p={2}>
        <Typography variant="body1">
          Discordでログインを押してDiscordのアカウントでログインしてください。
        </Typography>
      </Box>
    );
  } else if (status == 'authenticated' && !user?.isMember) {
    return (
      <Box p={2}>
        <Typography variant="body1">
          サークルメンバーではありません、サークル加入についてはサークルメンバーまでご連絡ください。
        </Typography>
      </Box>
    );
  }

  return (
    <Stack p={2} spacing={4}>
      メンバー向けの機能は準備中です。
    </Stack>
  );
};

export default Home;
