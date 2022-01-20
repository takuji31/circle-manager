import { list, nonNull, queryField, stringArg } from 'nexus';
import { Member } from '../types';

export const MemberField = queryField('member', {
  type: Member,
  args: {
    id: stringArg(),
    pathname: stringArg(),
  },
  resolve(_, args, ctx) {
    if (args.id) {
      return ctx.prisma.member.findUnique({
        where: {
          id: args.id,
        },
      });
    } else if (args.pathname) {
      return ctx.prisma.member.findUnique({
        where: {
          pathname: args.pathname,
        },
      });
    } else {
      throw new Error('id or pathname required');
    }
  },
});

export const MembersField = queryField('members', {
  type: nonNull(list(nonNull(Member))),
  resolve(_, __, ctx) {
    return ctx.prisma.member.findMany({
      orderBy: [
        {
          circleKey: 'asc',
        },
        {
          circleRole: 'asc',
        },
        {
          joinedAt: 'asc',
        },
      ],
    });
  },
});
