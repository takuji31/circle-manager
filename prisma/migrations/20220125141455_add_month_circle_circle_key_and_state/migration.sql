/*
  Warnings:

  - You are about to drop the column `circleId` on the `MonthCircle` table. All the data in the column will be lost.
  - You are about to drop the column `currentCircleId` on the `MonthCircle` table. All the data in the column will be lost.
  - Added the required column `state` to the `MonthCircle` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MonthCircleState" AS ENUM ('Saikyo', 'Shin', 'Ha', 'Jo', 'Leaved', 'OB', 'Kicked');

-- DropForeignKey
ALTER TABLE "MonthCircle" DROP CONSTRAINT "MonthCircle_circleId_fkey";

-- DropForeignKey
ALTER TABLE "MonthCircle" DROP CONSTRAINT "MonthCircle_currentCircleId_fkey";

-- DropIndex
DROP INDEX "MonthCircle_year_month_circleId_idx";

ALTER TABLE "MonthCircle"
ADD COLUMN "currentCircleKey" "CircleKey",
ADD COLUMN "state" "MonthCircleState";

UPDATE "MonthCircle" SET "currentCircleKey" = 'Saikyo' WHERE "currentCircleId" = '908304060640276520';
UPDATE "MonthCircle" SET "currentCircleKey" = 'Shin' WHERE "currentCircleId" = '863398236474834944';
UPDATE "MonthCircle" SET "currentCircleKey" = 'Ha' WHERE "currentCircleId" = '870950796479594556';
UPDATE "MonthCircle" SET "currentCircleKey" = 'Jo' WHERE "currentCircleId" = '863398725920227339';

UPDATE "MonthCircle" SET "state" = 'Saikyo' WHERE "circleId" = '908304060640276520';
UPDATE "MonthCircle" SET "state" = 'Shin' WHERE "circleId" = '863398236474834944';
UPDATE "MonthCircle" SET "state" = 'Ha' WHERE "circleId" = '870950796479594556';
UPDATE "MonthCircle" SET "state" = 'Jo' WHERE "circleId" = '863398725920227339';
UPDATE "MonthCircle" SET "state" = 'Leaved' WHERE "circleId" = '7777777777777777777';
UPDATE "MonthCircle" SET "state" = 'OB' WHERE "circleId" = '889835308189900810';
UPDATE "MonthCircle" SET "state" = 'Kicked' WHERE "circleId" = '8888888888888888888' OR "circleId" = '9999999999999999999';



-- AlterTable
ALTER TABLE "MonthCircle" DROP COLUMN "circleId",
DROP COLUMN "currentCircleId";

-- CreateIndex
CREATE INDEX "MonthCircle_year_month_state_idx" ON "MonthCircle"("year", "month", "state");
