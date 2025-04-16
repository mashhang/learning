import { Router } from "express";
import { prioritizeLessons } from "../utils/lessonPriority";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// // This should be ignore since we are not using it anymore (no sorting for lesson now)
// router.get("/:userId/prioritized-lessons", async (req, res) => {
//   const { userId } = req.params;

//   const prioritizedLessons = await prisma.userLessonPriority.findMany({
//     where: { userId },
//     include: {
//       lesson: {
//         include: { chapter: true },
//       },
//     },
//     orderBy: {
//       priority: "desc",
//     },
//   });

//   // ✅ Put this formatting logic here
//   const formatted = prioritizedLessons.map((item) => ({
//     lessonId: item.lessonId,
//     title: item.lesson?.title ?? "Untitled",
//     chapterId: item.lesson?.chapterId ?? null,
//     chapterTitle: item.lesson?.chapter?.title ?? null,
//     progress: item.progress,
//     priority: item.priority,
//     updatedAt: item.updatedAt, // ✅ Add this!
//   }));

//   res.status(200).json(formatted);
// });

// GET /api/lessons/by-user/:userId (new)
router.get("/lessons/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const lessons = await prisma.lesson.findMany({
      include: {
        chapter: true,
      },
      orderBy: [
        { chapter: { order: "asc" } }, // ✅ assumes you have chapter.order field
        { order: "asc" }, // ✅ assumes lessons have order field too
      ],
    });

    const formatted = lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      chapterId: lesson.chapterId,
      chapterTitle: lesson.chapter.title,
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error("Error fetching lessons:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/diagnostic/submit
router.post("/submit", async (req, res) => {
  const { userId, results } = req.body;

  try {
    const maxExpectedTime = 20; // seconds

    console.log("📨 Incoming submission for user:", userId);
    console.log("📊 Total results:", results.length);

    // 🧽 Delete old records
    await prisma.diagnosticAnswer.deleteMany({ where: { userId } });
    const deleted = await prisma.userLessonPriority.deleteMany({
      where: { userId },
    });
    console.log("🗑️ Deleted old priorities:", deleted.count);

    // 💾 Save all diagnostic answers
    for (const r of results) {
      await prisma.diagnosticAnswer.create({
        data: {
          userId,
          questionId: r.questionId,
          lessonId: r.lessonId,
          timeTaken: r.timeTaken,
          isCorrect: r.isCorrect,
        },
      });
    }

    // 🧠 Group and compute priorities
    const lessonMap: Record<
      string,
      { scores: number[]; total: number; correct: number }
    > = {};

    for (const r of results) {
      const score = r.timeTaken / maxExpectedTime + (r.isCorrect ? 0 : 1);

      if (!lessonMap[r.lessonId]) {
        lessonMap[r.lessonId] = { scores: [], total: 0, correct: 0 };
      }

      lessonMap[r.lessonId].scores.push(score);
      lessonMap[r.lessonId].total++;
      if (r.isCorrect) lessonMap[r.lessonId].correct++;
    }

    const priorities = Object.entries(lessonMap).map(([lessonId, data]) => {
      const avgDifficulty =
        data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
      const isCompleted = data.correct === data.total;
      const completionFactor = isCompleted ? 0 : 1;
      const rawPriority = (1 / avgDifficulty) * completionFactor;

      return {
        lessonId,
        priority: parseFloat(rawPriority.toFixed(6)),
      };
    });

    if (priorities.length === 0) {
      res.status(400).json({ error: "No priorities could be calculated." });
    }

    // ✅ Save computed priorities to UserLessonPriority
    await prisma.userLessonPriority.createMany({
      data: priorities.map((p) => ({
        userId,
        lessonId: p.lessonId,
        priority: p.priority,
        progress: 0,
        currentPage: 0,
        updatedAt: new Date(),
      })),
    });

    // 🟢 Update user flag
    await prisma.user.update({
      where: { id: userId },
      data: { hasTakenDiagnostic: true },
    });

    // 🧾 Debug logs
    const sortedPriorities = [...priorities].sort(
      (a, b) => b.priority - a.priority
    );

    const lessons = await prisma.lesson.findMany({
      where: {
        id: { in: sortedPriorities.map((p) => p.lessonId) },
      },
      select: { id: true, title: true },
    });

    const lessonTitleMap = Object.fromEntries(
      lessons.map((l) => [l.id, l.title])
    );

    console.log("🧠 Computed Lesson Priorities (sorted):");
    sortedPriorities.forEach((p, i) =>
      console.log(
        `#${i + 1}: ${lessonTitleMap[p.lessonId] || "Untitled"} (ID: ${
          p.lessonId
        }) → Priority: ${p.priority}`
      )
    );

    res.status(200).json({ message: "Diagnostic submitted", priorities });
  } catch (err) {
    console.error("❌ Diagnostic error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
