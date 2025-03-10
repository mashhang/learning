import { Request, Response, NextFunction, RequestHandler } from "express";
import { PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ Extend Express Request type to include `user`
declare module "express-serve-static-core" {
  interface Request {
    user?: User;
  }
}

/**
 * ✅ GET ALL LESSONS
 */
export const getLessons: RequestHandler = async (_req, res) => {
  try {
    const lessons = await prisma.lesson.findMany({
      include: { questions: true }, // Include related questions
      orderBy: { createdAt: "asc" }, // Ensure lessons are ordered
    });
    res.status(200).json(lessons);
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
export const updateLesson = async (req: Request, res: Response) => {
  try {
    const { title, content, questions } = req.body;
    const lessonId = req.params.id;

    if (!req.user || req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ error: "Forbidden: Only admins can update lessons" });
    }

    // ✅ Update the lesson details
    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: { title, content },
    });

    // ✅ Process questions: Update existing ones or create new ones
    if (questions && questions.length > 0) {
      await Promise.all(
        questions.map(async (q: any) => {
          if (q.id) {
            // ✅ Update existing question
            await prisma.question.update({
              where: { id: q.id },
              data: {
                question: q.question,
                choices: q.choices,
                correctAnswer: q.correctAnswer,
              },
            });
          } else {
            // ✅ Create new question
            await prisma.question.create({
              data: {
                lessonId,
                question: q.question,
                choices: q.choices,
                correctAnswer: q.correctAnswer,
              },
            });
          }
        })
      );
    }

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
export const createLesson: RequestHandler = async (
  req,
  res,
  next
): Promise<void> => {
  try {
    const { title, content, chapterId, questions } = req.body;

    if (!req.user) {
      res.status(401).json({ error: "Unauthorized: No user found" });
      return;
    }

    if (req.user.role !== "ADMIN") {
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

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
    });

    if (!chapter) {
      res.status(404).json({ error: "Chapter not found" });
      return;
    }

    const lesson = await prisma.lesson.create({
      data: {
        title,
        content,
        chapterId,
        questions: {
          create: questions.map((q: any) => ({
            question: q.question,
            choices: q.choices,
            correctAnswer: q.correctAnswer,
          })),
        },
      },
      include: { questions: true }, // Include questions in response
    });

    res.status(201).json(lesson);
  } catch (error) {
    console.error("Error creating lesson:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
