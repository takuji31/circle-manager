import type { NextPage } from "next";
import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Layout from "../components/Layout";

const Home: NextPage = () => {
  return (
    <Layout>
      <Box p={2}>
        <Typography variant="h5">シン・ウマ娘愛好会</Typography>
        <Typography variant="body1">
          Discordでログインを押してDiscordのアカウントでログインしてください。
        </Typography>
      </Box>
    </Layout>
  );
};

export default Home;
