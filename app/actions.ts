"use server";

import { auth } from "@clerk/nextjs/server";
import { analyzeImage, type ImageAnalysis } from "@/lib/claude";
import { getUserCredits, deductCredit } from "@/lib/credits";
import { getOrCreateUser } from "@/lib/user";
import type { Language } from "@/lib/i18n";

export async function checkApiKey(): Promise<{ configured: boolean }> {
  return { configured: !!process.env.ANTHROPIC_API_KEY };
}

export async function getCredits(): Promise<number> {
  const { userId } = await auth();
  if (!userId) return 0;
  return getUserCredits(userId);
}

export async function processImage(
  base64Data: string,
  mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp",
  language: Language
): Promise<{ success: boolean; analysis?: ImageAnalysis; error?: string }> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Ensure user exists in database
    const user = await getOrCreateUser(userId);

    // Check credits before processing
    if (user.credits <= 0) {
      return {
        success: false,
        error: "Insufficient credits. Please purchase more credits to continue.",
      };
    }

    // Strip data URL prefix if present (e.g. "data:image/png;base64,")
    const rawBase64 = base64Data.includes(",")
      ? base64Data.split(",")[1]
      : base64Data;

    console.log(
      `[processImage] Processing image (${mediaType}, ${Math.round(rawBase64.length / 1024)}KB base64, lang: ${language})`
    );

    const analysis = await analyzeImage(rawBase64, mediaType, language);
    console.log(
      `[processImage] Success -> ${analysis.descriptiveName}`
    );

    // Deduct credit only after successful analysis
    await deductCredit(userId);

    return { success: true, analysis };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[processImage] Error:`, message);
    return { success: false, error: message };
  }
}
