-- AlterTable
ALTER TABLE "MonthCircle" ALTER COLUMN "circleId" SET DEFAULT NULL;

-- CreateTable
CREATE TABLE "MonthTransfer" (
    "year" CHAR(4) NOT NULL,
    "month" CHAR(2) NOT NULL,
    "circleId" VARCHAR(255) NOT NULL,
    "memberId" VARCHAR(255) NOT NULL,
    "monthCircleId" VARCHAR(255) NOT NULL,
    "kicked" BOOLEAN NOT NULL,
    "invited" BOOLEAN NOT NULL,
    "joined" BOOLEAN NOT NULL,

    CONSTRAINT "MonthTransfer_pkey" PRIMARY KEY ("year","month","memberId")
);

-- CreateIndex
CREATE INDEX "MonthTransfer_memberId_idx" ON "MonthTransfer"("memberId");

-- CreateIndex
CREATE INDEX "MonthTransfer_kicked_invited_joined_memberId_idx" ON "MonthTransfer"("kicked", "invited", "joined", "memberId");

-- AddForeignKey
ALTER TABLE "MonthTransfer" ADD CONSTRAINT "MonthTransfer_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "Circle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthTransfer" ADD CONSTRAINT "MonthTransfer_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthTransfer" ADD CONSTRAINT "MonthTransfer_year_month_memberId_fkey" FOREIGN KEY ("year", "month", "memberId") REFERENCES "MonthCircle"("year", "month", "memberId") ON DELETE RESTRICT ON UPDATE CASCADE;
