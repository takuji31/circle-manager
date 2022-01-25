import { Temporal } from 'proposal-temporal';
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
  /** ISO8601 Date string */
  Date: Temporal.PlainDate;
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: any;
  /** An arbitrary-precision Decimal type */
  Decimal: any;
  /** The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  Json: any;
};

/** circle */
export type Circle = {
  __typename?: 'Circle';
  id: Scalars['ID'];
  key: CircleKey;
  name: Scalars['String'];
};

export enum CircleFilter {
  All = 'All',
  CircleSelect = 'CircleSelect',
  MonthSurvey = 'MonthSurvey'
}

export enum CircleKey {
  Ha = 'Ha',
  Jo = 'Jo',
  Saikyo = 'Saikyo',
  Shin = 'Shin'
}

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
  circleKey?: Maybe<CircleKey>;
  circleRole: CircleRole;
  id: Scalars['ID'];
  joinedAt: Scalars['DateTime'];
  leavedAt?: Maybe<Scalars['DateTime']>;
  name: Scalars['String'];
  nextMonthCircle?: Maybe<MonthCircle>;
  /** 次の月の在籍希望アンケート回答 */
  nextMonthSurveyAnswer?: Maybe<MonthSurveyAnswer>;
  pathname: Scalars['String'];
  setupCompleted: Scalars['Boolean'];
  signUp?: Maybe<SignUp>;
  thisMonthCircle?: Maybe<MonthCircle>;
  trainerId?: Maybe<Scalars['String']>;
};

/** Umastagramから取得した各メンバーのファン数 */
export type MemberFanCount = {
  __typename?: 'MemberFanCount';
  avg: Scalars['BigInt'];
  circle: CircleKey;
  id: Scalars['ID'];
  member?: Maybe<Member>;
  name: Scalars['String'];
  predicted: Scalars['BigInt'];
  total: Scalars['BigInt'];
};

export type Month = {
  __typename?: 'Month';
  month: Scalars['String'];
  survey?: Maybe<MonthSurvey>;
  year: Scalars['String'];
};

export type MonthCircle = {
  __typename?: 'MonthCircle';
  circle: Circle;
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
  kick: Array<MonthCircle>;
  leave: Array<MonthCircle>;
  month: Scalars['String'];
  monthSurveyAnswers: Array<MonthSurveyAnswer>;
  move: Array<MonthCircle>;
  noAnswerMembers: Array<Member>;
  year: Scalars['String'];
};

/** 在籍希望アンケートの回答 */
export type MonthSurveyAnswer = {
  __typename?: 'MonthSurveyAnswer';
  circleKey: CircleKey;
  id: Scalars['ID'];
  member: Member;
  month: Scalars['String'];
  value?: Maybe<MonthSurveyAnswerValue>;
  year: Scalars['String'];
};

export enum MonthSurveyAnswerValue {
  Leave = 'Leave',
  None = 'None',
  Ob = 'Ob',
  Saikyo = 'Saikyo',
  Umamusume = 'Umamusume'
}

export type Mutation = {
  __typename?: 'Mutation';
  createNextMonthSurvey?: Maybe<CreateNextMonthSurveyPayload>;
  updateMember: Member;
  updateMemberMonthCircle?: Maybe<UpdateMemberMonthCirclePayload>;
  updateMembers: Array<Member>;
  updateMonthCircle?: Maybe<UpdateMemberMonthCirclePayload>;
  updateSignUp: SignUp;
};


