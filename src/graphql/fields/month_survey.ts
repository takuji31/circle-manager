import { MonthSurvey as _MonthSurvey } from 'nexus-prisma';
import { intArg, nonNull, queryField, stringArg } from 'nexus';
import { MonthSurvey } from '../types';

export const MonthSurveyQueryField = queryField('monthSurvey', {
  type: MonthSurvey,
  args: {
    year: nonNull(intArg()),
    month: nonNull(intArg()),
  },
  resolve(_, { year, month }, ctx) {
    return ctx.prisma.monthSurvey.findUnique({
      where: { year_month: { year, month } },
    });
  },
});
