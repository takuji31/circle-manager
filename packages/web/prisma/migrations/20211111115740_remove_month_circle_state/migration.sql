/*
  Warnings:

  - You are about to drop the column `state` on the `MonthCircle` table. All the data in the column will be lost.

*/

INSERT INTO "Circle"("id", "name") VALUES('7777777777777777777', '');
INSERT INTO "Circle"("id", "name") VALUES('9999999999999999999', '');
UPDATE "MonthCircle" SET "circleId" = '7777777777777777777' WHERE "state" = 'Retired';
UPDATE "MonthCircle" SET "circleId" = '9999999999999999999' WHERE "state" = 'NoAnswer';

-- AlterTable
ALTER TABLE "MonthCircle" DROP COLUMN "state";
