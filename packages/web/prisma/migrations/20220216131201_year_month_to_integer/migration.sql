/*
  Warnings:

  - A unique constraint covering the columns `[year,month]` on the table `MonthSurvey` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[year,month,memberId]` on the table `MonthSurveyAnswer` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `year` on the `MonthSurvey` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `month` on the `MonthSurvey` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `year` on the `MonthSurveyAnswer` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `month` on the `MonthSurveyAnswer` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Member" ALTER COLUMN "circleKey" SET DEFAULT NULL;

-- AlterTable
ALTER TABLE "MonthSurvey" ALTER COLUMN "month" SET DATA TYPE INTEGER USING month::numeric,
ALTER COLUMN "year" SET DATA TYPE INTEGER USING year::numeric;


-- AlterTable
ALTER TABLE "MonthSurveyAnswer" ALTER COLUMN "month" SET DATA TYPE INTEGER USING month::numeric,
ALTER COLUMN "year" SET DATA TYPE INTEGER USING year::numeric;

DROP INDEX "MonthSurvey_year_month_key";
DROP INDEX "MonthSurveyAnswer_year_month_memberId_key";

-- CreateIndex
CREATE UNIQUE INDEX "MonthSurvey_year_month_key" ON "MonthSurvey"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "MonthSurveyAnswer_year_month_memberId_key" ON "MonthSurveyAnswer"("year", "month", "memberId");
