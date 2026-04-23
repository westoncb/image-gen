import express from "express";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import multer from "multer";
import { getOpenAIClient } from "../openaiClient.js";

const uploadDir = path.join(os.tmpdir(), "image-gen-uploads");
const upload = multer({
  dest: uploadDir,
  limits: {
    files: 1,
    fileSize: 25 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (["image/png", "image/jpeg", "image/webp"].includes(file.mimetype)) {
      cb(null, true);
      return;
    }
    const error = new Error("Only PNG, JPEG, and WebP images are supported.");
    error.statusCode = 400;
    cb(error);
  },
});

export const imageRouter = express.Router();

imageRouter.post("/", upload.single("image"), async (req, res, next) => {
  try {
    const prompt = String(req.body.prompt || "").trim();
    const model = String(req.body.model || "gpt-image-2").trim();
    const size = String(req.body.size || "auto").trim();
    const quality = String(req.body.quality || "high").trim();
    const outputFormat = String(req.body.output_format || "png").trim();
    const background = String(req.body.background || "auto").trim();
    const moderation = String(req.body.moderation || "low").trim();
    const outputCompression = Number(req.body.output_compression || 100);
    const inputFidelity = String(req.body.input_fidelity || "low").trim();

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    const openai = getOpenAIClient();
    const common = {
      model,
      prompt,
      n: 1,
      size,
      quality,
      output_format: outputFormat,
      background,
      moderation,
    };

    if (["jpeg", "webp"].includes(outputFormat)) {
      common.output_compression = outputCompression;
    }

    const mode = req.file ? "edit" : "generate";
    const response = req.file
      ? await openai.images.edit({
          ...common,
          input_fidelity: inputFidelity,
          image: fs.createReadStream(req.file.path),
        })
      : await openai.images.generate(common);

    const result = normalizeImageResponse({
      response,
      requestedModel: model,
      mode,
      requested: { size, quality, outputFormat, outputCompression, background, inputFidelity },
    });

    res.json(result);
  } catch (error) {
    next(error);
  } finally {
    if (req.file?.path) {
      await fsPromises.rm(req.file.path, { force: true }).catch(() => {});
    }
  }
});

function normalizeImageResponse({ response, requestedModel, mode, requested }) {
  const image = response?.data?.[0];
  const b64 = image?.b64_json;
  const mimeType = `image/${requested.outputFormat === "jpg" ? "jpeg" : requested.outputFormat}`;
  const warnings = [];

  if (!b64) {
    warnings.push("The API response did not include a base64 image payload.");
  }

  const executedModel =
    response?.model ||
    response?.data?.[0]?.model ||
    response?.output?.[0]?.model ||
    null;

  return {
    mode,
    requestedModel,
    executedModel,
    mimeType,
    imageDataUrl: b64 ? `data:${mimeType};base64,${b64}` : null,
    revisedPrompt: image?.revised_prompt || null,
    outputFormat: response?.output_format || requested.outputFormat,
    outputCompression: requested.outputCompression,
    quality: response?.quality || requested.quality,
    size: response?.size || requested.size,
    background: response?.background || requested.background,
    inputFidelity: mode === "edit" ? requested.inputFidelity : null,
    usage: response?.usage || {
      input_tokens: 0,
      output_tokens: 0,
      total_tokens: 0,
    },
    warning: warnings.length ? warnings.join(" ") : null,
    raw: redactImagePayloads(response),
  };
}

function redactImagePayloads(value) {
  if (Array.isArray(value)) {
    return value.map((item) => redactImagePayloads(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        key === "b64_json" ? "[base64 image payload omitted]" : redactImagePayloads(item),
      ]),
    );
  }

  return value;
}
