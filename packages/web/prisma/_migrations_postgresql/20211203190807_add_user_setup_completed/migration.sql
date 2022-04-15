-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "setupCompleted" BOOLEAN NOT NULL DEFAULT false;

UPDATE "Member" SET "setupCompleted" = true;
