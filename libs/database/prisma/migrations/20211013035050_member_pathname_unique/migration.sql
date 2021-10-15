/*
  Warnings:

  - A unique constraint covering the columns `[pathname]` on the table `Member` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "MonthCircle" ALTER COLUMN "circleId" SET DEFAULT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Member_pathname_key" ON "Member"("pathname");
