// import { Router } from "express";
// import { PrismaClient } from "@prisma/client";
// import { prioritizeLessons } from "../utils/lessonPriority";

// const router = Router();
// const prisma = new PrismaClient();

// router.get("/user/:userId/lesson-priorities", async (req, res) => {
//   const { userId } = req.params;

//   try {
//     const userLessons = await prisma.userLessonPriority.findMany({
//       where: { userId },
//       include: { lesson: true },
//     });

//     const lessonsInput = userLessons.map((ul) => ({
//       lessonId: ul.lessonId,
//       //   score: ul.score ?? 0,
//       isCompleted: ul.progress >= 1,
//     }));

//     const prioritized = prioritizeLessons(lessonsInput);

//     const orderedLessons = prioritized
//       .map((p) => {
//         const lessonData = userLessons.find((ul) => ul.lessonId === p.lessonId);
//         return {
//           lessonId: p.lessonId,
//           title: lessonData?.lesson?.title,
//           chapterId: lessonData?.lesson?.chapterId,
//           progress: lessonData?.progress ?? 0,
//           priority: p.priority,
//         };
//       })
//       .sort((a, b) => b.priority - a.priority);

//     res.json(orderedLessons);
//   } catch (error) {
//     console.error("❌ Error prioritizing lessons:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// export default router;
