# Image Chain Studio

React + Vite frontend with a small Express backend for OpenAI image generation and editing.

## Setup

```sh
npm install
npm run dev
```

Paste your API key into `.env` as `OPENAI_API_KEY=...`. The dev client runs on `http://localhost:5199` and proxies `/api` to the Express server on `http://localhost:3019`. Vite is configured with `strictPort`, so it fails instead of silently moving if `5199` is occupied.

In production, run:

```sh
npm run build
npm start
```

Saved images are written only when the fullscreen modal is open and `Cmd+S` or `Ctrl+S` is pressed. Files go to `saved-images/`.
