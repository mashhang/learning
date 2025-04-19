import { Router } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const router = Router();
router.get("/exercises/:lessonId", async (req, res) => {
    const { lessonId } = req.params;
    try {
        const exercises = await prisma.exampleExercise.findMany({
            where: { lessonId },
            orderBy: { createdAt: "asc" },
        });
        res.json(exercises);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch exercises" });
    }
});
router.post("/exercises", async (req, res) => {
    const { lessonId, exercises } = req.body;
    try {
        // ✅ Step 1: Delete existing exercises for the lesson
        await prisma.exampleExercise.deleteMany({
            where: { lessonId },
        });
        // ✅ Step 2: Prepare new data with explanation
        const data = exercises.map((ex) => ({
            lessonId,
            question: ex.question,
            choices: ex.choices,
            correctAnswer: ex.correctAnswer,
            difficulty: ex.difficulty,
            skillTag: ex.skillTag?.trim() || null,
            isChoiceImage: ex.isChoiceImage ?? false,
            questionImage: ex.questionImage ?? null,
            explanation: ex.explanation?.trim() || null,
        }));
        // ✅ Step 3: Create new exercises
        await prisma.exampleExercise.createMany({ data });
        res.json({ message: "Exercises saved successfully" });
    }
    catch (err) {
        console.error("❌ Failed to save exercises:", err.message, err.stack);
        res
            .status(500)
            .json({ error: "Failed to save exercises", details: err.message });
    }
});
// GET /api/exercises/:lessonId/unanswered
router.post("/exercises/:lessonId/unanswered", async (req, res) => {
    const { lessonId } = req.params;
    const { excludeIds = [] } = req.body; // array of exercise IDs
    try {
        const exercises = await prisma.exampleExercise.findMany({
            where: {
                lessonId,
                id: { notIn: excludeIds },
            },
            orderBy: { createdAt: "desc" },
            take: 3, // or however many you want to return
        });
        res.json(exercises);
    }
    catch (err) {
        console.error("❌ Failed to fetch additional exercises:", err);
        res.status(500).json({ error: "Failed to fetch additional exercises" });
    }
});
// UPDATE
router.put("/exercises/:id", async (req, res) => {
    const { id } = req.params;
    const { question, choices, correctAnswer, explanation, difficulty, skillTag, } = req.body;
    try {
        const updatedExercise = await prisma.exampleExercise.update({
            where: { id },
            data: {
                question,
                choices,
                correctAnswer,
                explanation,
                difficulty,
                skillTag,
            },
        });
        res.json(updatedExercise);
    }
    catch (err) {
        console.error("❌ Failed to update exercise:", err);
        res.status(500).json({ error: "Failed to update exercise" });
    }
});
// This route is for adding a new exercise to a lesson
router.post("/exercise", async (req, res) => {
    const { lessonId, question, choices, correctAnswer, explanation, difficulty, skillTag, } = req.body;
    try {
        const newExercise = await prisma.exampleExercise.create({
            data: {
                lessonId,
                question,
                choices,
                correctAnswer,
                explanation,
                difficulty,
                skillTag,
            },
        });
        res.json(newExercise);
    }
    catch (err) {
        console.error("❌ Failed to create exercise:", err);
        res.status(500).json({ error: "Failed to create exercise" });
    }
});
//DELETE
router.delete("/exercises/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.exampleExercise.delete({ where: { id } });
        res.json({ message: "Exercise deleted" });
    }
    catch (err) {
        console.error("❌ Failed to delete exercise:", err);
        res.status(500).json({ error: "Failed to delete exercise" });
    }
});
export default router;
