/**
 * This file was generated by Nexus Schema
 * Do not make changes to this file directly
 */


import type { Context } from "./../context"
import type { LocalDate } from "@js-joda/core"
import type { core } from "nexus"
declare global {
  interface NexusGenCustomInputMethods<TypeName extends string> {
    /**
     * ISO8601 Date string
     */
    date<FieldName extends string>(fieldName: FieldName, opts?: core.CommonInputFieldConfig<TypeName, FieldName>): void // "Date";
    /**
     * The `BigInt` scalar type represents non-fractional signed whole numeric values.
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt
     */
    bigInt<FieldName extends string>(fieldName: FieldName, opts?: core.CommonInputFieldConfig<TypeName, FieldName>): void // "BigInt";
    /**
     * The `Byte` scalar type represents byte value as a Buffer
     */
    bytes<FieldName extends string>(fieldName: FieldName, opts?: core.CommonInputFieldConfig<TypeName, FieldName>): void // "Bytes";
    /**
     * A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar.
     */
    dateTime<FieldName extends string>(fieldName: FieldName, opts?: core.CommonInputFieldConfig<TypeName, FieldName>): void // "DateTime";
    /**
     * An arbitrary-precision Decimal type
     */
    decimal<FieldName extends string>(fieldName: FieldName, opts?: core.CommonInputFieldConfig<TypeName, FieldName>): void // "Decimal";
    /**
     * The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf).
     */
    json<FieldName extends string>(fieldName: FieldName, opts?: core.CommonInputFieldConfig<TypeName, FieldName>): void // "Json";
  }
}
declare global {
  interface NexusGenCustomOutputMethods<TypeName extends string> {
    /**
     * ISO8601 Date string
     */
    date<FieldName extends string>(fieldName: FieldName, ...opts: core.ScalarOutSpread<TypeName, FieldName>): void // "Date";
    /**
     * The `BigInt` scalar type represents non-fractional signed whole numeric values.
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt
     */
    bigInt<FieldName extends string>(fieldName: FieldName, ...opts: core.ScalarOutSpread<TypeName, FieldName>): void // "BigInt";
    /**
     * The `Byte` scalar type represents byte value as a Buffer
     */
    bytes<FieldName extends string>(fieldName: FieldName, ...opts: core.ScalarOutSpread<TypeName, FieldName>): void // "Bytes";
    /**
     * A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar.
     */
    dateTime<FieldName extends string>(fieldName: FieldName, ...opts: core.ScalarOutSpread<TypeName, FieldName>): void // "DateTime";
    /**
     * An arbitrary-precision Decimal type
     */
    decimal<FieldName extends string>(fieldName: FieldName, ...opts: core.ScalarOutSpread<TypeName, FieldName>): void // "Decimal";
    /**
     * The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf).
     */
    json<FieldName extends string>(fieldName: FieldName, ...opts: core.ScalarOutSpread<TypeName, FieldName>): void // "Json";
  }
}


declare global {
  interface NexusGen extends NexusGenTypes {}
}

export interface NexusGenInputs {
  UpdateMemberMonthCircleMutationInput: { // input type
    locked?: boolean | null; // Boolean
    memberId: string; // String!
    month: number; // Int!
    state?: NexusGenEnums['MonthCircleState'] | null; // MonthCircleState
    year: number; // Int!
  }
  UpdateMemberMutationInput: { // input type
    id: string; // String!
    name?: string | null; // String
    setupCompleted?: boolean | null; // Boolean
    trainerId?: string | null; // String
  }
  UpdateMonthCircleMutationInput: { // input type
    id: string; // String!
    invited?: boolean | null; // Boolean
    joined?: boolean | null; // Boolean
    kicked?: boolean | null; // Boolean
  }
  UpdateSignUpMutationInput: { // input type
    circleKey?: NexusGenEnums['CircleKey'] | null; // CircleKey
    invited?: boolean | null; // Boolean
    joined?: boolean | null; // Boolean
    memberId: string; // String!
  }
}

export interface NexusGenEnums {
  CircleKey: "Ha" | "Jo" | "Saikyo" | "Shin"
  CircleRole: "Leader" | "Member" | "SubLeader"
  MemberStatus: "Joined" | "Kicked" | "Leaved" | "NotJoined" | "OB"
  MonthCircleState: "Ha" | "Jo" | "Kicked" | "Leaved" | "OB" | "Saikyo" | "Shin"
  MonthSurveyAnswerValue: "Leave" | "None" | "Ob" | "Saikyo" | "Umamusume"
}

