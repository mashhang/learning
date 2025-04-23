import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

// GET /api/admin/assessments?userId=...&lessonId=...&type=PRE|POST
router.get("/admin/assessments", async (req, res) => {
  const { userId, lessonId, type } = req.query;

  try {
    const filters: any = {};
    if (userId) filters.userId = String(userId);
    if (lessonId) filters.lessonId = String(lessonId);
    if (type) filters.type = String(type); // PRE or POST

    const answers = await prisma.assessmentAnswer.findMany({
      where: filters,
      include: {
        user: true,
        lesson: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Group by user + lesson + type
    const grouped: Record<string, any> = {};
    for (const a of answers) {
      const key = `${a.userId}_${a.lessonId}_${a.type}`;
      if (!grouped[key]) {
        grouped[key] = {
          user: a.user,
          lesson: a.lesson,
          type: a.type,
          total: 0,
          correct: 0,
          createdAt: a.createdAt,
        };
      }

      grouped[key].total += 1;
      if (a.isCorrect) grouped[key].correct += 1;
    }

    const results = Object.values(grouped).map((entry: any) => ({
      userId: entry.user.id,
      userName: entry.user.name,
      lessonTitle: entry.lesson.title,
      type: entry.type,
      correct: entry.correct,
      total: entry.total,
      score: Math.round((entry.correct / entry.total) * 100),
      createdAt: entry.createdAt,
    }));

    res.json(results);
  } catch (err) {
    console.error("❌ Failed to load assessment results:", err);
    res.status(500).json({ error: "Failed to fetch assessment results" });
  }
});

// POST /api/assessment/submit
router.post("/submit", async (req, res) => {
  const { userId, results, type } = req.body;

  try {
    const data = results.map((r: any) => ({
      userId,
      lessonId: r.lessonId,
      questionId: r.questionId,
      timeTaken: r.timeTaken,
      isCorrect: r.isCorrect,
      type,
    }));

    console.log("📝 Saving assessment answers:", data);

    await prisma.assessmentAnswer.createMany({ data });

    // ✅ Only apply algorithm if type is PRE
    if (type === "PRE") {
      const skillMap: Record<
        string,
        {
          totalTime: number;
          count: number;
          incorrect: number;
          lessonId: string;
        }
      > = {};

      for (const r of results) {
        const question = await prisma.question.findUnique({
          where: { id: r.questionId },
          select: { skillTag: true, lessonId: true },
        });

        if (!question?.skillTag) continue;

        const key = `${r.lessonId}_${question.skillTag}`;
        if (!skillMap[key]) {
          skillMap[key] = {
            totalTime: 0,
            count: 0,
            incorrect: 0,
            lessonId: r.lessonId,
          };
        }

        skillMap[key].totalTime += r.timeTaken;
        skillMap[key].count += 1;
        if (!r.isCorrect) skillMap[key].incorrect += 1;
      }

      const upserts = Object.entries(skillMap).map(async ([key, data]) => {
        const [lessonId, skillTag] = key.split("_");
        const avgTime = data.totalTime / data.count;
        const maxExpected = 20;
        const difficultyScore =
          avgTime / maxExpected + (data.incorrect > 0 ? 1 : 0);

        return prisma.userSkillPerformance.upsert({
          where: {
            userId_lessonId_skillTag_source: {
              userId,
              lessonId,
              skillTag,
              source: "PRE",
            },
          },
          update: {
            averageScore: difficultyScore,
          },
          create: {
            userId,
            lessonId,
            skillTag,
            source: "PRE",
            averageScore: difficultyScore,
          },
        });
      });

      await Promise.all(upserts);

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
                source: "PRE", // "DIAGNOSTIC" or "PRE"
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
              source: "PRE",
            },
          });
        }
      );

      await Promise.all(questionInserts);
    }

    res.status(200).json({ message: "Assessment saved." });
  } catch (err: any) {
    console.error("❌ Error saving assessment:", err.message);
    res.status(500).json({ error: "Failed to save assessment results." });
  }
});

export default router;
