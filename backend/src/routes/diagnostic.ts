import { Router } from "express";
import { prioritizeLessons } from "../utils/lessonPriority";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.get("/:userId/prioritized-lessons", async (req, res) => {
  const { userId } = req.params;

  const prioritizedLessons = await prisma.userLessonPriority.findMany({
    where: { userId },
    include: {
      lesson: {
        include: { chapter: true },
      },
    },
    orderBy: {
      priority: "desc",
    },
  });

  // ✅ Put this formatting logic here
  const formatted = prioritizedLessons.map((item) => ({
    lessonId: item.lessonId,
    title: item.lesson?.title ?? "Untitled",
    chapterId: item.lesson?.chapterId ?? null,
    chapterTitle: item.lesson?.chapter?.title ?? null,
    progress: item.progress,
    priority: item.priority,
  }));

  res.status(200).json(formatted);
});

// POST /api/diagnostic/submit
router.post("/submit", async (req, res) => {
  const { userId, results } = req.body;

  try {
    const priorities = prioritizeLessons(results); // ✅ your new function will be called here

    // ❗️ Delete previous priorities for the user
    await prisma.userLessonPriority.deleteMany({
      where: { userId },
    });

    // Save priorities
    await prisma.userLessonPriority.createMany({
      data: priorities.map((p) => ({
        userId,
        lessonId: p.lessonId,
        priority: p.priority,
      })),
      skipDuplicates: true, // Avoid inserting duplicates
    });

    // Update diagnostic flag
    await prisma.user.update({
      where: { id: userId },
      data: { hasTakenDiagnostic: true },
    });

    res.status(200).json({ message: "Priorities saved", priorities });
  } catch (err) {
    console.error("Diagnostic error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
