import { LinearProgress } from '@mui/material';
import { Box } from '@mui/system';
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import React from 'react';
import Layout from '../../components/layout';
import MemberMonthCircle from '../../components/member_month_circle';
import { useQuery } from 'urql';
import { MonthCircleDocument } from '../../graphql/generated/type';

interface Props {
  monthCircleId: string;
}

const MemberMonthCirclePage: NextPage<Props> = ({ monthCircleId }) => {
  const [{ data, fetching }] = useQuery({
    query: MonthCircleDocument,
    variables: {
      monthCircleId,
    },
  });
  const circles = data?.circles;
  const monthCircle = data?.monthCircle;
  return (
    <Layout
      title={
        monthCircle
          ? `${monthCircle.member.name} さんの ${monthCircle.year}年${monthCircle.month}月の在籍希望`
          : 'Loading...'
      }
    >
      {fetching && <LinearProgress />}
      {circles && monthCircle && (
        <Box p={2}>
          <MemberMonthCircle
            memberId={monthCircle.member.id}
            monthCircle={monthCircle}
            circles={circles}
            year={monthCircle.year}
            month={monthCircle.month}
            canEdit={true}
          />
        </Box>
      )}
    </Layout>
  );
};

export const getStaticProps: GetStaticProps<Props> = (ctx) => {
  const monthCircleId = ctx.params?.monthCircleId as string;
  return {
    props: {
      monthCircleId,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export default MemberMonthCirclePage;
