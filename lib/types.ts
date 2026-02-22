export type ImageStatus = "pending" | "processing" | "done" | "error";

export interface ImageItem {
  id: string;
  originalFileName: string;
  fileData: string; // base64 data URL from FileReader
  thumbnailUrl: string; // blob URL from URL.createObjectURL
  mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
  status: ImageStatus;
  error?: string;
  analysis?: {
    descriptiveName: string;
    title: string;
    altText: string;
    metaDescription: string;
    keywords: string[];
    locationName: string;
    city: string;
    stateProvince: string;
    country: string;
  };
  finalFileName?: string;
  exported: boolean;
}

import type { Language } from "./i18n";

export interface AppSettings {
  language: Language;
  prefix: string;
  suffix: string;
  separator: string;
}