export type MutationUpdateMemberArgs = {
  input: UpdateMemberMutationInput;
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
  input: UpdateSignUpMutationInput;
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


export type QueryCirclesArgs = {
  filter?: Maybe<CircleFilter>;
};


export type QueryMemberArgs = {
  id?: Maybe<Scalars['String']>;
  pathname?: Maybe<Scalars['String']>;
};


export type QueryMonthCircleArgs = {
  monthCircleId: Scalars['String'];
};


export type QueryMonthSurveyArgs = {
  month: Scalars['String'];
  year: Scalars['String'];
};

/** 特定の日または月のファン数ランキング */
export type Ranking = {
  __typename?: 'Ranking';
  date: Scalars['Date'];
  fanCounts: Array<MemberFanCount>;
};

/** 加入申請 */
export type SignUp = {
  __typename?: 'SignUp';
  circle?: Maybe<Circle>;
  circleKey?: Maybe<CircleKey>;
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

export type UpdateMemberMutationInput = {
  id: Scalars['String'];
  name?: Maybe<Scalars['String']>;
  setupCompleted?: Maybe<Scalars['Boolean']>;
  trainerId?: Maybe<Scalars['String']>;
};

export type UpdateMonthCircleMutationInput = {
  id: Scalars['String'];
  invited?: Maybe<Scalars['Boolean']>;
  joined?: Maybe<Scalars['Boolean']>;
  kicked?: Maybe<Scalars['Boolean']>;
};

export type UpdateSignUpMutationInput = {
  circleKey?: Maybe<CircleKey>;
  invited?: Maybe<Scalars['Boolean']>;
  joined?: Maybe<Scalars['Boolean']>;
  memberId: Scalars['String'];
};

export type ListedCircleFragment = { __typename?: 'Circle', id: string, key: CircleKey, name: string };

export type ListedMemberFragment = { __typename?: 'Member', id: string, name: string, trainerId?: string | null | undefined };

export type FullMemberFragment = { __typename?: 'Member', id: string, pathname: string, name: string, trainerId?: string | null | undefined, setupCompleted: boolean, circleRole: CircleRole, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined };

export type MonthAndSurveyFragment = { __typename?: 'Month', year: string, month: string, survey?: { __typename?: 'MonthSurvey', id: string, year: string, month: string, expiredAt: any } | null | undefined };

export type MonthAndSurveyWithMembersFragment = { __typename?: 'Month', year: string, month: string, survey?: { __typename?: 'MonthSurvey', id: string, year: string, month: string, expiredAt: any, answers: Array<{ __typename?: 'MonthCircle', id: string, year: string, month: string, member: { __typename?: 'Member', id: string, name: string, trainerId?: string | null | undefined }, circle: { __typename?: 'Circle', id: string, key: CircleKey, name: string } }>, noAnswerMembers: Array<{ __typename?: 'Member', id: string, name: string }>, monthSurveyAnswers: Array<{ __typename?: 'MonthSurveyAnswer', id: string, year: string, month: string, circleKey: CircleKey, value?: MonthSurveyAnswerValue | null | undefined }> } | null | undefined };

export type MemberMonthCircleFragment = { __typename?: 'MonthCircle', id: string, year: string, month: string, circle: { __typename?: 'Circle', id: string, key: CircleKey, name: string } };

export type FullMonthCircleFragment = { __typename?: 'MonthCircle', kicked: boolean, invited: boolean, joined: boolean, id: string, year: string, month: string, currentCircle: { __typename?: 'Circle', id: string, key: CircleKey, name: string }, member: { __typename?: 'Member', id: string, name: string, trainerId?: string | null | undefined }, circle: { __typename?: 'Circle', id: string, key: CircleKey, name: string } };

export type ListedMonthSurveyAnswerFragment = { __typename?: 'MonthSurveyAnswer', id: string, year: string, month: string, circleKey: CircleKey, value?: MonthSurveyAnswerValue | null | undefined };

export type ListedSignUpFragment = { __typename?: 'SignUp', id: string, invited: boolean, joined: boolean, member: { __typename?: 'Member', id: string, name: string, trainerId?: string | null | undefined }, circle?: { __typename?: 'Circle', id: string, key: CircleKey, name: string } | null | undefined };

export type CreateNextMonthSurveyMutationVariables = Exact<{ [key: string]: never; }>;


export type CreateNextMonthSurveyMutation = { __typename?: 'Mutation', createNextMonthSurvey?: { __typename?: 'CreateNextMonthSurveyPayload', nextMonth: { __typename?: 'Month', year: string, month: string, survey?: { __typename?: 'MonthSurvey', id: string, year: string, month: string, expiredAt: any } | null | undefined } } | null | undefined };

export type UpdateMemberMonthCircleMutationVariables = Exact<{
  memberId: Scalars['String'];
  year: Scalars['String'];
  month: Scalars['String'];
  circleId: Scalars['String'];
}>;


export type UpdateMemberMonthCircleMutation = { __typename?: 'Mutation', updateMemberMonthCircle?: { __typename?: 'UpdateMemberMonthCirclePayload', monthCircle: { __typename?: 'MonthCircle', id: string, year: string, month: string, circle: { __typename?: 'Circle', id: string, key: CircleKey, name: string } } } | null | undefined };

export type UpdateMemberMutationVariables = Exact<{
  input: UpdateMemberMutationInput;
}>;


export type UpdateMemberMutation = { __typename?: 'Mutation', updateMember: { __typename?: 'Member', id: string, pathname: string, name: string, trainerId?: string | null | undefined, setupCompleted: boolean, circleRole: CircleRole, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined } };

export type UpdateMembersMutationVariables = Exact<{ [key: string]: never; }>;


export type UpdateMembersMutation = { __typename?: 'Mutation', updateMembers: Array<{ __typename?: 'Member', id: string, name: string, trainerId?: string | null | undefined, circle?: { __typename?: 'Circle', id: string, key: CircleKey, name: string } | null | undefined, thisMonthCircle?: { __typename?: 'MonthCircle', id: string, year: string, month: string, circle: { __typename?: 'Circle', id: string, key: CircleKey, name: string } } | null | undefined, nextMonthCircle?: { __typename?: 'MonthCircle', id: string, year: string, month: string, circle: { __typename?: 'Circle', id: string, key: CircleKey, name: string } } | null | undefined }> };

export type UpdateMonthCircleMutationVariables = Exact<{
  data: UpdateMonthCircleMutationInput;
}>;


export type UpdateMonthCircleMutation = { __typename?: 'Mutation', updateMonthCircle?: { __typename?: 'UpdateMemberMonthCirclePayload', monthCircle: { __typename?: 'MonthCircle', kicked: boolean, invited: boolean, joined: boolean, id: string, year: string, month: string, currentCircle: { __typename?: 'Circle', id: string, name: string }, member: { __typename?: 'Member', id: string, name: string, trainerId?: string | null | undefined, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined }, circle: { __typename?: 'Circle', id: string, key: CircleKey, name: string } } } | null | undefined };

export type UpdateSetupMutationVariables = Exact<{
  memberId: Scalars['String'];
  circleKey: CircleKey;
  trainerId: Scalars['String'];
  name: Scalars['String'];
}>;


export type UpdateSetupMutation = { __typename?: 'Mutation', updateSignUp: { __typename?: 'SignUp', id: string, invited: boolean, joined: boolean, member: { __typename?: 'Member', id: string, name: string, trainerId?: string | null | undefined }, circle?: { __typename?: 'Circle', id: string, key: CircleKey, name: string } | null | undefined }, updateMember: { __typename?: 'Member', id: string, pathname: string, name: string, trainerId?: string | null | undefined, setupCompleted: boolean, circleRole: CircleRole, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined } };

export type UpdateSignUpMutationVariables = Exact<{
  memberId: Scalars['String'];
  invited?: Maybe<Scalars['Boolean']>;
  joined?: Maybe<Scalars['Boolean']>;
}>;


export type UpdateSignUpMutation = { __typename?: 'Mutation', updateSignUp: { __typename?: 'SignUp', id: string, invited: boolean, joined: boolean, member: { __typename?: 'Member', id: string, name: string, trainerId?: string | null | undefined }, circle?: { __typename?: 'Circle', id: string, key: CircleKey, name: string } | null | undefined } };

export type AdminCirclesQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminCirclesQuery = { __typename?: 'Query', circles: Array<{ __typename?: 'Circle', id: string, key: CircleKey, name: string }> };

export type AdminMembersQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminMembersQuery = { __typename?: 'Query', members: Array<{ __typename?: 'Member', id: string, pathname: string, name: string, trainerId?: string | null | undefined, circleRole: CircleRole, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined, thisMonthCircle?: { __typename?: 'MonthCircle', id: string, year: string, month: string, circle: { __typename?: 'Circle', id: string, key: CircleKey, name: string } } | null | undefined, nextMonthCircle?: { __typename?: 'MonthCircle', id: string, year: string, month: string, circle: { __typename?: 'Circle', id: string, key: CircleKey, name: string } } | null | undefined, nextMonthSurveyAnswer?: { __typename?: 'MonthSurveyAnswer', id: string, year: string, month: string, circleKey: CircleKey, value?: MonthSurveyAnswerValue | null | undefined } | null | undefined }> };

export type MonthSurveyQueryVariables = Exact<{
  year: Scalars['String'];
  month: Scalars['String'];
}>;


export type MonthSurveyQuery = { __typename?: 'Query', monthSurvey?: { __typename?: 'MonthSurvey', id: string, year: string, month: string, expiredAt: any, move: Array<{ __typename?: 'MonthCircle', kicked: boolean, invited: boolean, joined: boolean, id: string, year: string, month: string, currentCircle: { __typename?: 'Circle', id: string, key: CircleKey, name: string }, member: { __typename?: 'Member', id: string, name: string, trainerId?: string | null | undefined }, circle: { __typename?: 'Circle', id: string, key: CircleKey, name: string } }>, leave: Array<{ __typename?: 'MonthCircle', kicked: boolean, invited: boolean, joined: boolean, id: string, year: string, month: string, currentCircle: { __typename?: 'Circle', id: string, key: CircleKey, name: string }, member: { __typename?: 'Member', id: string, name: string, trainerId?: string | null | undefined }, circle: { __typename?: 'Circle', id: string, key: CircleKey, name: string } }>, kick: Array<{ __typename?: 'MonthCircle', kicked: boolean, invited: boolean, joined: boolean, id: string, year: string, month: string, currentCircle: { __typename?: 'Circle', id: string, key: CircleKey, name: string }, member: { __typename?: 'Member', id: string, name: string, trainerId?: string | null | undefined }, circle: { __typename?: 'Circle', id: string, key: CircleKey, name: string } }> } | null | undefined };

export type AdminTopQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminTopQuery = { __typename?: 'Query', thisMonth: { __typename?: 'Month', year: string, month: string, survey?: { __typename?: 'MonthSurvey', id: string, year: string, month: string, expiredAt: any } | null | undefined }, nextMonth: { __typename?: 'Month', year: string, month: string, survey?: { __typename?: 'MonthSurvey', id: string, year: string, month: string, expiredAt: any, answers: Array<{ __typename?: 'MonthCircle', id: string, year: string, month: string, member: { __typename?: 'Member', id: string, name: string, trainerId?: string | null | undefined }, circle: { __typename?: 'Circle', id: string, key: CircleKey, name: string } }>, noAnswerMembers: Array<{ __typename?: 'Member', id: string, name: string }>, monthSurveyAnswers: Array<{ __typename?: 'MonthSurveyAnswer', id: string, year: string, month: string, circleKey: CircleKey, value?: MonthSurveyAnswerValue | null | undefined }> } | null | undefined }, siteMetadata: { __typename?: 'SiteMetadata', activeMembers: number }, signUps: Array<{ __typename?: 'SignUp', id: string, invited: boolean, joined: boolean, member: { __typename?: 'Member', id: string, name: string, trainerId?: string | null | undefined }, circle?: { __typename?: 'Circle', id: string, key: CircleKey, name: string } | null | undefined }> };

export type MemberMonthCirclesQueryVariables = Exact<{
  memberId: Scalars['String'];
}>;


export type MemberMonthCirclesQuery = { __typename?: 'Query', member?: { __typename?: 'Member', thisMonthCircle?: { __typename?: 'MonthCircle', id: string, year: string, month: string, circle: { __typename?: 'Circle', id: string, key: CircleKey, name: string } } | null | undefined, nextMonthCircle?: { __typename?: 'MonthCircle', id: string, year: string, month: string, circle: { __typename?: 'Circle', id: string, key: CircleKey, name: string } } | null | undefined } | null | undefined, circles: Array<{ __typename?: 'Circle', id: string, key: CircleKey, name: string }> };

export type MemberByPathnameQueryVariables = Exact<{
  pathname: Scalars['String'];
}>;


export type MemberByPathnameQuery = { __typename?: 'Query', member?: { __typename?: 'Member', id: string, pathname: string, name: string, trainerId?: string | null | undefined, setupCompleted: boolean, circleRole: CircleRole, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined } | null | undefined };

export type MonthCircleQueryVariables = Exact<{
  monthCircleId: Scalars['String'];
}>;


export type MonthCircleQuery = { __typename?: 'Query', monthCircle?: { __typename?: 'MonthCircle', id: string, year: string, month: string, member: { __typename?: 'Member', id: string, name: string }, circle: { __typename?: 'Circle', id: string, key: CircleKey, name: string } } | null | undefined, circles: Array<{ __typename?: 'Circle', id: string, key: CircleKey, name: string }> };

export type SetupQueryVariables = Exact<{
  pathname: Scalars['String'];
}>;


export type SetupQuery = { __typename?: 'Query', member?: { __typename?: 'Member', id: string, pathname: string, name: string, trainerId?: string | null | undefined, setupCompleted: boolean, circleRole: CircleRole, signUp?: { __typename?: 'SignUp', id: string, invited: boolean, joined: boolean, circle?: { __typename?: 'Circle', id: string, key: CircleKey, name: string } | null | undefined } | null | undefined, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined } | null | undefined, circles: Array<{ __typename?: 'Circle', id: string, key: CircleKey, name: string }> };

export const FullMemberFragmentDoc = gql`
    fragment FullMember on Member {
  id
  pathname
  name
  trainerId
  setupCompleted
  circle {
    id
    name
  }
  circleRole
}
    `;
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
export const ListedCircleFragmentDoc = gql`
    fragment ListedCircle on Circle {
  id
  key
  name
}
    `;
export const MemberMonthCircleFragmentDoc = gql`
    fragment MemberMonthCircle on MonthCircle {
  id
  year
  month
  circle {
    ...ListedCircle
  }
}
    ${ListedCircleFragmentDoc}`;
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
    monthSurveyAnswers {
      id
      year
      month
      circleKey
      value
    }
  }
}
    ${MemberMonthCircleFragmentDoc}
