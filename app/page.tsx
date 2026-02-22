"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { SettingsPanel } from "@/components/settings-panel";
import { ImageGrid } from "@/components/image-grid";
import { ImageDetail } from "@/components/image-detail";
import { scanSourceFolder, processImage, exportImage, checkApiKey } from "./actions";
import type { ImageItem, AppSettings } from "@/lib/types";

const SETTINGS_KEY = "image-processor-settings";

const DEFAULT_SETTINGS: AppSettings = {
  language: "en",
  sourcePath: "",
  destPath: "",
  prefix: "",
  suffix: "",
  separator: "-",
};

function loadSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore parse errors
  }
  return DEFAULT_SETTINGS;
}

export default function Home() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);

  // Use ref so callbacks always see current images without stale closures
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
    if (settings.language || settings.sourcePath || settings.destPath) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }
  }, [settings]);

  const handleScan = useCallback(async () => {
    const s = settingsRef.current;
    if (!s.sourcePath) return;
    setIsScanning(true);
    const result = await scanSourceFolder(s.sourcePath);
    setIsScanning(false);

    if (result.success && result.files) {
      setImages(
        result.files.map((fileName) => ({
          id: crypto.randomUUID(),
          originalFileName: fileName,
          sourcePath: `${s.sourcePath}/${fileName}`,
          status: "pending" as const,
          exported: false,
        }))
      );
      setSelectedId(null);
    } else {
      alert(result.error || "Failed to scan folder");
    }
  }, []);

  const handleProcessSingle = useCallback(
    async (imageId: string) => {
      const s = settingsRef.current;

      // Find image from ref to avoid stale closure
      const image = imagesRef.current.find((img) => img.id === imageId);
      if (!image) {
        console.error(`Image not found: ${imageId}`);
        return;
      }

      // Set to processing
      setImages((prev) =>
        prev.map((img) =>
          img.id === imageId ? { ...img, status: "processing" as const, error: undefined } : img
        )
      );

      const result = await processImage(
        s.sourcePath,
        image.originalFileName,
        s.language
      );

      setImages((prev) =>
        prev.map((img) =>
          img.id === imageId
            ? result.success
              ? { ...img, status: "done" as const, analysis: result.analysis }
              : { ...img, status: "error" as const, error: result.error || "Unknown error" }
            : img
        )
      );
    },
    []
  );

  const handleProcessAll = useCallback(async () => {
    setIsProcessing(true);

    // Get pending images from ref for fresh state
    const pending = imagesRef.current.filter((img) => img.status === "pending");

    for (const image of pending) {
      await handleProcessSingle(image.id);
    }

    setIsProcessing(false);
  }, [handleProcessSingle]);

  const handleExportSingle = useCallback(
    async (imageId: string) => {
      const s = settingsRef.current;
      if (!s.destPath) {
        alert("Please enter a destination folder");
        return;
      }

      const image = imagesRef.current.find((img) => img.id === imageId);
      if (!image || !image.analysis) return;

      const result = await exportImage({
        sourcePath: s.sourcePath,
        destPath: s.destPath,
        originalFileName: image.originalFileName,
        descriptiveName: image.analysis.descriptiveName,
        prefix: s.prefix,
        suffix: s.suffix,
        separator: s.separator,
        title: image.analysis.title,
        altText: image.analysis.altText,
        metaDescription: image.analysis.metaDescription,
        keywords: image.analysis.keywords,
        locationName: image.analysis.locationName,
        city: image.analysis.city,
        stateProvince: image.analysis.stateProvince,
        country: image.analysis.country,
      });

      if (result.success) {
        setImages((prev) =>
          prev.map((img) =>
            img.id === imageId
              ? { ...img, exported: true, finalFileName: result.finalFileName }
              : img
          )
        );
      } else {
        alert(result.error || "Export failed");
      }
    },
    []
  );

  const handleExportAll = useCallback(async () => {
    const processed = imagesRef.current.filter(
      (img) => img.status === "done" && !img.exported
    );
    for (const image of processed) {
      await handleExportSingle(image.id);
    }
  }, [handleExportSingle]);

  const handleUpdateAnalysis = useCallback(
    (
      imageId: string,
      field: "descriptiveName" | "title" | "altText" | "metaDescription" | "keywords" | "locationName" | "city" | "stateProvince" | "country",
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
    setImages((prev) => prev.filter((img) => img.id !== imageId));
    setSelectedId((prev) => (prev === imageId ? null : prev));
  }, []);

  const handleReset = useCallback(() => {
    setImages([]);
    setSelectedId(null);
  }, []);

  const handleFilesDropped = useCallback(
    (_files: File[]) => {
      alert(
        "Drag-and-drop noted. Please use the source folder scan to process images from disk."
      );
    },
    []
  );

  const selectedImage = images.find((img) => img.id === selectedId) || null;

  return (
    <div className="flex h-screen bg-snow">
      <SettingsPanel
        settings={settings}
        onSettingsChange={setSettings}
        onScan={handleScan}
        onProcessAll={handleProcessAll}
        onExportAll={handleExportAll}
        onReset={handleReset}
        isScanning={isScanning}
        isProcessing={isProcessing}
        imageCount={images.length}
        apiKeyConfigured={apiKeyConfigured}
      />

      <ImageGrid
        images={images}
        selectedId={selectedId}
        onSelectImage={setSelectedId}
        onRemoveImage={handleRemoveImage}
        onFilesDropped={handleFilesDropped}
        sourcePath={settings.sourcePath}
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
          onExport={handleExportSingle}
          onClose={() => setSelectedId(null)}
          isProcessing={isProcessing}
          language={settings.language}
        />
      )}
    </div>
  );
}
