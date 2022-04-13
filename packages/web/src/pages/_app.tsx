import * as React from 'react';
import Head from 'next/head';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider, EmotionCache } from '@emotion/react';
import createEmotionCache from '../libs/createEmotionCache';
import type { AppProps } from 'next/app';
import { getSession, SessionProvider } from 'next-auth/react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { NextPageWithLayout } from '../libs/page_with_layout';
import Layout from '../components/layout';
import { RecoilRoot } from 'recoil';

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
  Component: NextPageWithLayout;
}

export default function MyApp({
  Component,
  emotionCache = clientSideEmotionCache,
  pageProps,
}: MyAppProps) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode]
  );
  const getLayout = Component.getLayout ?? ((page) => <Layout>{page}</Layout>);

  return (
    <SessionProvider session={pageProps.session}>
      <CacheProvider value={emotionCache}>
        <RecoilRoot>
          <Head>
            <title>ウマ娘愛好会グループ</title>
            <meta
              name="viewport"
              content="initial-scale=1, width=device-width"
            />
          </Head>
          <ThemeProvider theme={theme}>
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline />
            {getLayout(<Component {...pageProps} />)}
          </ThemeProvider>
        </RecoilRoot>
      </CacheProvider>
    </SessionProvider>
  );
}

export const getInitialProps = async () => {
  return {
    props: {
      session: await getSession(),
    },
  };
};
