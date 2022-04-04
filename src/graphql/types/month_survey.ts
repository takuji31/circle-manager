import { MonthCircle } from './month_circle';
import { MonthSurvey as _MonthSurvey } from 'nexus-prisma';
import { MonthCircle as _MonthCircle } from '@prisma/client';
import { nonNull, objectType, list } from 'nexus';
import { MonthSurveyAnswer } from './month_survey_answer';

export const MonthSurvey = objectType({
  name: _MonthSurvey.$name,
  description: _MonthSurvey.$description,
  definition(t) {
    t.field(_MonthSurvey.id);
    t.field(_MonthSurvey.year);
    t.field(_MonthSurvey.month);
    t.field(_MonthSurvey.expiredAt);

    t.field('move', {
      type: nonNull(list(nonNull(MonthCircle))),
      async resolve({ year, month }, _, { prisma }) {
        const monthCircles = await prisma.monthCircle.findMany({
          where: {
            year,
            month,
            state: {
              notIn: ['Kicked', 'Leaved', 'OB'],
            },
          },
          orderBy: [
            {
              currentCircleKey: 'asc',
            },
            {
              state: 'asc',
            },
            {
              member: { joinedAt: 'asc' },
            },
          ],
        });

        return monthCircles.filter(
          (monthCircle: _MonthCircle) =>
            monthCircle.state != monthCircle.currentCircleKey
        );
      },
    });

    t.field('leave', {
      type: nonNull(list(nonNull(MonthCircle))),
      async resolve({ year, month }, _, { prisma }) {
        return prisma.monthCircle.findMany({
          where: {
            year,
            month,
            state: {
              in: ['Leaved', 'OB'],
            },
          },
          orderBy: [
            {
              currentCircleKey: 'asc',
            },
            {
              state: 'asc',
            },
            {
              member: { joinedAt: 'asc' },
            },
          ],
        });
      },
    });

    t.field('kick', {
      type: nonNull(list(nonNull(MonthCircle))),
      async resolve({ year, month }, _, { prisma }) {
        return prisma.monthCircle.findMany({
          where: {
            year,
            month,
            state: 'Kicked',
          },
          orderBy: [
            {
              currentCircleKey: 'asc',
            },
            {
              state: 'asc',
            },
            {
              member: { joinedAt: 'asc' },
            },
          ],
        });
      },
    });

    t.field('monthSurveyAnswers', {
      type: nonNull(list(nonNull(MonthSurveyAnswer))),
      resolve({ year, month }, _, { prisma }) {
        return prisma.monthSurveyAnswer.findMany({
          where: {
            year,
            month,
          },
          orderBy: [
            {
              circleKey: 'asc',
            },
            {
              member: {
                joinedAt: 'asc',
              },
            },
          ],
        });
      },
    });
  },
});
