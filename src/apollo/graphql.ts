import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
import { FieldPolicy, FieldReadFunction, TypePolicies, TypePolicy } from '@apollo/client/cache';
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
  id: Scalars['ID'];
  members: Array<Member>;
  name: Scalars['String'];
  order: Scalars['Int'];
  selectableByAdmin: Scalars['Boolean'];
  selectableByUser: Scalars['Boolean'];
  selectableInSurvey: Scalars['Boolean'];
};

export enum CircleRole {
  Leader = 'Leader',
  Member = 'Member',
  SubLeader = 'SubLeader'
}

export type CreateNextMonthSurveyPayload = {
  __typename?: 'CreateNextMonthSurveyPayload';
  nextMonth: Month;
};

export type Member = {
  __typename?: 'Member';
  circle?: Maybe<Circle>;
  circleRole: CircleRole;
  id: Scalars['ID'];
  joinedAt: Scalars['DateTime'];
  leavedAt?: Maybe<Scalars['DateTime']>;
  name: Scalars['String'];
  nextMonthCircle?: Maybe<MonthCircle>;
  pathname: Scalars['String'];
  thisMonthCircle?: Maybe<MonthCircle>;
  trainerId?: Maybe<Scalars['String']>;
};

export type Month = {
  __typename?: 'Month';
  month: Scalars['String'];
  survey?: Maybe<MonthSurvey>;
  year: Scalars['String'];
};

export type MonthCircle = {
  __typename?: 'MonthCircle';
  circle?: Maybe<Circle>;
  currentCircle: Circle;
  id: Scalars['ID'];
  invited: Scalars['Boolean'];
  joined: Scalars['Boolean'];
  kicked: Scalars['Boolean'];
  member: Member;
  month: Scalars['String'];
  year: Scalars['String'];
};

/** 在籍希望アンケート */
export type MonthSurvey = {
  __typename?: 'MonthSurvey';
  answers: Array<MonthCircle>;
  expiredAt: Scalars['DateTime'];
  /** アンケートのメッセージID */
  id: Scalars['ID'];
  month: Scalars['String'];
  noAnswerMembers: Array<Member>;
  year: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createNextMonthSurvey?: Maybe<CreateNextMonthSurveyPayload>;
  updateMemberMonthCircle?: Maybe<UpdateMemberMonthCirclePayload>;
  updateMembers: Array<Member>;
  updateMonthCircle?: Maybe<UpdateMemberMonthCirclePayload>;
  updateSignUp: SignUp;
};


export type MutationUpdateMemberMonthCircleArgs = {
  circleId: Scalars['String'];
  memberId: Scalars['String'];
  month: Scalars['String'];
  year: Scalars['String'];
};


export type MutationUpdateMonthCircleArgs = {
  data: UpdateMonthCircleMutationInput;
};


export type MutationUpdateSignUpArgs = {
  invited?: Maybe<Scalars['Boolean']>;
  joined?: Maybe<Scalars['Boolean']>;
  memberId: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  circles: Array<Circle>;
  member?: Maybe<Member>;
  members: Array<Member>;
  monthCircle?: Maybe<MonthCircle>;
  monthSurvey?: Maybe<MonthSurvey>;
  nextMonth: Month;
  signUps: Array<SignUp>;
  siteMetadata: SiteMetadata;
  thisMonth: Month;
};


export type QueryMemberArgs = {
  id: Scalars['String'];
};


export type QueryMonthCircleArgs = {
  monthCircleId: Scalars['String'];
};


export type QueryMonthSurveyArgs = {
  month: Scalars['String'];
  year: Scalars['String'];
};

/** 加入申請 */
export type SignUp = {
  __typename?: 'SignUp';
  circle: Circle;
  /** DiscordのユーザーID */
  id: Scalars['ID'];
  invited: Scalars['Boolean'];
  joined: Scalars['Boolean'];
  member: Member;
};

export type SiteMetadata = {
  __typename?: 'SiteMetadata';
  activeMembers: Scalars['Int'];
  maxMembers: Scalars['Int'];
  totalMembers: Scalars['Int'];
};

