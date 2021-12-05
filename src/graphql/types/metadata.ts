import { Circles } from './../../model/circle';
import { objectType } from 'nexus';
export const SiteMetadata = objectType({
  name: 'SiteMetadata',
  definition(t) {
    t.nonNull.field('maxMembers', {
      type: 'Int',
      async resolve(_, __, { prisma }) {
        return (await prisma.circle.count()) * Circles.maxMembers;
      },
    });
    t.nonNull.field('totalMembers', {
      type: 'Int',
      async resolve(_, __, { prisma }) {
        return await prisma.member.count();
      },
    });
    t.nonNull.field('activeMembers', {
      type: 'Int',
      async resolve(_, __, { prisma }) {
        return await prisma.member.count({
          where: {
            circleId: {
              not: null,
            },
          },
        });
      },
    });
  },
});
