import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateUser } from "../routes/auth.js"; // ✅ Use your auth middleware

const prisma = new PrismaClient();
const router = Router();

// ✅ GET /api/user-announcements/me
router.get("/me", authenticateUser, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const records = await prisma.userAnnouncement.findMany({
      where: {
        userId,
        isRead: true,
      },
      select: {
        announcementId: true,
      },
    });

    res.status(200).json(records);
  } catch (error) {
    console.error("Failed to fetch user announcement status:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/user-announcements/:announcementId/mark-read
router.post(
  "/:announcementId/mark-read",
  authenticateUser,
  async (req, res) => {
    try {
      const { announcementId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      // Check if already exists
      const existing = await prisma.userAnnouncement.findFirst({
        where: {
          userId,
          announcementId,
        },
      });

      if (existing) {
        // If exists, update isRead = true
        await prisma.userAnnouncement.update({
          where: { id: existing.id },
          data: {
            isRead: true,
            readAt: new Date(),
          },
        });
      } else {
        // If not, create new record
        await prisma.userAnnouncement.create({
          data: {
            userId,
            announcementId,
            isRead: true,
            readAt: new Date(),
          },
        });
      }

      res.status(200).json({ message: "Marked as read" });
    } catch (error) {
      console.error("Error marking announcement as read:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;
