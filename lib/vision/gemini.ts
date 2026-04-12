import "server-only";
import { GoogleGenAI } from "@google/genai";
import type { Language } from "@/lib/i18n";
import { buildAnalysisPrompt } from "./prompt";
import {
  type ImageAnalysis,
  type MediaType,
  type VisionProvider,
  parseAnalysisJson,
} from "./types";

/**
 * Default model: gemini-2.5-flash — the current stable free-tier model
 * with ~500 requests/day. Overridable via GEMINI_MODEL env var if you
 * want to try a preview model or upgrade to Pro tier.
 */
const DEFAULT_MODEL = "gemini-2.5-flash";

export const geminiProvider: VisionProvider = {
  name: "gemini",

  isConfigured() {
    return !!process.env.GEMINI_API_KEY;
  },

  async analyzeImage(
    imageBase64: string,
    mediaType: MediaType,
    language: Language
  ): Promise<ImageAnalysis> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not configured. Add it to your .env.local file."
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: mediaType,
                data: imageBase64,
              },
            },
            { text: buildAnalysisPrompt(language) },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text ?? "";
    return parseAnalysisJson(text);
  },
};
