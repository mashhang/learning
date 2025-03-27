/*
  Warnings:

  - You are about to drop the column `progress` on the `Lesson` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "progress";

-- AlterTable
ALTER TABLE "UserLessonPriority" ADD COLUMN     "progress" DOUBLE PRECISION NOT NULL DEFAULT 0.0;
