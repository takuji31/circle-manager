import * as Types from './graphql';

import * as Operations from './graphql';
import { NextPage } from 'next';
import { NextRouter, useRouter } from 'next/router'
import { QueryHookOptions, useQuery } from '@apollo/client';
import * as Apollo from '@apollo/client';
import type React from 'react';
import { getApolloClient , Context} from '../apollo';






export async function getServerPageAdminMembers
    (options: Omit<Apollo.QueryOptions<Types.AdminMembersQueryVariables>, 'query'>, ctx?: Context ){
        const apolloClient = getApolloClient(ctx);
        
        const data = await apolloClient.query<Types.AdminMembersQuery>({ ...options, query: Operations.AdminMembersDocument });
        
        const apolloState = apolloClient.cache.extract();

        return {
            props: {
                apolloState: apolloState,
                data: data?.data,
                error: data?.error ?? data?.errors ?? null,
            },
        };
      }
export const useAdminMembers = (
  optionsFunc?: (router: NextRouter)=> QueryHookOptions<Types.AdminMembersQuery, Types.AdminMembersQueryVariables>) => {
  const router = useRouter();
  const options = optionsFunc ? optionsFunc(router) : {};
  return useQuery(Operations.AdminMembersDocument, options);
};
export type PageAdminMembersComp = React.FC<{data?: Types.AdminMembersQuery, error?: Apollo.ApolloError}>;
export const withPageAdminMembers = (optionsFunc?: (router: NextRouter)=> QueryHookOptions<Types.AdminMembersQuery, Types.AdminMembersQueryVariables>) => (WrappedComponent:PageAdminMembersComp) : NextPage  => (props) => {
                const router = useRouter()
                const options = optionsFunc ? optionsFunc(router) : {};
                const {data, error } = useQuery(Operations.AdminMembersDocument, options)    
                return <WrappedComponent {...props} data={data} error={error} /> ;
                   
            }; 
export const ssrAdminMembers = {
      getServerPage: getServerPageAdminMembers,
      withPage: withPageAdminMembers,
      usePage: useAdminMembers,
    }
export async function getServerPageMonthSurvey
    (options: Omit<Apollo.QueryOptions<Types.MonthSurveyQueryVariables>, 'query'>, ctx?: Context ){
        const apolloClient = getApolloClient(ctx);
        
        const data = await apolloClient.query<Types.MonthSurveyQuery>({ ...options, query: Operations.MonthSurveyDocument });
        
        const apolloState = apolloClient.cache.extract();

        return {
            props: {
                apolloState: apolloState,
                data: data?.data,
                error: data?.error ?? data?.errors ?? null,
            },
        };
      }
export const useMonthSurvey = (
  optionsFunc?: (router: NextRouter)=> QueryHookOptions<Types.MonthSurveyQuery, Types.MonthSurveyQueryVariables>) => {
  const router = useRouter();
  const options = optionsFunc ? optionsFunc(router) : {};
  return useQuery(Operations.MonthSurveyDocument, options);
};
export type PageMonthSurveyComp = React.FC<{data?: Types.MonthSurveyQuery, error?: Apollo.ApolloError}>;
export const withPageMonthSurvey = (optionsFunc?: (router: NextRouter)=> QueryHookOptions<Types.MonthSurveyQuery, Types.MonthSurveyQueryVariables>) => (WrappedComponent:PageMonthSurveyComp) : NextPage  => (props) => {
                const router = useRouter()
                const options = optionsFunc ? optionsFunc(router) : {};
                const {data, error } = useQuery(Operations.MonthSurveyDocument, options)    
                return <WrappedComponent {...props} data={data} error={error} /> ;
                   
            }; 
export const ssrMonthSurvey = {
      getServerPage: getServerPageMonthSurvey,
      withPage: withPageMonthSurvey,
      usePage: useMonthSurvey,
    }
export async function getServerPageAdminTop
    (options: Omit<Apollo.QueryOptions<Types.AdminTopQueryVariables>, 'query'>, ctx?: Context ){
        const apolloClient = getApolloClient(ctx);
        
        const data = await apolloClient.query<Types.AdminTopQuery>({ ...options, query: Operations.AdminTopDocument });
        
        const apolloState = apolloClient.cache.extract();

        return {
            props: {
                apolloState: apolloState,
                data: data?.data,
                error: data?.error ?? data?.errors ?? null,
            },
        };
      }
export const useAdminTop = (
  optionsFunc?: (router: NextRouter)=> QueryHookOptions<Types.AdminTopQuery, Types.AdminTopQueryVariables>) => {
  const router = useRouter();
  const options = optionsFunc ? optionsFunc(router) : {};
  return useQuery(Operations.AdminTopDocument, options);
};
export type PageAdminTopComp = React.FC<{data?: Types.AdminTopQuery, error?: Apollo.ApolloError}>;
export const withPageAdminTop = (optionsFunc?: (router: NextRouter)=> QueryHookOptions<Types.AdminTopQuery, Types.AdminTopQueryVariables>) => (WrappedComponent:PageAdminTopComp) : NextPage  => (props) => {
                const router = useRouter()
                const options = optionsFunc ? optionsFunc(router) : {};
                const {data, error } = useQuery(Operations.AdminTopDocument, options)    
                return <WrappedComponent {...props} data={data} error={error} /> ;
                   
            }; 
export const ssrAdminTop = {
      getServerPage: getServerPageAdminTop,
      withPage: withPageAdminTop,
      usePage: useAdminTop,
    }
