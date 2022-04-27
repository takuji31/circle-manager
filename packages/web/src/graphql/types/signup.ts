import { objectType, inputObjectType } from 'nexus';
import { CircleKey, SignUp as T } from 'nexus-prisma';
import { Circles } from '@circle-manager/shared/model';
import { Circle } from './circle';

export const SignUp = objectType({
  name: T.$name,
  description: T.$description,
  definition(t) {
    t.field(T.id);
    t.field(T.circleKey);
    t.field(T.member);
    t.field(T.invited);
    t.field(T.joined);
    t.field('circle', {
      type: Circle,
      resolve({ circleKey }, _, __) {
        return circleKey ? Circles.findByCircleKey(circleKey) : null;
      },
    });
  },
});

export const UpdateSignUpMutationInput = inputObjectType({
  name: 'UpdateSignUpMutationInput',
  definition(t) {
    t.nonNull.string('memberId');
    t.field('circleKey', { type: 'CircleKey', default: null });
    t.boolean('invited', { default: null });
    t.boolean('joined', { default: null });
  },
});
