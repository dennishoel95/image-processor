"use client";

import { ImageItem } from "@/lib/types";
import { t, type Language } from "@/lib/i18n";

interface ImageCardProps {
  image: ImageItem;
  isSelected: boolean;
  onClick: () => void;
  onRemove: (id: string) => void;
  thumbnailUrl: string;
  prefix: string;
  suffix: string;
  separator: string;
  language: Language;
}

function buildPreviewName(
  prefix: string,
  aiName: string,
  suffix: string,
  separator: string,
): string {
  const parts: string[] = [];
  if (prefix.trim()) parts.push(prefix.trim());
  parts.push(aiName.trim());
  if (suffix.trim()) parts.push(suffix.trim());
  return parts.join(separator);
}

export function ImageCard({
  image,
  isSelected,
  onClick,
  onRemove,
  thumbnailUrl,
  prefix,
  suffix,
  separator,
  language,
}: ImageCardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-lg border overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:shadow-black/20 ${
        isSelected ? "border-primary shadow-lg shadow-black/20" : "border-border"
      }`}
    >
      <div className="aspect-square bg-accent relative group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnailUrl}
          alt={image.analysis?.altText || image.originalFileName}
          className="w-full h-full object-cover"
        />
        {/* Status */}
        <span className="absolute top-2 left-2 text-[10px] px-2.5 py-1 rounded-full font-medium bg-background/80 text-foreground backdrop-blur-sm border border-border">
          {t(image.status, language)}
        </span>
        {image.exported && (
          <span className="absolute bottom-2 left-2 text-[10px] px-2.5 py-1 rounded-full font-medium bg-background/80 text-primary backdrop-blur-sm border border-border">
            {t("exported", language)}
          </span>
        )}
        {/* Remove button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(image.id);
          }}
          className="absolute top-2 right-2 text-[10px] px-2.5 py-1 rounded-full font-medium bg-background/90 text-foreground border border-border opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-all"
        >
          {t("remove", language)}
        </button>
      </div>
      <div className="p-2 bg-card">
        <p className="text-xs text-muted-foreground truncate">{image.originalFileName}</p>
        {image.analysis && (
          <p className="text-sm font-medium text-foreground truncate mt-0.5">
            {buildPreviewName(prefix, image.analysis.descriptiveName, suffix, separator)}
          </p>
        )}
        {image.status === "error" && image.error && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {image.error}
          </p>
        )}
      </div>
    </div>
  );
}
