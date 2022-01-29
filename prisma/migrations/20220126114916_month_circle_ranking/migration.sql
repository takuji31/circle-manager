/*
  Warnings:

  - A unique constraint covering the columns `[year,month,memberId]` on the table `MonthCircle` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `month` on the `MonthCircle` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `year` on the `MonthCircle` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "MonthCircle" ADD COLUMN     "locked" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "MonthCircle" ALTER COLUMN "month" SET DATA TYPE INTEGER USING month::numeric,
ALTER COLUMN "year" SET DATA TYPE INTEGER USING year::numeric;

DROP INDEX IF EXISTS "MonthCircle_year_month_state_idx";
DROP INDEX IF EXISTS "MonthCircle_year_month_memberId_key";

-- CreateIndex
CREATE INDEX "MonthCircle_year_month_state_idx" ON "MonthCircle"("year", "month", "state");

-- CreateIndex
CREATE INDEX "MonthCircle_locked_idx" ON "MonthCircle"("locked");

-- CreateIndex
CREATE UNIQUE INDEX "MonthCircle_year_month_memberId_key" ON "MonthCircle"("year", "month", "memberId");
