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

  const inputClass =
    "w-full rounded-md border border-raised bg-surface px-3 py-2 text-sm text-cream placeholder:text-dim focus:border-warm-dim focus:outline-none focus:ring-1 focus:ring-warm-dim";

  return (
    <div className="w-80 border-r border-elevated bg-surface p-5 flex flex-col gap-4 overflow-y-auto dark-scroll">
      <h2 className="text-sm font-medium text-fog tracking-[0.15em] uppercase">
        {t("settings", lang)}
      </h2>

      {/* Language selector */}
      <div>
        <label className="block text-xs font-medium text-dim mb-2">
          {t("language", lang)}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => onSettingsChange({ ...settings, language: l.code as Language })}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                settings.language === l.code
                  ? "bg-elevated text-cream border-warm-dim/40"
                  : "bg-surface text-fog border-raised hover:bg-elevated hover:text-cream"
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
          <hr className="border-elevated" />
          <div className="rounded-md px-3 py-2 text-sm bg-elevated text-fog border border-raised">
            {t("apiError", lang)}
          </div>
        </>
      )}

      <hr className="border-elevated" />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-dim mb-1">
            {t("prefix", lang)}
          </label>
          <input
            type="text"
            value={settings.prefix}
            onChange={(e) => update("prefix", e.target.value)}
            placeholder="e.g. blog"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-dim mb-1">
            {t("suffix", lang)}
          </label>
          <input
            type="text"
            value={settings.suffix}
            onChange={(e) => update("suffix", e.target.value)}
            placeholder="e.g. hero"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-dim mb-1">
          {t("separator", lang)}
        </label>
        <input
          type="text"
          value={settings.separator}
          onChange={(e) => update("separator", e.target.value)}
          maxLength={3}
          className={`${inputClass} w-20 text-center`}
        />
      </div>

      <hr className="border-elevated" />

      {/* Action steps */}
      <div className="rounded-lg border border-raised overflow-hidden">
        {/* Step 1: Process */}
        <button
          onClick={onProcessAll}
          disabled={isProcessing || !apiKeyConfigured || imageCount === 0}
          className="w-full flex items-center gap-3 px-3 py-2.5 bg-elevated text-left hover:bg-raised transition-all disabled:opacity-30 disabled:hover:bg-elevated disabled:cursor-not-allowed"
        >
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-warm-dim text-deep text-xs font-semibold flex items-center justify-center">
            1
          </span>
          <span className="text-sm font-medium text-cream">
            {isProcessing ? t("processing", lang) : imageCount > 0 ? `${t("processAll", lang)} (${imageCount})` : t("processAll", lang)}
          </span>
        </button>

        <div className="border-t border-raised" />

        {/* Step 2: Export */}
        <button
          onClick={onExportAll}
          disabled={isProcessing || processedCount === 0}
          className="w-full flex items-center gap-3 px-3 py-2.5 bg-elevated text-left hover:bg-raised transition-all disabled:opacity-30 disabled:hover:bg-elevated disabled:cursor-not-allowed"
        >
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-warm-dim text-deep text-xs font-semibold flex items-center justify-center">
            2
          </span>
          <span className="text-sm font-medium text-cream">
            {processedCount > 0 ? `${t("exportAllProcessed", lang)} (${processedCount})` : t("exportAllProcessed", lang)}
          </span>
        </button>
      </div>

      {imageCount > 0 && (
        <button
          onClick={onReset}
          disabled={isProcessing}
          className="w-full rounded-md px-4 py-2 text-sm font-medium text-fog bg-elevated border border-raised hover:bg-raised hover:text-cream disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          {t("reset", lang)}
        </button>
      )}
    </div>
  );
}
