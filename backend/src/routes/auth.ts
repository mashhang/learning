import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

// Extend Express Request type to include user property
declare module "express-serve-static-core" {
  interface Request {
    user?: User;
  }
}

/**
 * ✅ REGISTER USER
 */
export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: "Email already exists" });
      return;
    }

    // Hash password and save user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: "USER" },
    });

    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * ✅ LOGIN USER
 */
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(400).json({ error: "Invalid email or password" });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: String(user.id), role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token, user });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

/**
 * ✅ AUTHENTICATE USER (Middleware)
 */
export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({ error: "Unauthorized: No token provided" });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    req.user = user; // Attach user object to request
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

/**
 * ✅ GET USER PROFILE
 */
export const getProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({ user: req.user });
};