export interface NexusGenScalars {
  String: string
  Int: number
  Float: number
  Boolean: boolean
  ID: string
  BigInt: any
  Bytes: any
  Date: LocalDate
  DateTime: any
  Decimal: any
  Json: any
}

export interface NexusGenObjects {
  Circle: { // root type
    id: string; // ID!
    key: NexusGenEnums['CircleKey']; // CircleKey!
    name: string; // String!
  }
  CreateMonthCirclesPayload: { // root type
    month: number; // Int!
    monthCircles: NexusGenRootTypes['MonthCircle'][]; // [MonthCircle!]!
    year: number; // Int!
  }
  CreateNextMonthSurveyPayload: { // root type
    nextMonth: NexusGenRootTypes['Month']; // Month!
  }
  Member: { // root type
    circleKey?: NexusGenEnums['CircleKey'] | null; // CircleKey
    circleRole: NexusGenEnums['CircleRole']; // CircleRole!
    id: string; // ID!
    joinedAt: NexusGenScalars['DateTime']; // DateTime!
    leavedAt?: NexusGenScalars['DateTime'] | null; // DateTime
    messageChannelId?: string | null; // String
    name: string; // String!
    pathname: string; // String!
    setupCompleted: boolean; // Boolean!
    status: NexusGenEnums['MemberStatus']; // MemberStatus!
    trainerId?: string | null; // String
  }
  MemberFanCount: { // root type
    avg: NexusGenScalars['BigInt']; // BigInt!
    circle: NexusGenEnums['CircleKey']; // CircleKey!
    id: string; // ID!
    name: string; // String!
    predicted: NexusGenScalars['BigInt']; // BigInt!
    total: NexusGenScalars['BigInt']; // BigInt!
  }
  Month: { // root type
    month: number; // Int!
    year: number; // Int!
  }
  MonthCircle: { // root type
    currentCircleKey?: NexusGenEnums['CircleKey'] | null; // CircleKey
    id: string; // ID!
    invited: boolean; // Boolean!
    joined: boolean; // Boolean!
    kicked: boolean; // Boolean!
    locked: boolean; // Boolean!
    month: number; // Int!
    state: NexusGenEnums['MonthCircleState']; // MonthCircleState!
    year: number; // Int!
  }
  MonthSurvey: { // root type
    expiredAt: NexusGenScalars['DateTime']; // DateTime!
    id: string; // ID!
    month: number; // Int!
    year: number; // Int!
  }
  MonthSurveyAnswer: { // root type
    circleKey: NexusGenEnums['CircleKey']; // CircleKey!
    id: string; // ID!
    month: number; // Int!
    value?: NexusGenEnums['MonthSurveyAnswerValue'] | null; // MonthSurveyAnswerValue
    year: number; // Int!
  }
  Mutation: {};
  Query: {};
  Ranking: { // root type
    date: NexusGenScalars['Date']; // Date!
  }
  SignUp: { // root type
    circleKey?: NexusGenEnums['CircleKey'] | null; // CircleKey
    id: string; // ID!
    invited: boolean; // Boolean!
    joined: boolean; // Boolean!
  }
  SiteMetadata: {};
  UpdateMemberMonthCirclePayload: { // root type
    monthCircle: NexusGenRootTypes['MonthCircle']; // MonthCircle!
  }
}

export interface NexusGenInterfaces {
}

export interface NexusGenUnions {
}

export type NexusGenRootTypes = NexusGenObjects

export type NexusGenAllTypes = NexusGenRootTypes & NexusGenScalars & NexusGenEnums

