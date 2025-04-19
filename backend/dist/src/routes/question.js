import { Router } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const router = Router();
// This route is for adding a new question to a lesson
router.post("/questions", async (req, res) => {
    const { lessonId, question, choices, correctAnswer } = req.body;
    try {
        const newQuestion = await prisma.question.create({
            data: {
                lessonId,
                question,
                choices,
                correctAnswer,
                isChoiceImage: false,
            },
        });
        res.status(201).json(newQuestion);
    }
    catch (err) {
        console.error("❌ Failed to add question:", err);
        res.status(500).json({ error: "Failed to add question" });
    }
});
//UPDATE
router.put("/questions/:id", async (req, res) => {
    const { id } = req.params;
    const { question, choices, correctAnswer, isChoiceImage, questionImage } = req.body;
    try {
        const updated = await prisma.question.update({
            where: { id },
            data: {
                question,
                choices,
                correctAnswer,
                isChoiceImage: isChoiceImage ?? false,
                questionImage: questionImage ?? null,
            },
        });
        res.status(200).json(updated);
    }
    catch (err) {
        console.error("❌ Failed to update question:", err);
        res.status(500).json({ error: "Failed to update question" });
    }
});
//DELETE
router.delete("/questions/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.question.delete({
            where: { id },
        });
        res.status(200).json({ message: "Question deleted successfully" });
    }
    catch (err) {
        console.error("❌ Failed to delete question:", err);
        res.status(500).json({ error: "Failed to delete question" });
    }
});
export default router;
