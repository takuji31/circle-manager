import React from 'react';
import Box from '@mui/material/Box';
import { AppBar, IconButton, Toolbar, Typography } from '@mui/material';
import LoginButton from './login_button';
import Head from 'next/head';
import { AdminMenu } from './admin_menu';
import * as Icons from '@mui/icons-material';
import { NextLinkComposed } from './link';
import { useRouter } from 'next/router';
import { useTitle } from '../recoil/title';

type LayoutProps = {
  children: React.ReactNode;
  title?: string;
};

const Layout = ({ children, title }: LayoutProps) => {
  const router = useRouter();
  const [titleFromState] = useTitle();
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Head>
        <title>
          {!title && !titleFromState
            ? 'ウマ娘愛好会'
            : (titleFromState ?? title) + ' - ウマ娘愛好会'}
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
            {titleFromState ?? title ?? 'ウマ娘愛好会'}
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
