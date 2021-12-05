import * as Nexus from 'nexus-prisma';
import { enumType, objectType } from 'nexus';

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
