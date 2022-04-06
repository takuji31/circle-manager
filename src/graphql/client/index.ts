import { devtoolsExchange } from '@urql/devtools';
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  GetStaticProps,
  GetStaticPropsContext,
  GetStaticPropsResult,
  NextPageContext,
  PreviewData,
} from 'next';
import {
  withUrqlClient as _withUrqlClient,
  initUrqlClient as _initUrqlClient,
  SSRExchange,
  SSRData,
  WithUrqlClientOptions,
} from 'next-urql';
import { ParsedUrlQuery } from 'querystring';
import {
  cacheExchange,
  Client,
  createClient,
  dedupExchange,
  defaultExchanges,
  fetchExchange,
  ssrExchange,
} from 'urql';

const isSSR = typeof window == 'undefined';

export const withUrqlClient = (options: WithUrqlClientOptions = {}) => {
  return _withUrqlClient((ssr, ctx) => {
    return {
      url: (isSSR ? process.env.BASE_URL : '') + '/api/graphql',
      exchanges: [dedupExchange, cacheExchange, ssr, fetchExchange],
    };
  }, options);
};

export function getServerSidePropsWithUrql<
  P extends { [key: string]: any } = { [key: string]: any },
  Q extends ParsedUrlQuery = ParsedUrlQuery,
  D extends PreviewData = PreviewData
>(
  block: (
    context: GetServerSidePropsContext<Q, D>,
    urql: Client,
    ssrExchange: SSRExchange
  ) =>
    | Promise<GetServerSidePropsResult<P & { urqlState: SSRData }>>
    | GetServerSidePropsResult<P & { urqlState: SSRData }>
): GetServerSideProps<P & { urqlState: SSRData }, Q, D> {
  return async (ctx) => {
    const [ssr, client] = initUrqlClientAndSSRCache();
    return block(ctx, client, ssr);
  };
}

export function getStaticPropsWithUrql<
  P extends { [key: string]: any } = { [key: string]: any },
  Q extends ParsedUrlQuery = ParsedUrlQuery,
  D extends PreviewData = PreviewData
>(
  block: (
    context: GetStaticPropsContext<Q, D>,
    urql: Client,
    ssrExchange: SSRExchange
  ) =>
    | Promise<GetStaticPropsResult<P & { urqlState: SSRData }>>
    | GetStaticPropsResult<P & { urqlState: SSRData }>
): GetStaticProps<P & { urqlState: SSRData }, Q, D> {
  return async (ctx) => {
    const [ssr, client] = initUrqlClientAndSSRCache();
    return block(ctx, client, ssr);
  };
}

export const initUrqlClientAndSSRCache: () => [SSRExchange, Client] = () => {
  const ssr = ssrExchange({ isClient: false });
  const client = _initUrqlClient(
    {
      url: process.env.BASE_URL + '/api/graphql',
      exchanges: [dedupExchange, cacheExchange, ssr, fetchExchange],
    },
    false
  )!!;
  return [ssr, client];
};

export const createUrqlClient = () =>
  createClient({
    url: (isSSR ? process.env.BASE_URL : '') + '/api/graphql',
    fetch: fetch as any,
    exchanges: [devtoolsExchange, ...defaultExchanges],
    // exchanges: [
    //   dedupExchange,
    //   cacheExchange,
    //   executeExchange({
    //     schema,
    //     context: createContext,
    //   }),
    // ],
  });
