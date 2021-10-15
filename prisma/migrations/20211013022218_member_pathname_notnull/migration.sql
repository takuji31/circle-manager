/*
  Warnings:

  - Made the column `pathname` on table `Member` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Member" ALTER COLUMN "pathname" SET NOT NULL;

-- AlterTable
ALTER TABLE "MonthCircle" ALTER COLUMN "circleId" SET DEFAULT NULL;
