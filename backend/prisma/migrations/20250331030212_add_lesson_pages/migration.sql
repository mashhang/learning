-- CreateTable
CREATE TABLE "LessonPage" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "media" TEXT,
    "order" INTEGER NOT NULL,
    "lessonId" TEXT NOT NULL,

    CONSTRAINT "LessonPage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LessonPage" ADD CONSTRAINT "LessonPage_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
