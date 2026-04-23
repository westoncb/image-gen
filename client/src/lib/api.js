import { dataUrlParts, dataUrlToFile } from "./image.js";

export async function checkHealth() {
  const response = await fetch("/api/health");
  if (!response.ok) throw new Error("Server health check failed.");
  return response.json();
}

export async function submitImageRequest({ prompt, attachment, config }) {
  const body = new FormData();
  body.set("prompt", prompt);
  body.set("model", config?.model || "gpt-image-2");
  body.set("size", config?.size || "auto");
  body.set("quality", config?.quality || "high");
  body.set("output_format", config?.outputFormat || "png");
  body.set("background", config?.background || "auto");
  body.set("moderation", config?.moderation || "low");

  if (["jpeg", "webp"].includes(config?.outputFormat)) {
    body.set("output_compression", String(config?.outputCompression ?? 100));
  }

  if (attachment?.file) {
    body.set("input_fidelity", config?.inputFidelity || "low");
    body.set("image", attachment.file, attachment.file.name);
  } else if (attachment?.dataUrl) {
    body.set("input_fidelity", config?.inputFidelity || "low");
    body.set("image", dataUrlToFile(attachment.dataUrl, "previous-result.png"));
  }

  const response = await fetch("/api/image", {
    method: "POST",
    body,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Image request failed.");
  }

  return payload;
}

export async function saveImage({ imageDataUrl, filenameHint }) {
  const { mimeType, b64 } = dataUrlParts(imageDataUrl);
  const response = await fetch("/api/save-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filenameHint, mimeType, b64 }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Save failed.");
  }

  return payload;
}
