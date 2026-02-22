export type ImageStatus = "pending" | "processing" | "done" | "error";

export interface ImageItem {
  id: string;
  originalFileName: string;
  sourcePath: string;
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
  sourcePath: string;
  destPath: string;
  prefix: string;
  suffix: string;
  separator: string;
}
