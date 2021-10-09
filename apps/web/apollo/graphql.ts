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
  name: Scalars['String'];
  nextMonthCircle?: Maybe<MonthCircle>;
  thisMonthCircle?: Maybe<MonthCircle>;
  trainerId?: Maybe<Scalars['String']>;
  trainerName?: Maybe<Scalars['String']>;
};

export type MonthCircle = {
  __typename?: 'MonthCircle';
  circle?: Maybe<Circle>;
  id: Scalars['ID'];
  member: Member;
  month: Scalars['String'];
  state: MonthCircleAnswerState;
  year: Scalars['String'];
};

export enum MonthCircleAnswerState {
  Answered = 'Answered',
  NoAnswer = 'NoAnswer',
  Retired = 'Retired'
}

export type Mutation = {
  __typename?: 'Mutation';
  updateMemberMonthCircle?: Maybe<UpdateMemberMonthCirclePayload>;
  updateMembers: Array<Member>;
};


export type MutationUpdateMemberMonthCircleArgs = {
  circleId: Scalars['String'];
  memberId: Scalars['String'];
  month: Scalars['String'];
  year: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  circles: Array<Circle>;
  member?: Maybe<Member>;
  members: Array<Member>;
  monthCircle?: Maybe<MonthCircle>;
};


export type QueryMemberArgs = {
  id: Scalars['String'];
};


export type QueryMonthCircleArgs = {
  monthCircleId: Scalars['String'];
};

export type UpdateMemberMonthCirclePayload = {
  __typename?: 'UpdateMemberMonthCirclePayload';
  monthCircle: MonthCircle;
};

export type ListedCircleFragment = { __typename?: 'Circle', id: string, name: string };

export type MemberMonthCircleFragment = { __typename?: 'MonthCircle', id: string, year: string, month: string, state: MonthCircleAnswerState, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined };

export type UpdateMemberMonthCircleMutationVariables = Exact<{
  memberId: Scalars['String'];
  year: Scalars['String'];
  month: Scalars['String'];
  circleId: Scalars['String'];
}>;


export type UpdateMemberMonthCircleMutation = { __typename?: 'Mutation', updateMemberMonthCircle?: { __typename?: 'UpdateMemberMonthCirclePayload', monthCircle: { __typename?: 'MonthCircle', id: string, year: string, month: string, state: MonthCircleAnswerState, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined } } | null | undefined };

export type UpdateMembersMutationVariables = Exact<{ [key: string]: never; }>;


export type UpdateMembersMutation = { __typename?: 'Mutation', updateMembers: Array<{ __typename?: 'Member', id: string, name: string, trainerId?: string | null | undefined, trainerName?: string | null | undefined, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined, thisMonthCircle?: { __typename?: 'MonthCircle', id: string, year: string, month: string, state: MonthCircleAnswerState, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined } | null | undefined, nextMonthCircle?: { __typename?: 'MonthCircle', id: string, year: string, month: string, state: MonthCircleAnswerState, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined } | null | undefined }> };

export type AdminMembersQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminMembersQuery = { __typename?: 'Query', members: Array<{ __typename?: 'Member', id: string, name: string, circleRole: CircleRole, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined, thisMonthCircle?: { __typename?: 'MonthCircle', id: string, year: string, month: string, state: MonthCircleAnswerState, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined } | null | undefined, nextMonthCircle?: { __typename?: 'MonthCircle', id: string, year: string, month: string, state: MonthCircleAnswerState, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined } | null | undefined }> };

export type MemberMonthCirclesQueryVariables = Exact<{
  memberId: Scalars['String'];
}>;


export type MemberMonthCirclesQuery = { __typename?: 'Query', member?: { __typename?: 'Member', thisMonthCircle?: { __typename?: 'MonthCircle', id: string, year: string, month: string, state: MonthCircleAnswerState, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined } | null | undefined, nextMonthCircle?: { __typename?: 'MonthCircle', id: string, year: string, month: string, state: MonthCircleAnswerState, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined } | null | undefined } | null | undefined, circles: Array<{ __typename?: 'Circle', id: string, name: string }> };

