// ✅ Step 1: Backend /api/upload route
// File: backend/src/routes/upload.ts
import express, { Request, Response } from "express";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post(
  "/upload",
  upload.single("file"),
  (req: Request, res: Response): void => {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return; // ✅ TS now knows code below only runs if req.file exists
    }

    const file = req.file;
    const filePath = `/uploads/${file.filename}`;
    res.status(200).json({
      filename: file.filename,
      url: filePath,
    });
  }
);

export default router;
