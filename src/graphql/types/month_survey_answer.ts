import { enumType, objectType } from 'nexus';
import * as Nexus from 'nexus-prisma';

export const MonthSurveyAnswer = objectType({
  name: Nexus.MonthSurveyAnswer.$name,
  description: Nexus.MonthSurveyAnswer.$description,
  definition(t) {
    const m = Nexus.MonthSurveyAnswer;
    t.field(m.id);
    t.field(m.year);
    t.field(m.month);
    t.field(m.circleKey);
    t.field(m.value);
    t.field(m.member);
  },
});

export const MonthSurveyAnswerValue = enumType(Nexus.MonthSurveyAnswerValue);
