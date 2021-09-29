import React, { useState, KeyboardEvent, MouseEvent } from "react";
import Box from "@mui/material/Box";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import * as Icons from "@mui/icons-material";
import { AppBar, IconButton, Toolbar, Typography } from "@mui/material";
import { useSession } from "next-auth/react";
import LoginButton from "./login_button";
import Head from "next/head";
import { NextLinkComposed } from "../Link";

type LayoutProps = {
  children: React.ReactNode;
  title?: string;
};

const Layout = ({ children, title = "Circle Manager" }: LayoutProps) => {
  const [isOpen, setOpen] = useState(false);
  const toggleDrawer: (
    open: boolean
  ) => (event: KeyboardEvent | MouseEvent) => void = (open) => {
    return (event) => {
      const ev = event as KeyboardEvent;
      if (
        ev &&
        ev.type === "keydown" &&
        (ev.key == "Tab" || ev.key == "Shift")
      ) {
        return;
      } else {
        setOpen(open);
      }
    };
  };
  const { data, status } = useSession();
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
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={toggleDrawer(!isOpen)}
          >
            <Icons.Menu />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          <LoginButton />
        </Toolbar>
      </AppBar>
      {children}
      <SwipeableDrawer
        open={isOpen}
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
      >
        <Box
          sx={{ width: "auto" }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <List>
            <ListItem>
              <ListItemText>サークル一覧</ListItemText>
            </ListItem>
            {status == "unauthenticated" && (
              <ListItem button>
                <ListItemIcon>
                  <Icons.Computer />
                </ListItemIcon>
                <LoginButton />
              </ListItem>
            )}
          </List>
          <Divider />
          <List></List>
        </Box>
      </SwipeableDrawer>
    </Box>
  );
};

export default Layout;
