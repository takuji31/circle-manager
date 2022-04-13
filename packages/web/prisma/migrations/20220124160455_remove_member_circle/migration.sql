/*
  Warnings:

  - You are about to drop the column `circleId` on the `Member` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Member" DROP CONSTRAINT "Member_circleId_fkey";

-- DropIndex
DROP INDEX "Member_circleId_circleRole_joinedAt_idx";

-- AlterTable
ALTER TABLE "Member" DROP COLUMN "circleId";

-- CreateIndex
CREATE INDEX "Member_circleKey_circleRole_joinedAt_idx" ON "Member"("circleKey", "circleRole", "joinedAt");
