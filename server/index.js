import "dotenv/config";
import cors from "cors";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { imageRouter } from "./routes/image.js";
import { saveImageRouter } from "./routes/saveImage.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 3019);

app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    hasOpenAIKey: Boolean(process.env.OPENAI_API_KEY),
  });
});

app.use("/api/image", imageRouter);
app.use("/api/save-image", saveImageRouter);

if (process.env.NODE_ENV === "production") {
  const distDir = path.resolve(__dirname, "../dist");
  app.use(express.static(distDir));
  app.get("/{*splat}", (_req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });
}

app.use((error, _req, res, _next) => {
  const status = error.statusCode || error.status || 500;
  const message =
    error?.response?.data?.error?.message ||
    error?.error?.message ||
    error?.message ||
    "Unexpected server error.";

  res.status(status).json({
    error: message,
    details: error?.response?.data || undefined,
  });
});

app.listen(port, () => {
  console.log(`Image API listening on http://localhost:${port}`);
});
