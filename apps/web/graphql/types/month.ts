import { Context } from './../context';
import { nextMonth, thisMonth } from '@circle-manager/model';
import { objectType, queryField, nonNull } from 'nexus';
import { MonthSurvey } from './month_survey';
export const Month = objectType({
  name: 'Month',
  definition(t) {
    t.nonNull.field('year', {
      type: 'String',
    });
    t.nonNull.field('month', {
      type: 'String',
    });
    t.field('survey', {
      type: MonthSurvey,
      resolve(parent, _, ctx: Context) {
        return ctx.prisma.monthSurvey.findUnique({
          where: {
            year_month: {
              year: parent.year,
              month: parent.month,
            },
          },
        });
      },
    });
  },
});

export const NextMonthQuery = queryField('nextMonth', {
  type: nonNull(Month),
  resolve(_parent, _args, _ctx) {
    return { ...nextMonth() };
  },
});

export const ThisMonthQuery = queryField('thisMonth', {
  type: nonNull(Month),
  resolve(_parent, _args, _ctx) {
    return { ...thisMonth() };
  },
});
