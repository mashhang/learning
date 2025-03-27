import { Router } from "express";
import { prioritizeLessons } from "../utils/lessonPriority";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// GET /api/user/:userId/prioritized-lessons
// router.get("/:userId/prioritized-lessons", async (req, res) => {
//   const { userId } = req.params;

//   try {
//     const priorities = await prisma.userLessonPriority.findMany({
//       where: { userId },
//       include: {
//         lesson: {
//           include: { chapter: true },
//         },
//       },
//       orderBy: { priority: "desc" },
//     });

//     res.status(200).json(priorities);
//   } catch (err) {
//     console.error("Error fetching prioritized lessons:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });
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
    ...item,
    lesson: {
      ...item.lesson,
      progress: item.progress, // ✅ attach progress directly to lesson
    },
  }));

  res.json(formatted); // ✅ Send formatted data to frontend
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

// // GET /api/user/:userId/top-priority-lesson
// router.get("/:userId/top-priority-lesson", async (req, res) => {
//   const { userId } = req.params;

//   try {
//     const topLesson = await prisma.userLessonPriority.findFirst({
//       where: { userId },
//       include: {
//         lesson: {
//           include: { chapter: true },
//         },
//       },
//       orderBy: { priority: "desc" },
//     });

//     if (!topLesson) {
//       return res.status(404).json({ error: "No prioritized lesson found" });
//     }

//     res.status(200).json(topLesson.lesson);
//   } catch (error) {
//     console.error("Top lesson error:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// });
