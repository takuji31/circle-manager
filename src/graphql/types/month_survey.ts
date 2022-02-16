import { MonthCircle } from './month_circle';
import { Member } from './member';
import { Circles } from '../../model';
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
          orderBy: {
            state: 'asc',
          },
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
          orderBy: {
            currentCircleKey: 'asc',
          },
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
          orderBy: {
            currentCircleKey: 'asc',
          },
        });
      },
    });

    t.field('answers', {
      type: nonNull(list(nonNull(MonthCircle))),
      resolve({ year, month }, _, { prisma }) {
        return prisma.monthCircle.findMany({
          where: {
            member: {
              circleKey: { not: null },
            },
            year,
            month,
            state: {
              not: 'Kicked',
            },
          },
        });
      },
    });
    t.field('noAnswerMembers', {
      type: nonNull(list(nonNull(Member))),
      resolve({ year, month }, _, { prisma }) {
        return prisma.member.findMany({
          where: {
            AND: [
              {
                circleKey: {
                  not: null,
                },
              },
              {
                monthCircles: {
                  some: {
                    year,
                    month,
                    state: 'Kicked',
                  },
                },
              },
            ],
          },
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
              value: 'asc',
            },
          ],
        });
      },
    });
  },
});
