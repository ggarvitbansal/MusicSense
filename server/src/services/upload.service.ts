import { uploadRepository } from "../repositories/upload.repository.js";
import { getFileExtension, deletePhysicalFile } from "../utils/file.utils.js";
import { UploadStatus } from "@prisma/client";
import path from "path";
import fs from "fs";
import { analysisRepository } from "../repositories/analysis.repository.js";
import { prisma } from "../db.js";
import diagnostics_channel from "diagnostics_channel";
import net from "net";

// WeakMap to associate Undici request objects with their creation times
const requestTimings = new WeakMap<any, { createdTime: number; headersReceivedTime?: number }>();

diagnostics_channel.channel("undici:request:create").subscribe((data: any) => {
  const request = data.request;
  if (request.path.includes("/analyze")) {
    requestTimings.set(request, { createdTime: performance.now() });
  }
});

diagnostics_channel.channel("undici:request:headers").subscribe((data: any) => {
  const request = data.request;
  const timings = requestTimings.get(request);
  if (timings) {
    const elapsed = performance.now() - timings.createdTime;
    console.log(`[ML Request Detail] Time to First Byte (TTFB) on socket: ${elapsed.toFixed(2)}ms`);
  }
});

async function measureTcpConnection(targetUrl: string): Promise<number | null> {
  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(targetUrl);
      const host = parsedUrl.hostname;
      const port = parsedUrl.port ? parseInt(parsedUrl.port) : (parsedUrl.protocol === "https:" ? 443 : 80);
      
      const startConnect = performance.now();
      const socket = net.connect(port, host, () => {
        const elapsed = performance.now() - startConnect;
        socket.destroy();
        resolve(elapsed);
      });
      
      socket.on("error", (err) => {
        console.error(`[TCP CONNECT ERROR to ${host}:${port}]:`, err.message);
        socket.destroy();
        resolve(null);
      });
      
      socket.setTimeout(10000); // 10s timeout
      socket.on("timeout", () => {
        console.error(`[TCP CONNECT TIMEOUT to ${host}:${port}]`);
        socket.destroy();
        resolve(null);
      });
    } catch (e: any) {
      console.error("[TCP CONNECT ERROR]: Invalid URL", e.message);
      resolve(null);
    }
  });
}

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

  async analyzeUpload(id: string, userId: string, startTime?: number) {
    const start = startTime || performance.now();
    const getElapsed = () => (performance.now() - start).toFixed(2);

    const upload = await this.getUploadById(id, userId);

    // 1. Check if existing analysis exists for this file
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
      console.log(`[T3] Starting ML request - Timestamp: ${new Date().toISOString()}, Elapsed: ${getElapsed()}ms`);
      // 3. Read physical file into buffer and package into FormData
      const fileBuffer = await fs.promises.readFile(upload.path);
      const blob = new Blob([fileBuffer], { type: upload.mimeType });
      const formData = new FormData();
      formData.append("uploadId", id);
      formData.append("file", blob, upload.originalName);

      // 4. Request analysis from FastAPI ML Service via multipart POST
      const mlServiceUrl = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";
      console.log(`[ML Service Config] URL actually used: ${mlServiceUrl}`);

      // Measure TCP handshake time
      const tcpTime = await measureTcpConnection(mlServiceUrl);
      if (tcpTime !== null) {
        console.log(`[ML Request Detail] Time until connection established: ${tcpTime.toFixed(2)}ms`);
      } else {
        console.log(`[ML Request Detail] Time until connection established: Connection Failed`);
      }

      console.log(`[T4] ML request sent - Timestamp: ${new Date().toISOString()}, Elapsed: ${getElapsed()}ms`);
      const fetchStart = performance.now();
      
      let response;
      try {
        response = await fetch(`${mlServiceUrl}/analyze`, {
          method: "POST",
          body: formData,
        });
      } catch (fetchErr: any) {
        console.error("Full fetch error details:", fetchErr);
        if (fetchErr.cause) {
          console.error("Fetch error cause:", fetchErr.cause);
        }
        throw fetchErr;
      }

      const fetchEnd = performance.now();
      console.log(`[T5] ML response received - Timestamp: ${new Date().toISOString()}, Elapsed: ${getElapsed()}ms (Fetch call duration: ${(fetchEnd - fetchStart).toFixed(2)}ms)`);
      console.log(`[ML Response Detail] HTTP Status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[ML Response Error] Response body: ${errorText}`);
        throw new Error(`ML Service analysis failed: ${errorText}`);
      }

      console.log(`[T6] Parsing response - Timestamp: ${new Date().toISOString()}, Elapsed: ${getElapsed()}ms`);
      const result = await response.json();

      console.log(`[T7] Saving analysis - Timestamp: ${new Date().toISOString()}, Elapsed: ${getElapsed()}ms`);
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
      // 8. Update status to FAILED and keep the path column untouched so retry/deletion is possible
      try {
        await prisma.audioFile.update({
          where: { id },
          data: {
            status: UploadStatus.FAILED,
          }
        });
      } catch (dbErr) {
        console.error("Failed to update status to FAILED:", dbErr);
        await uploadRepository.updateStatus(id, UploadStatus.FAILED);
      }
      throw error;
    }
  }
}

export const uploadService = new UploadService();