export type UpdateMemberMonthCirclePayload = {
  __typename?: 'UpdateMemberMonthCirclePayload';
  monthCircle: MonthCircle;
};

export type UpdateMonthCircleMutationInput = {
  id: Scalars['String'];
  invited?: Maybe<Scalars['Boolean']>;
  joined?: Maybe<Scalars['Boolean']>;
  kicked?: Maybe<Scalars['Boolean']>;
};

export type ListedCircleFragment = { __typename?: 'Circle', id: string, name: string };

export type MemberMonthCircleFragment = { __typename?: 'MonthCircle', id: string, year: string, month: string, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined };

export type ListedMemberFragment = { __typename?: 'Member', id: string, name: string, trainerId?: string | null | undefined };

export type MonthAndSurveyFragment = { __typename?: 'Month', year: string, month: string, survey?: { __typename?: 'MonthSurvey', id: string, year: string, month: string, expiredAt: any } | null | undefined };

export type MonthAndSurveyWithMembersFragment = { __typename?: 'Month', year: string, month: string, survey?: { __typename?: 'MonthSurvey', id: string, year: string, month: string, expiredAt: any, answers: Array<{ __typename?: 'MonthCircle', id: string, year: string, month: string, member: { __typename?: 'Member', id: string, name: string, trainerId?: string | null | undefined }, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined }>, noAnswerMembers: Array<{ __typename?: 'Member', id: string, name: string }> } | null | undefined };

export type ListedSignUpFragment = { __typename?: 'SignUp', id: string, invited: boolean, joined: boolean, member: { __typename?: 'Member', id: string, name: string, trainerId?: string | null | undefined }, circle: { __typename?: 'Circle', id: string, name: string } };

export type CreateNextMonthSurveyMutationVariables = Exact<{ [key: string]: never; }>;


export type CreateNextMonthSurveyMutation = { __typename?: 'Mutation', createNextMonthSurvey?: { __typename?: 'CreateNextMonthSurveyPayload', nextMonth: { __typename?: 'Month', year: string, month: string, survey?: { __typename?: 'MonthSurvey', id: string, year: string, month: string, expiredAt: any } | null | undefined } } | null | undefined };

export type UpdateMemberMonthCircleMutationVariables = Exact<{
  memberId: Scalars['String'];
  year: Scalars['String'];
  month: Scalars['String'];
  circleId: Scalars['String'];
}>;


export type UpdateMemberMonthCircleMutation = { __typename?: 'Mutation', updateMemberMonthCircle?: { __typename?: 'UpdateMemberMonthCirclePayload', monthCircle: { __typename?: 'MonthCircle', id: string, year: string, month: string, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined } } | null | undefined };

export type UpdateMembersMutationVariables = Exact<{ [key: string]: never; }>;


export type UpdateMembersMutation = { __typename?: 'Mutation', updateMembers: Array<{ __typename?: 'Member', id: string, name: string, trainerId?: string | null | undefined, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined, thisMonthCircle?: { __typename?: 'MonthCircle', id: string, year: string, month: string, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined } | null | undefined, nextMonthCircle?: { __typename?: 'MonthCircle', id: string, year: string, month: string, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined } | null | undefined }> };

export type UpdateMonthCircleMutationVariables = Exact<{
  data: UpdateMonthCircleMutationInput;
}>;


export type UpdateMonthCircleMutation = { __typename?: 'Mutation', updateMonthCircle?: { __typename?: 'UpdateMemberMonthCirclePayload', monthCircle: { __typename?: 'MonthCircle', kicked: boolean, invited: boolean, joined: boolean, id: string, year: string, month: string, currentCircle: { __typename?: 'Circle', id: string, name: string }, member: { __typename?: 'Member', id: string, name: string, trainerId?: string | null | undefined, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined }, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined } } | null | undefined };

export type UpdateSignUpMutationVariables = Exact<{
  memberId: Scalars['String'];
  invited?: Maybe<Scalars['Boolean']>;
  joined?: Maybe<Scalars['Boolean']>;
}>;


