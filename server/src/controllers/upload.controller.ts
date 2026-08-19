import type { Request, Response, NextFunction } from "express";
import { uploadService } from "../services/upload.service.js";
import { UploadIdParamSchema } from "../validators/upload.validator.js";
import { z } from "zod";

const getBaseUrl = (req: Request) => {
  const protocol = (req.headers["x-forwarded-proto"] as string) || req.protocol;
  const host = req.get("host");
  return `${protocol}://${host}`;
};

const addUploadUrl = (req: Request, upload: any) => {
  if (!upload) return upload;
  const baseUrl = getBaseUrl(req);
  return {
    ...upload,
    url: upload.storedName ? `${baseUrl}/uploads/files/${upload.storedName}` : null,
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
      
      // Trigger background analysis asynchronously (unawaited) so the upload HTTP response finishes immediately
      uploadService.analyzeUpload(upload.id, userId, (req as any).startTime)
        .then(() => {
          console.log(`[Async Analysis] Completed successfully for upload ID: ${upload.id}`);
        })
        .catch((err) => {
          console.error(`[Async Analysis] Failed for upload ID: ${upload.id}:`, err);
        });

      const elapsed8 = performance.now() - ((req as any).startTime || performance.now());
      console.log(`[T8] Returning HTTP response - Timestamp: ${new Date().toISOString()}, Elapsed: ${elapsed8.toFixed(2)}ms`);

      res.status(201).json({
        success: true,
        data: addUploadUrl(req, upload),
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