export type MonthCircleQueryVariables = Exact<{
  monthCircleId: Scalars['String'];
}>;


export type MonthCircleQuery = { __typename?: 'Query', monthCircle?: { __typename?: 'MonthCircle', id: string, year: string, month: string, state: MonthCircleAnswerState, member: { __typename?: 'Member', id: string, name: string }, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined } | null | undefined, circles: Array<{ __typename?: 'Circle', id: string, name: string }> };

export const ListedCircleFragmentDoc = gql`
    fragment ListedCircle on Circle {
  id
  name
}
    `;
export const MemberMonthCircleFragmentDoc = gql`
    fragment MemberMonthCircle on MonthCircle {
  id
  year
  month
  circle {
    id
    name
  }
  state
}
    `;
export const UpdateMemberMonthCircleDocument = gql`
    mutation UpdateMemberMonthCircle($memberId: String!, $year: String!, $month: String!, $circleId: String!) {
  updateMemberMonthCircle(
    memberId: $memberId
    year: $year
    month: $month
    circleId: $circleId
  ) {
    monthCircle {
      ...MemberMonthCircle
    }
  }
}
    ${MemberMonthCircleFragmentDoc}`;
export type UpdateMemberMonthCircleMutationFn = Apollo.MutationFunction<UpdateMemberMonthCircleMutation, UpdateMemberMonthCircleMutationVariables>;

/**
 * __useUpdateMemberMonthCircleMutation__
 *
 * To run a mutation, you first call `useUpdateMemberMonthCircleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateMemberMonthCircleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateMemberMonthCircleMutation, { data, loading, error }] = useUpdateMemberMonthCircleMutation({
 *   variables: {
 *      memberId: // value for 'memberId'
 *      year: // value for 'year'
 *      month: // value for 'month'
 *      circleId: // value for 'circleId'
 *   },
 * });
 */
export function useUpdateMemberMonthCircleMutation(baseOptions?: Apollo.MutationHookOptions<UpdateMemberMonthCircleMutation, UpdateMemberMonthCircleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateMemberMonthCircleMutation, UpdateMemberMonthCircleMutationVariables>(UpdateMemberMonthCircleDocument, options);
      }
export type UpdateMemberMonthCircleMutationHookResult = ReturnType<typeof useUpdateMemberMonthCircleMutation>;
export type UpdateMemberMonthCircleMutationResult = Apollo.MutationResult<UpdateMemberMonthCircleMutation>;
export type UpdateMemberMonthCircleMutationOptions = Apollo.BaseMutationOptions<UpdateMemberMonthCircleMutation, UpdateMemberMonthCircleMutationVariables>;
export const UpdateMembersDocument = gql`
    mutation UpdateMembers {
  updateMembers {
    id
    name
    trainerId
    trainerName
    circle {
      ...ListedCircle
    }
    thisMonthCircle {
      ...MemberMonthCircle
    }
    nextMonthCircle {
      ...MemberMonthCircle
    }
  }
}
    ${ListedCircleFragmentDoc}
${MemberMonthCircleFragmentDoc}`;
export type UpdateMembersMutationFn = Apollo.MutationFunction<UpdateMembersMutation, UpdateMembersMutationVariables>;

/**
 * __useUpdateMembersMutation__
 *
 * To run a mutation, you first call `useUpdateMembersMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateMembersMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateMembersMutation, { data, loading, error }] = useUpdateMembersMutation({
 *   variables: {
 *   },
 * });
 */
export function useUpdateMembersMutation(baseOptions?: Apollo.MutationHookOptions<UpdateMembersMutation, UpdateMembersMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateMembersMutation, UpdateMembersMutationVariables>(UpdateMembersDocument, options);
      }
