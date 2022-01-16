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
      async resolve(parent, _, { prisma }) {
        const monthCircles = await prisma.monthCircle.findMany({
          where: {
            year: parent.year,
            month: parent.month,
            circleId: {
              not: {
                in: [
                  Circles.specialIds.noAnswer,
                  Circles.specialIds.leave,
                  Circles.specialIds.kick,
                  Circles.specialIds.notJoined,
                  Circles.specialIds.ob,
                ],
              },
            },
          },
          orderBy: {
            currentCircle: {
              order: 'asc',
            },
          },
        });

        return monthCircles.filter(
          (monthCircle: _MonthCircle) =>
            monthCircle.circleId != monthCircle.currentCircleId
        );
      },
    });

    t.field('leave', {
      type: nonNull(list(nonNull(MonthCircle))),
      async resolve(parent, _, { prisma }) {
        return prisma.monthCircle.findMany({
          where: {
            year: parent.year,
            month: parent.month,
            circleId: {
              in: [Circles.specialIds.leave, Circles.specialIds.ob],
            },
          },
          orderBy: {
            currentCircle: {
              order: 'asc',
            },
          },
        });
      },
    });

    t.field('kick', {
      type: nonNull(list(nonNull(MonthCircle))),
      async resolve(parent, _, { prisma }) {
        return prisma.monthCircle.findMany({
          where: {
            year: parent.year,
            month: parent.month,
            circleId: {
              in: [Circles.specialIds.kick, Circles.specialIds.noAnswer],
            },
          },
          orderBy: {
            currentCircle: {
              order: 'asc',
            },
          },
        });
      },
    });

    t.field('answers', {
      type: nonNull(list(nonNull(MonthCircle))),
      resolve(parent, _, { prisma }) {
        return prisma.monthCircle.findMany({
          where: {
            member: {
              circleId: { not: null },
            },
            year: parent.year,
            month: parent.month,
            circleId: {
              not: Circles.specialIds.noAnswer,
            },
          },
        });
      },
    });
    t.field('noAnswerMembers', {
      type: nonNull(list(nonNull(Member))),
      resolve(parent, _, { prisma }) {
        return prisma.member.findMany({
          where: {
            AND: [
              {
                circleId: {
                  not: null,
                },
              },
              {
                monthCircles: {
                  some: {
                    year: parent.year,
                    month: parent.month,
                    circleId: Circles.specialIds.noAnswer,
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
