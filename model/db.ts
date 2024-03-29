import type {
  CircleFanCount,
  Member,
  MemberFanCount,
  MonthCircle,
  MonthSurvey,
  MonthSurveyAnswer,
  PersonalChannel,
  ScreenShot,
  SignUp,
} from "@prisma/client";

export interface DbTableData {
  members: Array<Member>;
  monthCircles: Array<MonthCircle>;
  monthSurveys: Array<MonthSurvey>;
  monthSurveyAnswers: Array<MonthSurveyAnswer>;
  signUps: Array<SignUp>;
  circleFanCounts: CircleFanCount[];
  memberFanCounts: MemberFanCount[];
  screenShots: ScreenShot[];
  personalChannels: Array<PersonalChannel>;
}
