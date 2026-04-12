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
  isPremiumUser: boolean;
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
  isPremiumUser,
}: SettingsPanelProps) {
  const lang = settings.language;

  const update = (field: keyof AppSettings, value: string) => {
    onSettingsChange({ ...settings, [field]: value });
  };

  const inputClass =
    "w-full rounded-md border border-raised bg-elevated px-3 py-2 text-sm text-cream placeholder:text-dim focus:border-warm-dim focus:outline-none focus:ring-1 focus:ring-warm-dim";

  return (
    <div className="rounded-xl border border-elevated bg-surface p-4 md:p-5 flex flex-col gap-4">
      {/* API key warning */}
      {!apiKeyConfigured && (
        <div className="rounded-md px-3 py-2 text-sm bg-elevated text-fog border border-raised">
          {t("apiError", lang)}
        </div>
      )}

      {/* Row 1: Language + naming inputs */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Language selector */}
        <div className="flex-shrink-0">
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

        {/* Divider — desktop only */}
        <div className="hidden md:block w-px bg-elevated self-stretch" />

        {/* Prefix + Separator row */}
        <div className="flex flex-1 gap-3 items-end">
          <div className="flex-1">
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
          {isPremiumUser && (
            <div className="flex-1">
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
          )}
          <div className="w-20">
            <label className="block text-xs font-medium text-dim mb-1">
              {t("separator", lang)}
            </label>
            <input
              type="text"
              value={settings.separator}
              onChange={(e) => update("separator", e.target.value)}
              maxLength={3}
              className={`${inputClass} text-center`}
            />
          </div>
        </div>
      </div>

      {/* Premium: metadata defaults */}
      {isPremiumUser && (
        <>
          <hr className="border-elevated" />
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
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
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
        </>
      )}

      <hr className="border-elevated" />

      {/* Action buttons row */}
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        {/* Step 1: Process */}
        <button
          onClick={onProcessAll}
          disabled={isProcessing || !apiKeyConfigured || imageCount === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-warm-dim text-deep text-sm font-semibold hover:bg-warm disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-deep/20 text-deep text-[10px] font-bold flex items-center justify-center">
            1
          </span>
          {isProcessing
            ? `${t("processing", lang)} ${processProgress.current}/${processProgress.total}`
            : imageCount > 0
              ? `${t("processAll", lang)} (${imageCount})`
              : t("processAll", lang)}
        </button>

        {/* Progress bar — shown inline during processing */}
        {isProcessing && processProgress.total > 0 && (
          <div className="flex-1 h-1.5 rounded-full bg-elevated overflow-hidden min-w-[80px]">
            <div
              className="h-full bg-warm-dim rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(processProgress.current / processProgress.total) * 100}%` }}
            />
          </div>
        )}

        {/* Step 2: Export ZIP */}
        <button
          onClick={onExportAll}
          disabled={isProcessing || processedCount === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-elevated border border-raised text-cream text-sm font-medium hover:bg-raised disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-warm-dim/20 text-warm-dim text-[10px] font-bold flex items-center justify-center">
            2
          </span>
          {processedCount > 0 ? `${t("exportAllProcessed", lang)} (${processedCount})` : t("exportAllProcessed", lang)}
        </button>

        {/* Export CSV */}
        <button
          onClick={onExportCsv}
          disabled={isProcessing || processedCount === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-elevated border border-raised text-cream text-sm font-medium hover:bg-raised disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <span className="flex-shrink-0 text-warm-dim text-[10px] font-bold">CSV</span>
          {processedCount > 0 ? `Export CSV (${processedCount})` : "Export CSV"}
        </button>

        {/* Reset — spacer then small text button */}
        {imageCount > 0 && (
          <button
            onClick={onReset}
            disabled={isProcessing}
            className="ml-auto text-xs text-dim hover:text-fog disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {t("reset", lang)}
          </button>
        )}
      </div>
    </div>
  );
}
