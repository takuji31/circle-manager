-- AlterTable
ALTER TABLE "Circle" ADD COLUMN     "emoji" TEXT;

-- AlterTable
ALTER TABLE "MonthCircle" ALTER COLUMN "circleId" SET DEFAULT NULL;

-- CreateTable
CREATE TABLE "MonthSurvey" (
    "id" VARCHAR(255) NOT NULL,
    "year" VARCHAR(4) NOT NULL,
    "month" VARCHAR(2) NOT NULL,
    "expiredAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthSurvey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MonthSurvey_year_month_key" ON "MonthSurvey"("year", "month");
