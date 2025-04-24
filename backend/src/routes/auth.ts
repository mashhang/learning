import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient, User } from "@prisma/client";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { getApiUrl } from "../utils/getApiUrl.js";

const API_URL = getApiUrl();
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

    // ✅ Allow only institutional emails
    const allowedDomain = "@itmlyceumalabang.onmicrosoft.com";
    if (!email.endsWith(allowedDomain)) {
      res.status(400).json({
        error: `Registration is restricted to ${allowedDomain} emails only.`,
      });
      return;
    }

    // ✅ Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: "Email already exists." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: "USER" },
    });

    // Email verification setup
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const verificationToken = crypto.randomBytes(32).toString("hex");

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken },
    });

    const verificationLink = `${API_URL}/api/auth/verify-email?token=${verificationToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify your email",
      html: `
        <h2>Welcome to the Learning App, ${name}!</h2>
        <p>Please click the button below to verify your email address:</p>
        <a href="${verificationLink}" style="padding: 10px 20px; background: #30608E; color: white; text-decoration: none;">Verify Email</a>
      `,
    });

    res.status(201).json({
      message:
        "User registered successfully. Please check your email to verify.",
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * ✅ VERIFY EMAIL
 */
export const verifyEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const token = req.query.token as string;

    if (!token) {
      res.status(400).json({ error: "Missing token" });
      return;
    }

    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      res.status(400).json({ error: "Invalid or expired token." });
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
      },
    });

    res.send("✅ Email verified! You may now log in.");
  } catch (err) {
    console.error("Email verification error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * ✅ LOGIN USER
 */
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(400).json({ error: "Invalid email or password" });
      return;
    }

    if (!user.isVerified) {
      res
        .status(403)
        .json({ error: "Please verify your email before logging in." });
      return;
    }

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
