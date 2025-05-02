import { Router } from "express";
import { prioritizeLessons } from "../utils/lessonPriority.js";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// GET /api/lessons/by-user/:userId (new)
router.get("/lessons/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const lessons = await prisma.lesson.findMany({
      include: {
        chapter: true,
      },
      orderBy: [
        { chapter: { order: "asc" } }, // ✅ assumes you have chapter.order field
        { order: "asc" }, // ✅ assumes lessons have order field too
      ],
    });

    const formatted = lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      chapterId: lesson.chapterId,
      chapterTitle: lesson.chapter.title,
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error("Error fetching lessons:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/diagnostic/submit
router.post("/submit", async (req, res) => {
  const { userId, results } = req.body;

  try {
    const maxExpectedTime = 20; // seconds

    console.log("📨 Incoming submission for user:", userId);
    console.log("📊 Total results:", results.length);

    // Step 1: Preprocess data for insert
    const diagnosticData = results.map((r: any) => ({
      userId,
      questionId: r.questionId,
      lessonId: r.lessonId,
      timeTaken: r.timeTaken,
      isCorrect: r.isCorrect,
    }));

    // Step 2: Bulk delete + insert in one transaction
    await prisma.$transaction([
      prisma.diagnosticAnswer.deleteMany({ where: { userId } }),
      prisma.userLessonPriority.deleteMany({ where: { userId } }),
      prisma.diagnosticAnswer.createMany({ data: diagnosticData }),
    ]);

    // Step 3: Compute lesson priorities
    const lessonMap: Record<
      string,
      { scores: number[]; total: number; correct: number }
    > = {};

    for (const r of results) {
      const score = r.timeTaken / maxExpectedTime + (r.isCorrect ? 0 : 1);
      if (!lessonMap[r.lessonId]) {
        lessonMap[r.lessonId] = { scores: [], total: 0, correct: 0 };
      }
      lessonMap[r.lessonId].scores.push(score);
      lessonMap[r.lessonId].total++;
      if (r.isCorrect) lessonMap[r.lessonId].correct++;
    }

    const priorities = Object.entries(lessonMap).map(([lessonId, data]) => {
      const avgDifficulty =
        data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
      const isCompleted = data.correct === data.total;
      const completionFactor = isCompleted ? 0 : 1;
      const rawPriority = (1 / avgDifficulty) * completionFactor;

      return {
        lessonId,
        priority: parseFloat(rawPriority.toFixed(6)),
      };
    });

    // Step 4: If no priorities could be computed
    if (priorities.length === 0) {
      res.status(400).json({ error: "No priorities could be calculated." });
      return;
    }

    // Step 5: Save computed priorities
    await prisma.userLessonPriority.createMany({
      data: priorities.map((p) => ({
        userId,
        lessonId: p.lessonId,
        priority: p.priority,
        progress: 0,
        currentPage: 0,
        updatedAt: new Date(),
      })),
    });

    // Step 5.5: Compute skill-level performance and save to UserSkillPerformance
    const skillMap: Record<
      string,
      {
        lessonId: string;
        skillTag: string;
        totalTime: number;
        count: number;
        incorrect: number;
      }
    > = {};

    for (const r of results) {
      const question = await prisma.question.findUnique({
        where: { id: r.questionId },
        select: { skillTag: true, lessonId: true },
      });

      if (!question) {
        console.warn("⚠️ Question not found for ID:", r.questionId);
        continue;
      }

      if (!question.skillTag) {
        console.warn("⚠️ No skillTag for question ID:", r.questionId);
        continue;
      }

      const key = `${r.lessonId}_${question.skillTag}`;
      if (!skillMap[key]) {
        skillMap[key] = {
          lessonId: r.lessonId,
          skillTag: question.skillTag,
          totalTime: 0,
          count: 0,
          incorrect: 0,
        };
      }

      skillMap[key].totalTime += r.timeTaken;
      skillMap[key].count += 1;
      if (!r.isCorrect) skillMap[key].incorrect += 1;
    }

    // Upsert to UserSkillPerformance
    const skillInserts = Object.values(skillMap).map((entry) => {
      const avgTime = entry.totalTime / entry.count;
      const maxExpected = 20;
      const difficultyScore =
        avgTime / maxExpected + (entry.incorrect > 0 ? 1 : 0);

      return prisma.userSkillPerformance.upsert({
        where: {
          userId_lessonId_skillTag_source: {
            userId,
            lessonId: entry.lessonId,
            skillTag: entry.skillTag,
            source: "DIAGNOSTIC",
          },
        },
        update: { averageScore: difficultyScore },
        create: {
          userId,
          lessonId: entry.lessonId,
          skillTag: entry.skillTag,
          source: "DIAGNOSTIC",
          averageScore: difficultyScore,
        },
      });
    });

    await Promise.all(skillInserts);

    // Step 5.6: Save per-question difficulty to UserQuestionPerformance
    const questionInserts = results.map(
      (r: {
        questionId: string;
        lessonId: string;
        timeTaken: number;
        isCorrect: boolean;
      }) => {
        const difficulty = r.timeTaken / 20 + (r.isCorrect ? 0 : 1);

        return prisma.userQuestionPerformance.upsert({
          where: {
            userId_questionId_source: {
              userId,
              questionId: r.questionId,
              source: "DIAGNOSTIC", // "DIAGNOSTIC" or "PRE"
            },
          },
          update: {
            averageScore: difficulty,
          },
          create: {
            userId,
            lessonId: r.lessonId,
            questionId: r.questionId,
            averageScore: difficulty,
            source: "DIAGNOSTIC",
          },
        });
      }
    );

    await Promise.all(questionInserts);

    // Step 6: Mark user as having taken diagnostic
    await prisma.user.update({
      where: { id: userId },
      data: { hasTakenDiagnostic: true },
    });

    const skillResults = await prisma.userSkillPerformance.findMany({
      where: {
        userId,
        source: "DIAGNOSTIC",
      },
    });

    res.status(200).json({
      message: "Diagnostic submitted",
      priorities,
      skillPerformance: skillResults,
    });
  } catch (err) {
    console.error("❌ Diagnostic error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/diagnostic/results?userId=...
router.get("/results", async (req, res) => {
  const { userId } = req.query;

  try {
    const answers = await prisma.diagnosticAnswer.findMany({
      where: { userId: String(userId) },
      include: {
        lesson: {
          include: {
            chapter: true, // ✅ This is the missing part
          },
        },
      },
    });

    // Group scores per lesson
    const grouped: Record<string, any> = {};

    for (const a of answers) {
      const key = a.lessonId;
      if (!grouped[key]) {
        grouped[key] = {
          chapterTitle: a.lesson.chapter?.title ?? "Unassigned",
          lessonTitle: a.lesson.title,
          correct: 0,
          total: 0,
        };
      }

      grouped[key].total += 1;
      if (a.isCorrect) grouped[key].correct += 1;
    }

    const results = Object.values(grouped).map((entry: any) => ({
      chapterTitle: entry.chapterTitle,
      lessonTitle: entry.lessonTitle,
      correct: entry.correct,
      total: entry.total,
      score: Math.round((entry.correct / entry.total) * 100),
    }));

    res.json(results);
  } catch (err) {
    console.error("❌ Failed to fetch diagnostic results:", err);
    res.status(500).json({ error: "Failed to load diagnostic results." });
  }
});

// GET /api/diagnostic/admin/diagnostic-results
// GET /api/diagnostic/admin/diagnostic-results
router.get("/admin/diagnostic-results", async (req, res) => {
  try {
    const answers = await prisma.diagnosticAnswer.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Get all unique userIds
    const userIds = [...new Set(answers.map((a) => a.userId))];

    // Fetch user info separately
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, lastName: true, email: true },
    });

    const userMap = users.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {} as Record<string, { id: string; lastName: string; email: string }>);

    // Group diagnostic results
    const grouped: Record<string, any> = {};

    for (const a of answers) {
      const key = a.userId;
      if (!grouped[key]) {
        grouped[key] = {
          userId: a.userId,
          userName: userMap[a.userId]?.lastName || "Unknown",
          userEmail: userMap[a.userId]?.email || "",
          type: "DIAGNOSTIC",
          total: 0,
          correct: 0,
          createdAt: a.createdAt,
        };
      }
      grouped[key].total += 1;
      if (a.isCorrect) grouped[key].correct += 1;
    }

    const results = Object.values(grouped).map((entry: any) => ({
      userId: entry.userId,
      userName: entry.userName,
      userEmail: entry.userEmail,
      lessonTitle: "Diagnostic Exam",
      type: entry.type,
      correct: entry.correct,
      total: entry.total,
      score: Math.round((entry.correct / entry.total) * 100),
      createdAt: entry.createdAt,
    }));

    res.json(results);
  } catch (err) {
    console.error("❌ Failed to fetch diagnostic admin results:", err);
    res.status(500).json({ error: "Failed to load diagnostic results." });
  }
});

export default router;