export type UpdateSignUpMutation = { __typename?: 'Mutation', updateSignUp: { __typename?: 'SignUp', id: string, invited: boolean, joined: boolean, member: { __typename?: 'Member', id: string, name: string, trainerId?: string | null | undefined }, circle: { __typename?: 'Circle', id: string, name: string } } };

export type AdminMembersQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminMembersQuery = { __typename?: 'Query', members: Array<{ __typename?: 'Member', id: string, pathname: string, name: string, trainerId?: string | null | undefined, circleRole: CircleRole, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined, thisMonthCircle?: { __typename?: 'MonthCircle', id: string, year: string, month: string, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined } | null | undefined, nextMonthCircle?: { __typename?: 'MonthCircle', id: string, year: string, month: string, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined } | null | undefined }> };

export type MonthSurveyQueryVariables = Exact<{
  year: Scalars['String'];
  month: Scalars['String'];
}>;


export type MonthSurveyQuery = { __typename?: 'Query', monthSurvey?: { __typename?: 'MonthSurvey', id: string, year: string, month: string, expiredAt: any, answers: Array<{ __typename?: 'MonthCircle', kicked: boolean, invited: boolean, joined: boolean, id: string, year: string, month: string, currentCircle: { __typename?: 'Circle', id: string, name: string }, member: { __typename?: 'Member', id: string, name: string, trainerId?: string | null | undefined, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined }, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined }>, noAnswerMembers: Array<{ __typename?: 'Member', id: string, name: string, trainerId?: string | null | undefined, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined }> } | null | undefined };

export type AdminTopQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminTopQuery = { __typename?: 'Query', thisMonth: { __typename?: 'Month', year: string, month: string, survey?: { __typename?: 'MonthSurvey', id: string, year: string, month: string, expiredAt: any } | null | undefined }, nextMonth: { __typename?: 'Month', year: string, month: string, survey?: { __typename?: 'MonthSurvey', id: string, year: string, month: string, expiredAt: any, answers: Array<{ __typename?: 'MonthCircle', id: string, year: string, month: string, member: { __typename?: 'Member', id: string, name: string, trainerId?: string | null | undefined }, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined }>, noAnswerMembers: Array<{ __typename?: 'Member', id: string, name: string }> } | null | undefined }, siteMetadata: { __typename?: 'SiteMetadata', activeMembers: number }, signUps: Array<{ __typename?: 'SignUp', id: string, invited: boolean, joined: boolean, member: { __typename?: 'Member', id: string, name: string, trainerId?: string | null | undefined }, circle: { __typename?: 'Circle', id: string, name: string } }>, circles: Array<{ __typename?: 'Circle', id: string, name: string }> };

export type MemberMonthCirclesQueryVariables = Exact<{
  memberId: Scalars['String'];
}>;


export type MemberMonthCirclesQuery = { __typename?: 'Query', member?: { __typename?: 'Member', thisMonthCircle?: { __typename?: 'MonthCircle', id: string, year: string, month: string, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined } | null | undefined, nextMonthCircle?: { __typename?: 'MonthCircle', id: string, year: string, month: string, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined } | null | undefined } | null | undefined, circles: Array<{ __typename?: 'Circle', id: string, name: string }> };

export type MonthCircleQueryVariables = Exact<{
  monthCircleId: Scalars['String'];
}>;


export type MonthCircleQuery = { __typename?: 'Query', monthCircle?: { __typename?: 'MonthCircle', id: string, year: string, month: string, member: { __typename?: 'Member', id: string, name: string }, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined } | null | undefined, circles: Array<{ __typename?: 'Circle', id: string, name: string }> };

export const MonthAndSurveyFragmentDoc = gql`
    fragment MonthAndSurvey on Month {
  year
  month
  survey {
    id
    year
    month
    expiredAt
  }
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
}
    `;
export const ListedMemberFragmentDoc = gql`
    fragment ListedMember on Member {
  id
  name
  trainerId
}
    `;
