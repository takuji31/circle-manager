import { GetServerSideProps, NextPage } from 'next';
import { isArray } from 'nexus/dist/utils';
import { Temporal } from 'proposal-temporal';
import { ParsedUrlQuery } from 'querystring';
import { prisma } from '../../../../database';
import { toDate } from '../../../../model/date';

const RankingPage: NextPage<{ year: number; month: number; day: number }> = ({
  year,
  month,
  day,
}) => {
  return (
    <>
      {year}/{month}/{day}
    </>
  );
};

interface Props {}
interface Params extends ParsedUrlQuery {
  year: string;
  month: string;
  day: string[];
}

export const getServerSideProps: GetServerSideProps<Props, Params> = async ({
  params,
}) => {
  if (!params) {
    return {
      notFound: true,
    };
  }
  const { year, month, day: dayOrNull } = params;
  let monthStartDate = Temporal.PlainDate.from({
    year: parseInt(year),
    month: parseInt(month),
    day: 1,
  });
  let nextMonthStartDate = monthStartDate.add(
    Temporal.Duration.from({ months: 1 })
  );
  let date: Temporal.PlainDate;
  let day: number | null;
  try {
    if (dayOrNull && isArray(dayOrNull) && dayOrNull.length == 1) {
      day = parseInt(dayOrNull[0]);
    } else if (typeof dayOrNull == 'string') {
      day = parseInt(dayOrNull);
    } else if (dayOrNull) {
      throw new Error(`Unknown type day ${dayOrNull}`);
    } else {
      const aggregate = await prisma.memberFanCount.aggregate({
        _max: {
          date: true,
        },
        where: {
          date: {
            gte: toDate(monthStartDate),
            lt: toDate(nextMonthStartDate),
          },
        },
      });
      day = aggregate._max.date?.getDate() ?? null;
    }
    if (!day) {
      return {
        notFound: true,
      };
    }

    date = monthStartDate.with({ day });
  } catch (e) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      year: parseInt(year),
      month: parseInt(month),
      day: day,
    },
  };
};

export default RankingPage;