export interface NexusGenFieldTypes {
  Circle: { // field return type
    id: string; // ID!
    key: NexusGenEnums['CircleKey']; // CircleKey!
    name: string; // String!
  }
  CreateMonthCirclesPayload: { // field return type
    month: number; // Int!
    monthCircles: NexusGenRootTypes['MonthCircle'][]; // [MonthCircle!]!
    year: number; // Int!
  }
  CreateNextMonthSurveyPayload: { // field return type
    nextMonth: NexusGenRootTypes['Month']; // Month!
  }
  Member: { // field return type
    circle: NexusGenRootTypes['Circle'] | null; // Circle
    circleKey: NexusGenEnums['CircleKey'] | null; // CircleKey
    circleRole: NexusGenEnums['CircleRole']; // CircleRole!
    id: string; // ID!
    joinedAt: NexusGenScalars['DateTime']; // DateTime!
    leavedAt: NexusGenScalars['DateTime'] | null; // DateTime
    messageChannelId: string | null; // String
    monthCircle: NexusGenRootTypes['MonthCircle'] | null; // MonthCircle
    name: string; // String!
    nextMonthCircle: NexusGenRootTypes['MonthCircle'] | null; // MonthCircle
    nextMonthSurveyAnswer: NexusGenRootTypes['MonthSurveyAnswer'] | null; // MonthSurveyAnswer
    pathname: string; // String!
    setupCompleted: boolean; // Boolean!
    signUp: NexusGenRootTypes['SignUp'] | null; // SignUp
    status: NexusGenEnums['MemberStatus']; // MemberStatus!
    thisMonthCircle: NexusGenRootTypes['MonthCircle'] | null; // MonthCircle
    trainerId: string | null; // String
  }
  MemberFanCount: { // field return type
    avg: NexusGenScalars['BigInt']; // BigInt!
    circle: NexusGenEnums['CircleKey']; // CircleKey!
    id: string; // ID!
    member: NexusGenRootTypes['Member'] | null; // Member
    name: string; // String!
    predicted: NexusGenScalars['BigInt']; // BigInt!
    total: NexusGenScalars['BigInt']; // BigInt!
  }
  Month: { // field return type
    month: number; // Int!
    monthCircles: NexusGenRootTypes['MonthCircle'][]; // [MonthCircle!]!
    survey: NexusGenRootTypes['MonthSurvey'] | null; // MonthSurvey
    year: number; // Int!
  }
  MonthCircle: { // field return type
    circle: NexusGenRootTypes['Circle'] | null; // Circle
    currentCircle: NexusGenRootTypes['Circle'] | null; // Circle
    currentCircleKey: NexusGenEnums['CircleKey'] | null; // CircleKey
    id: string; // ID!
    invited: boolean; // Boolean!
    joined: boolean; // Boolean!
    kicked: boolean; // Boolean!
    locked: boolean; // Boolean!
    member: NexusGenRootTypes['Member']; // Member!
    month: number; // Int!
    state: NexusGenEnums['MonthCircleState']; // MonthCircleState!
    year: number; // Int!
  }
  MonthSurvey: { // field return type
    answers: NexusGenRootTypes['MonthCircle'][]; // [MonthCircle!]!
    expiredAt: NexusGenScalars['DateTime']; // DateTime!
    id: string; // ID!
    kick: NexusGenRootTypes['MonthCircle'][]; // [MonthCircle!]!
    leave: NexusGenRootTypes['MonthCircle'][]; // [MonthCircle!]!
    month: number; // Int!
    monthSurveyAnswers: NexusGenRootTypes['MonthSurveyAnswer'][]; // [MonthSurveyAnswer!]!
    move: NexusGenRootTypes['MonthCircle'][]; // [MonthCircle!]!
    noAnswerMembers: NexusGenRootTypes['Member'][]; // [Member!]!
    year: number; // Int!
  }
  MonthSurveyAnswer: { // field return type
    circleKey: NexusGenEnums['CircleKey']; // CircleKey!
    id: string; // ID!
    member: NexusGenRootTypes['Member']; // Member!
    month: number; // Int!
    value: NexusGenEnums['MonthSurveyAnswerValue'] | null; // MonthSurveyAnswerValue
    year: number; // Int!
  }
  Mutation: { // field return type
    createNextMonthCircles: NexusGenRootTypes['CreateMonthCirclesPayload']; // CreateMonthCirclesPayload!
    createNextMonthSurvey: NexusGenRootTypes['CreateNextMonthSurveyPayload'] | null; // CreateNextMonthSurveyPayload
    updateMember: NexusGenRootTypes['Member']; // Member!
    updateMemberMonthCircle: NexusGenRootTypes['UpdateMemberMonthCirclePayload'] | null; // UpdateMemberMonthCirclePayload
    updateMembers: NexusGenRootTypes['Member'][]; // [Member!]!
    updateMonthCircle: NexusGenRootTypes['UpdateMemberMonthCirclePayload'] | null; // UpdateMemberMonthCirclePayload
    updateSignUp: NexusGenRootTypes['SignUp']; // SignUp!
  }
  Query: { // field return type
    circles: NexusGenRootTypes['Circle'][]; // [Circle!]!
    member: NexusGenRootTypes['Member'] | null; // Member
    members: NexusGenRootTypes['Member'][]; // [Member!]!
    monthCircle: NexusGenRootTypes['MonthCircle'] | null; // MonthCircle
    monthSurvey: NexusGenRootTypes['MonthSurvey'] | null; // MonthSurvey
    nextMonth: NexusGenRootTypes['Month']; // Month!
    signUps: NexusGenRootTypes['SignUp'][]; // [SignUp!]!
    siteMetadata: NexusGenRootTypes['SiteMetadata']; // SiteMetadata!
    thisMonth: NexusGenRootTypes['Month']; // Month!
  }
  Ranking: { // field return type
    date: NexusGenScalars['Date']; // Date!
    fanCounts: NexusGenRootTypes['MemberFanCount'][]; // [MemberFanCount!]!
  }
  SignUp: { // field return type
    circle: NexusGenRootTypes['Circle'] | null; // Circle
    circleKey: NexusGenEnums['CircleKey'] | null; // CircleKey
    id: string; // ID!
    invited: boolean; // Boolean!
    joined: boolean; // Boolean!
    member: NexusGenRootTypes['Member']; // Member!
  }
  SiteMetadata: { // field return type
    activeMembers: number; // Int!
    maxMembers: number; // Int!
    totalMembers: number; // Int!
  }
  UpdateMemberMonthCirclePayload: { // field return type
    monthCircle: NexusGenRootTypes['MonthCircle']; // MonthCircle!
  }
}

