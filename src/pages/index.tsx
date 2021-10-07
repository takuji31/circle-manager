import type { NextPage } from "next";
import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Layout from "../components/layout";
import useUser from "../hooks/user";
import { LinearProgress } from "@mui/material";
import Link from "../components/link2";

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
      {status == "authenticated" && user?.isMember && (
        <Box p={2}>
          <Typography variant="body1"></Typography>
        </Box>
      )}
    </Layout>
  );
};

export default Home;
