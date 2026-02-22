"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
      // Migrate: remove old fields that no longer exist
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

export default function Home() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);

  const imagesRef = useRef(images);
  imagesRef.current = images;

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  // Load settings from localStorage and check API key on mount
  useEffect(() => {
    setSettings(loadSettings());
    checkApiKey().then((result) => setApiKeyConfigured(result.configured));
  }, []);

  // Persist settings to localStorage
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  // Clean up blob URLs when component unmounts
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.thumbnailUrl) URL.revokeObjectURL(img.thumbnailUrl);
      });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilesSelected = useCallback((files: File[]) => {
    const promises = files.map(
      (file) =>
        new Promise<ImageItem>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              id: crypto.randomUUID(),
              originalFileName: file.name,
              fileData: reader.result as string,
              thumbnailUrl: URL.createObjectURL(file),
              mediaType: getMediaType(file),
              status: "pending",
              exported: false,
            });
          };
          reader.readAsDataURL(file);
        })
    );

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

    // Mark all as exported
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
    images.forEach((img) => {
      if (img.thumbnailUrl) URL.revokeObjectURL(img.thumbnailUrl);
    });
    setImages([]);
    setSelectedId(null);
  }, [images]);

  const selectedImage = images.find((img) => img.id === selectedId) || null;
  const processedCount = images.filter(
    (img) => img.status === "done" && img.analysis
  ).length;

  return (
    <div className="flex h-screen bg-snow">
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
  );
}
