import type { Request, Response, NextFunction } from "express";
import { analysisService } from "../services/analysis.service.js";
import { z } from "zod";

const AnalysisIdParamSchema = z.object({
  id: z.string().uuid("Invalid analysis ID format"),
});

const getBaseUrl = (req: Request) => {
  const protocol = (req.headers["x-forwarded-proto"] as string) || req.protocol;
  const host = req.get("host");
  return `${protocol}://${host}`;
};

const addAnalysisUrl = (req: Request, analysis: any) => {
  if (!analysis) return analysis;
  const baseUrl = getBaseUrl(req);
  return {
    ...analysis,
    url: analysis.storedName ? `${baseUrl}/uploads/files/${analysis.storedName}` : null,
  };
};

const addAnalysesUrl = (req: Request, list: any[]) => {
  return list.map((item) => addAnalysisUrl(req, item));
};

export class AnalysisController {
  async getAnalyses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const list = await analysisService.getAnalysesForUser(userId);
      res.status(200).json({
        success: true,
        data: addAnalysesUrl(req, list),
      });
    } catch (error) {
      next(error);
    }
  }

  async getAnalysisById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const params = await AnalysisIdParamSchema.parseAsync(req.params);
      const analysis = await analysisService.getAnalysisById(params.id, userId);

      res.status(200).json({
        success: true,
        data: addAnalysisUrl(req, analysis),
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: error.issues[0]?.message || "Invalid ID format",
        });
        return;
      }
      if (error.message === "Analysis not found") {
        res.status(404).json({ success: false, message: "Analysis not found" });
        return;
      }
      if (error.message === "Forbidden") {
        res.status(403).json({ success: false, message: "Access denied" });
        return;
      }
      next(error);
    }
  }

  async deleteAnalysis(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const params = await AnalysisIdParamSchema.parseAsync(req.params);
      const result = await analysisService.deleteAnalysis(params.id, userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: error.issues[0]?.message || "Invalid ID format",
        });
        return;
      }
      if (error.message === "Analysis not found") {
        res.status(404).json({ success: false, message: "Analysis not found" });
        return;
      }
      if (error.message === "Forbidden") {
        res.status(403).json({ success: false, message: "Access denied" });
        return;
      }
      next(error);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const stats = await analysisService.getStats(userId);
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRecommendations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const params = await AnalysisIdParamSchema.parseAsync(req.params);
      const list = await analysisService.getRecommendations(params.id, userId);
      
      const baseUrl = getBaseUrl(req);
      const mappedList = list.map(item => ({
        ...item,
        url: item.storedName ? `${baseUrl}/uploads/files/${item.storedName}` : null,
      }));

      res.status(200).json({
        success: true,
        data: mappedList,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: error.issues[0]?.message || "Invalid ID format",
        });
        return;
      }
      if (error.message === "Analysis not found") {
        res.status(404).json({ success: false, message: "Analysis not found" });
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

export const analysisController = new AnalysisController();