export const MonthAndSurveyWithMembersFragmentDoc = gql`
    fragment MonthAndSurveyWithMembers on Month {
  year
  month
  survey {
    id
    year
    month
    expiredAt
    answers {
      ...MemberMonthCircle
      member {
        ...ListedMember
      }
    }
    noAnswerMembers {
      id
      name
    }
  }
}
    ${MemberMonthCircleFragmentDoc}
${ListedMemberFragmentDoc}`;
export const ListedCircleFragmentDoc = gql`
    fragment ListedCircle on Circle {
  id
  name
}
    `;
export const ListedSignUpFragmentDoc = gql`
    fragment ListedSignUp on SignUp {
  id
  member {
    ...ListedMember
  }
  circle {
    ...ListedCircle
  }
  invited
  joined
}
    ${ListedMemberFragmentDoc}
${ListedCircleFragmentDoc}`;
export const CreateNextMonthSurveyDocument = gql`
    mutation CreateNextMonthSurvey {
  createNextMonthSurvey {
    nextMonth {
      ...MonthAndSurvey
    }
  }
}
    ${MonthAndSurveyFragmentDoc}`;
export type CreateNextMonthSurveyMutationFn = Apollo.MutationFunction<CreateNextMonthSurveyMutation, CreateNextMonthSurveyMutationVariables>;

/**
 * __useCreateNextMonthSurveyMutation__
 *
 * To run a mutation, you first call `useCreateNextMonthSurveyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateNextMonthSurveyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createNextMonthSurveyMutation, { data, loading, error }] = useCreateNextMonthSurveyMutation({
 *   variables: {
 *   },
 * });
 */
export function useCreateNextMonthSurveyMutation(baseOptions?: Apollo.MutationHookOptions<CreateNextMonthSurveyMutation, CreateNextMonthSurveyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateNextMonthSurveyMutation, CreateNextMonthSurveyMutationVariables>(CreateNextMonthSurveyDocument, options);
      }
export type CreateNextMonthSurveyMutationHookResult = ReturnType<typeof useCreateNextMonthSurveyMutation>;
export type CreateNextMonthSurveyMutationResult = Apollo.MutationResult<CreateNextMonthSurveyMutation>;
export type CreateNextMonthSurveyMutationOptions = Apollo.BaseMutationOptions<CreateNextMonthSurveyMutation, CreateNextMonthSurveyMutationVariables>;
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
export const UpdateMonthCircleDocument = gql`
    mutation UpdateMonthCircle($data: UpdateMonthCircleMutationInput!) {
  updateMonthCircle(data: $data) {
    monthCircle {
      ...MemberMonthCircle
      currentCircle {
        id
        name
      }
      member {
        ...ListedMember
        circle {
          id
          name
        }
      }
      kicked
      invited
      joined
    }
  }
}
    ${MemberMonthCircleFragmentDoc}
${ListedMemberFragmentDoc}`;
export type UpdateMonthCircleMutationFn = Apollo.MutationFunction<UpdateMonthCircleMutation, UpdateMonthCircleMutationVariables>;

/**
 * __useUpdateMonthCircleMutation__
 *
 * To run a mutation, you first call `useUpdateMonthCircleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateMonthCircleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateMonthCircleMutation, { data, loading, error }] = useUpdateMonthCircleMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useUpdateMonthCircleMutation(baseOptions?: Apollo.MutationHookOptions<UpdateMonthCircleMutation, UpdateMonthCircleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateMonthCircleMutation, UpdateMonthCircleMutationVariables>(UpdateMonthCircleDocument, options);
      }
export type UpdateMonthCircleMutationHookResult = ReturnType<typeof useUpdateMonthCircleMutation>;
export type UpdateMonthCircleMutationResult = Apollo.MutationResult<UpdateMonthCircleMutation>;
export type UpdateMonthCircleMutationOptions = Apollo.BaseMutationOptions<UpdateMonthCircleMutation, UpdateMonthCircleMutationVariables>;
export const UpdateSignUpDocument = gql`
    mutation UpdateSignUp($memberId: String!, $invited: Boolean, $joined: Boolean) {
  updateSignUp(memberId: $memberId, invited: $invited, joined: $joined) {
    ...ListedSignUp
  }
}
    ${ListedSignUpFragmentDoc}`;
export type UpdateSignUpMutationFn = Apollo.MutationFunction<UpdateSignUpMutation, UpdateSignUpMutationVariables>;

/**
 * __useUpdateSignUpMutation__
 *
 * To run a mutation, you first call `useUpdateSignUpMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSignUpMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSignUpMutation, { data, loading, error }] = useUpdateSignUpMutation({
 *   variables: {
 *      memberId: // value for 'memberId'
 *      invited: // value for 'invited'
 *      joined: // value for 'joined'
 *   },
 * });
 */
