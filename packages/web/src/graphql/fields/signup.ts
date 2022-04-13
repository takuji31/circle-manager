import { queryField, list, nonNull } from 'nexus';
import { SignUp } from '../types';

export const SignUps = queryField('signUps', {
  type: nonNull(list(nonNull(SignUp))),
  async resolve(_, __, ctx) {
    return ctx.prisma.signUp.findMany({
      where: { joined: false, member: { leavedAt: null } },
      orderBy: { createdAt: 'asc' },
    });
  },
});
