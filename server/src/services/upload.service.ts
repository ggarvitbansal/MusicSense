import { uploadRepository } from "../repositories/upload.repository.js";
import { getFileExtension, deletePhysicalFile } from "../utils/file.utils.js";
import { UploadStatus } from "@prisma/client";
import path from "path";

export class UploadService {
  async handleUpload(userId: string, file: Express.Multer.File) {
    const originalName = file.originalname;
    const storedName = file.filename;
    const mimeType = file.mimetype;
    const extension = getFileExtension(originalName);
    const size = file.size;
    const path = file.path;

    return uploadRepository.create({
      userId,
      originalName,
      storedName,
      mimeType,
      extension,
      size,
      path,
      status: UploadStatus.UPLOADED,
    });
  }

  async getUploadsForUser(userId: string) {
    return uploadRepository.findByUserId(userId);
  }

  async getUploadById(id: string, userId: string) {
    const upload = await uploadRepository.findById(id);
    if (!upload) {
      throw new Error("Upload not found");
    }

    if (upload.userId !== userId) {
      throw new Error("Forbidden");
    }

    return upload;
  }

  async deleteUpload(id: string, userId: string) {
    const upload = await uploadRepository.findById(id);
    if (!upload) {
      throw new Error("Upload not found");
    }

    if (upload.userId !== userId) {
      throw new Error("Forbidden");
    }

    // 1. Delete database record
    await uploadRepository.delete(id);

    // 2. Delete physical file
    await deletePhysicalFile(upload.path);

    return { id };
  }

  async analyzeUpload(id: string, userId: string) {
    const upload = await this.getUploadById(id, userId);

    // 1. Update status to PROCESSING
    await uploadRepository.updateStatus(id, UploadStatus.PROCESSING);

    try {
      // 2. Resolve absolute file path so the ML Service can locate the file
      const absolutePath = path.resolve(upload.path);

      // 3. Request analysis from FastAPI ML Service
      const mlServiceUrl = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${mlServiceUrl}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uploadId: id,
          filePath: absolutePath,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ML Service analysis failed: ${errorText}`);
      }

      const result = await response.json();

      // 4. Update status to COMPLETED
      await uploadRepository.updateStatus(id, UploadStatus.COMPLETED);

      return result;
    } catch (error: any) {
      // 5. Update status to FAILED
      await uploadRepository.updateStatus(id, UploadStatus.FAILED);
      throw error;
    }
  }
}

export const uploadService = new UploadService();
