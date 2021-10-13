-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "pathname" VARCHAR(255);

-- AlterTable
ALTER TABLE "MonthCircle" ALTER COLUMN "circleId" SET DEFAULT NULL;
