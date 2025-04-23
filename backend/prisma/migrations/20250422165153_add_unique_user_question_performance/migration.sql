/*
  Warnings:

  - A unique constraint covering the columns `[userId,questionId,source]` on the table `UserQuestionPerformance` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserQuestionPerformance_userId_questionId_source_key" ON "UserQuestionPerformance"("userId", "questionId", "source");
