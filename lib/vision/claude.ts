import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { Language } from "@/lib/i18n";
import { buildAnalysisPrompt } from "./prompt";
import {
  type ImageAnalysis,
  type MediaType,
  type VisionProvider,
  parseAnalysisJson,
} from "./types";

const DEFAULT_MODEL = "claude-sonnet-4-6";

export const claudeProvider: VisionProvider = {
  name: "claude",

  isConfigured() {
    return !!process.env.ANTHROPIC_API_KEY;
  },

  async analyzeImage(
    imageBase64: string,
    mediaType: MediaType,
    language: Language
  ): Promise<ImageAnalysis> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY is not configured. Add it to your .env.local file."
      );
    }

    const client = new Anthropic({ apiKey });
    const model = process.env.CLAUDE_MODEL || DEFAULT_MODEL;

    const response = await client.messages.create({
      model,
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: buildAnalysisPrompt(language),
            },
          ],
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    return parseAnalysisJson(text);
  },
};
