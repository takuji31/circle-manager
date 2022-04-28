import { MonthCircleState, MonthSurveyAnswerValue } from '@prisma/client';
import { Circles, isCircleKey } from '.';

export function monthCircleStateLabel(state: MonthCircleState): string {
  if (isCircleKey(state)) {
    return Circles.findByCircleKey(state).name;
  }

  switch (state) {
    case MonthCircleState.Leaved:
      return '脱退';
    case MonthCircleState.OB:
      return '脱退(Discord残留)';
    case MonthCircleState.Kicked:
      return '除名';
  }
}
