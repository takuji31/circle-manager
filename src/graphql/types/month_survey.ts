import { MonthCircle } from './month_circle';
import { Member } from './member';
import { Circles } from '../../model';
import { MonthSurvey as _MonthSurvey } from 'nexus-prisma';
import { nonNull, objectType, list } from 'nexus';

export const MonthSurvey = objectType({
  name: _MonthSurvey.$name,
  description: _MonthSurvey.$description,
  definition(t) {
    t.field(_MonthSurvey.id);
    t.field(_MonthSurvey.year);
    t.field(_MonthSurvey.month);
    t.field(_MonthSurvey.expiredAt);
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
                OR: [
                  {
                    monthCircles: {
                      none: {
                        year: parent.year,
                        month: parent.month,
                      },
                    },
                  },
                  {
                    monthCircles: {
                      none: {
                        year: parent.year,
                        month: parent.month,
                        circleId: {
                          not: Circles.specialIds.noAnswer,
                        },
                      },
                    },
                  },
                ],
              },
            ],
          },
        });
      },
    });
  },
});
