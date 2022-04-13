import {
  MonthCircle as _MonthCircle,
  MonthCircleState as _MonthCircleState,
} from 'nexus-prisma';
import { enumType, inputObjectType, list, nonNull, objectType } from 'nexus';
import { Circles, isCircleKey } from '../../model';
import { stat } from 'fs';

export const MonthCircle = objectType({
  name: _MonthCircle.$name,
  description: _MonthCircle.$description,
  definition(t) {
    t.field(_MonthCircle.id);
    t.field(_MonthCircle.year);
    t.field(_MonthCircle.month);
    t.field(_MonthCircle.state);
    t.field(_MonthCircle.currentCircleKey);
    t.field('circle', {
      type: 'Circle',
      resolve({ state }, _, __) {
        if (isCircleKey(state)) {
          return Circles.findByCircleKey(state);
        } else {
          return null;
        }
      },
    });
    t.field('currentCircle', {
      type: 'Circle',
      resolve({ currentCircleKey }, _, __) {
        return currentCircleKey
          ? Circles.findByCircleKey(currentCircleKey)
          : null;
      },
    });
    t.field(_MonthCircle.member);
    t.field(_MonthCircle.state);
    t.field(_MonthCircle.kicked);
    t.field(_MonthCircle.invited);
    t.field(_MonthCircle.joined);
    t.field(_MonthCircle.locked);
  },
});

export const MonthCircleState = enumType(_MonthCircleState);

export const UpdateMemberMonthCircleMutationInput = inputObjectType({
  name: 'UpdateMemberMonthCircleMutationInput',
  definition(t) {
    t.nonNull.string('memberId');
    t.nonNull.int('year');
    t.nonNull.int('month');
    t.field({
      name: 'state',
      type: MonthCircleState,
      default: undefined,
    });
    t.boolean('locked', { default: undefined });
  },
});

export const UpdateMemberMonthCirclePayload = objectType({
  name: 'UpdateMemberMonthCirclePayload',
  definition(t) {
    t.field('monthCircle', {
      type: nonNull(MonthCircle),
    });
  },
});

export const UpdateMonthCircleMutationInput = inputObjectType({
  name: 'UpdateMonthCircleMutationInput',
  definition(t) {
    t.nonNull.string('id');
    t.boolean('kicked', { default: null });
    t.boolean('invited', { default: null });
    t.boolean('joined', { default: null });
  },
});

export const CreateMonthCirclesPayload = objectType({
  name: 'CreateMonthCirclesPayload',
  definition(t) {
    t.nonNull.int('year');
    t.nonNull.int('month');
    t.field('monthCircles', {
      type: nonNull(list(nonNull(MonthCircle))),
    });
  },
});
