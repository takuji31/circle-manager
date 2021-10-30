import { GetStaticPaths, GetStaticProps } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { prisma } from '../../../../../database';
import { nextMonth, thisMonth } from '../../../../../model';

export const getStaticProps: GetStaticProps<{}, PathParams> = async (ctx) => {
  const { memberId, year, month } = ctx.params!!;
  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member || !member.circleId) {
    return {
      notFound: true,
    };
  }
  const monthCircle = await prisma.monthCircle.upsert({
    where: {
      year_month_memberId: {
        year,
        month,
        memberId,
      },
    },
    create: {
      year,
      month,
      memberId,
      currentCircleId: member.circleId,
    },
    update: {},
  });
  return {
    redirect: {
      destination: `/month_circles/${monthCircle.id}`,
      permanent: true,
    },
  };
};

interface PathParams extends ParsedUrlQuery {
  memberId: string;
  year: string;
  month: string;
}

export const getStaticPaths: GetStaticPaths<PathParams> = async () => {
  return {
    paths: (await prisma.member.findMany({})).flatMap((member) => [
      {
        params: {
          memberId: member.id,
          ...thisMonth(),
        },
      },
      {
        params: {
          memberId: member.id,
          ...nextMonth(),
        },
      },
    ]),
    fallback: 'blocking',
  };
};

export default function MonthCircleRedirect() {
  return <p></p>;
}
