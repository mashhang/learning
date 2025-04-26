import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import upload from "./src/middleware/upload.js"; // ✅ Import upload middleware
import progressRoutes from "./src/routes/progress.js";
import questionRoutes from "./src/routes/question.js"; // ✅ adjust path if needed

import {
  registerUser,
  loginUser,
  getProfile,
  authenticateUser,
  verifyEmail,
} from "./src/routes/auth.js";

import {
  getChapters,
  getChapterById,
  createChapter,
  updateChapter,
  deleteChapter,
} from "./src/routes/chapter.js"; // ✅ Import chapter routes

import {
  getLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
} from "./src/routes/lesson.js";

import { userRouter } from "./src/routes/user.js";
import diagnosticRoutes from "./src/routes/diagnostic.js";
import uploadRouter from "./src/routes/upload.js";
import assessmentRoutes from "./src/routes/assessment.js";
import exerciseRoutes from "./src/routes/exercise.js";
import settingsRoutes from "./src/routes/settings.js";

dotenv.config();
const app = express();

// ✅ Manually define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// app.use(cors());
app.use(
  cors({
    origin: "*", // ✅ Temporarily allow all origins (change later for security)
    credentials: true, // ✅ Allow cookies & auth headers
  })
);

app.use(express.json());
app.use("/api/user", userRouter);
// Serve uploaded files publicly
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// app.use("/api", userLessonPriorityRoutes); // ✅ Add this line
app.use("/api", uploadRouter);

// ✅ AUTH ROUTES
app.post("/api/auth/register", registerUser); // Takes (req, res)
app.get("/api/auth/verify-email", verifyEmail);
app.post("/api/auth/login", loginUser); // Takes (req, res)
app.get("/api/auth/profile", authenticateUser, getProfile); // Middleware takes (req, res, next)

// ✅ SETTINGS ROUTES
app.use("/api/settings", settingsRoutes);

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

app.put("/api/lessons/:id", authenticateUser, upload.any(), updateLesson);
app.delete("/api/lessons/:id", authenticateUser, deleteLesson); // ✅ Now correctly includes `authenticateUser`

app.use("/api", questionRoutes);
app.use("/api", exerciseRoutes);
app.use("/api/assessment", assessmentRoutes);
app.use("/api/diagnostic", diagnosticRoutes);
app.use("/api/progress", progressRoutes); // ✅ use router, not raw handler

app.listen(5001, () => console.log("✅ Backend running on port 5001"));
