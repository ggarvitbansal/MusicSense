import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export function getFileExtension(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  return ext;
}

export function generateUniqueFilename(originalName: string): string {
  const uuid = crypto.randomUUID();
  const ext = getFileExtension(originalName);
  return `${uuid}${ext}`;
}

export async function deletePhysicalFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch (error: any) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}
