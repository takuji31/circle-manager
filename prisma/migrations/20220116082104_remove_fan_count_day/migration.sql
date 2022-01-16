/*
  Warnings:

  - You are about to drop the column `day` on the `CircleFanCount` table. All the data in the column will be lost.
  - You are about to drop the column `day` on the `MemberFanCount` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "CircleFanCount_circle_year_month_day_key";

-- DropIndex
DROP INDEX "CircleFanCount_year_month_day_idx";

-- DropIndex
DROP INDEX "MemberFanCount_memberId_year_month_day_idx";

-- DropIndex
DROP INDEX "MemberFanCount_year_month_day_circle_idx";

-- AlterTable
ALTER TABLE "CircleFanCount" DROP COLUMN "day";

-- AlterTable
ALTER TABLE "MemberFanCount" DROP COLUMN "day";