${ListedMemberFragmentDoc}`;
export const FullMonthCircleFragmentDoc = gql`
    fragment FullMonthCircle on MonthCircle {
  ...MemberMonthCircle
  currentCircle {
    ...ListedCircle
  }
  member {
    ...ListedMember
  }
  kicked
  invited
  joined
}
    ${MemberMonthCircleFragmentDoc}
${ListedCircleFragmentDoc}
${ListedMemberFragmentDoc}`;
export const ListedMonthSurveyAnswerFragmentDoc = gql`
    fragment ListedMonthSurveyAnswer on MonthSurveyAnswer {
  id
  year
  month
  circleKey
  value
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
export const UpdateMemberDocument = gql`
    mutation UpdateMember($input: UpdateMemberMutationInput!) {
  updateMember(input: $input) {
    ...FullMember
  }
}
    ${FullMemberFragmentDoc}`;
export type UpdateMemberMutationFn = Apollo.MutationFunction<UpdateMemberMutation, UpdateMemberMutationVariables>;

/**
 * __useUpdateMemberMutation__
 *
 * To run a mutation, you first call `useUpdateMemberMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateMemberMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateMemberMutation, { data, loading, error }] = useUpdateMemberMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateMemberMutation(baseOptions?: Apollo.MutationHookOptions<UpdateMemberMutation, UpdateMemberMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateMemberMutation, UpdateMemberMutationVariables>(UpdateMemberDocument, options);
      }
export type UpdateMemberMutationHookResult = ReturnType<typeof useUpdateMemberMutation>;
export type UpdateMemberMutationResult = Apollo.MutationResult<UpdateMemberMutation>;
export type UpdateMemberMutationOptions = Apollo.BaseMutationOptions<UpdateMemberMutation, UpdateMemberMutationVariables>;
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
export const UpdateSetupDocument = gql`
    mutation UpdateSetup($memberId: String!, $circleKey: CircleKey!, $trainerId: String!, $name: String!) {
  updateSignUp(input: {memberId: $memberId, circleKey: $circleKey}) {
    ...ListedSignUp
  }
  updateMember(
    input: {id: $memberId, trainerId: $trainerId, name: $name, setupCompleted: true}
  ) {
    ...FullMember
  }
}
    ${ListedSignUpFragmentDoc}
${FullMemberFragmentDoc}`;
export type UpdateSetupMutationFn = Apollo.MutationFunction<UpdateSetupMutation, UpdateSetupMutationVariables>;

/**
 * __useUpdateSetupMutation__
 *
 * To run a mutation, you first call `useUpdateSetupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSetupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSetupMutation, { data, loading, error }] = useUpdateSetupMutation({
 *   variables: {
 *      memberId: // value for 'memberId'
 *      circleKey: // value for 'circleKey'
 *      trainerId: // value for 'trainerId'
 *      name: // value for 'name'
 *   },
 * });
 */
export function useUpdateSetupMutation(baseOptions?: Apollo.MutationHookOptions<UpdateSetupMutation, UpdateSetupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateSetupMutation, UpdateSetupMutationVariables>(UpdateSetupDocument, options);
      }
export type UpdateSetupMutationHookResult = ReturnType<typeof useUpdateSetupMutation>;
export type UpdateSetupMutationResult = Apollo.MutationResult<UpdateSetupMutation>;
export type UpdateSetupMutationOptions = Apollo.BaseMutationOptions<UpdateSetupMutation, UpdateSetupMutationVariables>;
export const UpdateSignUpDocument = gql`
    mutation UpdateSignUp($memberId: String!, $invited: Boolean, $joined: Boolean) {
  updateSignUp(input: {memberId: $memberId, invited: $invited, joined: $joined}) {
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
export const AdminCirclesDocument = gql`
    query AdminCircles {
  circles(filter: CircleSelect) {
    ...ListedCircle
  }
}
    ${ListedCircleFragmentDoc}`;

/**
 * __useAdminCirclesQuery__
 *
 * To run a query within a React component, call `useAdminCirclesQuery` and pass it any options that fit your needs.
 * When your component renders, `useAdminCirclesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAdminCirclesQuery({
 *   variables: {
 *   },
 * });
 */
export function useAdminCirclesQuery(baseOptions?: Apollo.QueryHookOptions<AdminCirclesQuery, AdminCirclesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AdminCirclesQuery, AdminCirclesQueryVariables>(AdminCirclesDocument, options);
      }
export function useAdminCirclesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AdminCirclesQuery, AdminCirclesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AdminCirclesQuery, AdminCirclesQueryVariables>(AdminCirclesDocument, options);
        }