export type UpdateMembersMutationHookResult = ReturnType<typeof useUpdateMembersMutation>;
export type UpdateMembersMutationResult = Apollo.MutationResult<UpdateMembersMutation>;
export type UpdateMembersMutationOptions = Apollo.BaseMutationOptions<UpdateMembersMutation, UpdateMembersMutationVariables>;
export const AdminMembersDocument = gql`
    query AdminMembers {
  members {
    id
    name
    circle {
      id
      name
    }
    circleRole
    thisMonthCircle {
      ...MemberMonthCircle
    }
    nextMonthCircle {
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
 *   },
 * });
 */
export function useAdminMembersQuery(baseOptions?: Apollo.QueryHookOptions<AdminMembersQuery, AdminMembersQueryVariables>) {
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
export const MemberMonthCirclesDocument = gql`
    query MemberMonthCircles($memberId: String!) {
  member(id: $memberId) {
    thisMonthCircle {
      ...MemberMonthCircle
    }
    nextMonthCircle {
      ...MemberMonthCircle
    }
  }
  circles {
    ...ListedCircle
  }
}
    ${MemberMonthCircleFragmentDoc}
${ListedCircleFragmentDoc}`;

/**
 * __useMemberMonthCirclesQuery__
 *
 * To run a query within a React component, call `useMemberMonthCirclesQuery` and pass it any options that fit your needs.
 * When your component renders, `useMemberMonthCirclesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMemberMonthCirclesQuery({
 *   variables: {
 *      memberId: // value for 'memberId'
 *   },
 * });
 */
export function useMemberMonthCirclesQuery(baseOptions: Apollo.QueryHookOptions<MemberMonthCirclesQuery, MemberMonthCirclesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MemberMonthCirclesQuery, MemberMonthCirclesQueryVariables>(MemberMonthCirclesDocument, options);
      }
export function useMemberMonthCirclesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MemberMonthCirclesQuery, MemberMonthCirclesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MemberMonthCirclesQuery, MemberMonthCirclesQueryVariables>(MemberMonthCirclesDocument, options);
        }
export type MemberMonthCirclesQueryHookResult = ReturnType<typeof useMemberMonthCirclesQuery>;
export type MemberMonthCirclesLazyQueryHookResult = ReturnType<typeof useMemberMonthCirclesLazyQuery>;
export type MemberMonthCirclesQueryResult = Apollo.QueryResult<MemberMonthCirclesQuery, MemberMonthCirclesQueryVariables>;
export const MonthCircleDocument = gql`
    query MonthCircle($monthCircleId: String!) {
  monthCircle(monthCircleId: $monthCircleId) {
    ...MemberMonthCircle
    member {
      id
      name
    }
  }
  circles {
    ...ListedCircle
  }
}
    ${MemberMonthCircleFragmentDoc}
${ListedCircleFragmentDoc}`;

/**
 * __useMonthCircleQuery__
 *
 * To run a query within a React component, call `useMonthCircleQuery` and pass it any options that fit your needs.
 * When your component renders, `useMonthCircleQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMonthCircleQuery({
 *   variables: {
 *      monthCircleId: // value for 'monthCircleId'
 *   },
 * });
 */
export function useMonthCircleQuery(baseOptions: Apollo.QueryHookOptions<MonthCircleQuery, MonthCircleQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MonthCircleQuery, MonthCircleQueryVariables>(MonthCircleDocument, options);
      }
export function useMonthCircleLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MonthCircleQuery, MonthCircleQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MonthCircleQuery, MonthCircleQueryVariables>(MonthCircleDocument, options);
        }
export type MonthCircleQueryHookResult = ReturnType<typeof useMonthCircleQuery>;
export type MonthCircleLazyQueryHookResult = ReturnType<typeof useMonthCircleLazyQuery>;
export type MonthCircleQueryResult = Apollo.QueryResult<MonthCircleQuery, MonthCircleQueryVariables>;