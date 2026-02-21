import Anthropic from "@anthropic-ai/sdk";

export interface ImageAnalysis {
  descriptiveName: string;
  altText: string;
  metaDescription: string;
  keywords: string[];
}

export async function analyzeImage(
  apiKey: string,
  imageBase64: string,
  mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp"
): Promise<ImageAnalysis> {
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
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
            text: `Analyze this image and respond with ONLY valid JSON (no markdown, no code fences) in this exact format:

{
  "descriptiveName": "short-kebab-case-name",
  "altText": "Descriptive alt text for accessibility",
  "metaDescription": "SEO-friendly meta description of the image",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

Rules for descriptiveName:
- 3-6 words maximum
- Kebab-case (lowercase, hyphens between words)
- Describe the key subject and action
- No filler words (a, the, of, etc.)

Rules for altText:
- One clear sentence describing what's in the image
- Useful for screen readers

Rules for metaDescription:
- One sentence, SEO-friendly
- Describes the image content and potential use

Rules for keywords:
- 5-10 relevant keywords
- Lowercase, single words or short phrases`,
          },
        ],
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  try {
    const parsed = JSON.parse(text);
    return {
      descriptiveName: parsed.descriptiveName || "unnamed-image",
      altText: parsed.altText || "",
      metaDescription: parsed.metaDescription || "",
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
    };
  } catch {
    return {
      descriptiveName: "unnamed-image",
      altText: text.slice(0, 200),
      metaDescription: text.slice(0, 300),
      keywords: [],
    };
  }
}
