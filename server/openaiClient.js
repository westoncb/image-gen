import OpenAI from "openai";

let client;

export function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    const error = new Error(
      "OPENAI_API_KEY is not set. Add it to your server environment before submitting image requests.",
    );
    error.statusCode = 500;
    throw error;
  }

  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  return client;
}
