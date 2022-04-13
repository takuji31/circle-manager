import { list, nonNull, queryField } from 'nexus';
import { Circle as C } from '../../model';
import { Circle } from '../types/';

export const CirclesQueryField = queryField('circles', {
  type: nonNull(list(nonNull(Circle))),
  resolve(_) {
    return [C.saikyo, C.shin, C.ha];
  },
});
