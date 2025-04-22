-- CreateTable
CREATE TABLE "UserSkillPerformance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "skillTag" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "averageScore" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSkillPerformance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSkillPerformance_userId_lessonId_skillTag_source_key" ON "UserSkillPerformance"("userId", "lessonId", "skillTag", "source");

-- AddForeignKey
ALTER TABLE "UserSkillPerformance" ADD CONSTRAINT "UserSkillPerformance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSkillPerformance" ADD CONSTRAINT "UserSkillPerformance_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