export type AdminCirclesQueryHookResult = ReturnType<typeof useAdminCirclesQuery>;
export type AdminCirclesLazyQueryHookResult = ReturnType<typeof useAdminCirclesLazyQuery>;
export type AdminCirclesQueryResult = Apollo.QueryResult<AdminCirclesQuery, AdminCirclesQueryVariables>;
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
    nextMonthSurveyAnswer {
      ...ListedMonthSurveyAnswer
    }
  }
}
    ${MemberMonthCircleFragmentDoc}
${ListedMonthSurveyAnswerFragmentDoc}`;

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
    move {
      ...FullMonthCircle
    }
    leave {
      ...FullMonthCircle
    }
    kick {
      ...FullMonthCircle
    }
  }
}
    ${FullMonthCircleFragmentDoc}`;

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
}
    ${MonthAndSurveyFragmentDoc}
${MonthAndSurveyWithMembersFragmentDoc}
${ListedSignUpFragmentDoc}`;

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
export const MemberByPathnameDocument = gql`
    query MemberByPathname($pathname: String!) {
  member(pathname: $pathname) {
    ...FullMember
  }
}
    ${FullMemberFragmentDoc}`;

/**
 * __useMemberByPathnameQuery__
 *
 * To run a query within a React component, call `useMemberByPathnameQuery` and pass it any options that fit your needs.
 * When your component renders, `useMemberByPathnameQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMemberByPathnameQuery({
 *   variables: {
 *      pathname: // value for 'pathname'
 *   },
 * });
 */
