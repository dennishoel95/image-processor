"use client";

import { AppSettings } from "@/lib/types";
import { LANGUAGES, t, type Language } from "@/lib/i18n";

interface SettingsPanelProps {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  onProcessAll: () => void;
  onExportAll: () => void;
  onExportCsv: () => void;
  onReset: () => void;
  isProcessing: boolean;
  processProgress: { current: number; total: number };
  imageCount: number;
  processedCount: number;
  apiKeyConfigured: boolean;
}

export function SettingsPanel({
  settings,
  onSettingsChange,
  onProcessAll,
  onExportAll,
  onExportCsv,
  onReset,
  isProcessing,
  processProgress,
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
    <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-elevated bg-surface p-4 md:p-5 flex flex-col gap-4 overflow-y-auto dark-scroll">
      <h2 className="text-sm font-medium text-fog tracking-[0.15em] uppercase">
        {t("settings", lang)}
      </h2>

      {/* Language selector */}
      <div>
        <label className="block text-xs font-medium text-dim mb-2">
          {t("language", lang)}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {LANGUAGES.map((l) => {
            const isSelected = settings.language === l.code;
            return (
              <button
                key={l.code}
                onClick={() => onSettingsChange({ ...settings, language: l.code as Language })}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                  isSelected
                    ? "text-white border-white/20 shadow-sm"
                    : "bg-surface text-dim border-raised opacity-50 hover:opacity-100"
                }`}
                style={
                  isSelected
                    ? { background: l.gradient }
                    : undefined
                }
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = l.gradient;
                    e.currentTarget.style.opacity = "0.5";
                    e.currentTarget.style.color = "white";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = "";
                    e.currentTarget.style.opacity = "";
                    e.currentTarget.style.color = "";
                    e.currentTarget.style.borderColor = "";
                  }
                }}
              >
                {l.name}
              </button>
            );
          })}
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

      {/* Naming section — open by default */}
      <details open className="group">
        <summary className="flex items-center justify-between cursor-pointer text-xs font-medium text-dim tracking-[0.15em] uppercase select-none">
          {t("prefix", lang)} / {t("suffix", lang)}
          <svg className="w-3.5 h-3.5 text-dim transition-transform group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </summary>
        <div className="mt-3 flex flex-col gap-3">
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
        </div>
      </details>

      <hr className="border-elevated" />

      {/* Metadata defaults section — collapsed if already filled */}
      <details open={!settings.copyright && !settings.creator && !settings.rightsUrl} className="group">
        <summary className="flex items-center justify-between cursor-pointer text-xs font-medium text-dim tracking-[0.15em] uppercase select-none">
          {t("copyright", lang)} / {t("creator", lang)}
          {settings.copyright || settings.creator || settings.rightsUrl ? (
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-warm-dim" />
              <svg className="w-3.5 h-3.5 text-dim transition-transform group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </span>
          ) : (
            <svg className="w-3.5 h-3.5 text-dim transition-transform group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          )}
        </summary>
        <div className="mt-3 flex flex-col gap-3">
          <div>
            <label className="block text-xs font-medium text-dim mb-1">
              {t("copyright", lang)}
            </label>
            <input
              type="text"
              value={settings.copyright}
              onChange={(e) => update("copyright", e.target.value)}
              placeholder="© 2026 Company. All rights reserved."
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-dim mb-1">
              {t("creator", lang)}
            </label>
            <input
              type="text"
              value={settings.creator}
              onChange={(e) => update("creator", e.target.value)}
              placeholder="Photography: Name | Edit: Team"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-dim mb-1">
              {t("webRights", lang)}
            </label>
            <input
              type="text"
              value={settings.rightsUrl}
              onChange={(e) => update("rightsUrl", e.target.value)}
              placeholder="https://example.com/image-licensing"
              className={inputClass}
            />
          </div>
        </div>
      </details>

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
            {isProcessing
              ? `${t("processing", lang)} ${processProgress.current}/${processProgress.total}`
              : imageCount > 0
                ? `${t("processAll", lang)} (${imageCount})`
                : t("processAll", lang)}
          </span>
        </button>

        {/* Progress bar */}
        {isProcessing && processProgress.total > 0 && (
          <div className="h-1 bg-deep">
            <div
              className="h-full bg-warm-dim transition-all duration-500 ease-out"
              style={{ width: `${(processProgress.current / processProgress.total) * 100}%` }}
            />
          </div>
        )}

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

        <div className="border-t border-raised" />

        {/* Step 3: Export CSV */}
        <button
          onClick={onExportCsv}
          disabled={isProcessing || processedCount === 0}
          className="w-full flex items-center gap-3 px-3 py-2.5 bg-elevated text-left hover:bg-raised transition-all disabled:opacity-30 disabled:hover:bg-elevated disabled:cursor-not-allowed"
        >
          <span className="flex-shrink-0 w-6 h-6 rounded-full border border-warm-dim/40 text-warm-dim text-xs font-semibold flex items-center justify-center">
            CSV
          </span>
          <span className="text-sm font-medium text-cream">
            {processedCount > 0 ? `Export Metadata CSV (${processedCount})` : "Export Metadata CSV"}
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
