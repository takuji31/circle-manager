/*
  Warnings:

  - Made the column `circleId` on table `MonthCircle` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "MonthCircle" DROP CONSTRAINT "MonthCircle_circleId_fkey";

UPDATE "MonthCircle" SET "circleId" = '9999999999999999999' WHERE "circleId" IS NULL;

-- AlterTable
ALTER TABLE "MonthCircle" ALTER COLUMN "circleId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "MonthCircle" ADD CONSTRAINT "MonthCircle_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "Circle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
