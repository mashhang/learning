/*
  Warnings:

  - A unique constraint covering the columns `[lessonId,order]` on the table `LessonPage` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "LessonPage_lessonId_order_key" ON "LessonPage"("lessonId", "order");
