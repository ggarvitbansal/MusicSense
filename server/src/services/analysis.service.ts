import { analysisRepository } from "../repositories/analysis.repository.js";

export class AnalysisService {
  private formatAnalysis(analysis: any) {
    return {
      id: analysis.id,
      audioFileId: analysis.audioFileId,
      filename: analysis.filename,
      metadata: {
        ...(analysis.metadata as any),
        ...(analysis.audioFeatures as any),
      },
      musicDNA: analysis.musicDNA,
      createdAt: analysis.createdAt,
      updatedAt: analysis.updatedAt,
    };
  }

  async getAnalysesForUser(userId: string) {
    const list = await analysisRepository.findByUserId(userId);
    return list.map((item: any) => this.formatAnalysis(item));
  }

  async getAnalysisById(id: string, userId: string) {
    const analysis = await analysisRepository.findById(id);
    if (!analysis) {
      throw new Error("Analysis not found");
    }

    if (analysis.userId !== userId) {
      throw new Error("Forbidden");
    }

    return this.formatAnalysis(analysis);
  }

  async deleteAnalysis(id: string, userId: string) {
    const analysis = await analysisRepository.findById(id);
    if (!analysis) {
      throw new Error("Analysis not found");
    }

    if (analysis.userId !== userId) {
      throw new Error("Forbidden");
    }

    await analysisRepository.delete(id);
    return { id };
  }
}

export const analysisService = new AnalysisService();
