"use client";

import { useState } from "react";
import { AppSettings } from "@/lib/types";
import { FolderBrowser } from "./folder-browser";

interface SettingsPanelProps {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  onScan: () => void;
  onProcessAll: () => void;
  onExportAll: () => void;
  isScanning: boolean;
  isProcessing: boolean;
  imageCount: number;
}

export function SettingsPanel({
  settings,
  onSettingsChange,
  onScan,
  onProcessAll,
  onExportAll,
  isScanning,
  isProcessing,
  imageCount,
}: SettingsPanelProps) {
  const [browseTarget, setBrowseTarget] = useState<"source" | "dest" | null>(null);

  const update = (field: keyof AppSettings, value: string) => {
    onSettingsChange({ ...settings, [field]: value });
  };

  return (
    <div className="w-80 border-r border-gray-200 bg-gray-50 p-4 flex flex-col gap-4 overflow-y-auto">
      <h2 className="text-lg font-semibold text-gray-900">Settings</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Claude API Key
        </label>
        <input
          type="password"
          value={settings.apiKey}
          onChange={(e) => update("apiKey", e.target.value)}
          placeholder="sk-ant-..."
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <hr className="border-gray-200" />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Source Folder
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={settings.sourcePath}
            onChange={(e) => update("sourcePath", e.target.value)}
            placeholder="/path/to/source/images"
            className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={() => setBrowseTarget("source")}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100"
          >
            Browse
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Destination Folder
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={settings.destPath}
            onChange={(e) => update("destPath", e.target.value)}
            placeholder="/path/to/destination"
            className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={() => setBrowseTarget("dest")}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100"
          >
            Browse
          </button>
        </div>
      </div>

      <hr className="border-gray-200" />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prefix
          </label>
          <input
            type="text"
            value={settings.prefix}
            onChange={(e) => update("prefix", e.target.value)}
            placeholder="e.g. blog"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Suffix
          </label>
          <input
            type="text"
            value={settings.suffix}
            onChange={(e) => update("suffix", e.target.value)}
            placeholder="e.g. hero"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Separator
        </label>
        <input
          type="text"
          value={settings.separator}
          onChange={(e) => update("separator", e.target.value)}
          maxLength={3}
          className="w-20 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 text-center focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <hr className="border-gray-200" />

      <button
        onClick={onScan}
        disabled={isScanning || !settings.sourcePath}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {isScanning ? "Scanning..." : "Scan Source Folder"}
      </button>

      {imageCount > 0 && (
        <>
          <button
            onClick={onProcessAll}
            disabled={isProcessing || !settings.apiKey}
            className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Processing..." : `Process All (${imageCount})`}
          </button>

          <button
            onClick={onExportAll}
            disabled={isProcessing || !settings.destPath}
            className="w-full rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Export All Processed
          </button>
        </>
      )}

      {/* Folder Browser Modal */}
      <FolderBrowser
        isOpen={browseTarget !== null}
        onClose={() => setBrowseTarget(null)}
        onSelect={(selectedPath) => {
          if (browseTarget === "source") {
            update("sourcePath", selectedPath);
          } else if (browseTarget === "dest") {
            update("destPath", selectedPath);
          }
        }}
        title={browseTarget === "source" ? "Select Source Folder" : "Select Destination Folder"}
      />
    </div>
  );
}
