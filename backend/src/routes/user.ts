// import { Request, Response, RequestHandler } from "express";
// import { PrismaClient } from "@prisma/client";
// import { Router } from "express";

// const prisma = new PrismaClient();
// const router = Router();

// // GET /api/user/:userId/top-priority-lesson
// router.get("/:userId/top-priority-lesson", async (req, res) => {
//   const { userId } = req.params;

//   try {
//     const topLesson = await prisma.userLessonPriority.findFirst({
//       where: { userId },
//       include: {
//         lesson: {
//           include: { chapter: true },
//         },
//       },
//       orderBy: [
//         { priority: "desc" }, // highest priority
//         { lesson: { title: "asc" } }, // or updatedAt or title
//       ],
//     });

//     if (!topLesson) {
//       return res.status(404).json({ error: "No prioritized lesson found" });
//     }

//     res.status(200).json(topLesson.lesson);
//   } catch (error) {
//     console.error("Top lesson error:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // ✅ GET /api/user/:id
// router.get("/:id", getUserById);
// // ✅ GET all users
// router.get("/", getUsers);

// export { router as userRouter }; // ✅ export with alias

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
