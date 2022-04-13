/*
  Warnings:

  - You are about to drop the `MemberJoin` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MemberJoin" DROP CONSTRAINT "MemberJoin_circleId_fkey";

-- DropForeignKey
ALTER TABLE "MemberJoin" DROP CONSTRAINT "MemberJoin_id_fkey";

-- RenameTable
ALTER TABLE "MemberJoin" RENAME TO "SingnUp";

-- CreateIndex
CREATE INDEX "SingnUp_joined_idx" ON "SingnUp"("joined");

-- AddForeignKey
ALTER TABLE "SingnUp" ADD CONSTRAINT "SingnUp_id_fkey" FOREIGN KEY ("id") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SingnUp" ADD CONSTRAINT "SingnUp_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "Circle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
