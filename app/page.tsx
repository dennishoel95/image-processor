"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { HeroSection } from "@/components/hero-section";
import { SettingsPanel } from "@/components/settings-panel";
import { ImageGrid } from "@/components/image-grid";
import { ImageDetail } from "@/components/image-detail";
import { ComparisonGallery } from "@/components/comparison-gallery";
import { processImage, checkApiKey } from "./actions";
import { exportAsZip, exportAsCsv } from "@/lib/export";
import type { ImageItem, AppSettings } from "@/lib/types";

const SETTINGS_KEY = "image-processor-settings";

const DEFAULT_SETTINGS: AppSettings = {
  language: "en",
  prefix: "",
  suffix: "",
  separator: "-",
  copyright: "",
  creator: "",
  rightsUrl: "",
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
        copyright: parsed.copyright ?? DEFAULT_SETTINGS.copyright,
        creator: parsed.creator ?? DEFAULT_SETTINGS.creator,
        rightsUrl: parsed.rightsUrl ?? DEFAULT_SETTINGS.rightsUrl,
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
  const [processProgress, setProcessProgress] = useState({ current: 0, total: 0 });
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);

  const isPremiumUser = false;

  const imagesRef = useRef(images);
  imagesRef.current = images;

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    const loaded = loadSettings();
    setSettings(loaded);
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
    const CONCURRENCY = 3;
    setIsProcessing(true);
    const pending = imagesRef.current.filter((img) => img.status === "pending");
    setProcessProgress({ current: 0, total: pending.length });

    let completed = 0;
    let nextIndex = 0;

    const runNext = async (): Promise<void> => {
      while (nextIndex < pending.length) {
        const i = nextIndex++;
        await handleProcessSingle(pending[i].id);
        completed++;
        setProcessProgress({ current: completed, total: pending.length });
      }
    };

    const workers = Array.from({ length: Math.min(CONCURRENCY, pending.length) }, () => runNext());
    await Promise.all(workers);

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
      copyright: s.copyright,
      creator: s.creator,
      rightsUrl: s.rightsUrl,
      isPremiumUser,
    });

    setImages((prev) =>
      prev.map((img) =>
        img.status === "done" && img.analysis
          ? { ...img, exported: true }
          : img
      )
    );
  }, []);

  const handleExportCsv = useCallback(() => {
    const s = settingsRef.current;
    const processed = imagesRef.current.filter(
      (img) => img.status === "done" && img.analysis
    );
    if (processed.length === 0) return;

    exportAsCsv(processed, {
      prefix: s.prefix,
      suffix: s.suffix,
      separator: s.separator,
      copyright: s.copyright,
      creator: s.creator,
      rightsUrl: s.rightsUrl,
      isPremiumUser,
    });
  }, [isPremiumUser]);

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

  const handleSelectImage = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const selectedImage = images.find((img) => img.id === selectedId) || null;
  const processedCount = images.filter(
    (img) => img.status === "done" && img.analysis
  ).length;

  return (
    <main className="min-h-screen bg-deep">
      {/* Hero */}
      <HeroSection
        language={settings.language}
        onLanguageChange={(lang) => setSettings((s) => ({ ...s, language: lang }))}
      />

      {/* Tool section */}
      <section className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Compact settings bar */}
        <SettingsPanel
          settings={settings}
          onSettingsChange={setSettings}
          onProcessAll={handleProcessAll}
          onExportAll={handleExportAll}
          onExportCsv={handleExportCsv}
          onReset={handleReset}
          isProcessing={isProcessing}
          processProgress={processProgress}
          imageCount={images.length}
          processedCount={processedCount}
          apiKeyConfigured={apiKeyConfigured}
          isPremiumUser={isPremiumUser}
        />

        {/* Image grid */}
        <div className="mt-6">
          <ImageGrid
            images={images}
            selectedId={selectedId}
            onSelectImage={handleSelectImage}
            onRemoveImage={handleRemoveImage}
            onFilesSelected={handleFilesSelected}
            prefix={settings.prefix}
            suffix={settings.suffix}
            separator={settings.separator}
            language={settings.language}
          />
        </div>

        {/* Image detail — appears below grid when an image is selected */}
        {selectedImage && (
          <div className="mt-6">
            <ImageDetail
              image={selectedImage}
              prefix={settings.prefix}
              suffix={settings.suffix}
              separator={settings.separator}
              copyright={settings.copyright}
              creator={settings.creator}
              rightsUrl={settings.rightsUrl}
              onUpdateAnalysis={handleUpdateAnalysis}
              onProcess={handleProcessSingle}
              onExport={() => handleExportAll()}
              onClose={() => setSelectedId(null)}
              isProcessing={isProcessing}
              language={settings.language}
              isPremiumUser={isPremiumUser}
            />
          </div>
        )}
      </section>

      {/* Comparison gallery */}
      <ComparisonGallery language={settings.language} />
    </main>
  );
}
