import {
  CircleFanCount,
  Member,
  MemberFanCount,
  MonthCircle,
  MonthSurvey,
  MonthSurveyAnswer,
  PersonalChannel,
  SignUp,
} from '@prisma/client';

export interface DbTableData {
  members: Array<Member>;
  monthCircles: Array<MonthCircle>;
  monthSurveys: Array<MonthSurvey>;
  monthSurveyAnswers: Array<MonthSurveyAnswer>;
  signUps: Array<SignUp>;
  memberFanCounts: Array<MemberFanCount>;
  circleFanCounts: Array<CircleFanCount>;
  personalChannels: Array<PersonalChannel>;
}