export function useMemberByPathnameQuery(baseOptions: Apollo.QueryHookOptions<MemberByPathnameQuery, MemberByPathnameQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MemberByPathnameQuery, MemberByPathnameQueryVariables>(MemberByPathnameDocument, options);
      }
export function useMemberByPathnameLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MemberByPathnameQuery, MemberByPathnameQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MemberByPathnameQuery, MemberByPathnameQueryVariables>(MemberByPathnameDocument, options);
        }
export type MemberByPathnameQueryHookResult = ReturnType<typeof useMemberByPathnameQuery>;
export type MemberByPathnameLazyQueryHookResult = ReturnType<typeof useMemberByPathnameLazyQuery>;
export type MemberByPathnameQueryResult = Apollo.QueryResult<MemberByPathnameQuery, MemberByPathnameQueryVariables>;
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
export const SetupDocument = gql`
    query Setup($pathname: String!) {
  member(pathname: $pathname) {
    ...FullMember
    signUp {
      id
      circle {
        ...ListedCircle
      }
      invited
      joined
    }
  }
  circles(filter: CircleSelect) {
    ...ListedCircle
  }
}
    ${FullMemberFragmentDoc}
${ListedCircleFragmentDoc}`;

/**
 * __useSetupQuery__
 *
 * To run a query within a React component, call `useSetupQuery` and pass it any options that fit your needs.
 * When your component renders, `useSetupQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSetupQuery({
 *   variables: {
 *      pathname: // value for 'pathname'
 *   },
 * });
 */
