/*
  Warnings:

  - Made the column `currentCircleKey` on table `MonthCircle` required. This step will fail if there are existing NULL values in that column.
  - Made the column `state` on table `MonthCircle` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "MonthCircle" ALTER COLUMN "currentCircleKey" SET NOT NULL,
ALTER COLUMN "state" SET NOT NULL;
