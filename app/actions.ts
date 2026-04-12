"use server";

import { getVisionProvider, type ImageAnalysis } from "@/lib/vision";
import type { Language } from "@/lib/i18n";

export async function checkApiKey(): Promise<{
  configured: boolean;
  provider: string;
}> {
  const provider = getVisionProvider();
  return { configured: provider.isConfigured(), provider: provider.name };
}

export async function processImage(
  base64Data: string,
  mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp",
  language: Language
): Promise<{ success: boolean; analysis?: ImageAnalysis; error?: string }> {
  try {
    // Strip data URL prefix if present (e.g. "data:image/png;base64,")
    const rawBase64 = base64Data.includes(",")
      ? base64Data.split(",")[1]
      : base64Data;

    const provider = getVisionProvider();

    console.log(
      `[processImage] Processing image via ${provider.name} (${mediaType}, ${Math.round(rawBase64.length / 1024)}KB base64, lang: ${language})`
    );

    const analysis = await provider.analyzeImage(rawBase64, mediaType, language);
    console.log(
      `[processImage] Success -> ${analysis.descriptiveName}`
    );
    return { success: true, analysis };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[processImage] Error:`, message);
    return { success: false, error: message };
  }
}
