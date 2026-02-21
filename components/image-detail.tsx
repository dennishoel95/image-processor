"use client";

import { ImageItem } from "@/lib/types";

interface ImageDetailProps {
  image: ImageItem;
  prefix: string;
  suffix: string;
  separator: string;
  onUpdateAnalysis: (
    imageId: string,
    field: "descriptiveName" | "altText" | "metaDescription" | "keywords",
    value: string | string[]
  ) => void;
  onProcess: (imageId: string) => void;
  onExport: (imageId: string) => void;
  isProcessing: boolean;
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
  isProcessing,
}: ImageDetailProps) {
  const analysis = image.analysis;
  const ext = image.originalFileName.split(".").pop() || "jpg";

  const previewName = analysis
    ? buildPreviewName(prefix, analysis.descriptiveName, suffix, separator, ext)
    : null;

  return (
    <div className="w-96 border-l border-gray-200 bg-white p-4 overflow-y-auto flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-gray-900">Image Details</h2>

      {/* Preview */}
      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/thumbnail?path=${encodeURIComponent(image.sourcePath)}`}
          alt={analysis?.altText || image.originalFileName}
          className="w-full h-full object-contain"
        />
      </div>

      <div>
        <p className="text-xs text-gray-500">Original: {image.originalFileName}</p>
        {previewName && (
          <p className="text-sm font-medium text-blue-700 mt-1">
            New: {previewName}
          </p>
        )}
      </div>

      {image.status === "error" && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {image.error}
        </div>
      )}

      {!analysis && image.status !== "processing" && (
        <button
          onClick={() => onProcess(image.id)}
          disabled={isProcessing}
          className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:bg-gray-300"
        >
          Analyze with AI
        </button>
      )}

      {image.status === "processing" && (
        <div className="text-center text-sm text-yellow-700 py-2">
          Analyzing...
        </div>
      )}

      {analysis && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descriptive Name
            </label>
            <input
              type="text"
              value={analysis.descriptiveName}
              onChange={(e) =>
                onUpdateAnalysis(image.id, "descriptiveName", e.target.value)
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alt Text
            </label>
            <textarea
              value={analysis.altText}
              onChange={(e) =>
                onUpdateAnalysis(image.id, "altText", e.target.value)
              }
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Description
            </label>
            <textarea
              value={analysis.metaDescription}
              onChange={(e) =>
                onUpdateAnalysis(image.id, "metaDescription", e.target.value)
              }
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keywords (comma-separated)
            </label>
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
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Metadata preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              .md Preview
            </label>
            <pre className="rounded-md bg-gray-100 p-3 text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto">
{`# ${previewName}

## Alt Text
${analysis.altText}

## Meta Description
${analysis.metaDescription}

## Keywords
${analysis.keywords.join(", ")}`}
            </pre>
          </div>

          <button
            onClick={() => onExport(image.id)}
            disabled={image.exported}
            className="w-full rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:bg-gray-300"
          >
            {image.exported ? "Exported" : "Export Image"}
          </button>
        </>
      )}
    </div>
  );
}
