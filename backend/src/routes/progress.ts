import { Router, Request, Response, RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

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
    const newProgress = parseFloat((currentPage / totalPages).toFixed(2));

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
