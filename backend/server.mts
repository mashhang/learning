// import express, {
//   Request,
//   Response,
//   NextFunction,
//   RequestHandler,
// } from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import { PrismaClient, User } from "@prisma/client";

// dotenv.config();
// const app = express();
// const prisma = new PrismaClient();

// app.use(
//   cors({
//     origin: "http://localhost:3000", // ✅ Allow frontend requests
//     credentials: true,
//   })
// );
// app.use(express.json());

// const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

// // Extend Express Request type to include user property
// declare module "express-serve-static-core" {
//   interface Request {
//     user?: User;
//   }
// }

// /**
//  * ✅ Middleware to verify JWT token
//  */
// const authenticateUser: RequestHandler = async (req, res, next) => {
//   try {
//     const token = req.headers.authorization?.split(" ")[1];
//     if (!token) {
//       res.status(401).json({ error: "Unauthorized" });
//       return;
//     }

//     const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
//     const user = await prisma.user.findUnique({
//       where: { id: decoded.userId },
//     });

//     if (!user) {
//       res.status(404).json({ error: "User not found" });
//       return;
//     }

//     req.user = user;
//     next(); // ✅ Call `next()` to proceed to the next middleware or route
//   } catch (error) {
//     res.status(401).json({ error: "Invalid token" });
//   }
// };

// /**
//  * ✅ REGISTER USER
//  */
// app.post("/register", (async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     const existingUser = await prisma.user.findUnique({ where: { email } });

//     if (existingUser) {
//       return res.status(400).json({ error: "Email already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = await prisma.user.create({
//       data: { name, email, password: hashedPassword },
//     });

//     res.status(201).json({ message: "User registered successfully", user });
//   } catch (error) {
//     console.error("Registration Error:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// }) as RequestHandler);

// /**
//  * ✅ LOGIN USER
//  */
// app.post("/login", (async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await prisma.user.findUnique({ where: { email } });

//     if (!user || !(await bcrypt.compare(password, user.password))) {
//       return res.status(400).json({ error: "Invalid email or password" });
//     }

//     const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
//       expiresIn: "1h",
//     });

//     res.json({ message: "Login successful", token, user });
//   } catch (error) {
//     console.error("Login Error:", error);
//     res.status(500).json({ error: "Something went wrong" });
//   }
// }) as RequestHandler);

// /**
//  * ✅ GET USER PROFILE (Protected Route)
//  */
// app.get("/profile", authenticateUser, (async (req, res) => {
//   if (!req.user) {
//     return res.status(404).json({ error: "User not found" });
//   }
//   res.json({ user: req.user });
// }) as RequestHandler);

// /**
//  * ✅ GET ALL LESSONS
//  */
// app.get("/api/lessons", (async (req, res) => {
//   try {
//     const lessons = await prisma.lesson.findMany();
//     res.json(lessons);
//   } catch (error) {
//     console.error("Error fetching lessons:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// }) as RequestHandler);

// /**
//  * ✅ GET A SINGLE LESSON BY ID
//  */
// app.get("/api/lessons/:id", (async (req, res) => {
//   try {
//     const id = req.params.id;
//     const lesson = await prisma.lesson.findUnique({ where: { id } });

//     if (!lesson) {
//       return res.status(404).json({ error: "Lesson not found" });
//     }

//     res.json(lesson);
//   } catch (error) {
//     console.error("Error fetching lesson:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// }) as RequestHandler);

// /**
//  * ✅ CREATE A NEW LESSON (Admin Only)
//  */
// app.post("/api/lessons", authenticateUser, (async (req, res) => {
//   try {
//     if (req.user?.role !== "ADMIN") {
//       return res.status(403).json({ error: "Access denied" });
//     }

//     const { title, content } = req.body;
//     const newLesson = await prisma.lesson.create({
//       data: { title, content },
//     });

//     res.status(201).json(newLesson);
//   } catch (error) {
//     console.error("Error creating lesson:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// }) as RequestHandler);

// /**
//  * ✅ UPDATE A LESSON (Admin Only)
//  */
// app.put("/api/lessons/:id", authenticateUser, (async (req, res) => {
//   try {
//     if (req.user?.role !== "ADMIN") {
//       return res.status(403).json({ error: "Access denied" });
//     }

//     const id = req.params.id;
//     const { title, content } = req.body;

//     const updatedLesson = await prisma.lesson.update({
//       where: { id },
//       data: { title, content },
//     });

//     res.json(updatedLesson);
//   } catch (error) {
//     console.error("Error updating lesson:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// }) as RequestHandler);

// /**
//  * ✅ DELETE A LESSON (Admin Only)
//  */
// app.delete("/api/lessons/:id", authenticateUser, (async (req, res) => {
//   try {
//     if (req.user?.role !== "ADMIN") {
//       return res.status(403).json({ error: "Access denied" });
//     }

//     const id = req.params.id;
//     await prisma.lesson.delete({ where: { id } });

//     res.json({ message: "Lesson deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting lesson:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// }) as RequestHandler);

// /**
//  * ✅ START SERVER
//  */
// app.listen(5001, () => console.log("✅ Backend running on port 5001"));

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  registerUser,
  loginUser,
  getProfile,
  authenticateUser,
} from "./src/routes/auth";
import {
  getChapters,
  getChapterById,
  createChapter,
  updateChapter,
  deleteChapter,
} from "./src/routes/chapter"; // ✅ Import chapter routes
import {
  getLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
} from "./src/routes/lesson";

import { getUsers } from "./src/routes/user";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// ✅ AUTH ROUTES
app.post("/api/auth/register", registerUser); // Takes (req, res)
app.post("/api/auth/login", loginUser); // Takes (req, res)
app.get("/api/auth/profile", authenticateUser, getProfile); // Middleware takes (req, res, next)

// ✅ CHAPTER ROUTES
app.get("/api/chapters", getChapters);
app.get("/api/chapters/:id", getChapterById);
app.post("/api/chapters", createChapter);
app.put("/api/chapters/:id", authenticateUser, updateChapter);
app.delete("/api/chapters/:id", deleteChapter);

// ✅ LESSON ROUTES
app.get("/api/lessons", getLessons);
app.get("/api/lessons/:id", getLessonById);
app.post("/api/lessons", authenticateUser, createLesson);
app.put("/api/lessons/:id", authenticateUser, updateLesson); // ✅ Now correctly includes `authenticateUser`
app.delete("/api/lessons/:id", authenticateUser, deleteLesson); // ✅ Now correctly includes `authenticateUser`

// ✅ USERS ROUTE
app.get("/api/users", authenticateUser, getUsers);

app.listen(5001, () => console.log("✅ Backend running on port 5001"));
