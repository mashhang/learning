import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET all announcements
export const getAnnouncements = async (req: Request, res: Response) => {
  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.status(200).json(announcements);
};

// POST a new announcement
export const createAnnouncement = async (req: Request, res: Response) => {
  const { title, content, author } = req.body;
  const newAnnouncement = await prisma.announcement.create({
    data: { title, content, author },
  });
  res.status(201).json(newAnnouncement);
};

// PUT update existing announcement
export const updateAnnouncement = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, content, author } = req.body;

  try {
    // Update the announcement itself
    const updated = await prisma.announcement.update({
      where: { id },
      data: { title, content, author },
    });

    // 🛠 After updating the announcement:
    // Reset all related UserAnnouncement records to isRead = false
    await prisma.userAnnouncement.updateMany({
      where: { announcementId: id },
      data: {
        isRead: false,
        readAt: null, // optional: reset read date too
      },
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error("Error updating announcement:", error);
    res.status(500).json({ error: "Failed to update announcement." });
  }
};

// DELETE announcement
export const deleteAnnouncement = async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.announcement.delete({
    where: { id },
  });

  res.status(200).json({ message: "Announcement deleted" });
};

// POST mark as read
export const markAnnouncementAsRead = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.body; // send userId from frontend

  const existing = await prisma.userAnnouncement.findFirst({
    where: { userId, announcementId: id },
  });

  if (existing) {
    await prisma.userAnnouncement.update({
      where: { id: existing.id },
      data: { isRead: true, readAt: new Date() },
    });
  } else {
    await prisma.userAnnouncement.create({
      data: { userId, announcementId: id, isRead: true, readAt: new Date() },
    });
  }

  res.status(200).json({ message: "Marked as read" });
};
