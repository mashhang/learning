import { Router } from "express";
import {
  getUsers,
  getUserById,
  markDiagnosticTaken,
  getTopPriorityLesson,
} from "./userHandlers";

const router = Router();

router.get("/:userId/top-priority-lesson", getTopPriorityLesson);
router.get("/:id", getUserById);
router.get("/", getUsers);
router.patch("/:id/diagnostic", markDiagnosticTaken);

export { router as userRouter };
