import { Router, Request, Response, RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

const handler: RequestHandler = async (req, res) => {
  const { userId, lessonId, currentPage, totalPages } = req.body;

  if (!userId || !lessonId || !totalPages || currentPage === undefined) {
    res.status(400).json({ error: "Missing fields" });
    return;
  }

  try {
    const newProgress = parseFloat((currentPage / totalPages).toFixed(2));

    await prisma.userLessonPriority.update({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      data: {
        progress: newProgress,
      },
    });

    res
      .status(200)
      .json({ message: "Progress updated", progress: newProgress });
  } catch (error) {
    console.error("Error updating progress:", error);
    res.status(500).json({ error: "Failed to update progress" });
  }
};

router.patch("/", handler);
// router.patch("/", async (req: Request, res: Response) => {
//   const { userId, lessonId, currentPage, totalPages } = req.body;

//   if (!userId || !lessonId || !totalPages || currentPage === undefined) {
//     return res.status(400).json({ error: "Missing fields" });
//   }

//   try {
//     const newProgress = parseFloat((currentPage / totalPages).toFixed(2));

//     await prisma.userLessonPriority.update({
//       where: {
//         userId_lessonId: {
//           userId,
//           lessonId,
//         },
//       },
//       data: {
//         progress: newProgress,
//       },
//     });

//     res
//       .status(200)
//       .json({ message: "Progress updated", progress: newProgress });
//   } catch (error) {
//     console.error("Error updating progress:", error);
//     res.status(500).json({ error: "Failed to update progress" });
//   }
// });

export default router;
