import { MonthCircle as _MonthCircle } from 'nexus-prisma';
import { inputObjectType, nonNull, objectType } from 'nexus';

export const MonthCircle = objectType({
  name: _MonthCircle.$name,
  description: _MonthCircle.$description,
  definition(t) {
    t.field(_MonthCircle.id);
    t.field(_MonthCircle.year);
    t.field(_MonthCircle.month);
    t.field(_MonthCircle.circle);
    t.field(_MonthCircle.currentCircle);
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
