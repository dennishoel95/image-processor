"use client";

import { useState, useEffect, useCallback } from "react";
import { t, type Language } from "@/lib/i18n";

interface FolderBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (path: string) => void;
  title: string;
  language: Language;
}

interface BrowseResult {
  current: string;
  parent: string | null;
  folders: { name: string; path: string }[];
}

export function FolderBrowser({ isOpen, onClose, onSelect, title, language }: FolderBrowserProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-carbon/50">
      <div className="bg-snow rounded-lg shadow-xl w-[500px] max-h-[600px] flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-alabaster">
          <h3 className="text-base font-semibold text-carbon">{title}</h3>
          {data && (
            <p className="text-xs text-slate mt-1 truncate">{data.current}</p>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-2 min-h-[300px]">
          {loading && (
            <p className="text-sm text-slate text-center py-8">{t("loading", language)}</p>
          )}

          {error && (
            <p className="text-sm text-iron text-center py-8">{error}</p>
          )}

          {data && !loading && (
            <div className="space-y-0.5">
              {/* Go up */}
              {data.parent && (
                <button
                  onClick={() => browse(data.parent!)}
                  className="w-full text-left px-3 py-2 rounded hover:bg-platinum flex items-center gap-2 text-sm text-iron"
                >
                  <span className="text-lg">&#8592;</span>
                  <span>..</span>
                </button>
              )}

              {/* Folders */}
              {data.folders.length === 0 && (
                <p className="text-sm text-muted text-center py-4">{t("noSubfolders", language)}</p>
              )}

              {data.folders.map((folder) => (
                <button
                  key={folder.path}
                  onClick={() => browse(folder.path)}
                  className="w-full text-left px-3 py-2 rounded hover:bg-platinum flex items-center gap-2 text-sm text-carbon"
                >
                  <span className="text-slate">&#128193;</span>
                  <span>{folder.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-alabaster flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-iron hover:bg-platinum rounded-md"
          >
            {t("cancel", language)}
          </button>
          <button
            onClick={() => {
              if (data) {
                onSelect(data.current);
                onClose();
              }
            }}
            disabled={!data}
            className="px-4 py-2 text-sm font-medium text-snow bg-gunmetal hover:bg-carbon rounded-md disabled:bg-pale disabled:text-muted transition-colors"
          >
            {t("selectFolder", language)}
          </button>
        </div>
      </div>
    </div>
  );
}
