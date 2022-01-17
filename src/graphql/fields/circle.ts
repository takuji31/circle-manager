import { list, nonNull, queryField } from 'nexus';
import { Circle as C } from '../../model';
import { Circle, CircleFilter } from '../types/';

export const CirclesQueryField = queryField('circles', {
  type: nonNull(list(nonNull(Circle))),
  args: {
    filter: CircleFilter.asArg({ default: 'All' }),
  },
  resolve(_, { filter: f }, ctx) {
    // TODO: fix
    const circleSelect = f == 'CircleSelect';
    const monthSurvey = f == 'MonthSurvey';
    return [C.saikyo, C.shin, C.jo, C.ha];
  },
});
