import { Circles, nextMonth, thisMonth } from '../../model';
import * as Nexus from 'nexus-prisma';
import { enumType, inputObjectType, objectType } from 'nexus';
import { Circle } from './circle';
import { MonthCircle } from './month_circle';
import { SignUp } from './signup';

export const Member = objectType({
  name: Nexus.Member.$name,
  description: Nexus.Member.$description,
  definition: (t) => {
    const m = Nexus.Member;
    t.field(m.id);
    t.field(m.pathname);
    t.field(m.circleRole);
    t.field(m.name);
    t.field(m.trainerId);
    t.field(m.setupCompleted);
    t.field(m.joinedAt);
    t.field(m.leavedAt);
    t.field(m.circleKey);
    t.field('circle', {
      type: Circle,
      resolve({ circleKey }, _, __) {
        if (!circleKey) {
          return null;
        } else {
          return Circles.findByCircleKey(circleKey);
        }
      },
    });
    t.field('thisMonthCircle', {
      type: MonthCircle,
      resolve(parent, _, ctx) {
        return ctx.prisma.monthCircle.findFirst({
          where: {
            ...thisMonth(),
            memberId: parent.id,
          },
        });
      },
    });
    t.field('nextMonthCircle', {
      type: MonthCircle,
      resolve(parent, _, ctx) {
        return ctx.prisma.monthCircle.findFirst({
          where: {
            ...nextMonth(),
            memberId: parent.id,
          },
        });
      },
    });
    t.field('signUp', {
      type: SignUp,
      resolve(parent, _, ctx) {
        return ctx.prisma.signUp.findUnique({
          where: {
            id: parent.id,
          },
        });
      },
    });
  },
});

export const CircleRole = enumType(Nexus.CircleRole);

export const UpdateMemberMutationInput = inputObjectType({
  name: 'UpdateMemberMutationInput',
  definition(t) {
    t.nonNull.string('id');
    t.string('trainerId', { default: null });
    t.string('name', { default: null });
    t.boolean('setupCompleted', { default: null });
  },
});
