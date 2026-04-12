import "server-only";
import { claudeProvider } from "./claude";
import { geminiProvider } from "./gemini";
import { mistralProvider } from "./mistral";
import type { VisionProvider } from "./types";

export type { ImageAnalysis, MediaType, VisionProvider } from "./types";

const PROVIDERS: Record<string, VisionProvider> = {
  gemini: geminiProvider,
  mistral: mistralProvider,
  claude: claudeProvider,
};

/**
 * Picks the active vision provider based on the VISION_PROVIDER env var.
 * Defaults to "mistral" — the currently most reliable free-tier path
 * (no credit card, phone verification only, Pixtral 12B vision model).
 *
 * Override by setting VISION_PROVIDER in .env.local:
 * - "gemini"  → Google Gemini 2.5 Flash (free tier; currently has provisioning issues)
 * - "claude"  → Anthropic Claude Sonnet (paid, highest quality)
 * - "mistral" → Mistral Pixtral (free, default)
 */
export function getVisionProvider(): VisionProvider {
  const name = (process.env.VISION_PROVIDER || "mistral").toLowerCase();
  const provider = PROVIDERS[name];
  if (!provider) {
    throw new Error(
      `Unknown VISION_PROVIDER: "${name}". Valid values: ${Object.keys(PROVIDERS).join(", ")}`
    );
  }
  return provider;
}
