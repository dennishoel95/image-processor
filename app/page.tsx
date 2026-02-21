"use client";

import { useState, useCallback, useEffect } from "react";
import { SettingsPanel } from "@/components/settings-panel";
import { ImageGrid } from "@/components/image-grid";
import { ImageDetail } from "@/components/image-detail";
import { scanSourceFolder, processImage, exportImage } from "./actions";
import type { ImageItem, AppSettings } from "@/lib/types";

const SETTINGS_KEY = "image-processor-settings";

const DEFAULT_SETTINGS: AppSettings = {
  apiKey: "",
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

  // Load settings from localStorage on mount
  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  // Persist settings to localStorage
  useEffect(() => {
    if (settings.apiKey || settings.sourcePath || settings.destPath) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }
  }, [settings]);

  const handleScan = useCallback(async () => {
    if (!settings.sourcePath) return;
    setIsScanning(true);
    const result = await scanSourceFolder(settings.sourcePath);
    setIsScanning(false);

    if (result.success && result.files) {
      setImages(
        result.files.map((fileName) => ({
          id: crypto.randomUUID(),
          originalFileName: fileName,
          sourcePath: `${settings.sourcePath}/${fileName}`,
          status: "pending" as const,
          exported: false,
        }))
      );
      setSelectedId(null);
    } else {
      alert(result.error || "Failed to scan folder");
    }
  }, [settings.sourcePath]);

  const handleProcessSingle = useCallback(
    async (imageId: string) => {
      if (!settings.apiKey) {
        alert("Please enter your Claude API key");
        return;
      }

      setImages((prev) =>
        prev.map((img) =>
          img.id === imageId ? { ...img, status: "processing" as const } : img
        )
      );

      const image = images.find((img) => img.id === imageId);
      if (!image) return;

      const result = await processImage(
        settings.apiKey,
        settings.sourcePath,
        image.originalFileName
      );

      setImages((prev) =>
        prev.map((img) =>
          img.id === imageId
            ? result.success
              ? { ...img, status: "done" as const, analysis: result.analysis }
              : { ...img, status: "error" as const, error: result.error }
            : img
        )
      );
    },
    [settings.apiKey, settings.sourcePath, images]
  );

  const handleProcessAll = useCallback(async () => {
    if (!settings.apiKey) {
      alert("Please enter your Claude API key");
      return;
    }

    setIsProcessing(true);
    const pending = images.filter((img) => img.status === "pending");

    for (const image of pending) {
      await handleProcessSingle(image.id);
    }

    setIsProcessing(false);
  }, [settings.apiKey, images, handleProcessSingle]);

  const handleExportSingle = useCallback(
    async (imageId: string) => {
      if (!settings.destPath) {
        alert("Please enter a destination folder");
        return;
      }

      const image = images.find((img) => img.id === imageId);
      if (!image || !image.analysis) return;

      const result = await exportImage({
        sourcePath: settings.sourcePath,
        destPath: settings.destPath,
        originalFileName: image.originalFileName,
        descriptiveName: image.analysis.descriptiveName,
        prefix: settings.prefix,
        suffix: settings.suffix,
        separator: settings.separator,
        altText: image.analysis.altText,
        metaDescription: image.analysis.metaDescription,
        keywords: image.analysis.keywords,
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
    [settings, images]
  );

  const handleExportAll = useCallback(async () => {
    const processed = images.filter(
      (img) => img.status === "done" && !img.exported
    );
    for (const image of processed) {
      await handleExportSingle(image.id);
    }
  }, [images, handleExportSingle]);

  const handleUpdateAnalysis = useCallback(
    (
      imageId: string,
      field: "descriptiveName" | "altText" | "metaDescription" | "keywords",
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
    <div className="flex h-screen bg-white">
      <SettingsPanel
        settings={settings}
        onSettingsChange={setSettings}
        onScan={handleScan}
        onProcessAll={handleProcessAll}
        onExportAll={handleExportAll}
        isScanning={isScanning}
        isProcessing={isProcessing}
        imageCount={images.length}
      />

      <ImageGrid
        images={images}
        selectedId={selectedId}
        onSelectImage={setSelectedId}
        onFilesDropped={handleFilesDropped}
        sourcePath={settings.sourcePath}
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
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
}
