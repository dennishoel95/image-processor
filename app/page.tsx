"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { UserButton } from "@clerk/nextjs";
import { HeroSection } from "@/components/hero-section";
import { SettingsPanel } from "@/components/settings-panel";
import { ImageGrid } from "@/components/image-grid";
import { ImageDetail } from "@/components/image-detail";
import { processImage, checkApiKey, getCredits } from "./actions";
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
  const [credits, setCredits] = useState<number | null>(null);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);
  const [toolOpen, setToolOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<"grid" | "settings" | "details">("grid");

  const imagesRef = useRef(images);
  imagesRef.current = images;

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    const loaded = loadSettings();
    setSettings(loaded);
    checkApiKey().then((result) => setApiKeyConfigured(result.configured));
    getCredits().then((c) => setCredits(c));

    // Returning users skip the hero — open tool directly
    const isReturningUser = localStorage.getItem(SETTINGS_KEY) !== null;
    if (isReturningUser) {
      setToolOpen(true);
    }
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

        if (result.success) {
          // Refresh credits after successful processing
          getCredits().then((c) => setCredits(c));
        }

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
    });
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

  const handleSelectImage = useCallback((id: string) => {
    setSelectedId(id);
    setMobileTab("details");
  }, []);

  const selectedImage = images.find((img) => img.id === selectedId) || null;
  const processedCount = images.filter(
    (img) => img.status === "done" && img.analysis
  ).length;

  return (
    <main className="h-screen overflow-hidden">
      {/* Hero — always visible behind overlay */}
      <HeroSection
        onScrollToTool={() => setToolOpen(true)}
        language={settings.language}
        onLanguageChange={(lang) => setSettings((s) => ({ ...s, language: lang }))}
      />

      {/* Tool overlay */}
      {toolOpen && (
        <div className="fixed inset-0 z-50 flex flex-col">
          {/* Backdrop */}
          <div
            className="overlay-backdrop absolute inset-0 bg-deep/95 backdrop-blur-sm"
            onClick={() => setToolOpen(false)}
          />

          {/* Panel */}
          <div className="overlay-panel relative z-10 flex flex-col m-1 mt-2 mb-0 md:m-4 md:mt-6 md:mb-4 rounded-t-xl md:rounded-xl border border-elevated bg-surface overflow-hidden shadow-2xl shadow-black/40 flex-1">
            {/* Header bar */}
            <div className="flex items-center justify-between px-3 py-2 md:px-5 md:py-3 border-b border-elevated bg-surface/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 md:gap-3">
                <h2 className="font-display font-light text-cream text-base md:text-lg">
                  Image Processor
                </h2>
                <span className="hidden sm:inline text-[10px] text-dim tracking-wider uppercase font-medium px-2 py-0.5 rounded-full border border-raised">
                  AI Vision
                </span>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                {/* Credits display */}
                {credits !== null && (
                  <a
                    href="/credits"
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-raised bg-elevated text-xs text-cream hover:border-warm-dim/40 transition-all"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v12M6 12h12" />
                    </svg>
                    <span className="font-medium">{credits}</span>
                    <span className="hidden sm:inline text-dim">credits</span>
                  </a>
                )}
                <button
                  onClick={() => setToolOpen(false)}
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md text-xs text-dim hover:text-cream hover:bg-elevated transition-all"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                  <span>About</span>
                </button>
                <button
                  onClick={() => setToolOpen(false)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs text-dim hover:text-cream hover:bg-elevated transition-all"
                >
                  <span>Close</span>
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M1 1l12 12M13 1L1 13" />
                  </svg>
                </button>
                {/* User menu */}
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-7 h-7",
                    },
                  }}
                />
              </div>
            </div>

            {/* Tool body — desktop: side-by-side, mobile: tab-switched */}
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
              {/* Desktop: always show settings panel. Mobile: show only when tab active */}
              <div className={`${mobileTab === "settings" ? "flex" : "hidden"} md:flex flex-col w-full md:w-auto`}>
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
                  credits={credits}
                />
              </div>

              {/* Desktop: always show grid. Mobile: show only when tab active */}
              <div className={`${mobileTab === "grid" ? "flex" : "hidden"} md:flex flex-col flex-1 min-w-0`}>
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

              {/* Desktop: show when selected. Mobile: show only when tab active + selected */}
              {selectedImage && (
                <div className={`${mobileTab === "details" ? "flex" : "hidden"} md:flex flex-col w-full md:w-auto`}>
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
                    onClose={() => { setSelectedId(null); setMobileTab("grid"); }}
                    isProcessing={isProcessing}
                    language={settings.language}
                  />
                </div>
              )}

              {/* Mobile: no image selected on details tab */}
              {!selectedImage && mobileTab === "details" && (
                <div className="flex md:hidden flex-1 items-center justify-center text-dim text-sm">
                  Select an image to view details
                </div>
              )}
            </div>

            {/* Mobile tab bar */}
            <div className="flex md:hidden border-t border-elevated bg-surface/90 backdrop-blur-sm">
              <button
                onClick={() => setMobileTab("settings")}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium tracking-wider uppercase transition-all ${
                  mobileTab === "settings" ? "text-warm-dim" : "text-dim"
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Settings
              </button>
              <button
                onClick={() => setMobileTab("grid")}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium tracking-wider uppercase transition-all ${
                  mobileTab === "grid" ? "text-warm-dim" : "text-dim"
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
                Images
              </button>
              <button
                onClick={() => setMobileTab("details")}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium tracking-wider uppercase transition-all ${
                  mobileTab === "details" ? "text-warm-dim" : "text-dim"
                } ${selectedImage ? "" : "opacity-40"}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                Details
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
