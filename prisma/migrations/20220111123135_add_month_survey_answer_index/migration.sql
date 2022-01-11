/*
  Warnings:

  - A unique constraint covering the columns `[year,month,memberId]` on the table `MonthSurveyAnswer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "MonthSurveyAnswer_memberId_idx" ON "MonthSurveyAnswer"("memberId");

-- CreateIndex
CREATE INDEX "MonthSurveyAnswer_value_memberId_idx" ON "MonthSurveyAnswer"("value", "memberId");

-- CreateIndex
CREATE UNIQUE INDEX "MonthSurveyAnswer_year_month_memberId_key" ON "MonthSurveyAnswer"("year", "month", "memberId");
