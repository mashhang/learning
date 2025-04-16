/*
  Warnings:

  - You are about to drop the column `content` on the `ExampleExercise` table. All the data in the column will be lost.
  - Added the required column `question` to the `ExampleExercise` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ExampleExercise" DROP COLUMN "content",
ADD COLUMN     "question" TEXT NOT NULL;
