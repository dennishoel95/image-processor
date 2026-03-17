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
  prefix: string;
  suffix: string;
  separator: string;
  language: Language;
}

export function ImageGrid({
  images,
  selectedId,
  onSelectImage,
  onRemoveImage,
  onFilesSelected,
  prefix,
  suffix,
  separator,
  language,
}: ImageGridProps) {
  return (
    <div className="flex-1 p-4 overflow-y-auto dark-scroll">
      <DropZone
        onFilesSelected={onFilesSelected}
        currentCount={images.length}
        language={language}
      />

      {images.length === 0 ? (
        <div className="mt-8 text-center text-dim">
          <p>{t("noImages", language)}</p>
          <p className="text-sm mt-1">
            {t("noImagesSub", language)}
          </p>
        </div>
      ) : (
        <>
          <p className="mt-4 mb-3 text-sm text-fog">
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
                prefix={prefix}
                suffix={suffix}
                separator={separator}
                language={language}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
