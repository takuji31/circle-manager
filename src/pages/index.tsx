import type { NextPage } from "next";
import * as React from "react";
import { Box, Typography } from "@mui/material";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import Layout from "../components/layout";
import useUser from "../hooks/user";
import {
  CircularProgress,
  LinearProgress,
  Snackbar,
  Stack,
} from "@mui/material";
import Link from "../components/link2";
import { UserWithSession } from "../model/user";
import { nextMonth, thisAndNextMonth, thisMonth } from "../date/year_month";
import { MemberMonthCircle } from "../components/member_month_circle";
import { useMemberMonthCirclesQuery } from "../generated/graphql";

const Home: NextPage = (props) => {
  const { user, status } = useUser();
  return (
    <Layout>
      {status == "loading" && (
        <Box sx={{ width: "100%" }}>
          <LinearProgress />
        </Box>
      )}
      {status == "unauthenticated" && (
        <Box p={2}>
          <Typography variant="body1">
            Discordでログインを押してDiscordのアカウントでログインしてください。
          </Typography>
        </Box>
      )}
      {status == "authenticated" && !user?.isMember && (
        <Box p={2}>
          <Typography variant="body1">
            サークルメンバーではありません、サークル加入についてはサークルメンバーまでご連絡ください。
          </Typography>
        </Box>
      )}
      {status == "authenticated" && user && user?.isMember && (
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
          {member.thisMonthCircle && (
            <MemberMonthCircle
              memberId={user.id}
              monthCircle={member.thisMonthCircle}
              circles={circles}
            />
          )}
          {member.nextMonthCircle && (
            <MemberMonthCircle
              memberId={user.id}
              monthCircle={member.nextMonthCircle}
              circles={circles}
            />
          )}
        </Stack>
      )}
    </Box>
  );
};

export default Home;
