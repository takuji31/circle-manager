import { MonthSurvey as _MonthSurvey } from 'nexus-prisma';
import { nonNull, queryField, stringArg } from 'nexus';
import { MonthSurvey } from '../types';

export const MonthSurveyQueryField = queryField('monthSurvey', {
  type: MonthSurvey,
  args: {
    year: nonNull(stringArg()),
    month: nonNull(stringArg()),
  },
  resolve(_, { year, month }, ctx) {
    return ctx.prisma.monthSurvey.findUnique({
      where: { year_month: { year, month } },
    });
  },
});
