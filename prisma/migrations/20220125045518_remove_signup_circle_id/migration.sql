/*
  Warnings:

  - You are about to drop the column `circleId` on the `SignUp` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "SignUp" DROP CONSTRAINT "SignUp_circleId_fkey";

-- 適用時点で必要なデータは残ってないので全部削除してよい
DELETE FROM "SignUp";

-- AlterTable
ALTER TABLE "SignUp" DROP COLUMN "circleId";
