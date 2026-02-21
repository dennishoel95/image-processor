export type ImageStatus = "pending" | "processing" | "done" | "error";

export interface ImageItem {
  id: string;
  originalFileName: string;
  sourcePath: string;
  status: ImageStatus;
  error?: string;
  analysis?: {
    descriptiveName: string;
    altText: string;
    metaDescription: string;
    keywords: string[];
  };
  finalFileName?: string;
  exported: boolean;
}

export interface AppSettings {
  apiKey: string;
  sourcePath: string;
  destPath: string;
  prefix: string;
  suffix: string;
  separator: string;
}
