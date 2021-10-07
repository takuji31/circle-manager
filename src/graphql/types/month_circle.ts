import {
  MonthCircle as _MonthCircle,
  MonthCircleAnswerState as _MonthCircleAnswerState,
} from "nexus-prisma";
import { enumType, objectType } from "nexus";

export const MonthCircle = objectType({
  name: _MonthCircle.$name,
  description: _MonthCircle.$description,
  definition(t) {
    t.field(_MonthCircle.id);
    t.field(_MonthCircle.year);
    t.field(_MonthCircle.month);
    t.field(_MonthCircle.state);
    t.field(_MonthCircle.circle);
  },
});

export const MonthCircleAnswerState = enumType(_MonthCircleAnswerState);
