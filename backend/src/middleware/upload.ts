import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

// ✅ Ensure `uploads/` directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // ✅ Save files in 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, `${crypto.randomUUID()}-${file.originalname}`); // ✅ Unique filename
  },
});

const allowedTypes = ["image/jpeg", "image/png", "video/mp4"];

// ✅ Filter for images and videos
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  if (!file || !file.mimetype) {
    return cb(null, false); // ✅ no file, skip silently
  }

  // ⛔ skip invalid empty browser files that come as octet-stream
  if (file.mimetype === "application/octet-stream") {
    return cb(null, false); // ✅ do not throw, just ignore silently
  }

  if (allowedTypes.includes(file.mimetype)) {
    return cb(null, true); // ✅ accept valid files
  }

  console.log("❌ Rejected file with mimetype:", file.mimetype);
  return cb(
    new Error("Invalid file type. Only JPG, PNG, and MP4 are allowed."),
    false
  );
};

// ✅ Initialize Multer
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // ✅ Limit file size to 50MB
});

export default upload;
