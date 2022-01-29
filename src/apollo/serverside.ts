import { InMemoryCache } from '@apollo/client';
import { ApolloClient } from '@apollo/client/core/ApolloClient';
import { SchemaLink } from '@apollo/client/link/schema';
import { schema } from '../graphql';
import { createContext } from '../graphql/context';

/**
 * サーバー側で使うためのApollo Client
 * SSRでもSchemaLinkを使いたいが、Discord.jsをインポートするとMutationのimport解決が遅延されてしまって使えないので
 * サーバーサイド用として別途用意した。
 * @returns ApolloClientのインスタンス
 */
export function createServerSideApolloClient() {
  return new ApolloClient({
    link: new SchemaLink({
      schema: schema,
      context: createContext,
    }),
    cache: new InMemoryCache({
      //TODO: クライアントサイドとのキャシュポリシー統一
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
