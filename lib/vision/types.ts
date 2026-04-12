import type { Language } from "@/lib/i18n";

export interface ImageAnalysis {
  descriptiveName: string;
  title: string;
  altText: string;
  metaDescription: string;
  keywords: string[];
  locationName: string;
  city: string;
  stateProvince: string;
  country: string;
}

export type MediaType =
  | "image/jpeg"
  | "image/png"
  | "image/gif"
  | "image/webp";

export interface VisionProvider {
  /** Stable identifier for the provider (e.g. "gemini", "claude"). */
  readonly name: string;
  /** Returns true if the required env vars for this provider are set. */
  isConfigured(): boolean;
  /** Analyze an image and return structured metadata. */
  analyzeImage(
    imageBase64: string,
    mediaType: MediaType,
    language: Language
  ): Promise<ImageAnalysis>;
}

/**
 * Parses a provider response text into an ImageAnalysis, tolerating
 * minor formatting quirks (stray markdown fences, missing fields).
 *
 * Both Gemini (responseMimeType: application/json) and Claude produce
 * clean JSON in the happy path, but this keeps us resilient if either
 * model ever slips in a code fence or omits an optional field.
 */
export function parseAnalysisJson(raw: string): ImageAnalysis {
  const cleaned = raw
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    return {
      descriptiveName: parsed.descriptiveName || "unnamed-image",
      title: parsed.title || "",
      altText: parsed.altText || "",
      metaDescription: parsed.metaDescription || "",
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      locationName: parsed.locationName || "",
      city: parsed.city || "",
      stateProvince: parsed.stateProvince || "",
      country: parsed.country || "",
    };
  } catch {
    return {
      descriptiveName: "unnamed-image",
      title: "",
      altText: cleaned.slice(0, 200),
      metaDescription: cleaned.slice(0, 300),
      keywords: [],
      locationName: "",
      city: "",
      stateProvince: "",
      country: "",
    };
  }
}
