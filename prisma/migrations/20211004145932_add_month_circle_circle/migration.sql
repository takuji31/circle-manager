-- AlterTable
ALTER TABLE "MonthCircle" ALTER COLUMN "circleId" SET DEFAULT NULL;

-- AddForeignKey
ALTER TABLE "MonthCircle" ADD CONSTRAINT "MonthCircle_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "Circle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
