-- AlterTable
ALTER TABLE "Circle" ADD COLUMN     "selectableInSurvey" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Circle_selectableInSurvey_order_idx" ON "Circle"("selectableInSurvey", "order");
