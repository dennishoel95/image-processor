"use client";

import { ImageItem } from "@/lib/types";
import { t, type Language } from "@/lib/i18n";

interface ImageDetailProps {
  image: ImageItem;
  prefix: string;
  suffix: string;
  separator: string;
  copyright: string;
  creator: string;
  rightsUrl: string;
  onUpdateAnalysis: (
    imageId: string,
    field: "descriptiveName" | "title" | "altText" | "metaDescription" | "keywords" | "locationName" | "city" | "stateProvince" | "country",
    value: string | string[]
  ) => void;
  onProcess: (imageId: string) => void;
  onExport: (imageId: string) => void;
  onClose: () => void;
  isProcessing: boolean;
  language: Language;
}

function buildPreviewName(
  prefix: string,
  aiName: string,
  suffix: string,
  separator: string,
  ext: string
): string {
  const parts: string[] = [];
  if (prefix.trim()) parts.push(prefix.trim());
  parts.push(aiName.trim());
  if (suffix.trim()) parts.push(suffix.trim());
  const baseName = parts.join(separator);
  const extension = ext.startsWith(".") ? ext : `.${ext}`;
  return `${baseName}${extension.toLowerCase()}`;
}

function CharCount({ value, max, warn }: { value: string; max: number; warn: number }) {
  const len = value.length;
  const color = len > max ? "text-red-400" : len > warn ? "text-yellow-400" : "text-dim";
  return (
    <span className={`text-[10px] tabular-nums ${color}`}>
      {len}/{max}
    </span>
  );
}

export function ImageDetail({
  image,
  prefix,
  suffix,
  separator,
  copyright,
  creator,
  rightsUrl,
  onUpdateAnalysis,
  onProcess,
  onExport,
  onClose,
  isProcessing,
  language,
}: ImageDetailProps) {
  const analysis = image.analysis;
  const ext = image.originalFileName.split(".").pop() || "jpg";

  const previewName = analysis
    ? buildPreviewName(prefix, analysis.descriptiveName, suffix, separator, ext)
    : null;

  const inputClass =
    "w-full rounded-md border border-raised bg-surface px-3 py-2 text-sm text-cream placeholder:text-dim focus:border-warm-dim focus:outline-none focus:ring-1 focus:ring-warm-dim";
  const labelClass = "block text-xs font-medium text-dim mb-1";

  return (
    <div className="w-96 border-l border-elevated bg-surface p-4 overflow-y-auto flex flex-col gap-4 dark-scroll">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-fog tracking-[0.15em] uppercase">
          {t("imageDetails", language)}
        </h2>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-md text-dim hover:bg-elevated hover:text-cream transition-all"
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M1 1l12 12M13 1L1 13" />
          </svg>
        </button>
      </div>

      {/* Preview */}
      <div className="aspect-video bg-elevated rounded-lg overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.thumbnailUrl}
          alt={analysis?.altText || image.originalFileName}
          className="w-full h-full object-contain"
        />
      </div>

      <div>
        <p className="text-xs text-dim">{t("original", language)}: {image.originalFileName}</p>
        {previewName && (
          <p className="text-sm font-medium text-cream mt-1">
            {t("new", language)}: {previewName}
          </p>
        )}
      </div>

      {image.status === "error" && (
        <div className="rounded-md bg-elevated p-3 text-sm text-fog border border-raised">
          {image.error}
        </div>
      )}

      {!analysis && image.status !== "processing" && (
        <button
          onClick={() => onProcess(image.id)}
          disabled={isProcessing}
          className="w-full rounded-md bg-warm-dim px-4 py-2 text-sm font-medium text-deep hover:bg-warm disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          {t("analyzeAi", language)}
        </button>
      )}

      {image.status === "processing" && (
        <div className="text-center text-sm text-fog py-2">
          {t("analyzing", language)}
        </div>
      )}

      {analysis && (
        <>
          {/* Descriptive Name */}
          <div>
            <label className={labelClass}>{t("descriptiveName", language)}</label>
            <input
              type="text"
              value={analysis.descriptiveName}
              onChange={(e) => onUpdateAnalysis(image.id, "descriptiveName", e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-dim">{t("title", language)}</label>
              <CharCount value={analysis.title} max={100} warn={90} />
            </div>
            <input
              type="text"
              value={analysis.title}
              onChange={(e) => onUpdateAnalysis(image.id, "title", e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Alt Text */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-dim">{t("altText", language)}</label>
              <CharCount value={analysis.altText} max={125} warn={110} />
            </div>
            <textarea
              value={analysis.altText}
              onChange={(e) => onUpdateAnalysis(image.id, "altText", e.target.value)}
              rows={2}
              className={inputClass}
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-dim">{t("description", language)}</label>
              <CharCount value={analysis.metaDescription} max={160} warn={145} />
            </div>
            <textarea
              value={analysis.metaDescription}
              onChange={(e) => onUpdateAnalysis(image.id, "metaDescription", e.target.value)}
              rows={3}
              className={inputClass}
            />
          </div>

          {/* Keywords */}
          <div>
            <label className={labelClass}>{t("keywords", language)}</label>
            <input
              type="text"
              value={analysis.keywords.join(", ")}
              onChange={(e) =>
                onUpdateAnalysis(
                  image.id,
                  "keywords",
                  e.target.value.split(",").map((k) => k.trim()).filter(Boolean)
                )
              }
              className={inputClass}
            />
          </div>

          {/* Location */}
          <div className="rounded-md border border-raised p-3 space-y-3">
            <p className="text-xs font-medium text-dim uppercase tracking-wider">{t("location", language)}</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-dim mb-0.5">{t("locationName", language)}</label>
                <input
                  type="text"
                  value={analysis.locationName}
                  onChange={(e) => onUpdateAnalysis(image.id, "locationName", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs text-dim mb-0.5">{t("city", language)}</label>
                <input
                  type="text"
                  value={analysis.city}
                  onChange={(e) => onUpdateAnalysis(image.id, "city", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs text-dim mb-0.5">{t("stateProvince", language)}</label>
                <input
                  type="text"
                  value={analysis.stateProvince}
                  onChange={(e) => onUpdateAnalysis(image.id, "stateProvince", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs text-dim mb-0.5">{t("country", language)}</label>
                <input
                  type="text"
                  value={analysis.country}
                  onChange={(e) => onUpdateAnalysis(image.id, "country", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Metadata preview */}
          <div>
            <label className={labelClass}>{t("mdPreview", language)}</label>
            <pre className="rounded-md bg-deep p-3 text-xs text-fog whitespace-pre-wrap overflow-x-auto border border-elevated">
{`# ${previewName}

## ${t("title", language)}
${analysis.title}

## ${t("altText", language)}
${analysis.altText}

## ${t("description", language)}
${analysis.metaDescription}

## ${t("keywords", language)}
${analysis.keywords.join(", ")}

## ${t("copyright", language)}
${copyright || "—"}

## ${t("creator", language)}
${creator || "—"}

## ${t("webRights", language)}
${rightsUrl || "—"}

## ${t("location", language)}
${[analysis.locationName, analysis.city, analysis.stateProvince, analysis.country].filter(Boolean).join(", ") || "—"}`}
            </pre>
          </div>

          <button
            onClick={() => onExport(image.id)}
            disabled={image.exported}
            className="w-full rounded-md bg-elevated border border-raised px-4 py-2 text-sm font-medium text-cream hover:bg-raised disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            {image.exported ? t("exported", language) : t("exportImage", language)}
          </button>
        </>
      )}
    </div>
  );
}
