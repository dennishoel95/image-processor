import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { Language } from "./i18n";

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

const LANGUAGE_NAMES: Record<Language, string> = {
  en: "English",
  no: "Norwegian (Bokmål)",
  de: "German",
  es: "Spanish",
  ko: "Korean",
};

export async function analyzeImage(
  imageBase64: string,
  mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp",
  language: Language
): Promise<ImageAnalysis> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not configured. Add it to your .env.local file."
    );
  }
  const client = new Anthropic({ apiKey });

  const langName = LANGUAGE_NAMES[language];

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
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
            text: `Analyze this image and respond with ONLY valid JSON (no markdown, no code fences) in this exact format.

CRITICAL LANGUAGE REQUIREMENT: All text content MUST be written in ${langName} using correct ${langName} vocabulary, grammar, spelling, and established terminology. Do NOT translate words literally from English — use the proper ${langName} dictionary terms. For example, use the established ${langName} name for animals, plants, objects, and concepts as they appear in a ${langName} dictionary or encyclopedia.

{
  "descriptiveName": "short-kebab-case-name",
  "title": "Concise human-readable title",
  "altText": "Descriptive alt text for accessibility",
  "metaDescription": "SEO-friendly description of the image",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "locationName": "Specific place name if identifiable",
  "city": "City if identifiable",
  "stateProvince": "State or province if identifiable",
  "country": "Country if identifiable"
}

Rules for descriptiveName:
- 3-6 words maximum in ${langName}, using correct ${langName} vocabulary
- Kebab-case (lowercase, hyphens between words)
- Describe the key subject and action
- No filler words
- Use proper ${langName} terms, not literal translations from English

Rules for title:
- Concise human-readable heading in grammatically correct ${langName}
- STRICT LIMIT: Must be between 50 and 100 characters (count carefully before responding)
- If under 50 chars, add more descriptive detail; if over 100 chars, shorten

Rules for altText:
- One clear sentence in ${langName} describing what's in the image
- STRICT LIMIT: Maximum 125 characters (IPTC standard — count carefully before responding)
- Useful for screen readers and AI systems parsing images
- Must use proper ${langName} terminology and grammar
- Do NOT exceed 125 characters under any circumstances

Rules for metaDescription:
- Detailed description in ${langName}, 1-3 sentences
- STRICT LIMIT: Must be between 150 and 160 characters (Google optimal range — count carefully)
- SEO and GEO optimized for search engines and AI systems
- Describes the image content, context, and potential use
- Must follow ${langName} grammar and use established vocabulary

Rules for keywords:
- 5-10 relevant keywords in ${langName}
- Use correct ${langName} dictionary terms
- Lowercase, single words or short phrases

Rules for location fields:
- If the location is identifiable from the image, fill in as much as possible
- Use full names (not abbreviations)
- Location names should use the standard ${langName} form where applicable
- If location cannot be determined, use empty string ""`,
          },
        ],
      },
    ],
  });

  let text =
    response.content[0].type === "text" ? response.content[0].text : "";

  // Strip markdown code fences if the model wraps the JSON
  text = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();

  try {
    const parsed = JSON.parse(text);
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
      altText: text.slice(0, 200),
      metaDescription: text.slice(0, 300),
      keywords: [],
      locationName: "",
      city: "",
      stateProvince: "",
      country: "",
    };
  }
}
