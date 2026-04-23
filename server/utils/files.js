import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const projectRoot = path.resolve(__dirname, "../..");
export const savedImagesDir = path.join(projectRoot, "saved-images");

export async function ensureSavedImagesDir() {
  await fs.mkdir(savedImagesDir, { recursive: true });
}

export function publicSavedPath(filename) {
  return path.join("saved-images", filename);
}