export interface NexusGenFieldTypeNames {
  Circle: { // field return type name
    id: 'ID'
    key: 'CircleKey'
    name: 'String'
  }
  CreateMonthCirclesPayload: { // field return type name
    month: 'Int'
    monthCircles: 'MonthCircle'
    year: 'Int'
  }
  CreateNextMonthSurveyPayload: { // field return type name
    nextMonth: 'Month'
  }
  Member: { // field return type name
    circle: 'Circle'
    circleKey: 'CircleKey'
    circleRole: 'CircleRole'
    id: 'ID'
    joinedAt: 'DateTime'
    leavedAt: 'DateTime'
    messageChannelId: 'String'
    monthCircle: 'MonthCircle'
    name: 'String'
    nextMonthCircle: 'MonthCircle'
    nextMonthSurveyAnswer: 'MonthSurveyAnswer'
    pathname: 'String'
    setupCompleted: 'Boolean'
    signUp: 'SignUp'
    status: 'MemberStatus'
    thisMonthCircle: 'MonthCircle'
    trainerId: 'String'
  }
  MemberFanCount: { // field return type name
    avg: 'BigInt'
    circle: 'CircleKey'
    id: 'ID'
    member: 'Member'
    name: 'String'
    predicted: 'BigInt'
    total: 'BigInt'
  }
  Month: { // field return type name
    month: 'Int'
    monthCircles: 'MonthCircle'
    survey: 'MonthSurvey'
    year: 'Int'
  }
  MonthCircle: { // field return type name
    circle: 'Circle'
    currentCircle: 'Circle'
    currentCircleKey: 'CircleKey'
    id: 'ID'
    invited: 'Boolean'
    joined: 'Boolean'
    kicked: 'Boolean'
    locked: 'Boolean'
    member: 'Member'
    month: 'Int'
    state: 'MonthCircleState'
    year: 'Int'
  }
  MonthSurvey: { // field return type name
    answers: 'MonthCircle'
    expiredAt: 'DateTime'
    id: 'ID'
    kick: 'MonthCircle'
    leave: 'MonthCircle'
    month: 'Int'
    monthSurveyAnswers: 'MonthSurveyAnswer'
    move: 'MonthCircle'
    noAnswerMembers: 'Member'
    year: 'Int'
  }
  MonthSurveyAnswer: { // field return type name
    circleKey: 'CircleKey'
    id: 'ID'
    member: 'Member'
    month: 'Int'
    value: 'MonthSurveyAnswerValue'
    year: 'Int'
  }
  Mutation: { // field return type name
    createNextMonthCircles: 'CreateMonthCirclesPayload'
    createNextMonthSurvey: 'CreateNextMonthSurveyPayload'
    updateMember: 'Member'
    updateMemberMonthCircle: 'UpdateMemberMonthCirclePayload'
    updateMembers: 'Member'
    updateMonthCircle: 'UpdateMemberMonthCirclePayload'
    updateSignUp: 'SignUp'
  }
  Query: { // field return type name
    circles: 'Circle'
    member: 'Member'
    members: 'Member'
    monthCircle: 'MonthCircle'
    monthSurvey: 'MonthSurvey'
    nextMonth: 'Month'
    signUps: 'SignUp'
    siteMetadata: 'SiteMetadata'
    thisMonth: 'Month'
  }
  Ranking: { // field return type name
    date: 'Date'
    fanCounts: 'MemberFanCount'
  }
  SignUp: { // field return type name
    circle: 'Circle'
    circleKey: 'CircleKey'
    id: 'ID'
    invited: 'Boolean'
    joined: 'Boolean'
    member: 'Member'
  }
  SiteMetadata: { // field return type name
    activeMembers: 'Int'
    maxMembers: 'Int'
    totalMembers: 'Int'
  }
  UpdateMemberMonthCirclePayload: { // field return type name
    monthCircle: 'MonthCircle'
  }
}

