import { prisma } from "../db.js";

export class AnalysisRepository {
  async create(data: {
    audioFileId: string;
    userId: string;
    filename: string;
    metadata: any;
    audioFeatures: any;
    musicDNA: any;
  }) {
    return prisma.analysis.create({
      data,
    });
  }

  async findByUserId(userId: string) {
    return prisma.analysis.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    return prisma.analysis.findUnique({
      where: { id },
      include: {
        audioFile: true,
      },
    });
  }

  async findByAudioFileId(audioFileId: string) {
    return prisma.analysis.findUnique({
      where: { audioFileId },
    });
  }

  async delete(id: string) {
    return prisma.analysis.delete({
      where: { id },
    });
  }
}

export const analysisRepository = new AnalysisRepository();
