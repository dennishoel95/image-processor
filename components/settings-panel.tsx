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
    "w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-border bg-card p-4 md:p-5 flex flex-col gap-4 overflow-y-auto dark-scroll">
      <h2 className="text-sm font-medium text-muted-foreground tracking-[0.15em] uppercase">
        {t("settings", lang)}
      </h2>

      {/* Language selector */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-2">
          {t("language", lang)}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => onSettingsChange({ ...settings, language: l.code as Language })}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                settings.language === l.code
                  ? "bg-accent text-foreground border-primary/40"
                  : "bg-card text-muted-foreground border-border hover:bg-accent hover:text-foreground"
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
          <hr className="border-border" />
          <div className="rounded-md px-3 py-2 text-sm bg-accent text-muted-foreground border border-border">
            {t("apiError", lang)}
          </div>
        </>
      )}

      <hr className="border-border" />

      {/* Naming section — open by default */}
      <details open className="group">
        <summary className="flex items-center justify-between cursor-pointer text-xs font-medium text-muted-foreground tracking-[0.15em] uppercase select-none">
          {t("prefix", lang)} / {t("suffix", lang)}
          <svg className="w-3.5 h-3.5 text-muted-foreground transition-transform group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </summary>
        <div className="mt-3 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
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
              <label className="block text-xs font-medium text-muted-foreground mb-1">
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
            <label className="block text-xs font-medium text-muted-foreground mb-1">
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

      <hr className="border-border" />

      {/* Metadata defaults section — collapsed if already filled */}
      <details open={!settings.copyright && !settings.creator && !settings.rightsUrl} className="group">
        <summary className="flex items-center justify-between cursor-pointer text-xs font-medium text-muted-foreground tracking-[0.15em] uppercase select-none">
          {t("copyright", lang)} / {t("creator", lang)}
          {settings.copyright || settings.creator || settings.rightsUrl ? (
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <svg className="w-3.5 h-3.5 text-muted-foreground transition-transform group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </span>
          ) : (
            <svg className="w-3.5 h-3.5 text-muted-foreground transition-transform group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          )}
        </summary>
        <div className="mt-3 flex flex-col gap-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
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
            <label className="block text-xs font-medium text-muted-foreground mb-1">
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
            <label className="block text-xs font-medium text-muted-foreground mb-1">
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

      <hr className="border-border" />

      {/* Action steps */}
      <div className="rounded-lg border border-border overflow-hidden">
        {/* Step 1: Process */}
        <button
          onClick={onProcessAll}
          disabled={isProcessing || !apiKeyConfigured || imageCount === 0}
          className="w-full flex items-center gap-3 px-3 py-2.5 bg-accent text-left hover:bg-muted transition-all disabled:opacity-30 disabled:hover:bg-accent disabled:cursor-not-allowed"
        >
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">
            1
          </span>
          <span className="text-sm font-medium text-foreground">
            {isProcessing
              ? `${t("processing", lang)} ${processProgress.current}/${processProgress.total}`
              : imageCount > 0
                ? `${t("processAll", lang)} (${imageCount})`
                : t("processAll", lang)}
          </span>
        </button>

        {/* Progress bar */}
        {isProcessing && processProgress.total > 0 && (
          <div className="h-1 bg-background">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${(processProgress.current / processProgress.total) * 100}%` }}
            />
          </div>
        )}

        <div className="border-t border-border" />

        {/* Step 2: Export */}
        <button
          onClick={onExportAll}
          disabled={isProcessing || processedCount === 0}
          className="w-full flex items-center gap-3 px-3 py-2.5 bg-accent text-left hover:bg-muted transition-all disabled:opacity-30 disabled:hover:bg-accent disabled:cursor-not-allowed"
        >
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">
            2
          </span>
          <span className="text-sm font-medium text-foreground">
            {processedCount > 0 ? `${t("exportAllProcessed", lang)} (${processedCount})` : t("exportAllProcessed", lang)}
          </span>
        </button>

        <div className="border-t border-border" />

        {/* Step 3: Export CSV */}
        <button
          onClick={onExportCsv}
          disabled={isProcessing || processedCount === 0}
          className="w-full flex items-center gap-3 px-3 py-2.5 bg-accent text-left hover:bg-muted transition-all disabled:opacity-30 disabled:hover:bg-accent disabled:cursor-not-allowed"
        >
          <span className="flex-shrink-0 w-6 h-6 rounded-full border border-primary/40 text-primary text-xs font-semibold flex items-center justify-center">
            CSV
          </span>
          <span className="text-sm font-medium text-foreground">
            {processedCount > 0 ? `Export Metadata CSV (${processedCount})` : "Export Metadata CSV"}
          </span>
        </button>
      </div>

      {imageCount > 0 && (
        <button
          onClick={onReset}
          disabled={isProcessing}
          className="w-full rounded-md px-4 py-2 text-sm font-medium text-muted-foreground bg-accent border border-border hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          {t("reset", lang)}
        </button>
      )}
    </div>
  );
}
