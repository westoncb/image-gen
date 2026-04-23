import express from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { ensureSavedImagesDir, publicSavedPath, savedImagesDir } from "../utils/files.js";
import { extensionForMime, sanitizeFilename } from "../utils/sanitize.js";

export const saveImageRouter = express.Router();

saveImageRouter.post("/", async (req, res, next) => {
  try {
    const { filenameHint, mimeType = "image/png", b64 } = req.body || {};

    if (!b64 || typeof b64 !== "string") {
      return res.status(400).json({ error: "Missing image data to save." });
    }

    if (!["image/png", "image/jpeg", "image/webp"].includes(mimeType)) {
      return res.status(400).json({ error: `Unsupported image MIME type: ${mimeType}` });
    }

    const cleanBase = sanitizeFilename(filenameHint, "image");
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const ext = extensionForMime(mimeType);
    const filename = `${cleanBase}-${stamp}.${ext}`;
    const buffer = Buffer.from(b64.replace(/^data:[^,]+,/, ""), "base64");

    await ensureSavedImagesDir();
    await fs.writeFile(path.join(savedImagesDir, filename), buffer);

    res.json({ path: publicSavedPath(filename), filename });
  } catch (error) {
    next(error);
  }
});
