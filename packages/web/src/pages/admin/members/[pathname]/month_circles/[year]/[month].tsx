import { Box } from '@mui/system';
import { NextPage } from 'next';
import React from 'react';
import MemberMonthCircle from '../../../../../../components/member_month_circle';
import { MemberMonthCirclesDocument } from '../../../../../../graphql/generated/type';
import {
  getServerSidePropsWithUrql,
  withUrqlClient,
} from '../../../../../../graphql/client';
import { ParsedUrlQuery } from 'querystring';
import { prisma } from '../../../../../../database';
import Layout from '../../../../../../components/layout';
import { useTitle } from '../../../../../../recoil/title';

interface Props {
  year: number;
  month: number;
  memberId: string;
}

interface Params extends ParsedUrlQuery {
  year: string;
  month: string;
  pathname: string;
}

const MemberMonthCirclePage: NextPage<Props> = ({ year, month, memberId }) => {
  useTitle('サークル編集');
  return (
    <Box p={2}>
      <MemberMonthCircle year={year} month={month} memberId={memberId} />
    </Box>
  );
};

export const getServerSideProps = getServerSidePropsWithUrql<Props, Params>(
  async (ctx, urql, ssr) => {
    const { year, month, pathname } = ctx.params!;
    const member = await prisma.member.findUnique({ where: { pathname } });
    if (!member) {
      return {
        notFound: true,
      };
    }
    await urql
      .query(MemberMonthCirclesDocument, {
        year: parseInt(year),
        month: parseInt(month),
        memberId: member.id,
      })
      .toPromise();
    return {
      props: {
        year: parseInt(year),
        month: parseInt(month),
        memberId: member.id,
        urqlState: ssr.extractData(),
      },
    };
  }
);

const AdminMemberMonthCircle = withUrqlClient({ ssr: false })(
  MemberMonthCirclePage
);

export default AdminMemberMonthCircle;