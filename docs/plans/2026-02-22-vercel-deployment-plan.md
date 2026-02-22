# Vercel Deployment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert image processor from local file-system app to browser-based app deployable on Vercel.

**Architecture:** Browser-only, stateless. Users upload files via file picker, images held in React state as base64/blob, server action calls Claude API, browser generates ZIP export via JSZip. No database, no cloud storage, no auth.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Anthropic SDK, JSZip (new)

---

### Task 1: Install JSZip and update types

**Files:**
- Modify: `package.json`
- Modify: `lib/types.ts:1-33`

**Step 1: Install JSZip**

Run: `cd "/Users/dennishoel/Documents/Claude Dennis/Company directory/Development company/image-processor" && npm install jszip`
Expected: jszip added to dependencies in package.json

**Step 2: Update ImageItem type to hold browser file data instead of file path**

Replace `lib/types.ts` with:

```typescript
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
```

Key changes:
- `sourcePath` → `fileData` (base64 string) + `thumbnailUrl` (blob URL) + `mediaType`
- `AppSettings` removes `sourcePath` and `destPath` (no longer needed)

**Step 3: Verify build compiles (will have errors — that's expected, we fix them in subsequent tasks)**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: Type errors in files that reference old fields (we fix these next)

**Step 4: Commit**

```bash
git add package.json package-lock.json lib/types.ts
git commit -m "feat: install jszip and update types for browser-based architecture"
```

---

### Task 2: Create client-side export module

**Files:**
- Create: `lib/export.ts`

**Step 1: Create the export module**

Create `lib/export.ts`:

```typescript
import JSZip from "jszip";
import type { ImageItem } from "./types";
import { buildFileName } from "./naming";

function generateMetadataMarkdown(
  fileName: string,
  analysis: NonNullable<ImageItem["analysis"]>
): string {
  const dateCreated = new Date().toISOString().split("T")[0];

  const locationParts = [
    analysis.locationName,
    analysis.city,
    analysis.stateProvince,
    analysis.country,
  ].filter(Boolean);
  const locationString = locationParts.join(", ") || "—";

  return `# ${fileName}

## Title
${analysis.title || "—"}

## Alt Text
${analysis.altText || "—"}

## Description
${analysis.metaDescription || "—"}

## Keywords
${analysis.keywords.length > 0 ? analysis.keywords.join(", ") : "—"}

## Copyright
<!-- Fill in: e.g. © ${new Date().getFullYear()} Your Company. All rights reserved. -->

## Creator
<!-- Fill in: e.g. Photography: Name | Edit: Design Team -->

## Date Created
${dateCreated}

## Web Statement of Rights
<!-- Fill in: e.g. https://example.com/image-licensing-terms -->

## Location
${locationString}

### Location Details
- **Location Name:** ${analysis.locationName || "—"}
- **City:** ${analysis.city || "—"}
- **State/Province:** ${analysis.stateProvince || "—"}
- **Country:** ${analysis.country || "—"}
`;
}

function base64DataUrlToBytes(dataUrl: string): Uint8Array {
  // Strip "data:image/png;base64," prefix
  const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function exportAsZip(
  images: ImageItem[],
  settings: { prefix: string; suffix: string; separator: string }
): Promise<void> {
  const zip = new JSZip();

  const usedNames = new Set<string>();

  for (const image of images) {
    if (!image.analysis) continue;

    const ext = "." + image.originalFileName.split(".").pop()?.toLowerCase();
    let fileName = buildFileName({
      prefix: settings.prefix,
      aiName: image.analysis.descriptiveName,
      suffix: settings.suffix,
      separator: settings.separator,
      originalExtension: ext,
    });

    // Handle duplicate names
    const baseWithoutExt = fileName.slice(0, fileName.lastIndexOf("."));
    const extOnly = fileName.slice(fileName.lastIndexOf("."));
    let uniqueName = fileName;
    let counter = 2;
    while (usedNames.has(uniqueName)) {
      uniqueName = `${baseWithoutExt}-${counter}${extOnly}`;
      counter++;
    }
    usedNames.add(uniqueName);

    // Add image file
    const imageBytes = base64DataUrlToBytes(image.fileData);
    zip.file(uniqueName, imageBytes);

    // Add metadata .md file
    const mdBaseName = uniqueName.slice(0, uniqueName.lastIndexOf("."));
    const mdContent = generateMetadataMarkdown(uniqueName, image.analysis);
    zip.file(`${mdBaseName}.md`, mdContent);
  }

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `image-export-${new Date().toISOString().split("T")[0]}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
```

**Step 2: Commit**

```bash
git add lib/export.ts
git commit -m "feat: add client-side ZIP export module"
```

---

### Task 3: Update naming.ts to remove Node.js path dependency

**Files:**
- Modify: `lib/naming.ts:1-37`

**Step 1: Replace naming.ts**

Remove the `import path from "path"` and `getExtension` function that uses `path.extname`. Replace with:

```typescript
export function buildFileName(params: {
  prefix: string;
  aiName: string;
  suffix: string;
  separator: string;
  originalExtension: string;
}): string {
  const { prefix, aiName, suffix, separator, originalExtension } = params;

  const parts: string[] = [];
  if (prefix.trim()) parts.push(prefix.trim());
  parts.push(aiName.trim());
  if (suffix.trim()) parts.push(suffix.trim());

  const baseName = parts.join(separator);
  const ext = originalExtension.startsWith(".")
    ? originalExtension
    : `.${originalExtension}`;

  return `${baseName}${ext.toLowerCase()}`;
}

export function sanitizeForFilename(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
```

Note: `getExtension` is removed — it's not used anywhere except via the now-deleted filesystem module.

**Step 2: Commit**

```bash
git add lib/naming.ts
git commit -m "refactor: remove Node.js path dependency from naming module"
```

---

### Task 4: Simplify server action to receive base64 directly

**Files:**
- Modify: `app/actions.ts:1-106`

**Step 1: Replace actions.ts**

The server only does two things now: check API key and process an image. No scanning, no exporting.

```typescript
"use server";

import { analyzeImage, type ImageAnalysis } from "@/lib/claude";
import type { Language } from "@/lib/i18n";

export async function checkApiKey(): Promise<{ configured: boolean }> {
  return { configured: !!process.env.ANTHROPIC_API_KEY };
}

export async function processImage(
  base64Data: string,
  mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp",
  language: Language
): Promise<{ success: boolean; analysis?: ImageAnalysis; error?: string }> {
  try {
    // Strip data URL prefix if present (e.g. "data:image/png;base64,")
    const rawBase64 = base64Data.includes(",")
      ? base64Data.split(",")[1]
      : base64Data;

    console.log(
      `[processImage] Processing image (${mediaType}, ${Math.round(rawBase64.length / 1024)}KB base64, lang: ${language})`
    );

    const analysis = await analyzeImage(rawBase64, mediaType, language);
    console.log(
      `[processImage] Success -> ${analysis.descriptiveName}`
    );
    return { success: true, analysis };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[processImage] Error:`, message);
    return { success: false, error: message };
  }
}
```

Key changes:
- Removed `scanSourceFolder` and `exportImage` (no longer needed)
- Removed all `fs`/`path` imports
- `processImage` now receives `base64Data` and `mediaType` directly from browser
- Strips data URL prefix before sending to Claude

**Step 2: Commit**

```bash
git add app/actions.ts
git commit -m "refactor: simplify server actions for browser-based architecture"
```

---

### Task 5: Delete file-system dependent files

**Files:**
- Delete: `lib/filesystem.ts`
- Delete: `app/api/browse/route.ts`
- Delete: `app/api/thumbnail/route.ts`
- Delete: `components/folder-browser.tsx`

**Step 1: Delete the files**

```bash
rm lib/filesystem.ts
rm -r app/api/browse
rm -r app/api/thumbnail
rm components/folder-browser.tsx
```

**Step 2: Commit**

```bash
git add -A
git commit -m "chore: remove file-system dependent modules"
```

---

### Task 6: Update DropZone to be functional with file input

**Files:**
- Modify: `components/drop-zone.tsx:1-75`

**Step 1: Replace drop-zone.tsx**

Make the drop zone functional: accepts drag-and-drop AND click-to-browse. Enforces 10-file limit and 20MB max per file. Filters to image types only.

```typescript
"use client";

import { useCallback, useRef, useState } from "react";
import { t, type Language } from "@/lib/i18n";

const MAX_FILES = 10;
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif"];

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  currentCount: number;
  language: Language;
}

export function DropZone({ onFilesSelected, currentCount, language }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndEmit = useCallback(
    (files: File[]) => {
      const remaining = MAX_FILES - currentCount;
      if (remaining <= 0) {
        alert(t("maxFilesReached", language));
        return;
      }

      const valid = files
        .filter((f) => ACCEPTED_TYPES.includes(f.type))
        .filter((f) => f.size <= MAX_FILE_SIZE)
        .slice(0, remaining);

      if (valid.length === 0) return;
      onFilesSelected(valid);
    },
    [onFilesSelected, currentCount, language]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      validateAndEmit(files);
    },
    [validateAndEmit]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      validateAndEmit(files);
      // Reset input so same files can be re-selected
      e.target.value = "";
    },
    [validateAndEmit]
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
        isDragOver
          ? "border-slate bg-platinum"
          : "border-pale bg-snow hover:border-muted"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="text-slate">
        <svg
          className="mx-auto h-12 w-12 text-muted"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="mt-2 text-sm font-medium">
          {t("dropImages", language)}
        </p>
        <p className="mt-1 text-xs text-muted">
          {t("dropSubBrowser", language)}
        </p>
        <p className="mt-1 text-xs text-muted">
          {currentCount}/{MAX_FILES} {t("imagesLoaded", language)}
        </p>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add components/drop-zone.tsx
git commit -m "feat: make drop zone functional with file picker and validation"
```

---

### Task 7: Update ImageGrid to use blob URLs instead of thumbnail API

**Files:**
- Modify: `components/image-grid.tsx:1-61`

**Step 1: Replace image-grid.tsx**

Remove `sourcePath` prop, pass `thumbnailUrl` from ImageItem instead of constructing API URL.

```typescript
"use client";

import { ImageItem } from "@/lib/types";
import { ImageCard } from "./image-card";
import { DropZone } from "./drop-zone";
import { t, type Language } from "@/lib/i18n";

interface ImageGridProps {
  images: ImageItem[];
  selectedId: string | null;
  onSelectImage: (id: string) => void;
  onRemoveImage: (id: string) => void;
  onFilesSelected: (files: File[]) => void;
  language: Language;
}

export function ImageGrid({
  images,
  selectedId,
  onSelectImage,
  onRemoveImage,
  onFilesSelected,
  language,
}: ImageGridProps) {
  return (
    <div className="flex-1 p-4 overflow-y-auto">
      <DropZone
        onFilesSelected={onFilesSelected}
        currentCount={images.length}
        language={language}
      />

      {images.length === 0 ? (
        <div className="mt-8 text-center text-muted">
          <p>{t("noImages", language)}</p>
          <p className="text-sm mt-1">
            {t("noImagesSub", language)}
          </p>
        </div>
      ) : (
        <>
          <p className="mt-4 mb-3 text-sm text-slate">
            {images.length} {images.length !== 1 ? t("imagesFound", language) : t("imageFound", language)}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {images.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                isSelected={image.id === selectedId}
                onClick={() => onSelectImage(image.id)}
                onRemove={onRemoveImage}
                thumbnailUrl={image.thumbnailUrl}
                language={language}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
```

Key changes:
- `onFilesDropped` → `onFilesSelected` (renamed for clarity)
- Removed `sourcePath` prop
- `thumbnailUrl` now comes from `image.thumbnailUrl` (blob URL) instead of API route

**Step 2: Commit**

```bash
git add components/image-grid.tsx
git commit -m "refactor: use blob URLs for thumbnails instead of API route"
```

---

### Task 8: Update ImageDetail to use blob URL for preview

**Files:**
- Modify: `components/image-detail.tsx:77-84`

**Step 1: Change the image src**

In `image-detail.tsx`, replace the thumbnail API URL with `image.thumbnailUrl`:

Change line 80 from:
```
src={`/api/thumbnail?path=${encodeURIComponent(image.sourcePath)}`}
```
to:
```
src={image.thumbnailUrl}
```

No other changes needed — the rest of the component stays the same.

**Step 2: Commit**

```bash
git add components/image-detail.tsx
git commit -m "refactor: use blob URL for image detail preview"
```

---

### Task 9: Update SettingsPanel — remove folder inputs, simplify steps

**Files:**
- Modify: `components/settings-panel.tsx:1-241`

**Step 1: Replace settings-panel.tsx**

Remove source/dest folder inputs, folder browser import, and simplify action steps to 2 steps (Process + Export). Remove Step 1 (Scan) since upload is handled by the drop zone.

```typescript
"use client";

import { AppSettings } from "@/lib/types";
import { LANGUAGES, t, type Language } from "@/lib/i18n";

interface SettingsPanelProps {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  onProcessAll: () => void;
  onExportAll: () => void;
  onReset: () => void;
  isProcessing: boolean;
  imageCount: number;
  processedCount: number;
  apiKeyConfigured: boolean;
}

export function SettingsPanel({
  settings,
  onSettingsChange,
  onProcessAll,
  onExportAll,
  onReset,
  isProcessing,
  imageCount,
  processedCount,
  apiKeyConfigured,
}: SettingsPanelProps) {
  const lang = settings.language;

  const update = (field: keyof AppSettings, value: string) => {
    onSettingsChange({ ...settings, [field]: value });
  };

  return (
    <div className="w-80 border-r border-alabaster bg-platinum p-4 flex flex-col gap-4 overflow-y-auto">
      <h2 className="text-lg font-semibold text-carbon">{t("settings", lang)}</h2>

      {/* Language selector */}
      <div>
        <label className="block text-sm font-medium text-iron mb-2">
          {t("language", lang)}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => onSettingsChange({ ...settings, language: l.code as Language })}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                settings.language === l.code
                  ? "bg-pale text-carbon border-muted hover:bg-muted/40 hover:shadow-sm"
                  : "bg-snow text-iron border-pale hover:bg-alabaster hover:shadow-sm"
              }`}
            >
              <span>{l.flag}</span>
              <span>{l.name}</span>
            </button>
          ))}
        </div>
      </div>

      {!apiKeyConfigured && (
        <>
          <hr className="border-alabaster" />
          <div className="rounded-md px-3 py-2 text-sm bg-snow text-iron border border-pale">
            {t("apiError", lang)}
          </div>
        </>
      )}

      <hr className="border-alabaster" />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-iron mb-1">
            {t("prefix", lang)}
          </label>
          <input
            type="text"
            value={settings.prefix}
            onChange={(e) => update("prefix", e.target.value)}
            placeholder="e.g. blog"
            className="w-full rounded-md border border-pale bg-snow px-3 py-2 text-sm text-carbon focus:border-slate focus:outline-none focus:ring-1 focus:ring-slate"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-iron mb-1">
            {t("suffix", lang)}
          </label>
          <input
            type="text"
            value={settings.suffix}
            onChange={(e) => update("suffix", e.target.value)}
            placeholder="e.g. hero"
            className="w-full rounded-md border border-pale bg-snow px-3 py-2 text-sm text-carbon focus:border-slate focus:outline-none focus:ring-1 focus:ring-slate"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-iron mb-1">
          {t("separator", lang)}
        </label>
        <input
          type="text"
          value={settings.separator}
          onChange={(e) => update("separator", e.target.value)}
          maxLength={3}
          className="w-20 rounded-md border border-pale bg-snow px-3 py-2 text-sm text-carbon text-center focus:border-slate focus:outline-none focus:ring-1 focus:ring-slate"
        />
      </div>

      <hr className="border-alabaster" />

      {/* Action steps */}
      <div className="rounded-lg border border-pale overflow-hidden">
        {/* Step 1: Process */}
        <button
          onClick={onProcessAll}
          disabled={isProcessing || !apiKeyConfigured || imageCount === 0}
          className="w-full flex items-center gap-3 px-3 py-2.5 bg-snow text-left hover:bg-alabaster hover:shadow-md disabled:opacity-40 disabled:hover:bg-snow disabled:hover:shadow-none disabled:cursor-not-allowed transition-all"
        >
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-iron text-snow text-xs font-semibold flex items-center justify-center">
            1
          </span>
          <span className="text-sm font-medium text-carbon">
            {isProcessing ? t("processing", lang) : imageCount > 0 ? `${t("processAll", lang)} (${imageCount})` : t("processAll", lang)}
          </span>
        </button>

        {/* Divider */}
        <div className="border-t border-pale" />

        {/* Step 2: Export */}
        <button
          onClick={onExportAll}
          disabled={isProcessing || processedCount === 0}
          className="w-full flex items-center gap-3 px-3 py-2.5 bg-snow text-left hover:bg-alabaster hover:shadow-md disabled:opacity-40 disabled:hover:bg-snow disabled:hover:shadow-none disabled:cursor-not-allowed transition-all"
        >
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-iron text-snow text-xs font-semibold flex items-center justify-center">
            2
          </span>
          <span className="text-sm font-medium text-carbon">
            {processedCount > 0 ? `${t("exportAllProcessed", lang)} (${processedCount})` : t("exportAllProcessed", lang)}
          </span>
        </button>
      </div>

      {imageCount > 0 && (
        <button
          onClick={onReset}
          disabled={isProcessing}
          className="w-full rounded-md px-4 py-2 text-sm font-medium text-slate bg-snow border border-pale hover:bg-alabaster hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {t("reset", lang)}
        </button>
      )}
    </div>
  );
}
```

Key changes:
- Removed `onScan`, `isScanning` props
- Removed `sourcePath`/`destPath` inputs and browse buttons
- Removed `FolderBrowser` import
- Added `processedCount` prop to enable/disable export button correctly
- Steps reduced from 3 to 2 (Scan removed — upload is via drop zone)
- Export disabled based on `processedCount` instead of `destPath`

**Step 2: Commit**

```bash
git add components/settings-panel.tsx
git commit -m "refactor: simplify settings panel for browser-based workflow"
```

---

### Task 10: Rewrite main page for browser-based workflow

**Files:**
- Modify: `app/page.tsx:1-265`

**Step 1: Replace page.tsx**

This is the central integration point. Replace folder scanning with file reading, replace server-side export with client-side ZIP export.

```typescript
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

  // Clean up blob URLs when images are removed
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.thumbnailUrl) URL.revokeObjectURL(img.thumbnailUrl);
      });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilesSelected = useCallback((files: File[]) => {
    const newImages: ImageItem[] = [];

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
```

Key changes:
- `handleFilesSelected` reads files as base64 and creates blob URLs
- `handleProcessSingle` sends base64 + mediaType to server action
- `handleExportAll` calls client-side `exportAsZip` instead of server-side export
- `handleRemoveImage` and `handleReset` revoke blob URLs to prevent memory leaks
- Removed `handleScan`, `handleExportSingle`, `isScanning`
- `processedCount` computed and passed to SettingsPanel
- Removed `sourcePath` prop from ImageGrid

**Step 2: Commit**

```bash
git add app/page.tsx
git commit -m "feat: rewrite main page for browser-based upload/process/export"
```

---

### Task 11: Add new i18n translation keys

**Files:**
- Modify: `lib/i18n.ts`

**Step 1: Add new translation keys to all 5 languages**

Add these keys to each language in the translations object:

**English (en):**
```
maxFilesReached: "Maximum 10 images reached. Remove some to add more.",
dropSubBrowser: "Click to browse or drag and drop images",
imagesLoaded: "images loaded",
```

**Norwegian (no):**
```
maxFilesReached: "Maksimalt 10 bilder nådd. Fjern noen for å legge til flere.",
dropSubBrowser: "Klikk for å bla eller dra og slipp bilder",
imagesLoaded: "bilder lastet inn",
```

**German (de):**
```
maxFilesReached: "Maximal 10 Bilder erreicht. Entfernen Sie einige, um weitere hinzuzufügen.",
dropSubBrowser: "Klicken Sie zum Durchsuchen oder ziehen Sie Bilder hierher",
imagesLoaded: "Bilder geladen",
```

**Spanish (es):**
```
maxFilesReached: "Se alcanzó el máximo de 10 imágenes. Elimine algunas para agregar más.",
dropSubBrowser: "Haga clic para explorar o arrastre y suelte imágenes",
imagesLoaded: "imágenes cargadas",
```

**Korean (ko):**
```
maxFilesReached: "최대 10개 이미지에 도달했습니다. 더 추가하려면 일부를 제거하세요.",
dropSubBrowser: "클릭하여 찾아보거나 이미지를 드래그 앤 드롭하세요",
imagesLoaded: "개 이미지 로드됨",
```

Also update `noImagesSub` for all languages since the old text references "scan a source folder":

**English:** `"Upload images using the drop zone above."`
**Norwegian:** `"Last opp bilder med slippfeltet ovenfor."`
**German:** `"Laden Sie Bilder über den Ablagebereich oben hoch."`
**Spanish:** `"Suba imágenes usando la zona de carga de arriba."`
**Korean:** `"위의 업로드 영역을 사용하여 이미지를 올려주세요."`

**Step 2: Commit**

```bash
git add lib/i18n.ts
git commit -m "feat: add browser upload translations for all 5 languages"
```

---

### Task 12: Build, verify, and final commit

**Step 1: Run the build**

```bash
cd "/Users/dennishoel/Documents/Claude Dennis/Company directory/Development company/image-processor" && npm run build
```

Expected: Build succeeds with no errors.

**Step 2: Fix any build errors**

If there are TypeScript errors, fix them. Common issues:
- Old references to `sourcePath` in components
- Missing props on updated components
- Import paths for deleted modules

**Step 3: Start dev server and verify**

```bash
npm run dev
```

Manual verification checklist:
- [ ] App loads at localhost:3000
- [ ] Drop zone is clickable and opens file picker
- [ ] Drag and drop works
- [ ] 10-file limit enforced
- [ ] Settings panel shows language selector, prefix/suffix/separator, 2 action steps
- [ ] No folder input fields visible
- [ ] Process All sends images to Claude and returns metadata
- [ ] Metadata is editable in detail panel
- [ ] Export All downloads a ZIP file
- [ ] ZIP contains renamed images + .md metadata files

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete browser-based architecture for Vercel deployment"
```

---

## Post-Implementation: Vercel Deployment Steps (Manual)

After all code changes are complete and tested locally:

1. Go to https://vercel.com and sign in with GitHub
2. Click "Add New Project"
3. Import `dennishoel95/image-processor` repository
4. Framework will auto-detect as Next.js
5. Add environment variable: `ANTHROPIC_API_KEY` = your API key
6. Click "Deploy"
7. Vercel will build and provide a URL (e.g. `image-processor.vercel.app`)
8. Test the deployed version with the same checklist above
