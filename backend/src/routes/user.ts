import { Router } from "express";
import {
  getUsers,
  getUserById,
  markDiagnosticTaken,
  getTopPriorityLesson,
  getWeakSkillTagsByLesson,
  getQuestionDifficultiesByLesson,
} from "./userHandlers.js";

const router = Router();

router.get("/:userId/top-priority-lesson", getTopPriorityLesson);
router.get("/:id", getUserById);
router.get("/", getUsers);
router.patch("/:id/diagnostic", markDiagnosticTaken);
router.get("/:userId/skills/:lessonId", getWeakSkillTagsByLesson);
router.get(
  "/:userId/lesson/:lessonId/questions/difficulty",
  getQuestionDifficultiesByLesson
);

export { router as userRouter };
