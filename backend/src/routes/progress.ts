import { Router, Request, Response, RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

const API_URL = process.env.API_URL || "http://192.168.1.6:5001";

/**
 * PATCH /api/progress
 * Update progress and currentPage
 */
const handler: RequestHandler = async (req, res) => {
  const { userId, lessonId, currentPage, totalPages } = req.body;

  if (!userId || !lessonId || !totalPages || currentPage === undefined) {
    res.status(400).json({ error: "Missing fields" });
    return;
  }

  try {
    let newProgress = parseFloat((currentPage / totalPages).toFixed(2));
    if (currentPage === totalPages) newProgress = 1; // ✅ force 100% on last page

    // ✅ Check if progress entry exists first
    const existing = await prisma.userLessonPriority.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
    });

    if (!existing) {
      res.status(404).json({ error: "Progress row not found. Cannot update." });
      return; // ✅ Add this so it doesn't proceed
    }

    // ✅ Proceed to update
    await prisma.userLessonPriority.update({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      data: {
        progress: newProgress,
        currentPage, // ✅ Save this too!
        updatedAt: new Date(), // ✅ Force update of timestamp
      },
    });

    res
      .status(200)
      .json({ message: "Progress updated", progress: newProgress });
  } catch (error) {
    console.error("Error updating progress:", error);
    res.status(500).json({ error: "Failed to update progress" });
  }
};

router.patch("/", handler);

// GET /api/progress/ordered/:userId
router.get("/ordered/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const lessons = await prisma.lesson.findMany({
      include: {
        chapter: true,
        pages: {
          orderBy: { order: "asc" },
        },
        lessonPriorities: {
          where: { userId },
          select: {
            lessonId: true, // ✅ This is what was missing
            progress: true,
            updatedAt: true,
            priority: true, // ✅ ADD THIS
          },
        },
      },
      orderBy: [{ chapter: { order: "asc" } }, { order: "asc" }],
    });

    const result = lessons.map((lesson) => {
      const priorityData = lesson.lessonPriorities[0] ?? {};

      return {
        id: lesson.id,
        lessonId: priorityData.lessonId ?? lesson.id, // ✅ Add this line to make lessonId available!
        title: lesson.title,
        chapterId: lesson.chapterId,
        chapterTitle: lesson.chapter.title,
        progress: priorityData.progress ?? 0,
        updatedAt: priorityData.updatedAt ?? null,
        priority: priorityData.priority ?? 0,
        pages: lesson.pages.map((p) => ({
          content: p.content,
          media: p.media
            ? p.media.startsWith("/uploads/")
              ? `${API_URL}${p.media}`
              : `${API_URL}/uploads/${p.media}`
            : null,
          order: p.order,
        })),
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching ordered progress:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /api/progress/:userId/:lessonId
 * Get currentPage of a user's lesson progress
 */
router.get("/:userId/:lessonId", async (req, res) => {
  const { userId, lessonId } = req.params;

  try {
    const progress = await prisma.userLessonPriority.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
    });

    if (!progress) {
      res.status(404).json({ error: "Progress not found" });
    } else {
      res.status(200).json({ currentPage: progress.currentPage });
    }
  } catch (error) {
    console.error("Error fetching current page:", error);
    res.status(500).json({ error: "Failed to fetch current page" });
  }
});

export default router;
