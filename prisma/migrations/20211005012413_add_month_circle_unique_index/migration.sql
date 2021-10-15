/*
  Warnings:

  - A unique constraint covering the columns `[year,month,memberId]` on the table `MonthCircle` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "MonthCircle_memberId_year_month_circleId_idx";

-- DropIndex
DROP INDEX "MonthCircle_year_month_circleId_memberId_idx";

-- AlterTable
ALTER TABLE "MonthCircle" ALTER COLUMN "circleId" SET DEFAULT NULL;

-- CreateIndex
CREATE INDEX "MonthCircle_memberId_idx" ON "MonthCircle"("memberId");

-- CreateIndex
CREATE INDEX "MonthCircle_year_month_circleId_idx" ON "MonthCircle"("year", "month", "circleId");

-- CreateIndex
CREATE UNIQUE INDEX "MonthCircle_year_month_memberId_key" ON "MonthCircle"("year", "month", "memberId");
