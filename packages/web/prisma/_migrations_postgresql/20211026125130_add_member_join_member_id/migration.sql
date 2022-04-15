-- DropIndex
DROP INDEX "MemberJoin_circleId_key";

-- AddForeignKey
ALTER TABLE "MemberJoin" ADD CONSTRAINT "MemberJoin_id_fkey" FOREIGN KEY ("id") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
