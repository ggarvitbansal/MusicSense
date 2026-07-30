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
    if (filePath.startsWith("DIAGNOSTIC ERROR:")) {
      return;
    }
    await fs.unlink(filePath);
  } catch (error: any) {
    console.warn(`Could not delete physical file at ${filePath}:`, error.message);
  }
}
