import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

// This route is for adding a new question to a lesson
router.post("/questions", async (req, res) => {
  const { lessonId, question, questionEquation, choices, correctAnswer } =
    req.body;

  try {
    const newQuestion = await prisma.question.create({
      data: {
        lessonId,
        question,
        questionEquation,
        choices,
        correctAnswer,
        isChoiceImage: false,
      },
    });

    res.status(201).json(newQuestion);
  } catch (err) {
    console.error("❌ Failed to add question:", err);
    res.status(500).json({ error: "Failed to add question" });
  }
});

//UPDATE
router.put("/questions/:id", async (req, res) => {
  const { id } = req.params;
  const {
    question,
    questionEquation,
    choices,
    correctAnswer,
    isChoiceImage,
    questionImage,
  } = req.body;

  try {
    const updated = await prisma.question.update({
      where: { id },
      data: {
        question,
        questionEquation,
        choices,
        correctAnswer,
        isChoiceImage: isChoiceImage ?? false,
        questionImage: questionImage ?? null,
        skillTag: req.body.skillTag || null,
      },
    });

    res.status(200).json(updated);
  } catch (err) {
    console.error("❌ Failed to update question:", err);
    res.status(500).json({ error: "Failed to update question" });
  }
});

//DELETE
router.delete("/questions/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.question.delete({
      where: { id },
    });

    res.status(200).json({ message: "Question deleted successfully" });
  } catch (err) {
    console.error("❌ Failed to delete question:", err);
    res.status(500).json({ error: "Failed to delete question" });
  }
});

// GET /api/user/:userId/lesson/:lessonId/questions/post
router.get(
  "/user/:userId/lesson/:lessonId/questions/post",
  async (req, res) => {
    const { userId, lessonId } = req.params;

    try {
      const all = await prisma.question.findMany({ where: { lessonId } });

      const questionScores = await prisma.userQuestionPerformance.findMany({
        where: { userId, lessonId, source: "PRE" }, // use PRE assessment result
      });

      const map = new Map(
        questionScores.map((q) => [q.questionId, q.averageScore])
      );

      const sorted = all
        .map((q) => ({
          ...q,
          difficulty: map.get(q.id) ?? 1,
        }))
        .sort((a, b) => a.difficulty - b.difficulty); // easiest to hardest

      const final = sorted.slice(0, 15); // pick top 15 questions
      res.json(final);
    } catch (err) {
      console.error("❌ Failed to fetch post-assessment questions:", err);
      res
        .status(500)
        .json({ error: "Failed to fetch post-assessment questions." });
    }
  }
);

export default router;
