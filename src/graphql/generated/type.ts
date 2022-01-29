import { Temporal } from 'proposal-temporal';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
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

export type CreateMonthCirclesPayload = {
  __typename?: 'CreateMonthCirclesPayload';
  month: Scalars['Int'];
  monthCircles: Array<MonthCircle>;
  year: Scalars['Int'];
};

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
  messageChannelId?: Maybe<Scalars['String']>;
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
  month: Scalars['Int'];
  monthCircles: Array<MonthCircle>;
  survey?: Maybe<MonthSurvey>;
  year: Scalars['Int'];
};

/** メンバーの指定した月の在籍サークル */
export type MonthCircle = {
  __typename?: 'MonthCircle';
  circle?: Maybe<Circle>;
  currentCircle?: Maybe<Circle>;
  currentCircleKey?: Maybe<CircleKey>;
  id: Scalars['ID'];
  invited: Scalars['Boolean'];
  joined: Scalars['Boolean'];
  kicked: Scalars['Boolean'];
  /** ランキングによって上書きされないよう設定されているか */
  locked: Scalars['Boolean'];
  member: Member;
  month: Scalars['Int'];
  state: MonthCircleState;
  year: Scalars['Int'];
};

export enum MonthCircleState {
  Ha = 'Ha',
  Jo = 'Jo',
  Kicked = 'Kicked',
  Leaved = 'Leaved',
  Ob = 'OB',
  Saikyo = 'Saikyo',
  Shin = 'Shin'
}

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
  createNextMonthCircles: CreateMonthCirclesPayload;
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
  month: Scalars['Int'];
  year: Scalars['Int'];
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

export type MonthAndSurveyFragment = { __typename?: 'Month', year: number, month: number, survey?: { __typename?: 'MonthSurvey', id: string, year: string, month: string, expiredAt: any } | null | undefined };

export type MonthAndSurveyWithMembersFragment = { __typename?: 'Month', year: number, month: number, survey?: { __typename?: 'MonthSurvey', id: string, year: string, month: string, expiredAt: any, answers: Array<{ __typename?: 'MonthCircle', id: string, year: number, month: number, member: { __typename?: 'Member', id: string, name: string, trainerId?: string | null | undefined }, circle?: { __typename?: 'Circle', id: string, key: CircleKey, name: string } | null | undefined }>, noAnswerMembers: Array<{ __typename?: 'Member', id: string, name: string }>, monthSurveyAnswers: Array<{ __typename?: 'MonthSurveyAnswer', id: string, year: string, month: string, circleKey: CircleKey, value?: MonthSurveyAnswerValue | null | undefined }> } | null | undefined };

export type MemberMonthCircleFragment = { __typename?: 'MonthCircle', id: string, year: number, month: number, circle?: { __typename?: 'Circle', id: string, key: CircleKey, name: string } | null | undefined };

export type FullMonthCircleFragment = { __typename?: 'MonthCircle', state: MonthCircleState, kicked: boolean, invited: boolean, joined: boolean, id: string, year: number, month: number, currentCircle?: { __typename?: 'Circle', id: string, key: CircleKey, name: string } | null | undefined, member: { __typename?: 'Member', id: string, name: string, trainerId?: string | null | undefined }, circle?: { __typename?: 'Circle', id: string, key: CircleKey, name: string } | null | undefined };

export type ListedMonthSurveyAnswerFragment = { __typename?: 'MonthSurveyAnswer', id: string, year: string, month: string, circleKey: CircleKey, value?: MonthSurveyAnswerValue | null | undefined };

export type ListedSignUpFragment = { __typename?: 'SignUp', id: string, invited: boolean, joined: boolean, member: { __typename?: 'Member', id: string, name: string, trainerId?: string | null | undefined }, circle?: { __typename?: 'Circle', id: string, key: CircleKey, name: string } | null | undefined };

export type CreateNextMonthCirclesMutationVariables = Exact<{ [key: string]: never; }>;


export type CreateNextMonthCirclesMutation = { __typename?: 'Mutation', createNextMonthCircles: { __typename?: 'CreateMonthCirclesPayload', year: number, month: number, monthCircles: Array<{ __typename?: 'MonthCircle', state: MonthCircleState, kicked: boolean, invited: boolean, joined: boolean, id: string, year: number, month: number, currentCircle?: { __typename?: 'Circle', id: string, key: CircleKey, name: string } | null | undefined, member: { __typename?: 'Member', id: string, name: string, trainerId?: string | null | undefined }, circle?: { __typename?: 'Circle', id: string, key: CircleKey, name: string } | null | undefined }> } };

