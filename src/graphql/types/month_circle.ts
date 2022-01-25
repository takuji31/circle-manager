import { MonthCircle as _MonthCircle } from 'nexus-prisma';
import { inputObjectType, nonNull, objectType } from 'nexus';
import { Circles } from '../../model';

export const MonthCircle = objectType({
  name: _MonthCircle.$name,
  description: _MonthCircle.$description,
  definition(t) {
    t.field(_MonthCircle.id);
    t.field(_MonthCircle.year);
    t.field(_MonthCircle.month);
    t.field(_MonthCircle.circleKey);
    t.field(_MonthCircle.currentCircleKey);
    t.field('circle', {
      type: 'Circle',
      resolve({ circleKey }, _, __) {
        return circleKey ? Circles.findByCircleKey(circleKey) : null;
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
