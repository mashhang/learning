import { Request, Response, RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { sendResetPasswordEmail } from "../utils/mailer.js";

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
export const getTopPriorityLesson = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;

    const topLesson = await prisma.userLessonPriority.findFirst({
      where: { userId },
      include: {
        lesson: {
          include: {
            chapter: true,
            pages: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
      orderBy: [{ priority: "desc" }, { lesson: { title: "asc" } }],
    });

    if (!topLesson) {
      res.status(404).json({ error: "No prioritized lesson found" });
      return;
    }

    res.status(200).json(topLesson.lesson);
  } catch (error) {
    console.error("Top lesson error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getWeakSkillTagsByLesson: RequestHandler = async (req, res) => {
  try {
    const { userId, lessonId } = req.params;

    const performance = await prisma.userSkillPerformance.findMany({
      where: {
        userId,
        lessonId,
        source: "DIAGNOSTIC",
      },
      orderBy: {
        averageScore: "desc", // higher = weaker
      },
      select: {
        skillTag: true,
      },
    });

    const skillTags = performance.map((p) => p.skillTag);
    res.status(200).json(skillTags);
  } catch (error) {
    console.error("Error fetching weak skill tags:", error);
    res.status(500).json({ error: "Failed to load weak skills" });
  }
};

export const getQuestionDifficultiesByLesson: RequestHandler = async (
  req,
  res
) => {
  try {
    const { userId, lessonId } = req.params;

    const results = await prisma.userQuestionPerformance.findMany({
      where: {
        userId,
        lessonId,
        source: "PRE", // You can change this to "DIAGNOSTIC" or support both
      },
      select: {
        questionId: true,
        averageScore: true,
        source: true,
      },
      orderBy: {
        averageScore: "asc", // easier → harder
      },
    });

    res.status(200).json(results);
  } catch (error) {
    console.error("❌ Error fetching question difficulties:", error);
    res.status(500).json({ error: "Failed to fetch question difficulties." });
  }
};

// POST /api/user/:id/reset-password
export const submitPasswordResetHandler = async (
  req: Request,
  res: Response
) => {
  const { token, password } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      res.status(400).json({ error: "Invalid or expired token." });
      return;
    }

    const hashed = await bcrypt.hash(password, 10); // make sure bcrypt is imported

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.json({ message: "Password reset successful." });
  } catch (err) {
    console.error("Error resetting password:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const resetPasswordRequestHandler = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      res.status(400).json({ error: "Invalid or expired token." });
      return;
    }

    const token = crypto.randomUUID();

    await prisma.user.update({
      where: { id },
      data: {
        resetToken: token,
        resetTokenExpiry: new Date(Date.now() + 1000 * 60 * 30),
      },
    });

    await sendResetPasswordEmail(user.email, user.name, token);

    res.status(200).json({ message: "Reset email sent successfully." });
  } catch (err) {
    console.error("Admin-triggered password reset failed:", err);
    res.status(500).json({ error: "Failed to send reset email." });
  }
};
