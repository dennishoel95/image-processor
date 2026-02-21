"use client";

import { ImageItem } from "@/lib/types";

interface ImageCardProps {
  image: ImageItem;
  isSelected: boolean;
  onClick: () => void;
  thumbnailUrl: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-gray-200 text-gray-700",
  processing: "bg-yellow-200 text-yellow-800",
  done: "bg-green-200 text-green-800",
  error: "bg-red-200 text-red-800",
};

export function ImageCard({
  image,
  isSelected,
  onClick,
  thumbnailUrl,
}: ImageCardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-lg border-2 overflow-hidden cursor-pointer transition-all hover:shadow-md ${
        isSelected ? "border-blue-500 shadow-md" : "border-gray-200"
      }`}
    >
      <div className="aspect-square bg-gray-100 relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnailUrl}
          alt={image.analysis?.altText || image.originalFileName}
          className="w-full h-full object-cover"
        />
        <span
          className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[image.status]}`}
        >
          {image.status}
        </span>
        {image.exported && (
          <span className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-medium bg-purple-200 text-purple-800">
            exported
          </span>
        )}
      </div>
      <div className="p-2">
        <p className="text-xs text-gray-500 truncate">{image.originalFileName}</p>
        {image.analysis && (
          <p className="text-sm font-medium text-gray-900 truncate mt-0.5">
            {image.analysis.descriptiveName}
          </p>
        )}
        {image.status === "error" && image.error && (
          <p className="text-xs text-red-600 mt-0.5 line-clamp-2">
            {image.error}
          </p>
        )}
      </div>
    </div>
  );
}
