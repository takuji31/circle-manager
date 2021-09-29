/*
  Warnings:

  - Made the column `name` on table `Circle` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Circle" ALTER COLUMN "name" SET NOT NULL;
