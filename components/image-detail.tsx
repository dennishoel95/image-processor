"use client";

import { ImageItem } from "@/lib/types";
import { t, type Language } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

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
  const color = len > max ? "text-red-400" : len > warn ? "text-yellow-400" : "text-muted-foreground";
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

  return (
    <div className="w-full md:w-96 border-t md:border-t-0 md:border-l border-border bg-card p-4 overflow-y-auto flex flex-col gap-4 dark-scroll">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground tracking-[0.15em] uppercase">
          {t("imageDetails", language)}
        </h2>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M1 1l12 12M13 1L1 13" />
          </svg>
        </Button>
      </div>

      {/* Preview */}
      <div className="aspect-video bg-accent rounded-lg overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.thumbnailUrl}
          alt={analysis?.altText || image.originalFileName}
          className="w-full h-full object-contain"
        />
      </div>

      <div>
        <p className="text-xs text-muted-foreground">{t("original", language)}: {image.originalFileName}</p>
        {previewName && (
          <p className="text-sm font-medium text-foreground mt-1">
            {t("new", language)}: {previewName}
          </p>
        )}
      </div>

      {image.status === "error" && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
          {image.error}
        </div>
      )}

      {!analysis && image.status !== "processing" && (
        <Button
          onClick={() => onProcess(image.id)}
          disabled={isProcessing}
          className="w-full"
        >
          {t("analyzeAi", language)}
        </Button>
      )}

      {image.status === "processing" && (
        <div className="text-center text-sm text-muted-foreground py-2">
          {t("analyzing", language)}
        </div>
      )}

      {analysis && (
        <>
          {/* Descriptive Name */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1">{t("descriptiveName", language)}</Label>
            <Input
              value={analysis.descriptiveName}
              onChange={(e) => onUpdateAnalysis(image.id, "descriptiveName", e.target.value)}
            />
          </div>

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label className="text-xs text-muted-foreground">{t("title", language)}</Label>
              <CharCount value={analysis.title} max={100} warn={90} />
            </div>
            <Input
              value={analysis.title}
              onChange={(e) => onUpdateAnalysis(image.id, "title", e.target.value)}
            />
          </div>

          {/* Alt Text */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label className="text-xs text-muted-foreground">{t("altText", language)}</Label>
              <CharCount value={analysis.altText} max={125} warn={110} />
            </div>
            <Textarea
              value={analysis.altText}
              onChange={(e) => onUpdateAnalysis(image.id, "altText", e.target.value)}
              rows={2}
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label className="text-xs text-muted-foreground">{t("description", language)}</Label>
              <CharCount value={analysis.metaDescription} max={160} warn={145} />
            </div>
            <Textarea
              value={analysis.metaDescription}
              onChange={(e) => onUpdateAnalysis(image.id, "metaDescription", e.target.value)}
              rows={3}
            />
          </div>

          {/* Keywords */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1">{t("keywords", language)}</Label>
            <Input
              value={analysis.keywords.join(", ")}
              onChange={(e) =>
                onUpdateAnalysis(
                  image.id,
                  "keywords",
                  e.target.value.split(",").map((k) => k.trim()).filter(Boolean)
                )
              }
            />
          </div>

          {/* Location */}
          <div className="rounded-md border border-border p-3 space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("location", language)}</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground mb-0.5">{t("locationName", language)}</Label>
                <Input
                  value={analysis.locationName}
                  onChange={(e) => onUpdateAnalysis(image.id, "locationName", e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-0.5">{t("city", language)}</Label>
                <Input
                  value={analysis.city}
                  onChange={(e) => onUpdateAnalysis(image.id, "city", e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-0.5">{t("stateProvince", language)}</Label>
                <Input
                  value={analysis.stateProvince}
                  onChange={(e) => onUpdateAnalysis(image.id, "stateProvince", e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-0.5">{t("country", language)}</Label>
                <Input
                  value={analysis.country}
                  onChange={(e) => onUpdateAnalysis(image.id, "country", e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Metadata preview */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1">{t("mdPreview", language)}</Label>
            <pre className="rounded-md bg-background p-3 text-xs text-muted-foreground whitespace-pre-wrap overflow-x-auto border border-border">
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

          <Button
            variant="outline"
            onClick={() => onExport(image.id)}
            disabled={image.exported}
            className="w-full"
          >
            {image.exported ? t("exported", language) : t("exportImage", language)}
          </Button>
        </>
      )}
    </div>
  );
}