export type CreateNextMonthSurveyMutationVariables = Exact<{ [key: string]: never; }>;


export type CreateNextMonthSurveyMutation = { __typename?: 'Mutation', createNextMonthSurvey?: { __typename?: 'CreateNextMonthSurveyPayload', nextMonth: { __typename?: 'Month', year: number, month: number, survey?: { __typename?: 'MonthSurvey', id: string, year: string, month: string, expiredAt: any } | null | undefined } } | null | undefined };

export type UpdateMemberMonthCircleMutationVariables = Exact<{
  memberId: Scalars['String'];
  year: Scalars['Int'];
  month: Scalars['Int'];
  circleId: Scalars['String'];
}>;


export type UpdateMemberMonthCircleMutation = { __typename?: 'Mutation', updateMemberMonthCircle?: { __typename?: 'UpdateMemberMonthCirclePayload', monthCircle: { __typename?: 'MonthCircle', id: string, year: number, month: number, circle?: { __typename?: 'Circle', id: string, key: CircleKey, name: string } | null | undefined } } | null | undefined };

export type UpdateMemberMutationVariables = Exact<{
  input: UpdateMemberMutationInput;
}>;


export type UpdateMemberMutation = { __typename?: 'Mutation', updateMember: { __typename?: 'Member', id: string, pathname: string, name: string, trainerId?: string | null | undefined, setupCompleted: boolean, circleRole: CircleRole, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined } };

export type UpdateMembersMutationVariables = Exact<{ [key: string]: never; }>;


export type UpdateMembersMutation = { __typename?: 'Mutation', updateMembers: Array<{ __typename?: 'Member', id: string, name: string, trainerId?: string | null | undefined, circle?: { __typename?: 'Circle', id: string, key: CircleKey, name: string } | null | undefined, thisMonthCircle?: { __typename?: 'MonthCircle', id: string, year: number, month: number, circle?: { __typename?: 'Circle', id: string, key: CircleKey, name: string } | null | undefined } | null | undefined, nextMonthCircle?: { __typename?: 'MonthCircle', id: string, year: number, month: number, circle?: { __typename?: 'Circle', id: string, key: CircleKey, name: string } | null | undefined } | null | undefined }> };

export type UpdateMonthCircleMutationVariables = Exact<{
  data: UpdateMonthCircleMutationInput;
}>;


export type UpdateMonthCircleMutation = { __typename?: 'Mutation', updateMonthCircle?: { __typename?: 'UpdateMemberMonthCirclePayload', monthCircle: { __typename?: 'MonthCircle', kicked: boolean, invited: boolean, joined: boolean, id: string, year: number, month: number, currentCircle?: { __typename?: 'Circle', id: string, name: string } | null | undefined, member: { __typename?: 'Member', id: string, name: string, trainerId?: string | null | undefined, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined }, circle?: { __typename?: 'Circle', id: string, key: CircleKey, name: string } | null | undefined } } | null | undefined };

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


export type AdminMembersQuery = { __typename?: 'Query', members: Array<{ __typename?: 'Member', id: string, pathname: string, name: string, trainerId?: string | null | undefined, circleRole: CircleRole, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined, thisMonthCircle?: { __typename?: 'MonthCircle', id: string, year: number, month: number, circle?: { __typename?: 'Circle', id: string, key: CircleKey, name: string } | null | undefined } | null | undefined, nextMonthCircle?: { __typename?: 'MonthCircle', id: string, year: number, month: number, circle?: { __typename?: 'Circle', id: string, key: CircleKey, name: string } | null | undefined } | null | undefined, nextMonthSurveyAnswer?: { __typename?: 'MonthSurveyAnswer', id: string, year: string, month: string, circleKey: CircleKey, value?: MonthSurveyAnswerValue | null | undefined } | null | undefined }> };

export type MonthSurveyQueryVariables = Exact<{
  year: Scalars['String'];
  month: Scalars['String'];
}>;


