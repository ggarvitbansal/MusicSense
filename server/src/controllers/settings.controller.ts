import type { Request, Response, NextFunction } from "express";
import { settingsService } from "../services/settings.service.js";
import { z } from "zod";

const UpdateSettingsSchema = z.object({
  theme: z.string().optional(),
  notifications: z.boolean().optional(),
  preferredModel: z.enum(["TENSORFLOW"]).optional(),
});

export class SettingsController {
  async getSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const settings = await settingsService.getSettings(userId);
      res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const body = await UpdateSettingsSchema.parseAsync(req.body);
      const updated = await settingsService.updateSettings(userId, body);

      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: error.issues[0]?.message || "Invalid settings format",
        });
        return;
      }
      next(error);
    }
  }
}

export const settingsController = new SettingsController();
