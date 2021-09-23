import type { GetServerSideProps, NextPage } from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Layout from "../components/Layout";

const Home: NextPage = () => {
  return (
    <Layout>
      <Box p={2}>
        <Typography variant="h5">
          circle-manager サークル管理システム
        </Typography>
        <Typography variant="body1">
          Discordでログインを押してDiscordのアカウントでログインしてください。
        </Typography>
      </Box>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const data = await getSession(context);
  if (data?.user != null) {
    return {
      redirect: {
        destination: "/guilds",
        permanent: false,
      },
    };
  }
  return { props: {} };
};

export default Home;
