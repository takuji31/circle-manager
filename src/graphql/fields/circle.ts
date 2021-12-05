import { list, nonNull, queryField } from 'nexus';
import { Circle, CircleFilter } from '../types/';

export const CirclesQueryField = queryField('circles', {
  type: nonNull(list(nonNull(Circle))),
  args: {
    filter: CircleFilter.asArg({ default: 'All' }),
  },
  resolve(_, { filter: f }, ctx) {
    const circleSelect = f == 'CircleSelect';
    const monthSurvey = f == 'MonthSurvey';
    return ctx.prisma.circle.findMany({
      where: circleSelect
        ? {
            selectableByUser: true,
          }
        : monthSurvey
        ? {
            selectableInSurvey: true,
          }
        : {},
      orderBy: {
        order: 'asc',
      },
    });
  },
});
