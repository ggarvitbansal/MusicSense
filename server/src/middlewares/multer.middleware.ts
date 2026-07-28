import type { Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import { generateUniqueFilename } from "../utils/file.utils.js";

const uploadDirectory = path.join(process.cwd(), "uploads");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (_req, file, cb) => {
    const storedName = generateUniqueFilename(file.originalname);
    cb(null, storedName);
  },
});

const ALLOWED_EXTENSIONS = [".mp3", ".wav", ".flac", ".ogg", ".m4a"];
const ALLOWED_MIME_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/x-pn-wav",
  "audio/flac",
  "audio/x-flac",
  "audio/ogg",
  "application/ogg",
  "audio/x-m4a",
  "audio/m4a",
  "audio/mp4",
  "audio/aac",
];

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new Error(`Unsupported file extension: ${ext}`));
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error(`Unsupported MIME type: ${file.mimetype}`));
  }

  cb(null, true);
};

const uploadAudio = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB
  },
  fileFilter,
}).single("audio");

export const uploadAudioMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  uploadAudio(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          res.status(400).json({
            success: false,
            message: "File size exceeds the 25 MB limit",
          });
          return;
        }
        res.status(400).json({
          success: false,
          message: err.message,
        });
        return;
      }
      res.status(400).json({
        success: false,
        message: err.message,
      });
      return;
    }
    
    // Check if file is missing or empty
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
      return;
    }

    if (req.file.size === 0) {
      res.status(400).json({
        success: false,
        message: "Uploaded file is empty",
      });
      return;
    }

    next();
  });
};
