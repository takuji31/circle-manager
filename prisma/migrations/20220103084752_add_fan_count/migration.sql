-- CreateTable
CREATE TABLE "MemberFanCount" (
    "id" VARCHAR(255) NOT NULL,
    "year" CHAR(4) NOT NULL,
    "month" CHAR(2) NOT NULL,
    "day" CHAR(2) NOT NULL,
    "circleId" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "total" BIGINT NOT NULL,
    "avg" BIGINT NOT NULL,
    "predicted" BIGINT NOT NULL,
    "memberId" VARCHAR(255),

    CONSTRAINT "MemberFanCount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CircleFanCount" (
    "id" VARCHAR(255) NOT NULL,
    "year" CHAR(4) NOT NULL,
    "month" CHAR(2) NOT NULL,
    "day" CHAR(2) NOT NULL,
    "circleId" VARCHAR(255) NOT NULL,
    "total" BIGINT NOT NULL,
    "avg" BIGINT NOT NULL,
    "predicted" BIGINT NOT NULL,
    "predictedAvg" BIGINT NOT NULL,

    CONSTRAINT "CircleFanCount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MemberFanCount_year_month_day_circleId_idx" ON "MemberFanCount"("year", "month", "day", "circleId");

-- CreateIndex
CREATE INDEX "MemberFanCount_memberId_year_month_day_idx" ON "MemberFanCount"("memberId", "year", "month", "day");

-- CreateIndex
CREATE INDEX "CircleFanCount_year_month_day_idx" ON "CircleFanCount"("year", "month", "day");

-- CreateIndex
CREATE UNIQUE INDEX "CircleFanCount_circleId_year_month_day_key" ON "CircleFanCount"("circleId", "year", "month", "day");

-- AddForeignKey
ALTER TABLE "MemberFanCount" ADD CONSTRAINT "MemberFanCount_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "Circle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberFanCount" ADD CONSTRAINT "MemberFanCount_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CircleFanCount" ADD CONSTRAINT "CircleFanCount_circleId_fkey" FOREIGN KEY ("circleId") REFERENCES "Circle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
