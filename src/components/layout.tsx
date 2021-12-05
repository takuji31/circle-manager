import React from 'react';
import Box from '@mui/material/Box';
import { AppBar, IconButton, Toolbar, Typography } from '@mui/material';
import LoginButton from './login_button';
import Head from 'next/head';
import { AdminMenu } from './admin_menu';
import * as Icons from '@mui/icons-material';
import { NextLinkComposed } from './link';
import { useRouter } from 'next/router';

type LayoutProps = {
  children: React.ReactNode;
  title?: string;
};

const Layout = ({ children, title = 'ウマ娘愛好会' }: LayoutProps) => {
  const router = useRouter();
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Head>
        <title>
          {title == 'ウマ娘愛好会' ? title : title + ' - ウマ娘愛好会'}
        </title>
      </Head>
      <AppBar position="static">
        <Toolbar>
          {router.asPath != '/' && (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              component={NextLinkComposed}
              to={`/`}
              sx={{ mr: 2 }}
            >
              <Icons.ArrowBack />
            </IconButton>
          )}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          <AdminMenu />
          {/* <CircleListButton /> */}
          <LoginButton />
        </Toolbar>
      </AppBar>
      {children}
    </Box>
  );
};

export default Layout;
