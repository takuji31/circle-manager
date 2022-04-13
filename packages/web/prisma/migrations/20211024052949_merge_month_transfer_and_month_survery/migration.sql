/*
  Warnings:

  - You are about to drop the `MonthTransfer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MonthTransfer" DROP CONSTRAINT "MonthTransfer_circleId_fkey";

-- DropForeignKey
ALTER TABLE "MonthTransfer" DROP CONSTRAINT "MonthTransfer_memberId_fkey";

-- DropForeignKey
ALTER TABLE "MonthTransfer" DROP CONSTRAINT "MonthTransfer_year_month_memberId_fkey";

-- AlterTable
ALTER TABLE "MonthCircle" ADD COLUMN     "currentCircleId" VARCHAR(255),
ADD COLUMN     "invited" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "joined" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "kicked" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "MonthTransfer";

-- CreateIndex
CREATE INDEX "MonthCircle_kicked_invited_joined_memberId_idx" ON "MonthCircle"("kicked", "invited", "joined", "memberId");

-- AddForeignKey
ALTER TABLE "MonthCircle" ADD CONSTRAINT "MonthCircle_currentCircleId_fkey" FOREIGN KEY ("currentCircleId") REFERENCES "Circle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
