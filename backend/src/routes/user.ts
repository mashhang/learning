import { Router } from "express";
import {
  getUsers,
  getUserById,
  markDiagnosticTaken,
  getTopPriorityLesson,
  getWeakSkillTagsByLesson,
  getQuestionDifficultiesByLesson,
  submitPasswordResetHandler,
  resetPasswordRequestHandler,
  updatePasswordHandler,
  importUsersHandler,
} from "./userHandlers.js";

const router = Router();

router.get("/:id", getUserById);
router.get("/", getUsers);

router.post("/import", importUsersHandler);

router.post("/:id/reset-password", resetPasswordRequestHandler);
router.post("/reset-password", submitPasswordResetHandler);
router.patch("/:id/update-password", updatePasswordHandler);

router.patch("/:id/diagnostic", markDiagnosticTaken);
router.get("/:userId/top-priority-lesson", getTopPriorityLesson);
router.get("/:userId/skills/:lessonId", getWeakSkillTagsByLesson);
router.get(
  "/:userId/lesson/:lessonId/questions/difficulty",
  getQuestionDifficultiesByLesson
);

export { router as userRouter };
