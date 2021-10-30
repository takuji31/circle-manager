import { Context as GraphQLContext } from '../graphql/context';
import { useMemo } from 'react';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { NormalizedCacheObject } from '@apollo/client/cache/inmemory/types';
import { SchemaLink } from '@apollo/client/link/schema';

interface PageProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props?: Record<string, any>;
}

let apolloClient: ApolloClient<NormalizedCacheObject> | null = null;

function createIsomorphLink() {
  if (typeof window === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { schema } = require('../graphql');
    const { createContext } = require('../graphql/context');
    return new SchemaLink({ schema, context: createContext });
  } else {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { HttpLink } = require('@apollo/client/link/http');
    return new HttpLink({
      uri: '/api/graphql',
      credentials: 'same-origin',
    });
  }
}

function createApolloClient() {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: createIsomorphLink(),
    cache: new InMemoryCache({
      typePolicies: {
        Month: {
          keyFields: ['year', 'month'],
        },
        MonthSurvey: {
          keyFields: ['year', 'month'],
        },
      },
    }),
  });
}

export function getApolloClient(
  _ctx: Context | null | undefined,
  initialState: PageProps | null | undefined = null
) {
  const _apolloClient = apolloClient ?? createApolloClient();

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // gets hydrated here
  if (initialState) {
    _apolloClient.cache.restore(initialState as NormalizedCacheObject);
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return _apolloClient;
  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
}

export type Context = GraphQLContext;

export function useApollo(initialState: PageProps) {
  const store = useMemo(
    () => getApolloClient(null, initialState),
    [initialState]
  );
  return store;
}
