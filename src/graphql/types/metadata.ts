import { Circles } from './../../model/circle';
import { objectType, queryType, nonNull, queryField } from 'nexus';
import exp from 'constants';
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

export const SiteMetadataQuery = queryField('siteMetadata', {
  type: nonNull(SiteMetadata),
  resolve() {
    return {};
  },
});
