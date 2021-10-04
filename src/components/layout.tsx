import React from "react";
import Box from "@mui/material/Box";
import { AppBar, Toolbar, Typography } from "@mui/material";
import LoginButton from "./login_button";
import Head from "next/head";
import { CircleListButton } from "./circle_list_items";
import { AdminMenu } from "./admin_menu";

type LayoutProps = {
  children: React.ReactNode;
  title?: string;
};

const Layout = ({ children, title = "シン・ウマ娘愛好会" }: LayoutProps) => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Head>
        <title>
          {title == "シン・ウマ娘愛好会"
            ? title
            : title + " - シン・ウマ娘愛好会"}
        </title>
      </Head>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          <AdminMenu />
          <CircleListButton />
          <LoginButton />
        </Toolbar>
      </AppBar>
      {children}
    </Box>
  );
};

export default Layout;
