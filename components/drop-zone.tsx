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
