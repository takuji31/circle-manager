-- AlterTable
ALTER TABLE "Circle" ADD COLUMN     "selectableByAdmin" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "selectableByUser" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Circle_selectableByUser_order_idx" ON "Circle"("selectableByUser", "order");

-- CreateIndex
CREATE INDEX "Circle_selectableByAdmin_order_idx" ON "Circle"("selectableByAdmin", "order");
