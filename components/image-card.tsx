"use client";

import { ImageItem } from "@/lib/types";
import { t, type Language } from "@/lib/i18n";

interface ImageCardProps {
  image: ImageItem;
  isSelected: boolean;
  onClick: () => void;
  onRemove: (id: string) => void;
  thumbnailUrl: string;
  language: Language;
}

export function ImageCard({
  image,
  isSelected,
  onClick,
  onRemove,
  thumbnailUrl,
  language,
}: ImageCardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-lg border overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:shadow-black/20 ${
        isSelected ? "border-warm-dim shadow-lg shadow-black/20" : "border-raised"
      }`}
    >
      <div className="aspect-square bg-elevated relative group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnailUrl}
          alt={image.analysis?.altText || image.originalFileName}
          className="w-full h-full object-cover"
        />
        {/* Status */}
        <span className="absolute top-2 left-2 text-[10px] px-2.5 py-1 rounded-full font-medium bg-deep/80 text-cream backdrop-blur-sm border border-elevated">
          {t(image.status, language)}
        </span>
        {image.exported && (
          <span className="absolute bottom-2 left-2 text-[10px] px-2.5 py-1 rounded-full font-medium bg-deep/80 text-warm backdrop-blur-sm border border-elevated">
            {t("exported", language)}
          </span>
        )}
        {/* Remove button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(image.id);
          }}
          className="absolute top-2 right-2 text-[10px] px-2.5 py-1 rounded-full font-medium bg-deep/90 text-cream border border-elevated opacity-0 group-hover:opacity-100 hover:bg-black transition-all"
        >
          {t("remove", language)}
        </button>
      </div>
      <div className="p-2 bg-surface">
        <p className="text-xs text-dim truncate">{image.originalFileName}</p>
        {image.analysis && (
          <p className="text-sm font-medium text-cream truncate mt-0.5">
            {image.analysis.descriptiveName}
          </p>
        )}
        {image.status === "error" && image.error && (
          <p className="text-xs text-fog mt-0.5 line-clamp-2">
            {image.error}
          </p>
        )}
      </div>
    </div>
  );
}
