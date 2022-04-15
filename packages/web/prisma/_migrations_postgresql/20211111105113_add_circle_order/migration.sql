-- AlterTable
ALTER TABLE "Circle" ADD COLUMN     "order" INTEGER DEFAULT 0;

-- CreateIndex
CREATE INDEX "Circle_order_idx" ON "Circle"("order");