export type MonthSurveyQuery = { __typename?: 'Query', monthSurvey?: { __typename?: 'MonthSurvey', id: string, year: string, month: string, expiredAt: any, move: Array<{ __typename?: 'MonthCircle', state: MonthCircleState, kicked: boolean, invited: boolean, joined: boolean, id: string, year: number, month: number, currentCircle?: { __typename?: 'Circle', id: string, key: CircleKey, name: string } | null | undefined, member: { __typename?: 'Member', id: string, name: string, trainerId?: string | null | undefined }, circle?: { __typename?: 'Circle', id: string, key: CircleKey, name: string } | null | undefined }>, leave: Array<{ __typename?: 'MonthCircle', state: MonthCircleState, kicked: boolean, invited: boolean, joined: boolean, id: string, year: number, month: number, currentCircle?: { __typename?: 'Circle', id: string, key: CircleKey, name: string } | null | undefined, member: { __typename?: 'Member', id: string, name: string, trainerId?: string | null | undefined }, circle?: { __typename?: 'Circle', id: string, key: CircleKey, name: string } | null | undefined }>, kick: Array<{ __typename?: 'MonthCircle', state: MonthCircleState, kicked: boolean, invited: boolean, joined: boolean, id: string, year: number, month: number, currentCircle?: { __typename?: 'Circle', id: string, key: CircleKey, name: string } | null | undefined, member: { __typename?: 'Member', id: string, name: string, trainerId?: string | null | undefined }, circle?: { __typename?: 'Circle', id: string, key: CircleKey, name: string } | null | undefined }> } | null | undefined };

export type AdminTopQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminTopQuery = { __typename?: 'Query', thisMonth: { __typename?: 'Month', year: number, month: number, survey?: { __typename?: 'MonthSurvey', id: string, year: string, month: string, expiredAt: any } | null | undefined }, nextMonth: { __typename?: 'Month', year: number, month: number, survey?: { __typename?: 'MonthSurvey', id: string, year: string, month: string, expiredAt: any, answers: Array<{ __typename?: 'MonthCircle', id: string, year: number, month: number, member: { __typename?: 'Member', id: string, name: string, trainerId?: string | null | undefined }, circle?: { __typename?: 'Circle', id: string, key: CircleKey, name: string } | null | undefined }>, noAnswerMembers: Array<{ __typename?: 'Member', id: string, name: string }>, monthSurveyAnswers: Array<{ __typename?: 'MonthSurveyAnswer', id: string, year: string, month: string, circleKey: CircleKey, value?: MonthSurveyAnswerValue | null | undefined }> } | null | undefined }, siteMetadata: { __typename?: 'SiteMetadata', activeMembers: number }, signUps: Array<{ __typename?: 'SignUp', id: string, invited: boolean, joined: boolean, member: { __typename?: 'Member', id: string, name: string, trainerId?: string | null | undefined }, circle?: { __typename?: 'Circle', id: string, key: CircleKey, name: string } | null | undefined }> };

export type MemberMonthCirclesQueryVariables = Exact<{
  memberId: Scalars['String'];
}>;


export type MemberMonthCirclesQuery = { __typename?: 'Query', member?: { __typename?: 'Member', thisMonthCircle?: { __typename?: 'MonthCircle', id: string, year: number, month: number, circle?: { __typename?: 'Circle', id: string, key: CircleKey, name: string } | null | undefined } | null | undefined, nextMonthCircle?: { __typename?: 'MonthCircle', id: string, year: number, month: number, circle?: { __typename?: 'Circle', id: string, key: CircleKey, name: string } | null | undefined } | null | undefined } | null | undefined, circles: Array<{ __typename?: 'Circle', id: string, key: CircleKey, name: string }> };

export type MemberByPathnameQueryVariables = Exact<{
  pathname: Scalars['String'];
}>;


export type MemberByPathnameQuery = { __typename?: 'Query', member?: { __typename?: 'Member', id: string, pathname: string, name: string, trainerId?: string | null | undefined, setupCompleted: boolean, circleRole: CircleRole, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined } | null | undefined };

export type MonthCircleQueryVariables = Exact<{
  monthCircleId: Scalars['String'];
}>;


export type MonthCircleQuery = { __typename?: 'Query', monthCircle?: { __typename?: 'MonthCircle', id: string, year: number, month: number, member: { __typename?: 'Member', id: string, name: string }, circle?: { __typename?: 'Circle', id: string, key: CircleKey, name: string } | null | undefined } | null | undefined, circles: Array<{ __typename?: 'Circle', id: string, key: CircleKey, name: string }> };

export type NextMonthCirclesQueryVariables = Exact<{ [key: string]: never; }>;


export type NextMonthCirclesQuery = { __typename?: 'Query', nextMonth: { __typename?: 'Month', monthCircles: Array<{ __typename?: 'MonthCircle', state: MonthCircleState, kicked: boolean, invited: boolean, joined: boolean, id: string, year: number, month: number, member: { __typename?: 'Member', messageChannelId?: string | null | undefined, id: string, name: string, trainerId?: string | null | undefined }, currentCircle?: { __typename?: 'Circle', id: string, key: CircleKey, name: string } | null | undefined, circle?: { __typename?: 'Circle', id: string, key: CircleKey, name: string } | null | undefined }> } };