export function useSetupQuery(baseOptions: Apollo.QueryHookOptions<SetupQuery, SetupQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SetupQuery, SetupQueryVariables>(SetupDocument, options);
      }
export function useSetupLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SetupQuery, SetupQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SetupQuery, SetupQueryVariables>(SetupDocument, options);
        }
export type SetupQueryHookResult = ReturnType<typeof useSetupQuery>;
export type SetupLazyQueryHookResult = ReturnType<typeof useSetupLazyQuery>;
export type SetupQueryResult = Apollo.QueryResult<SetupQuery, SetupQueryVariables>;
export type CircleKeySpecifier = ('id' | 'key' | 'name' | CircleKeySpecifier)[];
export type CircleFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	key?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>
};
export type CreateNextMonthSurveyPayloadKeySpecifier = ('nextMonth' | CreateNextMonthSurveyPayloadKeySpecifier)[];
export type CreateNextMonthSurveyPayloadFieldPolicy = {
	nextMonth?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MemberKeySpecifier = ('circle' | 'circleKey' | 'circleRole' | 'id' | 'joinedAt' | 'leavedAt' | 'name' | 'nextMonthCircle' | 'nextMonthSurveyAnswer' | 'pathname' | 'setupCompleted' | 'signUp' | 'thisMonthCircle' | 'trainerId' | MemberKeySpecifier)[];
export type MemberFieldPolicy = {
	circle?: FieldPolicy<any> | FieldReadFunction<any>,
	circleKey?: FieldPolicy<any> | FieldReadFunction<any>,
	circleRole?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	joinedAt?: FieldPolicy<any> | FieldReadFunction<any>,
	leavedAt?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	nextMonthCircle?: FieldPolicy<any> | FieldReadFunction<any>,
	nextMonthSurveyAnswer?: FieldPolicy<any> | FieldReadFunction<any>,
	pathname?: FieldPolicy<any> | FieldReadFunction<any>,
	setupCompleted?: FieldPolicy<any> | FieldReadFunction<any>,
	signUp?: FieldPolicy<any> | FieldReadFunction<any>,
	thisMonthCircle?: FieldPolicy<any> | FieldReadFunction<any>,
	trainerId?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MemberFanCountKeySpecifier = ('avg' | 'circle' | 'id' | 'member' | 'name' | 'predicted' | 'total' | MemberFanCountKeySpecifier)[];
export type MemberFanCountFieldPolicy = {
	avg?: FieldPolicy<any> | FieldReadFunction<any>,
	circle?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	member?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	predicted?: FieldPolicy<any> | FieldReadFunction<any>,
	total?: FieldPolicy<any> | FieldReadFunction<any>
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
export type MonthSurveyKeySpecifier = ('answers' | 'expiredAt' | 'id' | 'kick' | 'leave' | 'month' | 'monthSurveyAnswers' | 'move' | 'noAnswerMembers' | 'year' | MonthSurveyKeySpecifier)[];
export type MonthSurveyFieldPolicy = {
	answers?: FieldPolicy<any> | FieldReadFunction<any>,
	expiredAt?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	kick?: FieldPolicy<any> | FieldReadFunction<any>,
	leave?: FieldPolicy<any> | FieldReadFunction<any>,
	month?: FieldPolicy<any> | FieldReadFunction<any>,
	monthSurveyAnswers?: FieldPolicy<any> | FieldReadFunction<any>,
	move?: FieldPolicy<any> | FieldReadFunction<any>,
	noAnswerMembers?: FieldPolicy<any> | FieldReadFunction<any>,
	year?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MonthSurveyAnswerKeySpecifier = ('circleKey' | 'id' | 'member' | 'month' | 'value' | 'year' | MonthSurveyAnswerKeySpecifier)[];
export type MonthSurveyAnswerFieldPolicy = {
	circleKey?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	member?: FieldPolicy<any> | FieldReadFunction<any>,
	month?: FieldPolicy<any> | FieldReadFunction<any>,
	value?: FieldPolicy<any> | FieldReadFunction<any>,
	year?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MutationKeySpecifier = ('createNextMonthSurvey' | 'updateMember' | 'updateMemberMonthCircle' | 'updateMembers' | 'updateMonthCircle' | 'updateSignUp' | MutationKeySpecifier)[];
export type MutationFieldPolicy = {
	createNextMonthSurvey?: FieldPolicy<any> | FieldReadFunction<any>,
	updateMember?: FieldPolicy<any> | FieldReadFunction<any>,
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
export type RankingKeySpecifier = ('date' | 'fanCounts' | RankingKeySpecifier)[];
export type RankingFieldPolicy = {
	date?: FieldPolicy<any> | FieldReadFunction<any>,
	fanCounts?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SignUpKeySpecifier = ('circle' | 'circleKey' | 'id' | 'invited' | 'joined' | 'member' | SignUpKeySpecifier)[];
export type SignUpFieldPolicy = {
	circle?: FieldPolicy<any> | FieldReadFunction<any>,
	circleKey?: FieldPolicy<any> | FieldReadFunction<any>,
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
	MemberFanCount?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | MemberFanCountKeySpecifier | (() => undefined | MemberFanCountKeySpecifier),
		fields?: MemberFanCountFieldPolicy,
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
	MonthSurveyAnswer?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | MonthSurveyAnswerKeySpecifier | (() => undefined | MonthSurveyAnswerKeySpecifier),
		fields?: MonthSurveyAnswerFieldPolicy,
	},
	Mutation?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | MutationKeySpecifier | (() => undefined | MutationKeySpecifier),
		fields?: MutationFieldPolicy,
	},
	Query?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | QueryKeySpecifier | (() => undefined | QueryKeySpecifier),
		fields?: QueryFieldPolicy,
	},
	Ranking?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | RankingKeySpecifier | (() => undefined | RankingKeySpecifier),
		fields?: RankingFieldPolicy,
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