import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

router.get("/exercises/:lessonId", async (req, res) => {
  const { lessonId } = req.params;
  try {
    const exercises = await prisma.exampleExercise.findMany({
      where: { lessonId },
      orderBy: { createdAt: "asc" },
    });
    res.json(exercises);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch exercises" });
  }
});

router.post("/exercises", async (req, res) => {
  const { lessonId, exercises } = req.body;

  try {
    // ✅ Step 1: Delete existing exercises for the lesson
    await prisma.exampleExercise.deleteMany({
      where: { lessonId },
    });

    // ✅ Step 2: Prepare new data with explanation
    const data = exercises.map((ex: any) => ({
      lessonId,
      question: ex.question,
      exerciseEquation: ex.exerciseEquation ?? null,
      choices: ex.choices,
      correctAnswer: ex.correctAnswer,
      difficulty: ex.difficulty,
      skillTag: ex.skillTag?.trim() || null,
      isChoiceImage: ex.isChoiceImage ?? false,
      questionImage: ex.questionImage ?? null,
      explanation: ex.explanation?.trim() || null,
      explanationEquation: ex.explanationEquation?.trim() || null,
    }));

    // ✅ Step 3: Create new exercises
    await prisma.exampleExercise.createMany({ data });

    res.json({ message: "Exercises saved successfully" });
  } catch (err: any) {
    console.error("❌ Failed to save exercises:", err.message, err.stack);
    res
      .status(500)
      .json({ error: "Failed to save exercises", details: err.message });
  }
});

// GET /api/exercises/:lessonId/unanswered
router.post("/exercises/:lessonId/unanswered", async (req, res) => {
  const { lessonId } = req.params;
  const { excludeIds = [] } = req.body; // array of exercise IDs

  try {
    const exercises = await prisma.exampleExercise.findMany({
      where: {
        lessonId,
        id: { notIn: excludeIds },
      },
      orderBy: { createdAt: "desc" },
      take: 3, // or however many you want to return
    });

    res.json(exercises);
  } catch (err) {
    console.error("❌ Failed to fetch additional exercises:", err);
    res.status(500).json({ error: "Failed to fetch additional exercises" });
  }
});

// UPDATE
router.put("/exercises/:id", async (req, res) => {
  const { id } = req.params;
  const {
    question,
    exerciseEquation,
    choices,
    correctAnswer,
    explanation,
    explanationEquation,
    difficulty,
    skillTag,
  } = req.body;

  try {
    const updatedExercise = await prisma.exampleExercise.update({
      where: { id },
      data: {
        question,
        exerciseEquation,
        choices,
        correctAnswer,
        explanation,
        explanationEquation,
        difficulty,
        skillTag,
      },
    });

    res.json(updatedExercise);
  } catch (err) {
    console.error("❌ Failed to update exercise:", err);
    res.status(500).json({ error: "Failed to update exercise" });
  }
});

// This route is for adding a new exercise to a lesson
router.post("/exercise", async (req, res) => {
  const {
    lessonId,
    question,
    exerciseEquation,
    choices,
    correctAnswer,
    explanation,
    explanationEquation,
    difficulty,
    skillTag,
  } = req.body;

  try {
    const newExercise = await prisma.exampleExercise.create({
      data: {
        lessonId,
        question,
        exerciseEquation,
        choices,
        correctAnswer,
        explanation,
        explanationEquation,
        difficulty,
        skillTag,
      },
    });

    res.json(newExercise);
  } catch (err) {
    console.error("❌ Failed to create exercise:", err);
    res.status(500).json({ error: "Failed to create exercise" });
  }
});

//DELETE
router.delete("/exercises/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.exampleExercise.delete({ where: { id } });
    res.json({ message: "Exercise deleted" });
  } catch (err) {
    console.error("❌ Failed to delete exercise:", err);
    res.status(500).json({ error: "Failed to delete exercise" });
  }
});

// POST /api/exercises/prioritized
router.post("/exercises/prioritized", async (req, res) => {
  const { userId, lessonId } = req.body;

  if (!userId || !lessonId) {
    res.status(400).json({ error: "Missing userId or lessonId." });
    return;
  }

  try {
    const exercises = await prisma.exampleExercise.findMany({
      where: { lessonId },
    });

    // Attempt to fetch diagnostic skill performance
    const skillScores = await prisma.userSkillPerformance.findMany({
      where: { userId, lessonId, source: "DIAGNOSTIC" },
    });

    if (skillScores.length > 0) {
      const skillMap: Record<string, number> = {};
      skillScores.forEach((s) => {
        skillMap[s.skillTag] = s.averageScore;
      });

      const scored = exercises.map((ex) => ({
        ...ex,
        priorityScore: skillMap[ex.skillTag || ""] ?? 1,
      }));

      scored.sort((a, b) => a.priorityScore - b.priorityScore);
      res.json(scored);
      return;
    }

    // Fallback to pre-assessment question performance
    const questionScores = await prisma.userQuestionPerformance.findMany({
      where: { userId, lessonId, source: "PRE" },
    });

    if (questionScores.length > 0) {
      const questionMap = new Map(
        questionScores.map((entry) => [entry.questionId, entry.averageScore])
      );

      const scored = exercises.map((ex) => ({
        ...ex,
        priorityScore: questionMap.get(ex.id) ?? 1,
      }));

      scored.sort((a, b) => a.priorityScore - b.priorityScore);
      res.json(scored);
      return;
    }

    // Default priority if no performance data is available
    const defaultScored = exercises.map((ex) => ({
      ...ex,
      priorityScore: 1,
    }));

    res.json(defaultScored);
    return;
  } catch (err) {
    console.error("❌ Failed to fetch prioritized exercises:", err);
    res.status(500).json({ error: "Failed to fetch prioritized exercises." });
    return;
  }
});

// GET /api/exercises/all
router.get("/exercises-all", async (req, res) => {
  try {
    const allExercises = await prisma.exampleExercise.findMany({
      include: {
        lesson: {
          include: {
            chapter: true,
          },
        },
      },
      orderBy: [
        { lesson: { chapter: { title: "asc" } } },
        { lesson: { title: "asc" } },
        { createdAt: "asc" },
      ],
    });

    const formatted = allExercises.map((ex) => ({
      lessonId: ex.lessonId,
      lessonTitle: ex.lesson.title,
      chapterTitle: ex.lesson.chapter.title,
      question: ex.question,
      exerciseEquation: ex.exerciseEquation ?? null,
      choices: ex.choices,
      correctAnswer: ex.correctAnswer,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ Failed to fetch all exercises:", err);
    res.status(500).json({ error: "Failed to fetch all exercises." });
  }
});

export default router;
