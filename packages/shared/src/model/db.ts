import {
  UmastagramCircleFanCount,
  Member,
  UmastagramMemberFanCount,
  MonthCircle,
  MonthSurvey,
  MonthSurveyAnswer,
  PersonalChannel,
  SignUp,
} from "@prisma/client";

export interface DbTableData {
  members: Array<Member>;
  monthCircles: Array<MonthCircle>;
  monthSurveys: Array<MonthSurvey>;
  monthSurveyAnswers: Array<MonthSurveyAnswer>;
  signUps: Array<SignUp>;
  umastagramMemberFanCount: Array<UmastagramMemberFanCount>;
  umastagramCircleFanCount: Array<UmastagramCircleFanCount>;
  personalChannels: Array<PersonalChannel>;
}
