import { MonthCircle } from "./generated/graphql";
import { useMemo } from "react";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { NormalizedCacheObject } from "@apollo/client/cache/inmemory/types";

interface PageProps {
  props?: Record<string, any>;
}

let apolloClient: ApolloClient<NormalizedCacheObject> | null = null;

function createIsomorphLink() {
  if (typeof window === "undefined") {
    const { SchemaLink } = require("@apollo/client/link/schema");
    const { schema } = require("./graphql");
    return new SchemaLink({ schema });
  } else {
    const { HttpLink } = require("@apollo/client/link/http");
    return new HttpLink({
      uri: "/api/graphql",
      credentials: "same-origin",
    });
  }
}

function createApolloClient() {
  return new ApolloClient({
    ssrMode: typeof window === "undefined",
    link: createIsomorphLink(),
    cache: new InMemoryCache({
      typePolicies: {
        Member: {
          fields: {
            monthCircle: {
              merge: false,
            },
          },
        },
      },
    }),
  });
}

export function initializeApollo(initialState: PageProps | null = null) {
  const _apolloClient = apolloClient ?? createApolloClient();

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // gets hydrated here
  if (initialState) {
    _apolloClient.cache.restore(initialState as NormalizedCacheObject);
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === "undefined") return _apolloClient;
  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
}

export function useApollo(initialState: PageProps) {
  const store = useMemo(() => initializeApollo(initialState), [initialState]);
  return store;
}
