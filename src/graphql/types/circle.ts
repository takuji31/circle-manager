import * as Nexus from 'nexus-prisma';
import { list, nonNull, objectType, queryField, queryType } from 'nexus';
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

export const CirclesQueryField = queryField('circles', {
  type: nonNull(list(nonNull(Circle))),
  resolve(parent, args, ctx) {
    return ctx.prisma.circle.findMany({
      orderBy: {
        order: 'asc',
      },
    });
  },
});
