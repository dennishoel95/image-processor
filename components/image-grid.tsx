"use client";

import { ImageItem } from "@/lib/types";
import { ImageCard } from "./image-card";
import { DropZone } from "./drop-zone";

interface ImageGridProps {
  images: ImageItem[];
  selectedId: string | null;
  onSelectImage: (id: string) => void;
  onFilesDropped: (files: File[]) => void;
  sourcePath: string;
}

export function ImageGrid({
  images,
  selectedId,
  onSelectImage,
  onFilesDropped,
}: ImageGridProps) {
  return (
    <div className="flex-1 p-4 overflow-y-auto">
      <DropZone onFilesDropped={onFilesDropped} />

      {images.length === 0 ? (
        <div className="mt-8 text-center text-gray-400">
          <p>No images loaded yet.</p>
          <p className="text-sm mt-1">
            Scan a source folder or drop images above.
          </p>
        </div>
      ) : (
        <>
          <p className="mt-4 mb-3 text-sm text-gray-600">
            {images.length} image{images.length !== 1 ? "s" : ""} found
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {images.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                isSelected={image.id === selectedId}
                onClick={() => onSelectImage(image.id)}
                thumbnailUrl={`/api/thumbnail?path=${encodeURIComponent(
                  image.sourcePath
                )}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
