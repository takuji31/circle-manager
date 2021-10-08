import type { NextPage } from "next";
import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Layout from "../components/layout";
import useUser from "../hooks/user";
import { LinearProgress } from "@mui/material";
import Link from "../components/link2";
import { useTopQuery } from "../generated/graphql";
import { UserWithSession } from "../model/user";
import { thisAndNextMonth } from "../date/year_month";

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
  console.log(user);
  const { data, loading, error } = useTopQuery({
    variables: {
      memberId: user.id,
      ...thisAndNextMonth(),
    },
  });
  const member = data?.member;

  if (loading) {
    return (
      <Box sx={{ width: "100%" }}>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    <Box p={2}>
      <Typography variant="body1">
        エラーが発生しました {error.message}
      </Typography>
    </Box>;
  }

  if (!member) {
    return <Box />;
  }

  const name = member.trainerName ?? member.name;
  return (
    <Box p={2}>
      <Typography variant="body1">{name}さん</Typography>
    </Box>
  );
};

export default Home;
