import "server-only";
import { Mistral } from "@mistralai/mistralai";
import type { Language } from "@/lib/i18n";
import { buildAnalysisPrompt } from "./prompt";
import {
  type ImageAnalysis,
  type MediaType,
  type VisionProvider,
  parseAnalysisJson,
} from "./types";

/**
 * Default model: mistral-medium-2505 — Mistral's frontier-class
 * multimodal model. Confirmed multimodal via the /v1/models API
 * (capabilities.vision = true) and has the most generous token budget
 * on the free Experiment workspace tier at 375,000 TPM / 0.42 RPS.
 *
 * Why not pixtral-large-2411: it tokenizes large images aggressively
 * and a single high-res photo can burst its 50k TPM budget, triggering
 * a 429 "Rate limit exceeded" on the first request. mistral-medium-2505
 * has 7.5x the TPM headroom, so single large images fit comfortably.
 *
 * Overridable via MISTRAL_MODEL env var. Other vision-capable options
 * on the free tier: pixtral-large-2411, mistral-large-2512.
 */
const DEFAULT_MODEL = "mistral-medium-2505";

export const mistralProvider: VisionProvider = {
  name: "mistral",

  isConfigured() {
    return !!process.env.MISTRAL_API_KEY;
  },

  async analyzeImage(
    imageBase64: string,
    mediaType: MediaType,
    language: Language
  ): Promise<ImageAnalysis> {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      throw new Error(
        "MISTRAL_API_KEY is not configured. Add it to your .env.local file."
      );
    }

    const client = new Mistral({ apiKey });
    const model = process.env.MISTRAL_MODEL || DEFAULT_MODEL;

    // Mistral's image_url field accepts either a remote URL or a
    // data URL — same encoding pattern as OpenAI's vision API.
    const dataUrl = `data:${mediaType};base64,${imageBase64}`;

    const response = await client.chat.complete({
      model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: buildAnalysisPrompt(language) },
            { type: "image_url", imageUrl: dataUrl },
          ],
        },
      ],
      responseFormat: { type: "json_object" },
    });

    const choice = response.choices?.[0];
    const content = choice?.message?.content;

    // Mistral's message.content can be either a string or an array of
    // content chunks depending on the model and SDK version. Normalize
    // both shapes into a single string before parsing.
    let text = "";
    if (typeof content === "string") {
      text = content;
    } else if (Array.isArray(content)) {
      text = content
        .map((chunk) => {
          if (typeof chunk === "string") return chunk;
          if (chunk && typeof chunk === "object" && "text" in chunk) {
            return typeof chunk.text === "string" ? chunk.text : "";
          }
          return "";
        })
        .join("");
    }

    return parseAnalysisJson(text);
  },
};
