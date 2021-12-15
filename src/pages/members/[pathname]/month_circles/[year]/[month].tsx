import { GetServerSideProps } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { prisma } from '../../../../../database';

export const getServerSideProps: GetServerSideProps<{}, PathParams> = async (
  ctx
) => {
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

export default function MonthCircleRedirect() {
  return <p></p>;
}
