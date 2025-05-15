import { Request, Response, NextFunction, RequestHandler } from "express";
import { PrismaClient, User, Prisma } from "@prisma/client";
import { AuthenticatedRequest } from "../types/express";
import { deleteFile } from "../utils/deleteFile.js";
import { Multer } from "multer";
import { getApiUrl } from "../utils/getApiUrl.js";

const API_URL = getApiUrl();
// const API_URL = process.env.API_URL || "http://192.168.1.10:5001"; // ✅ Use backend env
const prisma = new PrismaClient();

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
        chapter: true, // ✅ include chapter relation
        _count: {
          select: {
            questions: true,
            pages: true,
            exampleExercises: true,
          },
        },
        questions: {
          select: {
            id: true,
            question: true,
            questionEquation: true,
            questionImage: true, // ✅ include this
            choices: true,
            correctAnswer: true,
            isChoiceImage: true,
            skillTag: true,
          },
        },
        pages: {
          orderBy: { order: "asc" }, // ✅ ensure consistent ordering
        },
      },
    });

    // ✅ Sort lessons using natural sorting (Lesson 1, Lesson 2, Lesson 3, etc.)
    lessons.sort((a, b) => {
      // Extract chapter number from chapter title like "Chapter 1"
      const chapterA = parseInt(a.chapter?.title?.split(" ")[1] || "0");
      const chapterB = parseInt(b.chapter?.title?.split(" ")[1] || "0");

      if (chapterA !== chapterB) return chapterA - chapterB;

      // Extract lesson number from title like "Lesson 2: ..."
      const lessonNumA = parseInt(a.title?.split(" ")[1] || "0");
      const lessonNumB = parseInt(b.title?.split(" ")[1] || "0");

      return lessonNumA - lessonNumB;
    });

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
          questionEquation: q.questionEquation,
          questionImage:
            q.questionImage && !q.questionImage.startsWith("http")
              ? `${API_URL}${q.questionImage.startsWith("/") ? "" : "/"}${
                  q.questionImage
                }`
              : q.questionImage || null,
          choices: q.choices,
          correctAnswer: q.correctAnswer,
          isChoiceImage: q.isChoiceImage,
          skillTag: q.skillTag || null,
        })),
        pages: Array.isArray(lesson.pages)
          ? lesson.pages.map((p) => ({
              content: p.content,
              media: p.media,
              order: p.order,
            }))
          : [],
        status: lesson.status, // ✅ Add this line
        questionCount: lesson._count.questions,
        pageCount: lesson._count.pages,
        exerciseCount: lesson._count.exampleExercises,
        videoUrl: lesson.videoUrl || null,
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
        exampleExercises: true,
      },
    });
    if (!lesson) {
      res.status(404).json({ error: "Lesson not found" });
      return;
    }

    // ✅ Add full URL to questionImage
    const questionsWithURL = lesson.questions.map((q) => ({
      id: q.id,
      question: q.question,
      questionEquation: q.questionEquation,
      choices: q.choices,
      correctAnswer: q.correctAnswer,
      isChoiceImage: q.isChoiceImage,
      skillTag: q.skillTag ?? null, // ✅ ADD THIS
      questionImage:
        q.questionImage && q.questionImage.startsWith("uploads/")
          ? `/uploads/${q.questionImage}`
          : q.questionImage,
    }));

    // 🆕 Map media URL on lesson.pages
    const pagesWithMediaURL = lesson.pages.map((p) => ({
      content: p.content,
      media: p.media?.startsWith("http")
        ? p.media // ✅ already full Supabase URL
        : `${API_URL}/uploads/${p.media?.replace(/^\/uploads\//, "")}`,
      order: p.order,
      serverFilename: p.media?.split("/").pop() || null,
    }));

    console.log("Loaded pages:", lesson.pages);

    res.status(200).json({
      id: lesson.id,
      title: lesson.title,
      chapterId: lesson.chapterId,
      media: lesson.media,
      videoUrl: lesson.videoUrl || "", // ✅ ADD videoUrl correctly here
      status: lesson.status,
      questions: questionsWithURL,
      pages: pagesWithMediaURL.map((p) => ({
        ...p,
        existingMedia: p.media,
      })),
      exampleExercises: lesson.exampleExercises,
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

    const { title, content, chapterId, status, videoUrl } = req.body;

    const questions = req.body.questions ? JSON.parse(req.body.questions) : [];
    const lessonId = req.params.id;

    const files = req.files as {
      [key: string]: Express.Multer.File[];
    };

    const media = files?.media?.[0]?.filename
      ? `/uploads/${files.media[0].filename}`
      : undefined;

    const updateData: Prisma.LessonUpdateInput = {
      title,
      status,
    };

    if (media) updateData.media = media;
    if (chapterId) {
      updateData.chapter = {
        connect: { id: chapterId },
      };
    }
    if (videoUrl !== undefined) {
      updateData.videoUrl = videoUrl;
    }

    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: updateData,
    });

    if (media) updateData.media = media;
    if (status) updateData.status = status; // ✅ ADD THIS LINE

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

        const mediaPath = p.filename?.startsWith("http")
          ? p.filename // 🟢 Supabase URL already
          : savedFilename
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
          questionEquation: q.questionEquation || null,
          questionImage: questionImagePath,
          choices,
          correctAnswer: q.correctAnswer,
          isChoiceImage: q.isChoiceImage || false,
        },
        create: {
          lessonId,
          question: q.question || null,
          questionEquation: q.questionEquation || null,
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
      ...updatedLesson,
      status: updatedLesson?.status, // ✅ manually ensure it's included
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

    const existingLesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!existingLesson) {
      res.status(404).json({ error: "Lesson not found" });
      return;
    }

    // 🔥 Delete all related records in the correct order
    await prisma.userSkillPerformance.deleteMany({ where: { lessonId } });
    await prisma.userQuestionPerformance.deleteMany({ where: { lessonId } });
    await prisma.assessmentAnswer.deleteMany({ where: { lessonId } });
    await prisma.diagnosticAnswer.deleteMany({ where: { lessonId } });
    await prisma.userLessonPriority.deleteMany({ where: { lessonId } });
    await prisma.lessonPage.deleteMany({ where: { lessonId } });
    await prisma.question.deleteMany({ where: { lessonId } });
    await prisma.exampleExercise.deleteMany({ where: { lessonId } });

    // ✅ Then delete the lesson
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

    const { title, chapterId, status, videoUrl } = req.body;

    const parsedQuestions =
      typeof req.body.questions === "string"
        ? JSON.parse(req.body.questions)
        : req.body.questions || [];

    const parsedPages =
      typeof req.body.pages === "string"
        ? JSON.parse(req.body.pages)
        : req.body.pages || [];

    if (!title || !chapterId) {
      res.status(400).json({ error: "Title and chapterId are required" });
    }

    if (!Array.isArray(parsedPages) || parsedPages.length === 0) {
      res.status(400).json({ error: "At least one page is required" });
    }

    const existingLessons = await prisma.lesson.findMany({
      where: { chapterId },
    });
    const nextOrder = existingLessons.length + 1;

    const createdLesson = await prisma.lesson.create({
      data: {
        title,
        chapterId,
        status,
        order: nextOrder,
        videoUrl,
      },
    });

    // ✅ Save pages using public Supabase URLs directly
    await prisma.lessonPage.createMany({
      data: parsedPages.map((p: any, i: number) => ({
        lessonId: createdLesson.id,
        content: p.content,
        media: p.media ?? null, // from Supabase public URL
        order: p.order ?? i + 1,
      })),
    });

    // ✅ Save questions (optional - image uploads to be migrated later if needed)
    for (const q of parsedQuestions) {
      await prisma.question.create({
        data: {
          lessonId: createdLesson.id,
          question: q.question || null,
          questionImage: q.questionImage || null,
          choices: q.choices,
          correctAnswer: q.correctAnswer,
          isChoiceImage: q.isChoiceImage || false,
        },
      });
    }

    res.status(201).json({
      message: "Lesson created successfully!",
      createdLesson,
    });
  } catch (error) {
    console.error("❌ Error creating lesson:", error);
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

    if (!lessonId || !imagePath || typeof imagePath !== "string") {
      res.status(400).json({ error: "Lesson ID and image path are required." });
      return;
    }

    const localPath = imagePath.replace(API_URL ?? "", "");
    deleteFile(localPath);

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

    if (!imagePath || typeof imagePath !== "string") {
      res.status(400).json({ error: "Image path is required." });
      return;
    }

    const localPath = imagePath.replace(API_URL ?? "", "");
    deleteFile(localPath);

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

    if (
      typeof index !== "number" ||
      !imagePath ||
      typeof imagePath !== "string"
    ) {
      res.status(400).json({ error: "Index and image path are required." });
      return;
    }

    const localPath = imagePath.replace(API_URL ?? "", "");
    deleteFile(localPath);

    res.status(200).json({ message: "Choice image deleted." });
  } catch (error) {
    console.error("❌ Failed to delete choice image:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}) as RequestHandler;

/**
 * ✅ GET DISTINCT SKILL TAGS FOR A LESSON
 */
export const getSkillTagsByLessonId = async (req: Request, res: Response) => {
  const { lessonId } = req.params;

  try {
    const tags = await prisma.question.findMany({
      where: { lessonId },
      select: { skillTag: true },
      distinct: ["skillTag"],
    });

    const filtered = tags
      .map((t) => t.skillTag)
      .filter((t): t is string => !!t); // remove nulls

    res.status(200).json(filtered);
  } catch (error) {
    console.error("❌ Error fetching skillTags:", error);
    res.status(500).json({ error: "Failed to fetch skill tags" });
  }
};

export const getLessonEngagementStats: RequestHandler = async (req, res) => {
  try {
    const lessons = await prisma.lesson.findMany({
      include: {
        chapter: {
          select: {
            title: true,
            order: true,
          },
        },
      },
    });

    const allAssessments = await prisma.assessmentAnswer.findMany();
    const allProgress = await prisma.userLessonPriority.findMany();

    const stats = lessons.map((lesson) => {
      const lessonId = lesson.id;

      const completedCount = allProgress.filter(
        (p) => p.lessonId === lessonId && p.progress === 1
      ).length;

      const preAnswers = allAssessments.filter(
        (a) => a.lessonId === lessonId && a.type === "PRE"
      );
      const postAnswers = allAssessments.filter(
        (a) => a.lessonId === lessonId && a.type === "POST"
      );

      const preUsers = new Set(preAnswers.map((a) => a.userId));
      const postUsers = new Set(postAnswers.map((a) => a.userId));

      const avgPreScore =
        preAnswers.length > 0
          ? Math.round(
              (preAnswers.filter((a) => a.isCorrect).length /
                preAnswers.length) *
                100
            )
          : null;

      const avgPostScore =
        postAnswers.length > 0
          ? Math.round(
              (postAnswers.filter((a) => a.isCorrect).length /
                postAnswers.length) *
                100
            )
          : null;

      return {
        id: lessonId,
        title: lesson.title,
        chapterTitle: lesson.chapter?.title ?? "Uncategorized",
        chapterOrder: lesson.chapter?.order ?? 999,
        order: lesson.order ?? 999,
        completedCount,
        preCount: preUsers.size,
        postCount: postUsers.size,
        avgPreScore,
        avgPostScore,
      };
    });

    res.status(200).json(stats);
  } catch (err) {
    console.error("❌ Error computing lesson engagement stats:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
