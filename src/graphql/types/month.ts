import { Context } from './../context';
import { nonNull, objectType } from 'nexus';
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

export const CreateNextMonthSurveyPayload = objectType({
  name: 'CreateNextMonthSurveyPayload',
  definition(t) {
    t.field('nextMonth', {
      type: nonNull(Month),
    });
  },
});
