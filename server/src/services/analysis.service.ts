import { analysisRepository } from "../repositories/analysis.repository.js";
import { prisma } from "../db.js";

export class AnalysisService {
  private formatAnalysis(analysis: any) {
    return {
      id: analysis.id,
      audioFileId: analysis.audioFileId,
      filename: analysis.filename,
      storedName: analysis.audioFile?.storedName || null,
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

  async getStats(userId: string) {
    const list = await analysisRepository.findByUserId(userId);
    const totalCount = list.length;
    
    if (totalCount === 0) {
      return {
        totalCount: 0,
        averageDNA: {
          energy: 0,
          brightness: 0,
          rhythm: 0,
          harmonicRichness: 0,
          danceability: 0,
          acousticness: 0,
          complexity: 0,
          silence: 0,
        },
        tempoDistribution: {
          chill: 0,
          groove: 0,
          energized: 0,
        },
        latestTracks: [],
      };
    }

    const averageDNA = {
      energy: 0,
      brightness: 0,
      rhythm: 0,
      harmonicRichness: 0,
      danceability: 0,
      acousticness: 0,
      complexity: 0,
      silence: 0,
    };

    let chillCount = 0;
    let grooveCount = 0;
    let energizedCount = 0;

    for (const item of list) {
      const dna = item.musicDNA as any;
      if (dna) {
        averageDNA.energy += dna.energy || 0;
        averageDNA.brightness += dna.brightness || 0;
        averageDNA.rhythm += dna.rhythm || 0;
        averageDNA.harmonicRichness += dna.harmonicRichness || 0;
        averageDNA.danceability += dna.danceability || 0;
        averageDNA.acousticness += dna.acousticness || 0;
        averageDNA.complexity += dna.complexity || 0;
        averageDNA.silence += dna.silence || 0;
      }

      const meta = item.metadata as any;
      const tempo = meta?.tempo || 120;
      if (tempo < 90) {
        chillCount++;
      } else if (tempo <= 120) {
        grooveCount++;
      } else {
        energizedCount++;
      }
    }

    averageDNA.energy = Math.round(averageDNA.energy / totalCount);
    averageDNA.brightness = Math.round(averageDNA.brightness / totalCount);
    averageDNA.rhythm = Math.round(averageDNA.rhythm / totalCount);
    averageDNA.harmonicRichness = Math.round(averageDNA.harmonicRichness / totalCount);
    averageDNA.danceability = Math.round(averageDNA.danceability / totalCount);
    averageDNA.acousticness = Math.round(averageDNA.acousticness / totalCount);
    averageDNA.complexity = Math.round(averageDNA.complexity / totalCount);
    averageDNA.silence = Math.round(averageDNA.silence / totalCount);

    const latestTracks = list.slice(0, 5).map((item: any) => ({
      id: item.id,
      audioFileId: item.audioFileId,
      filename: item.filename,
      tempo: (item.metadata as any)?.tempo || 120,
      energy: (item.musicDNA as any)?.energy || 0,
      danceability: (item.musicDNA as any)?.danceability || 0,
      createdAt: item.createdAt,
    }));

    return {
      totalCount,
      averageDNA,
      tempoDistribution: {
        chill: chillCount,
        groove: grooveCount,
        energized: energizedCount,
      },
      latestTracks,
    };
  }

  async getRecommendations(id: string, userId: string) {
    const target = await analysisRepository.findById(id);
    if (!target) {
      throw new Error("Analysis not found");
    }

    if (target.userId !== userId) {
      throw new Error("Forbidden");
    }

    const targetDNA = target.musicDNA as any;
    const targetEnergy = targetDNA?.energy || 50;
    const targetDanceability = targetDNA?.danceability || 50;
    const targetBrightness = targetDNA?.brightness || 50;
    const targetRhythm = targetDNA?.rhythm || 50;

    const rawMatches: any[] = await prisma.$queryRaw`
      SELECT a.id, a."audioFileId", a.filename, a."musicDNA", a.metadata,
             (ABS(CAST(a."musicDNA"->>'energy' AS double precision) - ${targetEnergy}::double precision) +
              ABS(CAST(a."musicDNA"->>'danceability' AS double precision) - ${targetDanceability}::double precision) +
              ABS(CAST(a."musicDNA"->>'brightness' AS double precision) - ${targetBrightness}::double precision) +
              ABS(CAST(a."musicDNA"->>'rhythm' AS double precision) - ${targetRhythm}::double precision)) AS distance
      FROM "Analysis" a
      WHERE a."userId" = ${userId}::uuid AND a."audioFileId" != ${target.audioFileId}::uuid
      ORDER BY distance ASC
      LIMIT 5
    `;

    const audioFileIds = rawMatches.map((item) => item.audioFileId);
    const audioFiles = await prisma.audioFile.findMany({
      where: { id: { in: audioFileIds } },
    });

    const audioFileMap = new Map<string, any>(audioFiles.map((file: any) => [file.id, file]));

    return rawMatches.map((item) => {
      const audioFile = audioFileMap.get(item.audioFileId);
      return {
        id: item.id,
        audioFileId: item.audioFileId,
        filename: item.filename,
        storedName: audioFile?.storedName || null,
        metadata: {
          duration: (item.metadata as any)?.duration || 0,
          tempo: (item.metadata as any)?.tempo || 120,
        },
        musicDNA: item.musicDNA,
        distance: Math.round(item.distance),
      };
    });
  }
}

export const analysisService = new AnalysisService();
