-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "isChoiceImage" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "questionImage" TEXT,
ALTER COLUMN "question" DROP NOT NULL;