export interface NexusGenArgTypes {
  Member: {
    monthCircle: { // args
      month: number; // Int!
      year: number; // Int!
    }
  }
  Mutation: {
    createNextMonthCircles: { // args
      withoutNewMembers: boolean; // Boolean!
    }
    updateMember: { // args
      input: NexusGenInputs['UpdateMemberMutationInput']; // UpdateMemberMutationInput!
    }
    updateMemberMonthCircle: { // args
      input: NexusGenInputs['UpdateMemberMonthCircleMutationInput']; // UpdateMemberMonthCircleMutationInput!
    }
    updateMonthCircle: { // args
      data: NexusGenInputs['UpdateMonthCircleMutationInput']; // UpdateMonthCircleMutationInput!
    }
    updateSignUp: { // args
      input: NexusGenInputs['UpdateSignUpMutationInput']; // UpdateSignUpMutationInput!
    }
  }
  Query: {
    member: { // args
      id?: string | null; // String
      pathname?: string | null; // String
    }
    monthCircle: { // args
      monthCircleId: string; // String!
    }
    monthSurvey: { // args
      month: number; // Int!
      year: number; // Int!
    }
  }
}

export interface NexusGenAbstractTypeMembers {
}

export interface NexusGenTypeInterfaces {
}

export type NexusGenObjectNames = keyof NexusGenObjects;

export type NexusGenInputNames = keyof NexusGenInputs;

export type NexusGenEnumNames = keyof NexusGenEnums;

export type NexusGenInterfaceNames = never;

export type NexusGenScalarNames = keyof NexusGenScalars;

export type NexusGenUnionNames = never;

export type NexusGenObjectsUsingAbstractStrategyIsTypeOf = never;

export type NexusGenAbstractsUsingStrategyResolveType = never;

export type NexusGenFeaturesConfig = {
  abstractTypeStrategies: {
    isTypeOf: false
    resolveType: true
    __typename: false
  }
}

export interface NexusGenTypes {
  context: Context;
  inputTypes: NexusGenInputs;
  rootTypes: NexusGenRootTypes;
  inputTypeShapes: NexusGenInputs & NexusGenEnums & NexusGenScalars;
  argTypes: NexusGenArgTypes;
  fieldTypes: NexusGenFieldTypes;
  fieldTypeNames: NexusGenFieldTypeNames;
  allTypes: NexusGenAllTypes;
  typeInterfaces: NexusGenTypeInterfaces;
  objectNames: NexusGenObjectNames;
  inputNames: NexusGenInputNames;
  enumNames: NexusGenEnumNames;
  interfaceNames: NexusGenInterfaceNames;
  scalarNames: NexusGenScalarNames;
  unionNames: NexusGenUnionNames;
  allInputTypes: NexusGenTypes['inputNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['scalarNames'];
  allOutputTypes: NexusGenTypes['objectNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['unionNames'] | NexusGenTypes['interfaceNames'] | NexusGenTypes['scalarNames'];
  allNamedTypes: NexusGenTypes['allInputTypes'] | NexusGenTypes['allOutputTypes']
  abstractTypes: NexusGenTypes['interfaceNames'] | NexusGenTypes['unionNames'];
  abstractTypeMembers: NexusGenAbstractTypeMembers;
  objectsUsingAbstractStrategyIsTypeOf: NexusGenObjectsUsingAbstractStrategyIsTypeOf;
  abstractsUsingStrategyResolveType: NexusGenAbstractsUsingStrategyResolveType;
  features: NexusGenFeaturesConfig;
}


declare global {
  interface NexusGenPluginTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginInputTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginInputFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginSchemaConfig {
  }
  interface NexusGenPluginArgConfig {
  }
}