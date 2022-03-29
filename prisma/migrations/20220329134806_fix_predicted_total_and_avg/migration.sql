ALTER TABLE "CircleFanCount" RENAME COLUMN "predicted" TO "a";
ALTER TABLE "CircleFanCount" RENAME COLUMN "predictedAvg" TO "b";
ALTER TABLE "CircleFanCount" RENAME COLUMN "a" TO "predictedAvg";
ALTER TABLE "CircleFanCount" RENAME COLUMN "b" TO "predicted";
ALTER TABLE "Member" ALTER COLUMN "circleKey" SET DEFAULT NULL;
