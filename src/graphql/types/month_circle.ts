import {
  MonthCircle as _MonthCircle,
  MonthCircleState as _MonthCircleState,
} from 'nexus-prisma';
import { enumType, inputObjectType, nonNull, objectType } from 'nexus';
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
    t.field(_MonthCircle.kicked);
    t.field(_MonthCircle.invited);
    t.field(_MonthCircle.joined);
  },
});

export const MonthCircleState = enumType(_MonthCircleState);

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
