"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { HeroSection } from "@/components/hero-section";
import { SettingsPanel } from "@/components/settings-panel";
import { ImageGrid } from "@/components/image-grid";
import { ImageDetail } from "@/components/image-detail";
import { processImage, checkApiKey } from "./actions";
import { exportAsZip } from "@/lib/export";
import type { ImageItem, AppSettings } from "@/lib/types";

const SETTINGS_KEY = "image-processor-settings";

const DEFAULT_SETTINGS: AppSettings = {
  language: "en",
  prefix: "",
  suffix: "",
  separator: "-",
};

function loadSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        language: parsed.language || DEFAULT_SETTINGS.language,
        prefix: parsed.prefix || DEFAULT_SETTINGS.prefix,
        suffix: parsed.suffix || DEFAULT_SETTINGS.suffix,
        separator: parsed.separator || DEFAULT_SETTINGS.separator,
      };
    }
  } catch {
    // ignore parse errors
  }
  return DEFAULT_SETTINGS;
}

function getMediaType(
  file: File
): "image/jpeg" | "image/png" | "image/gif" | "image/webp" {
  const map: Record<string, "image/jpeg" | "image/png" | "image/gif" | "image/webp"> = {
    "image/jpeg": "image/jpeg",
    "image/png": "image/png",
    "image/gif": "image/gif",
    "image/webp": "image/webp",
  };
  return map[file.type] || "image/jpeg";
}

const MAX_DIMENSION = 2048;

function compressImage(
  file: File
): Promise<{ dataUrl: string; mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp" }> {
  return new Promise((resolve) => {
    const mediaType = getMediaType(file);

    if (mediaType === "image/gif") {
      const reader = new FileReader();
      reader.onload = () => resolve({ dataUrl: reader.result as string, mediaType });
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const scale = MAX_DIMENSION / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      const outputType = "image/webp";
      const dataUrl = canvas.toDataURL(outputType, 0.85);
      resolve({ dataUrl, mediaType: "image/webp" });
    };
    img.src = objectUrl;
  });
}

