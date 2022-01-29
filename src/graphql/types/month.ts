import { Context } from './../context';
import { list, nonNull, objectType } from 'nexus';
import { MonthSurvey } from './month_survey';
import { MonthCircle } from './month_circle';

export const Month = objectType({
  name: 'Month',
  definition(t) {
    t.nonNull.int('year');
    t.nonNull.int('month');
    t.field('survey', {
      type: MonthSurvey,
      resolve({ year, month }, _, { prisma }) {
        return prisma.monthSurvey.findUnique({
          where: {
            year_month: {
              year: year.toString(),
              month: month.toString(),
            },
          },
        });
      },
    });
    t.field('monthCircles', {
      type: nonNull(list(nonNull(MonthCircle))),
      resolve({ year, month }, _, { prisma }) {
        return prisma.monthCircle.findMany({
          where: {
            year,
            month,
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
