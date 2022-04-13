-- CreateEnum
CREATE TYPE "MonthSurveyAnswerValue" AS ENUM ('None', 'Saikyo', 'Umamusume', 'Leave', 'Ob');

-- CreateTable
CREATE TABLE "MonthSurveyAnswer" (
    "id" VARCHAR(255) NOT NULL,
    "year" CHAR(4) NOT NULL,
    "month" CHAR(2) NOT NULL,
    "memberId" VARCHAR(255) NOT NULL,
    "circleKey" "CircleKey" NOT NULL,
    "value" "MonthSurveyAnswerValue" DEFAULT E'None',

    CONSTRAINT "MonthSurveyAnswer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MonthSurveyAnswer" ADD CONSTRAINT "MonthSurveyAnswer_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
