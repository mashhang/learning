import { Request, Response, RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * ✅ GET ALL USERS
 */
export const getUsers: RequestHandler = async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true }, // Exclude password for security
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * ✅ GET A SINGLE USER BY ID
 */
export const getUserById: RequestHandler = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        hasTakenDiagnostic: true, // ✅ Add this line
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// PATCH /api/user/:id/diagnostic
export const markDiagnosticTaken: RequestHandler = async (req, res) => {
  try {
    const userId = req.params.id;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { hasTakenDiagnostic: true },
      select: { id: true, hasTakenDiagnostic: true },
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get Top Priority Lesson
export const getTopPriorityLesson = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const topLesson = await prisma.userLessonPriority.findFirst({
      where: { userId },
      include: {
        lesson: {
          include: { chapter: true },
        },
      },
      orderBy: [{ priority: "desc" }, { lesson: { title: "asc" } }],
    });

    if (!topLesson) {
      return res.status(404).json({ error: "No prioritized lesson found" });
    }

    res.status(200).json(topLesson.lesson);
  } catch (error) {
    console.error("Top lesson error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
