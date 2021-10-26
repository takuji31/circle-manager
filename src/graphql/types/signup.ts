import { objectType, queryField, list, nonNull } from 'nexus';
import { SignUp as T } from 'nexus-prisma';
export const SignUp = objectType({
  name: T.$name,
  description: T.$description,
  definition(t) {
    t.field(T.id);
    t.field(T.circle);
    t.field(T.member);
    t.field(T.invited);
    t.field(T.joined);
  },
});

export const SignUps = queryField('signUps', {
  type: nonNull(list(nonNull(SignUp))),
  async resolve(_, __, ctx) {
    return ctx.prisma.signUp.findMany({
      where: { joined: false },
      orderBy: { createdAt: 'asc' },
    });
  },
});
