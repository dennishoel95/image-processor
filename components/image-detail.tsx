"use client";

import { ImageItem } from "@/lib/types";
import { t, type Language } from "@/lib/i18n";

interface ImageDetailProps {
  image: ImageItem;
  prefix: string;
  suffix: string;
  separator: string;
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

export function ImageDetail({
  image,
  prefix,
  suffix,
  separator,
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

  const inputClass = "w-full rounded-md border border-pale bg-snow px-3 py-2 text-sm text-carbon focus:border-slate focus:outline-none focus:ring-1 focus:ring-slate";
  const labelClass = "block text-sm font-medium text-iron mb-1";

  return (
    <div className="w-96 border-l border-alabaster bg-snow p-4 overflow-y-auto flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-carbon">{t("imageDetails", language)}</h2>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-md text-slate hover:bg-alabaster hover:shadow-md transition-all"
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M1 1l12 12M13 1L1 13" />
          </svg>
        </button>
      </div>

      {/* Preview */}
      <div className="aspect-video bg-platinum rounded-lg overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/thumbnail?path=${encodeURIComponent(image.sourcePath)}`}
          alt={analysis?.altText || image.originalFileName}
          className="w-full h-full object-contain"
        />
      </div>

      <div>
        <p className="text-xs text-slate">{t("original", language)}: {image.originalFileName}</p>
        {previewName && (
          <p className="text-sm font-medium text-iron mt-1">
            {t("new", language)}: {previewName}
          </p>
        )}
      </div>

      {image.status === "error" && (
        <div className="rounded-md bg-platinum p-3 text-sm text-iron border border-pale">
          {image.error}
        </div>
      )}

      {!analysis && image.status !== "processing" && (
        <button
          onClick={() => onProcess(image.id)}
          disabled={isProcessing}
          className="w-full rounded-md bg-iron px-4 py-2 text-sm font-medium text-snow hover:bg-gunmetal hover:shadow-md disabled:bg-pale disabled:text-muted transition-all"
        >
          {t("analyzeAi", language)}
        </button>
      )}

      {image.status === "processing" && (
        <div className="text-center text-sm text-slate py-2">
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
            <label className={labelClass}>{t("title", language)}</label>
            <input
              type="text"
              value={analysis.title}
              onChange={(e) => onUpdateAnalysis(image.id, "title", e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Alt Text */}
          <div>
            <label className={labelClass}>{t("altText", language)}</label>
            <textarea
              value={analysis.altText}
              onChange={(e) => onUpdateAnalysis(image.id, "altText", e.target.value)}
              rows={2}
              className={inputClass}
            />
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>{t("description", language)}</label>
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
          <div className="rounded-md border border-pale p-3 space-y-3">
            <p className="text-sm font-medium text-iron">{t("location", language)}</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate mb-0.5">{t("locationName", language)}</label>
                <input
                  type="text"
                  value={analysis.locationName}
                  onChange={(e) => onUpdateAnalysis(image.id, "locationName", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs text-slate mb-0.5">{t("city", language)}</label>
                <input
                  type="text"
                  value={analysis.city}
                  onChange={(e) => onUpdateAnalysis(image.id, "city", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs text-slate mb-0.5">{t("stateProvince", language)}</label>
                <input
                  type="text"
                  value={analysis.stateProvince}
                  onChange={(e) => onUpdateAnalysis(image.id, "stateProvince", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs text-slate mb-0.5">{t("country", language)}</label>
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
            <pre className="rounded-md bg-platinum p-3 text-xs text-iron whitespace-pre-wrap overflow-x-auto">
{`# ${previewName}

## ${t("title", language)}
${analysis.title}

## ${t("altText", language)}
${analysis.altText}

## ${t("description", language)}
${analysis.metaDescription}

## ${t("keywords", language)}
${analysis.keywords.join(", ")}

## ${t("location", language)}
${[analysis.locationName, analysis.city, analysis.stateProvince, analysis.country].filter(Boolean).join(", ") || "\u2014"}`}
            </pre>
          </div>

          <button
            onClick={() => onExport(image.id)}
            disabled={image.exported}
            className="w-full rounded-md bg-slate px-4 py-2 text-sm font-medium text-snow hover:bg-iron hover:shadow-md disabled:bg-pale disabled:text-muted transition-all"
          >
            {image.exported ? t("exported", language) : t("exportImage", language)}
          </button>
        </>
      )}
    </div>
  );
}
