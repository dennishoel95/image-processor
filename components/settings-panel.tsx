"use client";

import { AppSettings } from "@/lib/types";
import { LANGUAGES, t, type Language } from "@/lib/i18n";

interface SettingsPanelProps {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  onProcessAll: () => void;
  onExportAll: () => void;
  onReset: () => void;
  isProcessing: boolean;
  imageCount: number;
  processedCount: number;
  apiKeyConfigured: boolean;
}

export function SettingsPanel({
  settings,
  onSettingsChange,
  onProcessAll,
  onExportAll,
  onReset,
  isProcessing,
  imageCount,
  processedCount,
  apiKeyConfigured,
}: SettingsPanelProps) {
  const lang = settings.language;

  const update = (field: keyof AppSettings, value: string) => {
    onSettingsChange({ ...settings, [field]: value });
  };

  return (
    <div className="w-80 border-r border-alabaster bg-platinum p-4 flex flex-col gap-4 overflow-y-auto">
      <h2 className="text-lg font-semibold text-carbon">{t("settings", lang)}</h2>

      {/* Language selector */}
      <div>
        <label className="block text-sm font-medium text-iron mb-2">
          {t("language", lang)}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => onSettingsChange({ ...settings, language: l.code as Language })}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                settings.language === l.code
                  ? "bg-pale text-carbon border-muted hover:bg-muted/40 hover:shadow-sm"
                  : "bg-snow text-iron border-pale hover:bg-alabaster hover:shadow-sm"
              }`}
            >
              <span>{l.flag}</span>
              <span>{l.name}</span>
            </button>
          ))}
        </div>
      </div>

      {!apiKeyConfigured && (
        <>
          <hr className="border-alabaster" />
          <div className="rounded-md px-3 py-2 text-sm bg-snow text-iron border border-pale">
            {t("apiError", lang)}
          </div>
        </>
      )}

      <hr className="border-alabaster" />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-iron mb-1">
            {t("prefix", lang)}
          </label>
          <input
            type="text"
            value={settings.prefix}
            onChange={(e) => update("prefix", e.target.value)}
            placeholder="e.g. blog"
            className="w-full rounded-md border border-pale bg-snow px-3 py-2 text-sm text-carbon focus:border-slate focus:outline-none focus:ring-1 focus:ring-slate"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-iron mb-1">
            {t("suffix", lang)}
          </label>
          <input
            type="text"
            value={settings.suffix}
            onChange={(e) => update("suffix", e.target.value)}
            placeholder="e.g. hero"
            className="w-full rounded-md border border-pale bg-snow px-3 py-2 text-sm text-carbon focus:border-slate focus:outline-none focus:ring-1 focus:ring-slate"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-iron mb-1">
          {t("separator", lang)}
        </label>
        <input
          type="text"
          value={settings.separator}
          onChange={(e) => update("separator", e.target.value)}
          maxLength={3}
          className="w-20 rounded-md border border-pale bg-snow px-3 py-2 text-sm text-carbon text-center focus:border-slate focus:outline-none focus:ring-1 focus:ring-slate"
        />
      </div>

      <hr className="border-alabaster" />

      {/* Action steps */}
      <div className="rounded-lg border border-pale overflow-hidden">
        {/* Step 1: Process */}
        <button
          onClick={onProcessAll}
          disabled={isProcessing || !apiKeyConfigured || imageCount === 0}
          className="w-full flex items-center gap-3 px-3 py-2.5 bg-snow text-left hover:bg-alabaster hover:shadow-md disabled:opacity-40 disabled:hover:bg-snow disabled:hover:shadow-none disabled:cursor-not-allowed transition-all"
        >
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-iron text-snow text-xs font-semibold flex items-center justify-center">
            1
          </span>
          <span className="text-sm font-medium text-carbon">
            {isProcessing ? t("processing", lang) : imageCount > 0 ? `${t("processAll", lang)} (${imageCount})` : t("processAll", lang)}
          </span>
        </button>

        {/* Divider */}
        <div className="border-t border-pale" />

        {/* Step 2: Export */}
        <button
          onClick={onExportAll}
          disabled={isProcessing || processedCount === 0}
          className="w-full flex items-center gap-3 px-3 py-2.5 bg-snow text-left hover:bg-alabaster hover:shadow-md disabled:opacity-40 disabled:hover:bg-snow disabled:hover:shadow-none disabled:cursor-not-allowed transition-all"
        >
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-iron text-snow text-xs font-semibold flex items-center justify-center">
            2
          </span>
          <span className="text-sm font-medium text-carbon">
            {processedCount > 0 ? `${t("exportAllProcessed", lang)} (${processedCount})` : t("exportAllProcessed", lang)}
          </span>
        </button>
      </div>

      {imageCount > 0 && (
        <button
          onClick={onReset}
          disabled={isProcessing}
          className="w-full rounded-md px-4 py-2 text-sm font-medium text-slate bg-snow border border-pale hover:bg-alabaster hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {t("reset", lang)}
        </button>
      )}
    </div>
  );
}
