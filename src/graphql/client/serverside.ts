import { createClient, dedupExchange, cacheExchange } from 'urql';

export const createUrqlClient = () =>
  createClient({
    url: process.env.BASE_URL + '/api/graphql',
    // exchanges: [
    //   dedupExchange,
    //   cacheExchange,
    //   executeExchange({
    //     schema,
    //     context: createContext,
    //   }),
    // ],
  });
