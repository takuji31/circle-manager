import { MonthSurveyAnswerValue } from '@prisma/client';

export function monthSurveyAnswerLabel(answer: MonthSurveyAnswerValue): string {
  return answer == MonthSurveyAnswerValue.Saikyo
    ? '西京ファーム'
    : answer == MonthSurveyAnswerValue.Umamusume
    ? 'ウマ娘愛好会'
    : answer == MonthSurveyAnswerValue.Leave
    ? '脱退'
    : answer == MonthSurveyAnswerValue.Ob
    ? '脱退(Discord残留)'
    : '未回答';
}