export function useUpdateSignUpMutation(baseOptions?: Apollo.MutationHookOptions<UpdateSignUpMutation, UpdateSignUpMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateSignUpMutation, UpdateSignUpMutationVariables>(UpdateSignUpDocument, options);
      }
export type UpdateSignUpMutationHookResult = ReturnType<typeof useUpdateSignUpMutation>;
export type UpdateSignUpMutationResult = Apollo.MutationResult<UpdateSignUpMutation>;
export type UpdateSignUpMutationOptions = Apollo.BaseMutationOptions<UpdateSignUpMutation, UpdateSignUpMutationVariables>;
export const AdminMembersDocument = gql`
    query AdminMembers {
  members {
    id
    pathname
    name
    trainerId
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
export const MonthSurveyDocument = gql`
    query MonthSurvey($year: String!, $month: String!) {
  monthSurvey(year: $year, month: $month) {
    id
    year
    month
    expiredAt
    answers {
      ...MemberMonthCircle
      currentCircle {
        id
        name
      }
      member {
        ...ListedMember
        circle {
          id
          name
        }
      }
      kicked
      invited
      joined
    }
    noAnswerMembers {
      ...ListedMember
      circle {
        id
        name
      }
    }
  }
}
    ${MemberMonthCircleFragmentDoc}
${ListedMemberFragmentDoc}`;

/**
 * __useMonthSurveyQuery__
 *
 * To run a query within a React component, call `useMonthSurveyQuery` and pass it any options that fit your needs.
 * When your component renders, `useMonthSurveyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMonthSurveyQuery({
 *   variables: {
 *      year: // value for 'year'
 *      month: // value for 'month'
 *   },
 * });
 */
export function useMonthSurveyQuery(baseOptions: Apollo.QueryHookOptions<MonthSurveyQuery, MonthSurveyQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MonthSurveyQuery, MonthSurveyQueryVariables>(MonthSurveyDocument, options);
      }
export function useMonthSurveyLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MonthSurveyQuery, MonthSurveyQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MonthSurveyQuery, MonthSurveyQueryVariables>(MonthSurveyDocument, options);
        }
export type MonthSurveyQueryHookResult = ReturnType<typeof useMonthSurveyQuery>;
export type MonthSurveyLazyQueryHookResult = ReturnType<typeof useMonthSurveyLazyQuery>;
export type MonthSurveyQueryResult = Apollo.QueryResult<MonthSurveyQuery, MonthSurveyQueryVariables>;
export const AdminTopDocument = gql`
    query AdminTop {
  thisMonth {
    ...MonthAndSurvey
  }
  nextMonth {
    ...MonthAndSurveyWithMembers
  }
  siteMetadata {
    activeMembers
  }
  signUps {
    ...ListedSignUp
  }
  circles {
    ...ListedCircle
  }
}
    ${MonthAndSurveyFragmentDoc}
${MonthAndSurveyWithMembersFragmentDoc}
${ListedSignUpFragmentDoc}
${ListedCircleFragmentDoc}`;

/**
 * __useAdminTopQuery__
 *
 * To run a query within a React component, call `useAdminTopQuery` and pass it any options that fit your needs.
 * When your component renders, `useAdminTopQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAdminTopQuery({
 *   variables: {
 *   },
 * });
 */
export function useAdminTopQuery(baseOptions?: Apollo.QueryHookOptions<AdminTopQuery, AdminTopQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AdminTopQuery, AdminTopQueryVariables>(AdminTopDocument, options);
      }
export function useAdminTopLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AdminTopQuery, AdminTopQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AdminTopQuery, AdminTopQueryVariables>(AdminTopDocument, options);
        }
