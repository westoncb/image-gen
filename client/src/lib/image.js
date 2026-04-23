export function dataUrlToFile(dataUrl, filename = "image.png") {
  const [header, b64] = dataUrl.split(",");
  const mimeType = header.match(/data:(.*?);base64/)?.[1] || "image/png";
  const bytes = atob(b64);
  const buffer = new Uint8Array(bytes.length);

  for (let index = 0; index < bytes.length; index += 1) {
    buffer[index] = bytes.charCodeAt(index);
  }

  return new File([buffer], filename, { type: mimeType });
}

export function dataUrlParts(dataUrl) {
  const [header, b64 = ""] = dataUrl.split(",");
  const mimeType = header.match(/data:(.*?);base64/)?.[1] || "image/png";
  return { mimeType, b64 };
}

export function promptSlug(prompt) {
  return String(prompt || "image")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70) || "image";
}

export function resultToAttachment(stage) {
  if (!stage?.result?.imageDataUrl) return null;

  return {
    id: `attachment_${stage.id}`,
    name: `Result from ${stage.label}`,
    mimeType: stage.result.mimeType || "image/png",
    previewUrl: stage.result.imageDataUrl,
    dataUrl: stage.result.imageDataUrl,
    source: "result",
    sourceStageId: stage.id,
  };
}

export function formatUsage(usage) {
  if (!usage) return "not provided";

  const total = usage.total_tokens ?? 0;
  const input = usage.input_tokens ?? 0;
  const output = usage.output_tokens ?? 0;
  return `${total} total (${input} input, ${output} output)`;
}
