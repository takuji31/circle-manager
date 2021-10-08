import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions =  {}
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /**
   * The `BigInt` scalar type represents non-fractional signed whole numeric values.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt
   */
  BigInt: any;
  /** The `Byte` scalar type represents byte value as a Buffer */
  Bytes: any;
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: any;
  /** An arbitrary-precision Decimal type */
  Decimal: any;
  /** The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  Json: any;
};

export type Circle = {
  __typename?: 'Circle';
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  members: Array<Member>;
  name: Scalars['String'];
};

export enum CircleRole {
  Leader = 'Leader',
  Member = 'Member',
  SubLeader = 'SubLeader'
}

export type Member = {
  __typename?: 'Member';
  circle?: Maybe<Circle>;
  circleRole: CircleRole;
  id: Scalars['ID'];
  joinedAt: Scalars['DateTime'];
  leavedAt?: Maybe<Scalars['DateTime']>;
  monthCircle?: Maybe<MonthCircle>;
  name: Scalars['String'];
  trainerId?: Maybe<Scalars['String']>;
  trainerName?: Maybe<Scalars['String']>;
};


export type MemberMonthCircleArgs = {
  month: Scalars['String'];
  year: Scalars['String'];
};

export type MonthCircle = {
  __typename?: 'MonthCircle';
  circle?: Maybe<Circle>;
  id: Scalars['ID'];
  month: Scalars['String'];
  state: MonthCircleAnswerState;
  year: Scalars['String'];
};

export enum MonthCircleAnswerState {
  Answered = 'Answered',
  NoAnswer = 'NoAnswer',
  Retired = 'Retired'
}

export type Query = {
  __typename?: 'Query';
  member?: Maybe<Member>;
  members?: Maybe<Array<Maybe<Member>>>;
};


export type QueryMemberArgs = {
  id: Scalars['String'];
};

export type MemberMonthCircleFragment = { __typename?: 'MonthCircle', id: string, state: MonthCircleAnswerState, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined };

export type AdminMembersQueryVariables = Exact<{
  thisYear: Scalars['String'];
  thisMonth: Scalars['String'];
  nextYear: Scalars['String'];
  nextMonth: Scalars['String'];
}>;


export type AdminMembersQuery = { __typename?: 'Query', members?: Array<{ __typename?: 'Member', id: string, name: string, circleRole: CircleRole, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined, thisMonthCircle?: { __typename?: 'MonthCircle', id: string, state: MonthCircleAnswerState, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined } | null | undefined, nextMonthCircle?: { __typename?: 'MonthCircle', id: string, state: MonthCircleAnswerState, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined } | null | undefined } | null | undefined> | null | undefined };

export type TopQueryVariables = Exact<{
  memberId: Scalars['String'];
  thisYear: Scalars['String'];
  thisMonth: Scalars['String'];
  nextYear: Scalars['String'];
  nextMonth: Scalars['String'];
}>;


export type TopQuery = { __typename?: 'Query', member?: { __typename?: 'Member', id: string, name: string, trainerId?: string | null | undefined, trainerName?: string | null | undefined, circleRole: CircleRole, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined, thisMonthCircle?: { __typename?: 'MonthCircle', id: string, state: MonthCircleAnswerState, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined } | null | undefined, nextMonthCircle?: { __typename?: 'MonthCircle', id: string, state: MonthCircleAnswerState, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined } | null | undefined } | null | undefined };

export const MemberMonthCircleFragmentDoc = gql`
    fragment MemberMonthCircle on MonthCircle {
  id
  circle {
    id
    name
  }
  state
}
    `;
export const AdminMembersDocument = gql`
    query AdminMembers($thisYear: String!, $thisMonth: String!, $nextYear: String!, $nextMonth: String!) {
  members {
    id
    name
    circle {
      id
      name
    }
    circleRole
    thisMonthCircle: monthCircle(year: $thisYear, month: $thisMonth) {
      ...MemberMonthCircle
    }
    nextMonthCircle: monthCircle(year: $nextYear, month: $nextMonth) {
      ...MemberMonthCircle
    }
  }
}
    ${MemberMonthCircleFragmentDoc}`;

/**
 * __useAdminMembersQuery__
 *
 * To run a query within a React component, call `useAdminMembersQuery` and pass it any options that fit your needs.
 * When your component renders, `useAdminMembersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAdminMembersQuery({
 *   variables: {
 *      thisYear: // value for 'thisYear'
 *      thisMonth: // value for 'thisMonth'
 *      nextYear: // value for 'nextYear'
 *      nextMonth: // value for 'nextMonth'
 *   },
 * });
 */
export function useAdminMembersQuery(baseOptions: Apollo.QueryHookOptions<AdminMembersQuery, AdminMembersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AdminMembersQuery, AdminMembersQueryVariables>(AdminMembersDocument, options);
      }
export function useAdminMembersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AdminMembersQuery, AdminMembersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AdminMembersQuery, AdminMembersQueryVariables>(AdminMembersDocument, options);
        }
export type AdminMembersQueryHookResult = ReturnType<typeof useAdminMembersQuery>;
export type AdminMembersLazyQueryHookResult = ReturnType<typeof useAdminMembersLazyQuery>;
export type AdminMembersQueryResult = Apollo.QueryResult<AdminMembersQuery, AdminMembersQueryVariables>;
export const TopDocument = gql`
    query Top($memberId: String!, $thisYear: String!, $thisMonth: String!, $nextYear: String!, $nextMonth: String!) {
  member(id: $memberId) {
    id
    name
    trainerId
    trainerName
    circleRole
    circle {
      id
      name
    }
    thisMonthCircle: monthCircle(year: $thisYear, month: $thisMonth) {
      ...MemberMonthCircle
    }
    nextMonthCircle: monthCircle(year: $nextYear, month: $nextMonth) {
      ...MemberMonthCircle
    }
  }
}
    ${MemberMonthCircleFragmentDoc}`;

/**
 * __useTopQuery__
 *
 * To run a query within a React component, call `useTopQuery` and pass it any options that fit your needs.
 * When your component renders, `useTopQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTopQuery({
 *   variables: {
 *      memberId: // value for 'memberId'
 *      thisYear: // value for 'thisYear'
 *      thisMonth: // value for 'thisMonth'
 *      nextYear: // value for 'nextYear'
 *      nextMonth: // value for 'nextMonth'
 *   },
 * });
 */
export function useTopQuery(baseOptions: Apollo.QueryHookOptions<TopQuery, TopQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TopQuery, TopQueryVariables>(TopDocument, options);
      }
export function useTopLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TopQuery, TopQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TopQuery, TopQueryVariables>(TopDocument, options);
        }
export type TopQueryHookResult = ReturnType<typeof useTopQuery>;
export type TopLazyQueryHookResult = ReturnType<typeof useTopLazyQuery>;
export type TopQueryResult = Apollo.QueryResult<TopQuery, TopQueryVariables>;