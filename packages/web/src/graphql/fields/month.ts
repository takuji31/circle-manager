import { nextMonthInt, thisMonthInt } from '@circle-manager/shared/model';
import { queryField, nonNull } from 'nexus';
import { Month } from '../types';

export const NextMonthQuery = queryField('nextMonth', {
  type: nonNull(Month),
  resolve(_parent, _args, _ctx) {
    return { ...nextMonthInt() };
  },
});

export const ThisMonthQuery = queryField('thisMonth', {
  type: nonNull(Month),
  resolve(_parent, _args, _ctx) {
    return { ...thisMonthInt() };
  },
});
