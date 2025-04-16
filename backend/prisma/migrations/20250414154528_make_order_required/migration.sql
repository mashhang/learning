/*
  Warnings:

  - Made the column `order` on table `Chapter` required. This step will fail if there are existing NULL values in that column.
  - Made the column `order` on table `Lesson` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Chapter" ALTER COLUMN "order" SET NOT NULL;

-- AlterTable
ALTER TABLE "Lesson" ALTER COLUMN "order" SET NOT NULL;
