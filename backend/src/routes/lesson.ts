import { Request, Response, NextFunction, RequestHandler } from "express";
import { PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient();
const API_URL = process.env.API_URL || "http://192.168.1.4:5001"; // ✅ Use backend env

// ✅ Extend Express Request type to include `user`
declare module global {
  interface Request {
    user?: User;
    file?: Express.Multer.File; // ✅ Extend Request type to include `file`
  }
}

/**
 * ✅ GET ALL LESSONS
 */
export const getLessons: RequestHandler = async (_req, res) => {
  try {
    const lessons = await prisma.lesson.findMany({
      include: {
        chapter: true, // Include chapter details
        questions: true, // Include related questions
      },
      // orderBy: { title: "asc" },
    });

    // ✅ Sort lessons using natural sorting (Lesson 1, Lesson 2, Lesson 3, etc.)
    lessons.sort((a, b) =>
      new Intl.Collator(undefined, {
        numeric: true,
        sensitivity: "base",
      }).compare(a.title, b.title)
    );

    // Ensure the response includes `chapterId`
    res.status(200).json(
      lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        content: lesson.content,
        chapterId: lesson.chapterId,
        chapterTitle: lesson.chapter ? lesson.chapter.title : "Unassigned", // ✅ Include Chapter Title
        media: lesson.media
          ? `${API_URL}${lesson.media.startsWith("/") ? "" : "/"}${
              lesson.media
            }`
          : null, // ✅ Ensure full path
      }))
    );
  } catch (error) {
    console.error("Error fetching lessons:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * ✅ GET A SINGLE LESSON BY ID
 */
export const getLessonById: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const lessonId = req.params.id;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { questions: true },
    });
    if (!lesson) {
      res.status(404).json({ error: "Lesson not found" });
      return;
    }

    res.status(200).json(lesson);
  } catch (error) {
    console.error("Error fetching lesson:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * ✅ UPDATE A LESSON
 */
export const updateLesson: RequestHandler = async (req, res) => {
  try {
    const { title, content, questions } = req.body;
    const lessonId = req.params.id;
    const media = req.file ? `/uploads/${req.file.filename}` : undefined; // ✅ Store File URL

    if (!req.user || req.user.role !== "ADMIN") {
      res
        .status(403)
        .json({ error: "Forbidden: Only admins can update lessons" });
      return;
    }

    const updateData: { title?: string; content?: string; media?: string } = {
      title,
      content,
    };
    if (media) updateData.media = media; // ✅ Only update media if present

    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: updateData,
    });

    res.status(200).json(updatedLesson);
  } catch (error) {
    console.error("Error updating lesson:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * ✅ DELETE A LESSON
 */
export const deleteLesson: RequestHandler = async (req, res): Promise<void> => {
  try {
    const lessonId = req.params.id;

    // Check if the lesson exists before deleting
    const existingLesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!existingLesson) {
      res.status(404).json({ error: "Lesson not found" });
      return;
    }

    await prisma.lesson.delete({ where: { id: lessonId } });

    res.status(200).json({ message: "Lesson deleted successfully" });
  } catch (error) {
    console.error("Error deleting lesson:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * ✅ CREATE A NEW LESSON INSIDE A CHAPTER
 */
export const createLesson: RequestHandler = async (req, res) => {
  try {
    const { title, content, chapterId, questions } = req.body;
    const media = req.file ? `/uploads/${req.file.filename}` : null; // ✅ Store File URL

    if (!req.user || req.user.role !== "ADMIN") {
      res
        .status(403)
        .json({ error: "Forbidden: Only admins can create lessons" });
      return;
    }

    if (!title || !content || !chapterId) {
      res
        .status(400)
        .json({ error: "Title, content, and chapterId are required" });
      return;
    }

    const lesson = await prisma.lesson.create({
      data: {
        title,
        content,
        chapterId,
        media,
        questions: {
          create: Array.isArray(questions)
            ? questions.map((q: any) => ({
                question: q.question,
                choices: q.choices,
                correctAnswer: q.correctAnswer,
              }))
            : [],
        },
      },
      include: { questions: true },
    });

    res.status(201).json({ message: "Lesson created successfully!", lesson });
  } catch (error) {
    console.error("Error creating lesson:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