export async function getServerPageMemberMonthCircles
    (options: Omit<Apollo.QueryOptions<Types.MemberMonthCirclesQueryVariables>, 'query'>, ctx?: Context ){
        const apolloClient = getApolloClient(ctx);
        
        const data = await apolloClient.query<Types.MemberMonthCirclesQuery>({ ...options, query: Operations.MemberMonthCirclesDocument });
        
        const apolloState = apolloClient.cache.extract();

        return {
            props: {
                apolloState: apolloState,
                data: data?.data,
                error: data?.error ?? data?.errors ?? null,
            },
        };
      }
export const useMemberMonthCircles = (
  optionsFunc?: (router: NextRouter)=> QueryHookOptions<Types.MemberMonthCirclesQuery, Types.MemberMonthCirclesQueryVariables>) => {
  const router = useRouter();
  const options = optionsFunc ? optionsFunc(router) : {};
  return useQuery(Operations.MemberMonthCirclesDocument, options);
};
export type PageMemberMonthCirclesComp = React.FC<{data?: Types.MemberMonthCirclesQuery, error?: Apollo.ApolloError}>;
export const withPageMemberMonthCircles = (optionsFunc?: (router: NextRouter)=> QueryHookOptions<Types.MemberMonthCirclesQuery, Types.MemberMonthCirclesQueryVariables>) => (WrappedComponent:PageMemberMonthCirclesComp) : NextPage  => (props) => {
                const router = useRouter()
                const options = optionsFunc ? optionsFunc(router) : {};
                const {data, error } = useQuery(Operations.MemberMonthCirclesDocument, options)    
                return <WrappedComponent {...props} data={data} error={error} /> ;
                   
            }; 
export const ssrMemberMonthCircles = {
      getServerPage: getServerPageMemberMonthCircles,
      withPage: withPageMemberMonthCircles,
      usePage: useMemberMonthCircles,
    }
export async function getServerPageMemberByPathname
    (options: Omit<Apollo.QueryOptions<Types.MemberByPathnameQueryVariables>, 'query'>, ctx?: Context ){
        const apolloClient = getApolloClient(ctx);
        
        const data = await apolloClient.query<Types.MemberByPathnameQuery>({ ...options, query: Operations.MemberByPathnameDocument });
        
        const apolloState = apolloClient.cache.extract();

        return {
            props: {
                apolloState: apolloState,
                data: data?.data,
                error: data?.error ?? data?.errors ?? null,
            },
        };
      }
export const useMemberByPathname = (
  optionsFunc?: (router: NextRouter)=> QueryHookOptions<Types.MemberByPathnameQuery, Types.MemberByPathnameQueryVariables>) => {
  const router = useRouter();
  const options = optionsFunc ? optionsFunc(router) : {};
  return useQuery(Operations.MemberByPathnameDocument, options);
};
export type PageMemberByPathnameComp = React.FC<{data?: Types.MemberByPathnameQuery, error?: Apollo.ApolloError}>;
export const withPageMemberByPathname = (optionsFunc?: (router: NextRouter)=> QueryHookOptions<Types.MemberByPathnameQuery, Types.MemberByPathnameQueryVariables>) => (WrappedComponent:PageMemberByPathnameComp) : NextPage  => (props) => {
                const router = useRouter()
                const options = optionsFunc ? optionsFunc(router) : {};
                const {data, error } = useQuery(Operations.MemberByPathnameDocument, options)    
                return <WrappedComponent {...props} data={data} error={error} /> ;
                   
            }; 
export const ssrMemberByPathname = {
      getServerPage: getServerPageMemberByPathname,
      withPage: withPageMemberByPathname,
      usePage: useMemberByPathname,
    }
export async function getServerPageMonthCircle
    (options: Omit<Apollo.QueryOptions<Types.MonthCircleQueryVariables>, 'query'>, ctx?: Context ){
        const apolloClient = getApolloClient(ctx);
        
        const data = await apolloClient.query<Types.MonthCircleQuery>({ ...options, query: Operations.MonthCircleDocument });
        
        const apolloState = apolloClient.cache.extract();

        return {
            props: {
                apolloState: apolloState,
                data: data?.data,
                error: data?.error ?? data?.errors ?? null,
            },
        };
      }
export const useMonthCircle = (
  optionsFunc?: (router: NextRouter)=> QueryHookOptions<Types.MonthCircleQuery, Types.MonthCircleQueryVariables>) => {
  const router = useRouter();
  const options = optionsFunc ? optionsFunc(router) : {};
  return useQuery(Operations.MonthCircleDocument, options);
};
export type PageMonthCircleComp = React.FC<{data?: Types.MonthCircleQuery, error?: Apollo.ApolloError}>;
export const withPageMonthCircle = (optionsFunc?: (router: NextRouter)=> QueryHookOptions<Types.MonthCircleQuery, Types.MonthCircleQueryVariables>) => (WrappedComponent:PageMonthCircleComp) : NextPage  => (props) => {
                const router = useRouter()
                const options = optionsFunc ? optionsFunc(router) : {};
                const {data, error } = useQuery(Operations.MonthCircleDocument, options)    
                return <WrappedComponent {...props} data={data} error={error} /> ;
                   
            }; 
export const ssrMonthCircle = {
      getServerPage: getServerPageMonthCircle,
      withPage: withPageMonthCircle,
      usePage: useMonthCircle,
    }