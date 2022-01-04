/*
  Warnings:

  - You are about to drop the column `circleId` on the `CircleFanCount` table. All the data in the column will be lost.
  - You are about to drop the column `circleId` on the `MemberFanCount` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[circle,year,month,day]` on the table `CircleFanCount` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `circle` to the `CircleFanCount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `circle` to the `MemberFanCount` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CircleKey" AS ENUM ('Saikyo', 'Shin', 'Ha', 'Jo');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('NotJoined', 'Joined', 'Leaved', 'OB', 'Kicked');

-- DropForeignKey
ALTER TABLE "CircleFanCount" DROP CONSTRAINT "CircleFanCount_circleId_fkey";

-- DropForeignKey
ALTER TABLE "MemberFanCount" DROP CONSTRAINT "MemberFanCount_circleId_fkey";

-- DropIndex
DROP INDEX "CircleFanCount_circleId_year_month_day_key";

-- DropIndex
DROP INDEX "MemberFanCount_year_month_day_circleId_idx";

-- AlterTable
ALTER TABLE "CircleFanCount" DROP COLUMN "circleId",
ADD COLUMN     "circle" "CircleKey" NOT NULL;

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "circleKey" "CircleKey",
ADD COLUMN     "status" "MemberStatus" NOT NULL DEFAULT E'Joined';

-- AlterTable
ALTER TABLE "MemberFanCount" DROP COLUMN "circleId",
ADD COLUMN     "circle" "CircleKey" NOT NULL;

-- AlterTable
ALTER TABLE "SignUp" ADD COLUMN     "circleKey" "CircleKey";

-- CreateIndex
CREATE UNIQUE INDEX "CircleFanCount_circle_year_month_day_key" ON "CircleFanCount"("circle", "year", "month", "day");

-- CreateIndex
CREATE INDEX "MemberFanCount_year_month_day_circle_idx" ON "MemberFanCount"("year", "month", "day", "circle");
