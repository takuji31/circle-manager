/*
  Warnings:

  - You are about to drop the column `month` on the `CircleFanCount` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `CircleFanCount` table. All the data in the column will be lost.
  - You are about to drop the column `month` on the `MemberFanCount` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `MemberFanCount` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[circle,date]` on the table `CircleFanCount` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `date` to the `CircleFanCount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `MemberFanCount` table without a default value. This is not possible if the table is not empty.

*/

DELETE FROM "CircleFanCount";
DELETE FROM "MemberFanCount";

-- AlterTable
ALTER TABLE "CircleFanCount" DROP COLUMN "month",
DROP COLUMN "year",
ADD COLUMN     "date" DATE NOT NULL;

-- AlterTable
ALTER TABLE "MemberFanCount" DROP COLUMN "month",
DROP COLUMN "year",
ADD COLUMN     "date" DATE NOT NULL;

-- CreateIndex
CREATE INDEX "CircleFanCount_date_idx" ON "CircleFanCount"("date");

-- CreateIndex
CREATE UNIQUE INDEX "CircleFanCount_circle_date_key" ON "CircleFanCount"("circle", "date");

-- CreateIndex
CREATE INDEX "MemberFanCount_date_circle_idx" ON "MemberFanCount"("date", "circle");

-- CreateIndex
CREATE INDEX "MemberFanCount_memberId_date_idx" ON "MemberFanCount"("memberId", "date");
