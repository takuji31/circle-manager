import { objectType, inputObjectType } from 'nexus';
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

export const UpdateSignUpMutationInput = inputObjectType({
  name: 'UpdateSignUpMutationInput',
  definition(t) {
    t.nonNull.string('memberId');
    t.string('circleId', { default: null });
    t.boolean('invited', { default: null });
    t.boolean('joined', { default: null });
  },
});
