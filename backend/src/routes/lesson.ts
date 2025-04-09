import { Request, Response, NextFunction, RequestHandler } from "express";
import { PrismaClient, User } from "@prisma/client";
import { AuthenticatedRequest } from "../types/express";
import { deleteFile } from "../utils/deleteFile";
import { Multer } from "multer";

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
        // chapter: true, // Include chapter details
        // questions: true, // Include related questions
        chapter: true, // ✅ include chapter relation
        questions: {
          select: {
            id: true,
            question: true,
            questionImage: true, // ✅ include this
            choices: true,
            correctAnswer: true,
            isChoiceImage: true,
          },
        },
        pages: {
          orderBy: { order: "asc" }, // ✅ ensure consistent ordering
        },
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
        chapterId: lesson.chapterId,
        chapterTitle: lesson.chapter?.title || "Unassigned",
        media:
          lesson.media && !lesson.media.startsWith("http")
            ? `${API_URL}${lesson.media.startsWith("/") ? "" : "/"}${
                lesson.media
              }`
            : lesson.media || null,
        questions: lesson.questions.map((q) => ({
          id: q.id,
          question: q.question,
          questionImage:
            q.questionImage && !q.questionImage.startsWith("http")
              ? `${API_URL}${q.questionImage.startsWith("/") ? "" : "/"}${
                  q.questionImage
                }`
              : q.questionImage || null,
          choices: q.choices,
          correctAnswer: q.correctAnswer,
          isChoiceImage: q.isChoiceImage,
        })),
        pages: Array.isArray(lesson.pages)
          ? lesson.pages.map((p) => ({
              content: p.content,
              media: p.media,
              order: p.order,
            }))
          : [],
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
      include: {
        questions: true,
        pages: {
          orderBy: { order: "asc" },
        },
      },
    });
    if (!lesson) {
      res.status(404).json({ error: "Lesson not found" });
      return;
    }

    // ✅ Add full URL to questionImage
    const questionsWithURL = lesson.questions.map((q) => ({
      ...q,
      questionImage:
        q.questionImage && !q.questionImage.startsWith("http")
          ? `${API_URL}${q.questionImage.startsWith("/") ? "" : "/"}${
              q.questionImage
            }`
          : q.questionImage || null,
    }));

    // 🆕 Map media URL on lesson.pages
    const pagesWithMediaURL = lesson.pages.map((p) => ({
      content: p.content,
      media: p.media
        ? p.media.startsWith("/uploads/")
          ? `${API_URL}${p.media}`
          : `${API_URL}/uploads/${p.media}`
        : null,
      order: p.order,
      serverFilename: p.media?.split("/").pop() || null, // 👈 ADD THIS LINE
    }));

    console.log("Loaded pages:", lesson.pages);

    res.status(200).json({
      ...lesson,
      questions: questionsWithURL,
      pages: pagesWithMediaURL, // ✅ return updated pages
    });
  } catch (error) {
    console.error("Error fetching lesson:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * ✅ UPDATE A LESSON
 */
export const updateLesson = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== "ADMIN") {
      res
        .status(403)
        .json({ error: "Forbidden: Only admins can update lessons" });
    }

    const { title, content, chapterId } = req.body;
    const questions = req.body.questions ? JSON.parse(req.body.questions) : [];
    const lessonId = req.params.id;

    const files = req.files as {
      [key: string]: Express.Multer.File[];
    };

    const media = files?.media?.[0]?.filename
      ? `/uploads/${files.media[0].filename}`
      : undefined;

    const updateData: {
      title?: string;
      content?: string;
      media?: string;
      chapterId?: string;
    } = { title, content, chapterId };
    if (media) updateData.media = media;

    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: updateData,
    });

    // ✅ Update Pages with Upsert
    const { pages } = req.body;
    const uploadedPageMediaFiles = files?.pageMedias || [];

    if (pages) {
      const parsedPages = typeof pages === "string" ? JSON.parse(pages) : pages;

      // Get all existing pages from DB
      const existingPages = await prisma.lessonPage.findMany({
        where: { lessonId },
      });

      // Determine which pages were removed
      const idsFromClient = parsedPages.map((p: any) => p.id).filter(Boolean);
      const deletedPages = existingPages.filter(
        (p) => !idsFromClient.includes(p.id)
      );

      // Delete removed pages
      await prisma.lessonPage.deleteMany({
        where: {
          lessonId,
          order: {
            in: deletedPages.map((p) => p.order),
          },
        },
      });

      for (let i = 0; i < parsedPages.length; i++) {
        const p = parsedPages[i];

        const uploadedFile = uploadedPageMediaFiles[i]; // Match by index instead
        const savedFilename = uploadedFile?.filename;

        const mediaPath = savedFilename
          ? `/uploads/${savedFilename}`
          : p.filename
          ? `/uploads/${p.filename.replace("/uploads/", "")}`
          : null;

        await prisma.lessonPage.upsert({
          where: {
            lessonId_order: {
              lessonId,
              order: p.order ?? i + 1,
            },
          },
          update: {
            content: p.content,
            media: mediaPath,
          },
          create: {
            lessonId,
            content: p.content,
            media: mediaPath,
            order: p.order ?? i + 1,
          },
        });
      }
    }

    // ✅ Upsert Questions
    let qImgIndex = 0;
    let cImgIndex = 0;

    for (const q of questions) {
      let questionImagePath: string | null = null;

      if (files?.questionImages?.[qImgIndex]) {
        questionImagePath = `/uploads/${files.questionImages[qImgIndex].filename}`;
        qImgIndex++;
      } else if (typeof q.questionImage === "string") {
        questionImagePath = q.questionImage;
      }

      let choices = q.choices;
      if (q.isChoiceImage && Array.isArray(choices)) {
        choices = choices.map((_c: string, index: number) => {
          const file = files?.choiceImages?.[cImgIndex];
          cImgIndex++;
          return file ? `/uploads/${file.filename}` : _c;
        });
      }

      await prisma.question.upsert({
        where: {
          id: q.id || "", // ensure ID is passed from frontend
        },
        update: {
          question: q.question || null,
          questionImage: questionImagePath,
          choices,
          correctAnswer: q.correctAnswer,
          isChoiceImage: q.isChoiceImage || false,
        },
        create: {
          lessonId,
          question: q.question || null,
          questionImage: questionImagePath,
          choices,
          correctAnswer: q.correctAnswer,
          isChoiceImage: q.isChoiceImage || false,
        },
      });
    }

    const updated = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        questions: true,
        pages: {
          orderBy: { order: "asc" },
        },
      },
    });

    // Include full media URLs and serverFilename again
    const pagesWithMediaURL =
      updated?.pages.map((p) => ({
        content: p.content,
        media: p.media
          ? p.media.startsWith("/uploads/")
            ? `${API_URL}${p.media}`
            : `${API_URL}/uploads/${p.media}`
          : null,
        order: p.order,
        serverFilename: p.media?.split("/").pop() || null,
      })) || [];

    res.status(200).json({
      ...updated,
      pages: pagesWithMediaURL,
    });
  } catch (error) {
    console.error("Error updating lesson:", error);
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
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
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user || req.user.role !== "ADMIN") {
      res
        .status(403)
        .json({ error: "Forbidden: Only admins can create lessons" });
    }

    const files = req.files as {
      media?: Express.Multer.File[];
      questionImages?: Express.Multer.File[];
      choiceImages?: Express.Multer.File[];
      pageMedias?: Express.Multer.File[];
    };

    const { title, chapterId } = req.body;
    const questions = JSON.parse(req.body.questions || "[]");
    const pages = JSON.parse(req.body.pages || "[]");

    // if (!title || !content || !chapterId) {
    if (!title || !chapterId) {
      res
        .status(400)
        .json({ error: "Title, content, and chapterId are required" });
    }

    if (pages.length === 0) {
      console.error("Something went wrong");
      res.status(500).json({ error: "Add at least one page" });
    }

    // Optional: Use first page's content as fallback
    // const fallbackContent = pages[0].content || "";
    const uploadedPageMediaFiles = files?.pageMedias || [];

    const media = files?.media?.[0]?.filename
      ? `/uploads/${files.media[0].filename}`
      : null;

    const createdLesson = await prisma.lesson.create({
      data: {
        title,
        chapterId,
        media,
      },
    });

    // ✅ Safely create lesson pages
    if (Array.isArray(pages) && pages.length > 0) {
      await prisma.lessonPage.createMany({
        data: pages.map((p: any, i: number) => ({
          lessonId: createdLesson.id,
          content: p.content,
          media: uploadedPageMediaFiles[i]
            ? `/uploads/${uploadedPageMediaFiles[i].filename}`
            : null,
          order: p.order,
        })),
      });
    }

    // ✅ Questions
    let qImgIndex = 0;
    let cImgIndex = 0;

    for (const q of questions) {
      let questionImagePath = null;

      if (q.questionImage === true && files?.questionImages?.[qImgIndex]) {
        questionImagePath = `/uploads/${files.questionImages[qImgIndex].filename}`;
        qImgIndex++;
      }

      let choices = q.choices;
      if (q.isChoiceImage && Array.isArray(choices)) {
        choices = choices.map((_c: any) => {
          const file = files?.choiceImages?.[cImgIndex];
          cImgIndex++;
          return file ? `/uploads/${file.filename}` : "";
        });
      }

      await prisma.question.create({
        data: {
          lessonId: createdLesson.id,
          question: q.question || null,
          questionImage: questionImagePath,
          choices,
          correctAnswer: q.correctAnswer,
          isChoiceImage: q.isChoiceImage || false,
        },
      });
    }

    res
      .status(201)
      .json({ message: "Lesson created successfully!", createdLesson });
  } catch (error) {
    console.error(
      "❌ Error creating lesson:",
      error instanceof Error ? error.message : error
    );
    if (error instanceof Error) {
      console.error(error.stack);
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 *
/**
 * ✅ DELETE CONTENT IMAGE
 */
export const deleteContentImage: RequestHandler = (async (req, res) => {
  try {
    const { lessonId, imagePath } = req.body;
    if (!lessonId || !imagePath || typeof imagePath !== "string") {
      res.status(400).json({ error: "Lesson ID and image path are required." });
      return;
    }

    await prisma.lesson.update({
      where: { id: lessonId },
      data: { media: null },
    });

    deleteFile(imagePath.replace(API_URL, ""));
    res.status(200).json({ message: "Content image deleted." });
  } catch (error) {
    console.error("❌ Failed to delete content image:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}) as RequestHandler;

/**
 * ✅ DELETE QUESTION IMAGE
 */
export const deleteQuestionImage: RequestHandler = (async (req, res) => {
  try {
    const { questionId, imagePath } = req.body;
    if (!questionId || !imagePath || typeof imagePath !== "string") {
      res
        .status(400)
        .json({ error: "Question ID and image path are required." });
      return;
    }

    await prisma.question.update({
      where: { id: questionId },
      data: { questionImage: null },
    });

    deleteFile(imagePath.replace(API_URL, ""));
    res.status(200).json({ message: "Question image deleted." });
  } catch (error) {
    console.error("❌ Failed to delete question image:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}) as RequestHandler;

/**
 * ✅ DELETE CHOICE IMAGE
 */
export const deleteChoiceImage: RequestHandler = (async (req, res) => {
  try {
    const { questionId, index, imagePath } = req.body;
    if (
      !questionId ||
      typeof index !== "number" ||
      !imagePath ||
      typeof imagePath !== "string"
    ) {
      res
        .status(400)
        .json({ error: "Question ID, index, and image path are required." });
      return;
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (
      !question ||
      !question.isChoiceImage ||
      !Array.isArray(question.choices)
    ) {
      res.status(404).json({ error: "Question not found or not image-based." });
      return;
    }

    const updatedChoices = [...question.choices];
    updatedChoices[index] = "";

    await prisma.question.update({
      where: { id: questionId },
      data: { choices: updatedChoices },
    });

    deleteFile(imagePath.replace(API_URL, ""));
    res.status(200).json({ message: "Choice image deleted." });
  } catch (error) {
    console.error("❌ Failed to delete choice image:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}) as RequestHandler;
