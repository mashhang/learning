import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

router.get("/api/lessons/export-all", async (req, res) => {
  try {
    const lessons = await prisma.lesson.findMany({
      include: {
        questions: true,
        exampleExercises: true,
      },
    });

    const result = lessons.map((lesson) => ({
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      questions: lesson.questions.map((q) => ({
        question: q.question,
        questionEquation: q.questionEquation,
        choices: q.choices,
        correctAnswer: q.correctAnswer,
        skillTag: q.skillTag,
      })),
      exercises: lesson.exampleExercises.map((ex) => ({
        question: ex.question,
        exerciseEquation: ex.exerciseEquation,
        choices: ex.choices,
        correctAnswer: ex.correctAnswer,
        explanation: ex.explanation,
        explanationEquation: ex.explanationEquation,
        difficulty: ex.difficulty,
        skillTag: ex.skillTag,
      })),
    }));

    res.json(result);
  } catch (error) {
    console.error("❌ Export error:", error);
    res.status(500).json({ error: "Failed to export lessons" });
  }
});

export default router;
