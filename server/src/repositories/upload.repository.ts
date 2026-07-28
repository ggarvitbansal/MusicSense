import { prisma } from "../db.js";
import type { UploadStatus } from "@prisma/client";

export class UploadRepository {
  async create(data: {
    userId: string;
    originalName: string;
    storedName: string;
    mimeType: string;
    extension: string;
    size: number;
    path: string;
    status: UploadStatus;
  }) {
    return prisma.audioFile.create({
      data,
    });
  }

  async findById(id: string) {
    return prisma.audioFile.findUnique({
      where: { id },
    });
  }

  async findByUserId(userId: string) {
    return prisma.audioFile.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async delete(id: string) {
    return prisma.audioFile.delete({
      where: { id },
    });
  }
}

export const uploadRepository = new UploadRepository();
