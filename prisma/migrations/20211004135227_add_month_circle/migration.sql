/*
  Warnings:

  - The primary key for the `MonthCircle` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `month` on the `MonthCircle` table. The data in that column could be lost. The data in that column will be cast from `Char(6)` to `Char(2)`.
  - The required column `id` was added to the `MonthCircle` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `year` to the `MonthCircle` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MonthCircleAnswerState" AS ENUM ('NoAnswer', 'Answered', 'Retired');

-- DropIndex
DROP INDEX "MonthCircle_month_circleId_memberId_idx";

-- AlterTable
ALTER TABLE "MonthCircle" DROP CONSTRAINT "MonthCircle_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "state" "MonthCircleAnswerState" NOT NULL DEFAULT E'NoAnswer',
ADD COLUMN     "year" CHAR(4) NOT NULL,
ALTER COLUMN "month" SET DATA TYPE CHAR(2),
ALTER COLUMN "circleId" DROP NOT NULL,
ALTER COLUMN "circleId" SET DEFAULT NULL,
ADD CONSTRAINT "MonthCircle_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "MonthCircle_memberId_year_month_circleId_idx" ON "MonthCircle"("memberId", "year", "month", "circleId");

-- CreateIndex
CREATE INDEX "MonthCircle_year_month_circleId_memberId_idx" ON "MonthCircle"("year", "month", "circleId", "memberId");
