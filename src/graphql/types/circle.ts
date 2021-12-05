import * as Nexus from 'nexus-prisma';
import {
  arg,
  enumType,
  list,
  nonNull,
  objectType,
  queryField,
  queryType,
} from 'nexus';
export const Circle = objectType({
  name: Nexus.Circle.$name,
  description: Nexus.Circle.$description,
  definition(t) {
    const c = Nexus.Circle;
    t.field(c.id);
    t.field(c.name);
    t.field(c.order);
    t.field(c.selectableByUser);
    t.field(c.selectableByAdmin);
    t.field(c.selectableInSurvey);
    t.field(c.members);
  },
});

export const CircleFilter = enumType({
  name: 'CircleFilter',
  members: ['All', 'CircleSelect', 'MonthSurvey'],
});

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
