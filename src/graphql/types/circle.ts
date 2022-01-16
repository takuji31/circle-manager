import * as Nexus from 'nexus-prisma';
import { enumType, objectType } from 'nexus';

export const Circle = objectType({
  name: 'Circle',
  description: 'circle',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.field('key', { type: CircleKey });
    t.nonNull.string('name');
  },
});

export const CircleKey = enumType(Nexus.CircleKey);

export const CircleFilter = enumType({
  name: 'CircleFilter',
  members: ['All', 'CircleSelect', 'MonthSurvey'],
});
