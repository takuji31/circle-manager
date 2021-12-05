import { MonthCircle as _MonthCircle } from 'nexus-prisma';
import { nonNull, queryField, stringArg } from 'nexus';
import { MonthCircle } from '../types';

export const MonthCircleQuery = queryField('monthCircle', {
  type: MonthCircle,
  args: {
    monthCircleId: nonNull(stringArg()),
  },
  resolve(_, { monthCircleId }, ctx) {
    return ctx.prisma.monthCircle.findUnique({
      where: {
        id: monthCircleId,
      },
    });
  },
});
