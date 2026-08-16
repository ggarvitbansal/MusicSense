import { prisma } from "../db.js";

export class SettingsService {
  async getSettings(userId: string) {
    let settings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    // Fallback: If for some reason settings don't exist, create default ones
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId,
        },
      });
    }

    return settings;
  }

  async updateSettings(userId: string, data: {
    theme?: string | undefined;
    notifications?: boolean | undefined;
    preferredModel?: "TENSORFLOW" | undefined;
  }) {
    const updateData: any = {};
    if (data.theme !== undefined) updateData.theme = data.theme;
    if (data.notifications !== undefined) updateData.notifications = data.notifications;
    if (data.preferredModel !== undefined) updateData.preferredModel = data.preferredModel;

    return prisma.userSettings.update({
      where: { userId },
      data: updateData,
    });
  }
}

export const settingsService = new SettingsService();