export type AdminTopQueryHookResult = ReturnType<typeof useAdminTopQuery>;
export type AdminTopLazyQueryHookResult = ReturnType<typeof useAdminTopLazyQuery>;
export type AdminTopQueryResult = Apollo.QueryResult<AdminTopQuery, AdminTopQueryVariables>;
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
export type CircleKeySpecifier = ('id' | 'members' | 'name' | 'order' | 'selectableByAdmin' | 'selectableByUser' | 'selectableInSurvey' | CircleKeySpecifier)[];
export type CircleFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	members?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	order?: FieldPolicy<any> | FieldReadFunction<any>,
	selectableByAdmin?: FieldPolicy<any> | FieldReadFunction<any>,
	selectableByUser?: FieldPolicy<any> | FieldReadFunction<any>,
	selectableInSurvey?: FieldPolicy<any> | FieldReadFunction<any>
};
export type CreateNextMonthSurveyPayloadKeySpecifier = ('nextMonth' | CreateNextMonthSurveyPayloadKeySpecifier)[];
export type CreateNextMonthSurveyPayloadFieldPolicy = {
	nextMonth?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MemberKeySpecifier = ('circle' | 'circleRole' | 'id' | 'joinedAt' | 'leavedAt' | 'name' | 'nextMonthCircle' | 'pathname' | 'thisMonthCircle' | 'trainerId' | MemberKeySpecifier)[];
export type MemberFieldPolicy = {
	circle?: FieldPolicy<any> | FieldReadFunction<any>,
	circleRole?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	joinedAt?: FieldPolicy<any> | FieldReadFunction<any>,
	leavedAt?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	nextMonthCircle?: FieldPolicy<any> | FieldReadFunction<any>,
	pathname?: FieldPolicy<any> | FieldReadFunction<any>,
	thisMonthCircle?: FieldPolicy<any> | FieldReadFunction<any>,
	trainerId?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MonthKeySpecifier = ('month' | 'survey' | 'year' | MonthKeySpecifier)[];
export type MonthFieldPolicy = {
	month?: FieldPolicy<any> | FieldReadFunction<any>,
	survey?: FieldPolicy<any> | FieldReadFunction<any>,
	year?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MonthCircleKeySpecifier = ('circle' | 'currentCircle' | 'id' | 'invited' | 'joined' | 'kicked' | 'member' | 'month' | 'year' | MonthCircleKeySpecifier)[];
export type MonthCircleFieldPolicy = {
	circle?: FieldPolicy<any> | FieldReadFunction<any>,
	currentCircle?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	invited?: FieldPolicy<any> | FieldReadFunction<any>,
	joined?: FieldPolicy<any> | FieldReadFunction<any>,
	kicked?: FieldPolicy<any> | FieldReadFunction<any>,
	member?: FieldPolicy<any> | FieldReadFunction<any>,
	month?: FieldPolicy<any> | FieldReadFunction<any>,
	year?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MonthSurveyKeySpecifier = ('answers' | 'expiredAt' | 'id' | 'month' | 'noAnswerMembers' | 'year' | MonthSurveyKeySpecifier)[];
export type MonthSurveyFieldPolicy = {
	answers?: FieldPolicy<any> | FieldReadFunction<any>,
	expiredAt?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	month?: FieldPolicy<any> | FieldReadFunction<any>,
	noAnswerMembers?: FieldPolicy<any> | FieldReadFunction<any>,
	year?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MutationKeySpecifier = ('createNextMonthSurvey' | 'updateMemberMonthCircle' | 'updateMembers' | 'updateMonthCircle' | 'updateSignUp' | MutationKeySpecifier)[];
export type MutationFieldPolicy = {
	createNextMonthSurvey?: FieldPolicy<any> | FieldReadFunction<any>,
	updateMemberMonthCircle?: FieldPolicy<any> | FieldReadFunction<any>,
	updateMembers?: FieldPolicy<any> | FieldReadFunction<any>,
	updateMonthCircle?: FieldPolicy<any> | FieldReadFunction<any>,
	updateSignUp?: FieldPolicy<any> | FieldReadFunction<any>
};
export type QueryKeySpecifier = ('circles' | 'member' | 'members' | 'monthCircle' | 'monthSurvey' | 'nextMonth' | 'signUps' | 'siteMetadata' | 'thisMonth' | QueryKeySpecifier)[];
export type QueryFieldPolicy = {
	circles?: FieldPolicy<any> | FieldReadFunction<any>,
	member?: FieldPolicy<any> | FieldReadFunction<any>,
	members?: FieldPolicy<any> | FieldReadFunction<any>,
	monthCircle?: FieldPolicy<any> | FieldReadFunction<any>,
	monthSurvey?: FieldPolicy<any> | FieldReadFunction<any>,
	nextMonth?: FieldPolicy<any> | FieldReadFunction<any>,
	signUps?: FieldPolicy<any> | FieldReadFunction<any>,
	siteMetadata?: FieldPolicy<any> | FieldReadFunction<any>,
	thisMonth?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SignUpKeySpecifier = ('circle' | 'id' | 'invited' | 'joined' | 'member' | SignUpKeySpecifier)[];
export type SignUpFieldPolicy = {
	circle?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	invited?: FieldPolicy<any> | FieldReadFunction<any>,
	joined?: FieldPolicy<any> | FieldReadFunction<any>,
	member?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SiteMetadataKeySpecifier = ('activeMembers' | 'maxMembers' | 'totalMembers' | SiteMetadataKeySpecifier)[];
export type SiteMetadataFieldPolicy = {
	activeMembers?: FieldPolicy<any> | FieldReadFunction<any>,
	maxMembers?: FieldPolicy<any> | FieldReadFunction<any>,
	totalMembers?: FieldPolicy<any> | FieldReadFunction<any>
};
export type UpdateMemberMonthCirclePayloadKeySpecifier = ('monthCircle' | UpdateMemberMonthCirclePayloadKeySpecifier)[];
export type UpdateMemberMonthCirclePayloadFieldPolicy = {
	monthCircle?: FieldPolicy<any> | FieldReadFunction<any>
};
export type StrictTypedTypePolicies = {
	Circle?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | CircleKeySpecifier | (() => undefined | CircleKeySpecifier),
		fields?: CircleFieldPolicy,
	},
	CreateNextMonthSurveyPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | CreateNextMonthSurveyPayloadKeySpecifier | (() => undefined | CreateNextMonthSurveyPayloadKeySpecifier),
		fields?: CreateNextMonthSurveyPayloadFieldPolicy,
	},
	Member?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | MemberKeySpecifier | (() => undefined | MemberKeySpecifier),
		fields?: MemberFieldPolicy,
	},
	Month?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | MonthKeySpecifier | (() => undefined | MonthKeySpecifier),
		fields?: MonthFieldPolicy,
	},
	MonthCircle?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | MonthCircleKeySpecifier | (() => undefined | MonthCircleKeySpecifier),
		fields?: MonthCircleFieldPolicy,
	},
	MonthSurvey?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | MonthSurveyKeySpecifier | (() => undefined | MonthSurveyKeySpecifier),
		fields?: MonthSurveyFieldPolicy,
	},
	Mutation?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | MutationKeySpecifier | (() => undefined | MutationKeySpecifier),
		fields?: MutationFieldPolicy,
	},
	Query?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | QueryKeySpecifier | (() => undefined | QueryKeySpecifier),
		fields?: QueryFieldPolicy,
	},
	SignUp?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SignUpKeySpecifier | (() => undefined | SignUpKeySpecifier),
		fields?: SignUpFieldPolicy,
	},
	SiteMetadata?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SiteMetadataKeySpecifier | (() => undefined | SiteMetadataKeySpecifier),
		fields?: SiteMetadataFieldPolicy,
	},
	UpdateMemberMonthCirclePayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | UpdateMemberMonthCirclePayloadKeySpecifier | (() => undefined | UpdateMemberMonthCirclePayloadKeySpecifier),
		fields?: UpdateMemberMonthCirclePayloadFieldPolicy,
	}
};
export type TypedTypePolicies = StrictTypedTypePolicies & TypePolicies;