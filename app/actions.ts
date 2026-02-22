"use server";

import path from "path";
import {
  validateDirectory,
  scanForImages,
  readImageAsBase64,
  getImageMediaType,
  copyFileWithNewName,
  writeMetadataFile,
  getUniqueFileName,
} from "@/lib/filesystem";
import { analyzeImage, type ImageAnalysis } from "@/lib/claude";
import { buildFileName } from "@/lib/naming";
import type { Language } from "@/lib/i18n";

export async function scanSourceFolder(
  sourcePath: string
): Promise<{ success: boolean; files?: string[]; error?: string }> {
  const valid = await validateDirectory(sourcePath);
  if (!valid) {
    return { success: false, error: `Invalid directory: ${sourcePath}` };
  }

  const files = await scanForImages(sourcePath);
  return { success: true, files };
}

export async function checkApiKey(): Promise<{ configured: boolean }> {
  return { configured: !!process.env.ANTHROPIC_API_KEY };
}

export async function processImage(
  sourcePath: string,
  fileName: string,
  language: Language
): Promise<{ success: boolean; analysis?: ImageAnalysis; error?: string }> {
  try {
    const filePath = path.join(sourcePath, fileName);
    console.log(`[processImage] Processing: ${fileName} (lang: ${language})`);
    const base64 = await readImageAsBase64(filePath);
    console.log(`[processImage] Read ${fileName} as base64 (${Math.round(base64.length / 1024)}KB)`);
    const mediaType = await getImageMediaType(filePath);
    console.log(`[processImage] Media type: ${mediaType}, calling Claude API...`);
    const analysis = await analyzeImage(base64, mediaType, language);
    console.log(`[processImage] Success: ${fileName} -> ${analysis.descriptiveName}`);
    return { success: true, analysis };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[processImage] Error processing ${fileName}:`, message);
    return { success: false, error: message };
  }
}

export async function exportImage(params: {
  sourcePath: string;
  destPath: string;
  originalFileName: string;
  descriptiveName: string;
  prefix: string;
  suffix: string;
  separator: string;
  title: string;
  altText: string;
  metaDescription: string;
  keywords: string[];
  locationName: string;
  city: string;
  stateProvince: string;
  country: string;
}): Promise<{ success: boolean; finalFileName?: string; error?: string }> {
  try {
    const ext = path.extname(params.originalFileName);
    const fileName = buildFileName({
      prefix: params.prefix,
      aiName: params.descriptiveName,
      suffix: params.suffix,
      separator: params.separator,
      originalExtension: ext,
    });

    const uniqueFileName = await getUniqueFileName(params.destPath, fileName);
    const baseName = path.basename(uniqueFileName, path.extname(uniqueFileName));

    const sourceFilePath = path.join(params.sourcePath, params.originalFileName);

    await copyFileWithNewName(sourceFilePath, params.destPath, uniqueFileName);
    await writeMetadataFile(params.destPath, baseName, {
      fileName: uniqueFileName,
      title: params.title,
      altText: params.altText,
      metaDescription: params.metaDescription,
      keywords: params.keywords,
      locationName: params.locationName,
      city: params.city,
      stateProvince: params.stateProvince,
      country: params.country,
    });

    return { success: true, finalFileName: uniqueFileName };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}
