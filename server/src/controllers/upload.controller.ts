import type { Request, Response, NextFunction } from "express";
import { uploadService } from "../services/upload.service.js";
import { UploadIdParamSchema } from "../validators/upload.validator.js";
import { z } from "zod";

const addUploadUrl = (req: Request, upload: any) => {
  if (!upload) return upload;
  const protocol = req.protocol;
  const host = req.get("host");
  const baseUrl = `${protocol}://${host}`;
  return {
    ...upload,
    url: `${baseUrl}/uploads/files/${upload.storedName}`,
  };
};

const addUploadsUrl = (req: Request, uploads: any[]) => {
  return uploads.map((u) => addUploadUrl(req, u));
};

export class UploadController {
  async createUpload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      if (!req.file) {
        res.status(400).json({ success: false, message: "No file uploaded" });
        return;
      }

      const upload = await uploadService.handleUpload(userId, req.file);
      
      const elapsed2 = performance.now() - ((req as any).startTime || performance.now());
      console.log(`[T2] Database insert complete - Timestamp: ${new Date().toISOString()}, Elapsed: ${elapsed2.toFixed(2)}ms`);
      
      // Auto-trigger analysis immediately while the file is guaranteed to be on disk in this container session
      try {
        await uploadService.analyzeUpload(upload.id, userId, (req as any).startTime);
      } catch (err) {
        console.error("Auto-analysis failed during upload:", err);
      }

      // Retrieve the updated upload record (which now has COMPLETED or FAILED status)
      const updatedUpload = await uploadService.getUploadById(upload.id, userId);
      
      const elapsed8 = performance.now() - ((req as any).startTime || performance.now());
      console.log(`[T8] Returning HTTP response - Timestamp: ${new Date().toISOString()}, Elapsed: ${elapsed8.toFixed(2)}ms`);

      res.status(201).json({
        success: true,
        data: addUploadUrl(req, updatedUpload),
      });
    } catch (error) {
      next(error);
    }
  }

  async getUploads(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const uploads = await uploadService.getUploadsForUser(userId);
      
      res.status(200).json({
        success: true,
        data: addUploadsUrl(req, uploads),
      });
    } catch (error) {
      next(error);
    }
  }

  async getUploadById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const params = await UploadIdParamSchema.parseAsync(req.params);
      const upload = await uploadService.getUploadById(params.id, userId);

      res.status(200).json({
        success: true,
        data: addUploadUrl(req, upload),
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: error.issues[0]?.message || "Invalid upload ID format",
        });
        return;
      }
      if (error.message === "Upload not found") {
        res.status(404).json({ success: false, message: "Upload not found" });
        return;
      }
      if (error.message === "Forbidden") {
        res.status(403).json({ success: false, message: "Access denied" });
        return;
      }
      next(error);
    }
  }

  async deleteUpload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const params = await UploadIdParamSchema.parseAsync(req.params);
      const result = await uploadService.deleteUpload(params.id, userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: error.issues[0]?.message || "Invalid upload ID format",
        });
        return;
      }
      if (error.message === "Upload not found") {
        res.status(404).json({ success: false, message: "Upload not found" });
        return;
      }
      if (error.message === "Forbidden") {
        res.status(403).json({ success: false, message: "Access denied" });
        return;
      }
      next(error);
    }
  }

  async analyzeUpload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const params = await UploadIdParamSchema.parseAsync(req.params);
      const analysisResult = await uploadService.analyzeUpload(params.id, userId);

      res.status(200).json({
        success: true,
        data: analysisResult,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: error.issues[0]?.message || "Invalid upload ID format",
        });
        return;
      }
      if (error.message === "Upload not found") {
        res.status(404).json({ success: false, message: "Upload not found" });
        return;
      }
      if (error.message === "Forbidden") {
        res.status(403).json({ success: false, message: "Access denied" });
        return;
      }
      next(error);
    }
  }
}

export const uploadController = new UploadController();
