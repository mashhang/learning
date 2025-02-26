import { Request, Response, RequestHandler } from "express";
import { PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * ✅ Extend Express Request Type to Include `user`
 */
declare module "express-serve-static-core" {
  interface Request {
    user?: User; // ✅ Allow `req.user`
  }
}

/**
 * ✅ GET ALL CHAPTERS
 */
export const getChapters: RequestHandler = async (_req, res): Promise<void> => {
  try {
    const chapters = await prisma.chapter.findMany({
      include: { lessons: true },
    });
    res.status(200).json(chapters);
  } catch (error) {
    console.error("Error fetching chapters:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * ✅ GET A SINGLE CHAPTER
 */
export const getChapterById: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const chapterId = req.params.id;

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { lessons: true }, // ✅ Include lessons in the chapter
    });

    if (!chapter) {
      res.status(404).json({ error: "Chapter not found" });
      return;
    }

    res.status(200).json(chapter);
  } catch (error) {
    console.error("Error fetching chapter:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * ✅ CREATE A NEW CHAPTER
 */
export const createChapter: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const { title } = req.body;

    if (!title) {
      res.status(400).json({ error: "Title is required" });
      return;
    }

    const chapter = await prisma.chapter.create({
      data: { title },
    });

    res.status(201).json(chapter);
  } catch (error) {
    console.error("Error creating chapter:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * ✅ DELETE A CHAPTER
 */
export const deleteChapter: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const chapterId = req.params.id;

    // ✅ Check if the chapter exists
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { lessons: true }, // ✅ Check if it has lessons
    });

    if (!chapter) {
      res.status(404).json({ error: "Chapter not found" });
      return; // ✅ Ensure function execution stops here
    }

    // ✅ Prevent deletion if lessons exist
    if (chapter.lessons.length > 0) {
      res.status(400).json({
        error:
          "Cannot delete chapter with existing lessons. Delete lessons first.",
      });
      return; // ✅ Stop function execution
    }

    // ✅ Delete the chapter
    await prisma.chapter.delete({ where: { id: chapterId } });

    res.status(200).json({ message: "Chapter deleted successfully" });
    return; // ✅ Ensure function execution stops
  } catch (error) {
    console.error("Error deleting chapter:", error);
    res.status(500).json({ error: "Internal Server Error" });
    return; // ✅ Explicitly return void
  }
};

/**
 * ✅ UPDATE A CHAPTER
 */
export const updateChapter: RequestHandler = async (req, res) => {
  try {
    const chapterId = req.params.id;
    const { title } = req.body;

    if (!req.user) {
      res.status(401).json({ error: "Unauthorized: No user found" });
      return; // ✅ Ensure void return
    }

    if (req.user.role !== "ADMIN") {
      res
        .status(403)
        .json({ error: "Forbidden: Only admins can update chapters" });
      return;
    }

    const existingChapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
    });

    if (!existingChapter) {
      res.status(404).json({ error: "Chapter not found" });
      return;
    }

    const updatedChapter = await prisma.chapter.update({
      where: { id: chapterId },
      data: { title },
    });

    res.status(200).json(updatedChapter);
  } catch (error) {
    console.error("Error updating chapter:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
