import type { Request, Response, NextFunction } from "express";
import { analysisService } from "../services/analysis.service.js";
import { z } from "zod";

const AnalysisIdParamSchema = z.object({
  id: z.string().uuid("Invalid analysis ID format"),
});

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
        data: list,
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
        data: analysis,
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
}

export const analysisController = new AnalysisController();