export type SetupQueryVariables = Exact<{
  pathname: Scalars['String'];
}>;


export type SetupQuery = { __typename?: 'Query', member?: { __typename?: 'Member', id: string, pathname: string, name: string, trainerId?: string | null | undefined, setupCompleted: boolean, circleRole: CircleRole, signUp?: { __typename?: 'SignUp', id: string, invited: boolean, joined: boolean, circle?: { __typename?: 'Circle', id: string, key: CircleKey, name: string } | null | undefined } | null | undefined, circle?: { __typename?: 'Circle', id: string, name: string } | null | undefined } | null | undefined, circles: Array<{ __typename?: 'Circle', id: string, key: CircleKey, name: string }> };

export const FullMemberFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FullMember"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Member"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"pathname"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"trainerId"}},{"kind":"Field","name":{"kind":"Name","value":"setupCompleted"}},{"kind":"Field","name":{"kind":"Name","value":"circle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"circleRole"}}]}}]} as unknown as DocumentNode<FullMemberFragment, unknown>;
export const MonthAndSurveyFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MonthAndSurvey"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Month"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"month"}},{"kind":"Field","name":{"kind":"Name","value":"survey"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"month"}},{"kind":"Field","name":{"kind":"Name","value":"expiredAt"}}]}}]}}]} as unknown as DocumentNode<MonthAndSurveyFragment, unknown>;
export const ListedCircleFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ListedCircle"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Circle"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]} as unknown as DocumentNode<ListedCircleFragment, unknown>;
export const MemberMonthCircleFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MemberMonthCircle"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MonthCircle"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"month"}},{"kind":"Field","name":{"kind":"Name","value":"circle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ListedCircle"}}]}}]}},...ListedCircleFragmentDoc.definitions]} as unknown as DocumentNode<MemberMonthCircleFragment, unknown>;
export const ListedMemberFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ListedMember"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Member"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"trainerId"}}]}}]} as unknown as DocumentNode<ListedMemberFragment, unknown>;
export const MonthAndSurveyWithMembersFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"MonthAndSurveyWithMembers"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Month"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"month"}},{"kind":"Field","name":{"kind":"Name","value":"survey"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"month"}},{"kind":"Field","name":{"kind":"Name","value":"expiredAt"}},{"kind":"Field","name":{"kind":"Name","value":"answers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MemberMonthCircle"}},{"kind":"Field","name":{"kind":"Name","value":"member"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ListedMember"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"noAnswerMembers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"monthSurveyAnswers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"month"}},{"kind":"Field","name":{"kind":"Name","value":"circleKey"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}},...MemberMonthCircleFragmentDoc.definitions,...ListedMemberFragmentDoc.definitions]} as unknown as DocumentNode<MonthAndSurveyWithMembersFragment, unknown>;
export const FullMonthCircleFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FullMonthCircle"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MonthCircle"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MemberMonthCircle"}},{"kind":"Field","name":{"kind":"Name","value":"currentCircle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ListedCircle"}}]}},{"kind":"Field","name":{"kind":"Name","value":"member"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ListedMember"}}]}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"kicked"}},{"kind":"Field","name":{"kind":"Name","value":"invited"}},{"kind":"Field","name":{"kind":"Name","value":"joined"}}]}},...MemberMonthCircleFragmentDoc.definitions,...ListedCircleFragmentDoc.definitions,...ListedMemberFragmentDoc.definitions]} as unknown as DocumentNode<FullMonthCircleFragment, unknown>;
export const ListedMonthSurveyAnswerFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ListedMonthSurveyAnswer"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MonthSurveyAnswer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"month"}},{"kind":"Field","name":{"kind":"Name","value":"circleKey"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]} as unknown as DocumentNode<ListedMonthSurveyAnswerFragment, unknown>;
export const ListedSignUpFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ListedSignUp"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SignUp"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"member"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ListedMember"}}]}},{"kind":"Field","name":{"kind":"Name","value":"circle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ListedCircle"}}]}},{"kind":"Field","name":{"kind":"Name","value":"invited"}},{"kind":"Field","name":{"kind":"Name","value":"joined"}}]}},...ListedMemberFragmentDoc.definitions,...ListedCircleFragmentDoc.definitions]} as unknown as DocumentNode<ListedSignUpFragment, unknown>;
export const CreateNextMonthCirclesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateNextMonthCircles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createNextMonthCircles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"month"}},{"kind":"Field","name":{"kind":"Name","value":"monthCircles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FullMonthCircle"}}]}}]}}]}},...FullMonthCircleFragmentDoc.definitions]} as unknown as DocumentNode<CreateNextMonthCirclesMutation, CreateNextMonthCirclesMutationVariables>;
export const CreateNextMonthSurveyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateNextMonthSurvey"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createNextMonthSurvey"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nextMonth"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MonthAndSurvey"}}]}}]}}]}},...MonthAndSurveyFragmentDoc.definitions]} as unknown as DocumentNode<CreateNextMonthSurveyMutation, CreateNextMonthSurveyMutationVariables>;
export const UpdateMemberMonthCircleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMemberMonthCircle"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"memberId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"year"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"month"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"circleId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMemberMonthCircle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"memberId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"memberId"}}},{"kind":"Argument","name":{"kind":"Name","value":"year"},"value":{"kind":"Variable","name":{"kind":"Name","value":"year"}}},{"kind":"Argument","name":{"kind":"Name","value":"month"},"value":{"kind":"Variable","name":{"kind":"Name","value":"month"}}},{"kind":"Argument","name":{"kind":"Name","value":"circleId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"circleId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"monthCircle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MemberMonthCircle"}}]}}]}}]}},...MemberMonthCircleFragmentDoc.definitions]} as unknown as DocumentNode<UpdateMemberMonthCircleMutation, UpdateMemberMonthCircleMutationVariables>;
export const UpdateMemberDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMember"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateMemberMutationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMember"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FullMember"}}]}}]}},...FullMemberFragmentDoc.definitions]} as unknown as DocumentNode<UpdateMemberMutation, UpdateMemberMutationVariables>;
export const UpdateMembersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMembers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMembers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"trainerId"}},{"kind":"Field","name":{"kind":"Name","value":"circle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ListedCircle"}}]}},{"kind":"Field","name":{"kind":"Name","value":"thisMonthCircle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MemberMonthCircle"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nextMonthCircle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MemberMonthCircle"}}]}}]}}]}},...ListedCircleFragmentDoc.definitions,...MemberMonthCircleFragmentDoc.definitions]} as unknown as DocumentNode<UpdateMembersMutation, UpdateMembersMutationVariables>;
export const UpdateMonthCircleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMonthCircle"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateMonthCircleMutationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMonthCircle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"monthCircle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MemberMonthCircle"}},{"kind":"Field","name":{"kind":"Name","value":"currentCircle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"member"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ListedMember"}},{"kind":"Field","name":{"kind":"Name","value":"circle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"kicked"}},{"kind":"Field","name":{"kind":"Name","value":"invited"}},{"kind":"Field","name":{"kind":"Name","value":"joined"}}]}}]}}]}},...MemberMonthCircleFragmentDoc.definitions,...ListedMemberFragmentDoc.definitions]} as unknown as DocumentNode<UpdateMonthCircleMutation, UpdateMonthCircleMutationVariables>;
export const UpdateSetupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateSetup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"memberId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"circleKey"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CircleKey"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"trainerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateSignUp"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"memberId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"memberId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"circleKey"},"value":{"kind":"Variable","name":{"kind":"Name","value":"circleKey"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ListedSignUp"}}]}},{"kind":"Field","name":{"kind":"Name","value":"updateMember"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"memberId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"trainerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"trainerId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"setupCompleted"},"value":{"kind":"BooleanValue","value":true}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FullMember"}}]}}]}},...ListedSignUpFragmentDoc.definitions,...FullMemberFragmentDoc.definitions]} as unknown as DocumentNode<UpdateSetupMutation, UpdateSetupMutationVariables>;
export const UpdateSignUpDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateSignUp"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"memberId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"invited"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"joined"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateSignUp"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"memberId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"memberId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"invited"},"value":{"kind":"Variable","name":{"kind":"Name","value":"invited"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"joined"},"value":{"kind":"Variable","name":{"kind":"Name","value":"joined"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ListedSignUp"}}]}}]}},...ListedSignUpFragmentDoc.definitions]} as unknown as DocumentNode<UpdateSignUpMutation, UpdateSignUpMutationVariables>;
export const AdminCirclesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminCircles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"circles"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"EnumValue","value":"CircleSelect"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ListedCircle"}}]}}]}},...ListedCircleFragmentDoc.definitions]} as unknown as DocumentNode<AdminCirclesQuery, AdminCirclesQueryVariables>;
export const AdminMembersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminMembers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"pathname"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"trainerId"}},{"kind":"Field","name":{"kind":"Name","value":"circle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"circleRole"}},{"kind":"Field","name":{"kind":"Name","value":"thisMonthCircle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MemberMonthCircle"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nextMonthCircle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MemberMonthCircle"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nextMonthSurveyAnswer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ListedMonthSurveyAnswer"}}]}}]}}]}},...MemberMonthCircleFragmentDoc.definitions,...ListedMonthSurveyAnswerFragmentDoc.definitions]} as unknown as DocumentNode<AdminMembersQuery, AdminMembersQueryVariables>;
export const MonthSurveyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MonthSurvey"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"year"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"month"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"monthSurvey"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"year"},"value":{"kind":"Variable","name":{"kind":"Name","value":"year"}}},{"kind":"Argument","name":{"kind":"Name","value":"month"},"value":{"kind":"Variable","name":{"kind":"Name","value":"month"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"month"}},{"kind":"Field","name":{"kind":"Name","value":"expiredAt"}},{"kind":"Field","name":{"kind":"Name","value":"move"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FullMonthCircle"}}]}},{"kind":"Field","name":{"kind":"Name","value":"leave"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FullMonthCircle"}}]}},{"kind":"Field","name":{"kind":"Name","value":"kick"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FullMonthCircle"}}]}}]}}]}},...FullMonthCircleFragmentDoc.definitions]} as unknown as DocumentNode<MonthSurveyQuery, MonthSurveyQueryVariables>;
export const AdminTopDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminTop"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"thisMonth"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MonthAndSurvey"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nextMonth"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MonthAndSurveyWithMembers"}}]}},{"kind":"Field","name":{"kind":"Name","value":"siteMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activeMembers"}}]}},{"kind":"Field","name":{"kind":"Name","value":"signUps"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ListedSignUp"}}]}}]}},...MonthAndSurveyFragmentDoc.definitions,...MonthAndSurveyWithMembersFragmentDoc.definitions,...ListedSignUpFragmentDoc.definitions]} as unknown as DocumentNode<AdminTopQuery, AdminTopQueryVariables>;
export const MemberMonthCirclesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MemberMonthCircles"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"memberId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"member"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"memberId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"thisMonthCircle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MemberMonthCircle"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nextMonthCircle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MemberMonthCircle"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"circles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ListedCircle"}}]}}]}},...MemberMonthCircleFragmentDoc.definitions,...ListedCircleFragmentDoc.definitions]} as unknown as DocumentNode<MemberMonthCirclesQuery, MemberMonthCirclesQueryVariables>;
export const MemberByPathnameDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MemberByPathname"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pathname"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"member"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pathname"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pathname"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FullMember"}}]}}]}},...FullMemberFragmentDoc.definitions]} as unknown as DocumentNode<MemberByPathnameQuery, MemberByPathnameQueryVariables>;
export const MonthCircleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MonthCircle"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"monthCircleId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"monthCircle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"monthCircleId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"monthCircleId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"MemberMonthCircle"}},{"kind":"Field","name":{"kind":"Name","value":"member"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"circles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ListedCircle"}}]}}]}},...MemberMonthCircleFragmentDoc.definitions,...ListedCircleFragmentDoc.definitions]} as unknown as DocumentNode<MonthCircleQuery, MonthCircleQueryVariables>;
export const NextMonthCirclesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"NextMonthCircles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nextMonth"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"monthCircles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FullMonthCircle"}},{"kind":"Field","name":{"kind":"Name","value":"member"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"messageChannelId"}}]}}]}}]}}]}},...FullMonthCircleFragmentDoc.definitions]} as unknown as DocumentNode<NextMonthCirclesQuery, NextMonthCirclesQueryVariables>;
export const SetupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Setup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pathname"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"member"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pathname"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pathname"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FullMember"}},{"kind":"Field","name":{"kind":"Name","value":"signUp"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"circle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ListedCircle"}}]}},{"kind":"Field","name":{"kind":"Name","value":"invited"}},{"kind":"Field","name":{"kind":"Name","value":"joined"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"circles"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"EnumValue","value":"CircleSelect"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ListedCircle"}}]}}]}},...FullMemberFragmentDoc.definitions,...ListedCircleFragmentDoc.definitions]} as unknown as DocumentNode<SetupQuery, SetupQueryVariables>;