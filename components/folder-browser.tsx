"use client";

import { useState, useEffect, useCallback } from "react";

interface FolderBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (path: string) => void;
  title: string;
}

interface BrowseResult {
  current: string;
  parent: string | null;
  folders: { name: string; path: string }[];
}

export function FolderBrowser({ isOpen, onClose, onSelect, title }: FolderBrowserProps) {
  const [data, setData] = useState<BrowseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const browse = useCallback(async (dirPath?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = dirPath ? `?path=${encodeURIComponent(dirPath)}` : "";
      const res = await fetch(`/api/browse${params}`);
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed to browse");
        return;
      }
      const result: BrowseResult = await res.json();
      setData(result);
    } catch {
      setError("Failed to connect");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      browse();
    }
  }, [isOpen, browse]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-[500px] max-h-[600px] flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          {data && (
            <p className="text-xs text-gray-500 mt-1 truncate">{data.current}</p>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-2 min-h-[300px]">
          {loading && (
            <p className="text-sm text-gray-500 text-center py-8">Loading...</p>
          )}

          {error && (
            <p className="text-sm text-red-600 text-center py-8">{error}</p>
          )}

          {data && !loading && (
            <div className="space-y-0.5">
              {/* Go up */}
              {data.parent && (
                <button
                  onClick={() => browse(data.parent!)}
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 flex items-center gap-2 text-sm text-gray-700"
                >
                  <span className="text-lg">&#8592;</span>
                  <span>..</span>
                </button>
              )}

              {/* Folders */}
              {data.folders.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No subfolders</p>
              )}

              {data.folders.map((folder) => (
                <button
                  key={folder.path}
                  onClick={() => browse(folder.path)}
                  className="w-full text-left px-3 py-2 rounded hover:bg-blue-50 flex items-center gap-2 text-sm text-gray-900"
                >
                  <span className="text-blue-500">&#128193;</span>
                  <span>{folder.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (data) {
                onSelect(data.current);
                onClose();
              }
            }}
            disabled={!data}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:bg-gray-300"
          >
            Select This Folder
          </button>
        </div>
      </div>
    </div>
  );
}
