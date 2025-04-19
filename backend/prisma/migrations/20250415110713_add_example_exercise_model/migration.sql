-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateTable
CREATE TABLE "ExampleExercise" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "choices" TEXT[],
    "correctAnswer" TEXT NOT NULL,
    "skillTag" TEXT,
    "difficulty" "DifficultyLevel" NOT NULL DEFAULT 'MEDIUM',
    "isChoiceImage" BOOLEAN NOT NULL DEFAULT false,
    "questionImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExampleExercise_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ExampleExercise" ADD CONSTRAINT "ExampleExercise_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
