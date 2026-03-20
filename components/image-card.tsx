"use client";

import { ImageItem } from "@/lib/types";
import { t, type Language } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
        <Badge variant="secondary" className="absolute top-2 left-2 text-[10px] backdrop-blur-sm">
          {t(image.status, language)}
        </Badge>
        {image.exported && (
          <Badge className="absolute bottom-2 left-2 text-[10px] backdrop-blur-sm">
            {t("exported", language)}
          </Badge>
        )}
        <Button
          variant="destructive"
          size="xs"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(image.id);
          }}
          className="absolute top-2 right-2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {t("remove", language)}
        </Button>
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
