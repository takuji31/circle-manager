/*
  Warnings:

  - You are about to drop the column `memberId` on the `PersonalChannel` table. All the data in the column will be lost.
  - Added the required column `channelId` to the `PersonalChannel` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PersonalChannel" DROP CONSTRAINT "PersonalChannel_memberId_fkey";

-- DropIndex
DROP INDEX "PersonalChannel_memberId_id_idx";

-- AlterTable
ALTER TABLE "PersonalChannel" DROP COLUMN "memberId",
ADD COLUMN     "channelId" VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE INDEX "PersonalChannel_id_channelId_idx" ON "PersonalChannel"("id", "channelId");

-- AddForeignKey
ALTER TABLE "PersonalChannel" ADD CONSTRAINT "PersonalChannel_id_fkey" FOREIGN KEY ("id") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