export default function Home() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);
  const [toolOpen, setToolOpen] = useState(false);

  const imagesRef = useRef(images);
  imagesRef.current = images;

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    setSettings(loadSettings());
    checkApiKey().then((result) => setApiKeyConfigured(result.configured));
  }, []);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((img) => {
        if (img.thumbnailUrl) URL.revokeObjectURL(img.thumbnailUrl);
      });
    };
  }, []);

  // Lock body scroll when overlay is open
  useEffect(() => {
    if (toolOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [toolOpen]);

  const handleFilesSelected = useCallback((files: File[]) => {
    const promises = files.map(async (file): Promise<ImageItem> => {
      const { dataUrl, mediaType } = await compressImage(file);
      return {
        id: crypto.randomUUID(),
        originalFileName: file.name,
        fileData: dataUrl,
        thumbnailUrl: URL.createObjectURL(file),
        mediaType,
        status: "pending",
        exported: false,
      };
    });

    Promise.all(promises).then((items) => {
      setImages((prev) => [...prev, ...items]);
    });
  }, []);

  const handleProcessSingle = useCallback(
    async (imageId: string) => {
      const s = settingsRef.current;
      const image = imagesRef.current.find((img) => img.id === imageId);
      if (!image) return;

      setImages((prev) =>
        prev.map((img) =>
          img.id === imageId
            ? { ...img, status: "processing" as const, error: undefined }
            : img
        )
      );

      try {
        const result = await processImage(
          image.fileData,
          image.mediaType,
          s.language
        );

        setImages((prev) =>
          prev.map((img) =>
            img.id === imageId
              ? result.success
                ? { ...img, status: "done" as const, analysis: result.analysis }
                : {
                    ...img,
                    status: "error" as const,
                    error: result.error || "Unknown error",
                  }
              : img
          )
        );
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setImages((prev) =>
          prev.map((img) =>
            img.id === imageId
              ? { ...img, status: "error" as const, error: message }
              : img
          )
        );
      }
    },
    []
  );

  const handleProcessAll = useCallback(async () => {
    setIsProcessing(true);
    const pending = imagesRef.current.filter((img) => img.status === "pending");
    for (const image of pending) {
      await handleProcessSingle(image.id);
    }
    setIsProcessing(false);
  }, [handleProcessSingle]);

  const handleExportAll = useCallback(async () => {
    const s = settingsRef.current;
    const processed = imagesRef.current.filter(
      (img) => img.status === "done" && img.analysis
    );
    if (processed.length === 0) return;

    await exportAsZip(processed, {
      prefix: s.prefix,
      suffix: s.suffix,
      separator: s.separator,
    });

    setImages((prev) =>
      prev.map((img) =>
        img.status === "done" && img.analysis
          ? { ...img, exported: true }
          : img
      )
    );
  }, []);

  const handleUpdateAnalysis = useCallback(
    (
      imageId: string,
      field:
        | "descriptiveName"
        | "title"
        | "altText"
        | "metaDescription"
        | "keywords"
        | "locationName"
        | "city"
        | "stateProvince"
        | "country",
      value: string | string[]
    ) => {
      setImages((prev) =>
        prev.map((img) =>
          img.id === imageId && img.analysis
            ? { ...img, analysis: { ...img.analysis, [field]: value } }
            : img
        )
      );
    },
    []
  );

  const handleRemoveImage = useCallback((imageId: string) => {
    setImages((prev) => {
      const removed = prev.find((img) => img.id === imageId);
      if (removed?.thumbnailUrl) URL.revokeObjectURL(removed.thumbnailUrl);
      return prev.filter((img) => img.id !== imageId);
    });
    setSelectedId((prev) => (prev === imageId ? null : prev));
  }, []);

  const handleReset = useCallback(() => {
    imagesRef.current.forEach((img) => {
      if (img.thumbnailUrl) URL.revokeObjectURL(img.thumbnailUrl);
    });
    setImages([]);
    setSelectedId(null);
  }, []);

  const selectedImage = images.find((img) => img.id === selectedId) || null;
  const processedCount = images.filter(
    (img) => img.status === "done" && img.analysis
  ).length;

  return (
    <main className="h-screen overflow-hidden">
      {/* Hero — always visible behind overlay */}
      <HeroSection onScrollToTool={() => setToolOpen(true)} />

      {/* Tool overlay */}
      {toolOpen && (
        <div className="fixed inset-0 z-50 flex flex-col">
          {/* Backdrop */}
          <div
            className="overlay-backdrop absolute inset-0 bg-deep/95 backdrop-blur-sm"
            onClick={() => setToolOpen(false)}
          />

          {/* Panel */}
          <div className="overlay-panel relative z-10 flex flex-col m-4 mt-6 mb-4 rounded-xl border border-elevated bg-surface overflow-hidden shadow-2xl shadow-black/40 flex-1">
            {/* Header bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-elevated bg-surface/80 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <h2 className="font-display font-light text-cream text-lg">
                  Image Processor
                </h2>
                <span className="text-[10px] text-dim tracking-wider uppercase font-medium px-2 py-0.5 rounded-full border border-raised">
                  AI Vision
                </span>
              </div>
              <button
                onClick={() => setToolOpen(false)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs text-dim hover:text-cream hover:bg-elevated transition-all"
              >
                <span>Close</span>
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M1 1l12 12M13 1L1 13" />
                </svg>
              </button>
            </div>

            {/* Tool body */}
            <div className="flex flex-1 overflow-hidden">
              <SettingsPanel
                settings={settings}
                onSettingsChange={setSettings}
                onProcessAll={handleProcessAll}
                onExportAll={handleExportAll}
                onReset={handleReset}
                isProcessing={isProcessing}
                imageCount={images.length}
                processedCount={processedCount}
                apiKeyConfigured={apiKeyConfigured}
              />

              <ImageGrid
                images={images}
                selectedId={selectedId}
                onSelectImage={setSelectedId}
                onRemoveImage={handleRemoveImage}
                onFilesSelected={handleFilesSelected}
                language={settings.language}
              />

              {selectedImage && (
                <ImageDetail
                  image={selectedImage}
                  prefix={settings.prefix}
                  suffix={settings.suffix}
                  separator={settings.separator}
                  onUpdateAnalysis={handleUpdateAnalysis}
                  onProcess={handleProcessSingle}
                  onExport={() => handleExportAll()}
                  onClose={() => setSelectedId(null)}
                  isProcessing={isProcessing}
                  language={settings.language}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
