/*
  Warnings:

  - Made the column `currentCircleId` on table `MonthCircle` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "MonthCircle" DROP CONSTRAINT "MonthCircle_currentCircleId_fkey";

-- AlterTable
ALTER TABLE "MonthCircle" ALTER COLUMN "currentCircleId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "MonthCircle" ADD CONSTRAINT "MonthCircle_currentCircleId_fkey" FOREIGN KEY ("currentCircleId") REFERENCES "Circle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
