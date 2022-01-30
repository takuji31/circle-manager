import { createClient, defaultExchanges } from '@urql/core';
import fetch from 'node-fetch';
import { devtoolsExchange } from '@urql/devtools';

export const createUrqlClient = () =>
  createClient({
    url: process.env.BASE_URL + '/api/graphql',
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
