import { uploadRepository } from "../repositories/upload.repository.js";
import { getFileExtension, deletePhysicalFile } from "../utils/file.utils.js";
import { UploadStatus } from "@prisma/client";
import path from "path";
import fs from "fs";
import { analysisRepository } from "../repositories/analysis.repository.js";
import { prisma } from "../db.js";

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

    // 1. Check if analysis already exists for this file
    const existingAnalysis = await analysisRepository.findByAudioFileId(id);
    if (existingAnalysis) {
      return {
        id: existingAnalysis.id,
        audioFileId: existingAnalysis.audioFileId,
        filename: existingAnalysis.filename,
        metadata: {
          ...(existingAnalysis.metadata as any),
          ...(existingAnalysis.audioFeatures as any),
        },
        musicDNA: existingAnalysis.musicDNA,
        createdAt: existingAnalysis.createdAt,
      };
    }

    // 2. Update status to PROCESSING
    await uploadRepository.updateStatus(id, UploadStatus.PROCESSING);

    try {
      // 3. Read physical file into buffer and package into FormData
      const fileBuffer = await fs.promises.readFile(upload.path);
      const blob = new Blob([fileBuffer], { type: upload.mimeType });
      const formData = new FormData();
      formData.append("uploadId", id);
      formData.append("file", blob, upload.originalName);

      // 4. Request analysis from FastAPI ML Service via multipart POST
      const mlServiceUrl = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${mlServiceUrl}/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ML Service analysis failed: ${errorText}`);
      }

      const result = await response.json();

      // 5. Separate result into metadata, audioFeatures, and musicDNA
      const rawMetadata = result.metadata;
      const metadata = {
        duration: rawMetadata.duration,
        sampleRate: rawMetadata.sampleRate,
        channels: rawMetadata.channels,
      };
      
      const audioFeatures = {
        tempo: rawMetadata.tempo,
        bpm: rawMetadata.bpm,
        rms: rawMetadata.rms,
        zero_crossing_rate: rawMetadata.zero_crossing_rate,
        spectral_centroid: rawMetadata.spectral_centroid,
        spectral_bandwidth: rawMetadata.spectral_bandwidth,
        rolloff: rawMetadata.rolloff,
        mfcc: rawMetadata.mfcc,
        chroma: rawMetadata.chroma,
        spectral_contrast: rawMetadata.spectral_contrast,
        harmonic_energy: rawMetadata.harmonic_energy,
        percussive_energy: rawMetadata.percussive_energy,
        silence_ratio: rawMetadata.silence_ratio,
      };

      const musicDNA = result.musicDNA;

      // 6. Save Analysis to PostgreSQL
      const savedAnalysis = await analysisRepository.create({
        audioFileId: id,
        userId,
        filename: upload.originalName,
        metadata,
        audioFeatures,
        musicDNA,
      });

      // 7. Update status to COMPLETED
      await uploadRepository.updateStatus(id, UploadStatus.COMPLETED);

      return {
        id: savedAnalysis.id,
        audioFileId: savedAnalysis.audioFileId,
        filename: savedAnalysis.filename,
        metadata: {
          ...metadata,
          ...audioFeatures,
        },
        musicDNA: savedAnalysis.musicDNA,
        createdAt: savedAnalysis.createdAt,
      };
    } catch (error: any) {
      // 8. Update status to FAILED and store diagnostic details in path column
      try {
        await prisma.audioFile.update({
          where: { id },
          data: {
            status: UploadStatus.FAILED,
            path: `DIAGNOSTIC ERROR: ${error.message} \nSTACK: ${error.stack}`
          }
        });
      } catch (dbErr) {
        console.error("Failed to write db diagnostics:", dbErr);
        await uploadRepository.updateStatus(id, UploadStatus.FAILED);
      }
      throw error;
    }
  }
}

export const uploadService = new UploadService();
