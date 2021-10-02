import type { NextPage } from "next";
import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Layout from "../components/layout";

const Home: NextPage = (props) => {
  return (
    <Layout>
      <Box p={2}>
        <Typography variant="body1">
          Discordでログインを押してDiscordのアカウントでログインしてください。
        </Typography>
      </Box>
    </Layout>
  );
};

export default Home;
