/*
  Warnings:

  - You are about to drop the `SingnUp` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SingnUp" DROP CONSTRAINT "SingnUp_circleId_fkey";

-- DropForeignKey
ALTER TABLE "SingnUp" DROP CONSTRAINT "SingnUp_id_fkey";

-- RenameTable
ALTER TABLE "SingnUp" RENAME TO "SignUp";

-- CreateIndex
CREATE INDEX "SignUp_joined_idx" ON "SignUp"("joined");

-- AddForeignKey
ALTER TABLE "SignUp" ADD CONSTRAINT "SignUp_id_fkey" FOREIGN KEY ("id") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignUp" ADD CONSTRAINT "SignUp_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "Circle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
