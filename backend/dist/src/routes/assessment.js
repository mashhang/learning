import { Router } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const router = Router();
// GET /api/admin/assessments?userId=...&lessonId=...&type=PRE|POST
router.get("/admin/assessments", async (req, res) => {
    const { userId, lessonId, type } = req.query;
    try {
        const filters = {};
        if (userId)
            filters.userId = String(userId);
        if (lessonId)
            filters.lessonId = String(lessonId);
        if (type)
            filters.type = String(type); // PRE or POST
        const answers = await prisma.assessmentAnswer.findMany({
            where: filters,
            include: {
                user: true,
                lesson: true,
            },
            orderBy: { createdAt: "desc" },
        });
        // Group by user + lesson + type
        const grouped = {};
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
            if (a.isCorrect)
                grouped[key].correct += 1;
        }
        const results = Object.values(grouped).map((entry) => ({
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
    }
    catch (err) {
        console.error("❌ Failed to load assessment results:", err);
        res.status(500).json({ error: "Failed to fetch assessment results" });
    }
});
// POST /api/assessment/submit
router.post("/submit", async (req, res) => {
    const { userId, results, type } = req.body;
    try {
        const data = results.map((r) => ({
            userId,
            lessonId: r.lessonId,
            questionId: r.questionId,
            timeTaken: r.timeTaken,
            isCorrect: r.isCorrect,
            type,
        }));
        console.log("📝 Saving assessment answers:", data); // ✅ Log
        await prisma.assessmentAnswer.createMany({ data });
        res.status(200).json({ message: "Assessment saved." });
    }
    catch (err) {
        console.error("❌ Error saving assessment:", err.message);
        res.status(500).json({ error: "Failed to save assessment results." });
    }
});
export default router;
