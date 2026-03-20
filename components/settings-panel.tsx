"use client";

import { AppSettings } from "@/lib/types";
import { LANGUAGES, t, type Language } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

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

  return (
    <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-border bg-card p-4 md:p-5 flex flex-col gap-4 overflow-y-auto dark-scroll">
      <h2 className="text-sm font-medium text-muted-foreground tracking-[0.15em] uppercase">
        {t("settings", lang)}
      </h2>

      {/* Language selector */}
      <div>
        <Label className="text-xs text-muted-foreground mb-2">
          {t("language", lang)}
        </Label>
        <div className="flex flex-wrap gap-1.5">
          {LANGUAGES.map((l) => (
            <Badge
              key={l.code}
              variant={settings.language === l.code ? "default" : "outline"}
              className="cursor-pointer gap-1.5 px-3 py-1.5 h-auto"
              onClick={() => onSettingsChange({ ...settings, language: l.code as Language })}
            >
              <span>{l.flag}</span>
              <span>{l.name}</span>
            </Badge>
          ))}
        </div>
      </div>

      {!apiKeyConfigured && (
        <>
          <Separator />
          <div className="rounded-md px-3 py-2 text-sm bg-destructive/10 text-destructive border border-destructive/20">
            {t("apiError", lang)}
          </div>
        </>
      )}

      <Separator />

      {/* Naming section */}
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
              <Label className="text-xs text-muted-foreground mb-1">
                {t("prefix", lang)}
              </Label>
              <Input
                value={settings.prefix}
                onChange={(e) => update("prefix", e.target.value)}
                placeholder="e.g. blog"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1">
                {t("suffix", lang)}
              </Label>
              <Input
                value={settings.suffix}
                onChange={(e) => update("suffix", e.target.value)}
                placeholder="e.g. hero"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1">
              {t("separator", lang)}
            </Label>
            <Input
              value={settings.separator}
              onChange={(e) => update("separator", e.target.value)}
              maxLength={3}
              className="w-20 text-center"
            />
          </div>
        </div>
      </details>

      <Separator />

      {/* Metadata defaults section */}
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
            <Label className="text-xs text-muted-foreground mb-1">
              {t("copyright", lang)}
            </Label>
            <Input
              value={settings.copyright}
              onChange={(e) => update("copyright", e.target.value)}
              placeholder="© 2026 Company. All rights reserved."
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1">
              {t("creator", lang)}
            </Label>
            <Input
              value={settings.creator}
              onChange={(e) => update("creator", e.target.value)}
              placeholder="Photography: Name | Edit: Team"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1">
              {t("webRights", lang)}
            </Label>
            <Input
              value={settings.rightsUrl}
              onChange={(e) => update("rightsUrl", e.target.value)}
              placeholder="https://example.com/image-licensing"
            />
          </div>
        </div>
      </details>

      <Separator />

      {/* Action steps */}
      <div className="rounded-lg border border-border overflow-hidden">
        {/* Step 1: Process */}
        <Button
          variant="ghost"
          onClick={onProcessAll}
          disabled={isProcessing || !apiKeyConfigured || imageCount === 0}
          className="w-full flex items-center justify-start gap-3 px-3 py-2.5 h-auto rounded-none"
        >
          <Badge className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs font-semibold">
            1
          </Badge>
          <span className="text-sm font-medium">
            {isProcessing
              ? `${t("processing", lang)} ${processProgress.current}/${processProgress.total}`
              : imageCount > 0
                ? `${t("processAll", lang)} (${imageCount})`
                : t("processAll", lang)}
          </span>
        </Button>

        {/* Progress bar */}
        {isProcessing && processProgress.total > 0 && (
          <Progress
            value={(processProgress.current / processProgress.total) * 100}
            className="h-1 rounded-none"
          />
        )}

        <Separator />

        {/* Step 2: Export */}
        <Button
          variant="ghost"
          onClick={onExportAll}
          disabled={isProcessing || processedCount === 0}
          className="w-full flex items-center justify-start gap-3 px-3 py-2.5 h-auto rounded-none"
        >
          <Badge className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs font-semibold">
            2
          </Badge>
          <span className="text-sm font-medium">
            {processedCount > 0 ? `${t("exportAllProcessed", lang)} (${processedCount})` : t("exportAllProcessed", lang)}
          </span>
        </Button>

        <Separator />

        {/* Step 3: Export CSV */}
        <Button
          variant="ghost"
          onClick={onExportCsv}
          disabled={isProcessing || processedCount === 0}
          className="w-full flex items-center justify-start gap-3 px-3 py-2.5 h-auto rounded-none"
        >
          <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs font-semibold border-primary/40 text-primary">
            CSV
          </Badge>
          <span className="text-sm font-medium">
            {processedCount > 0 ? `Export Metadata CSV (${processedCount})` : "Export Metadata CSV"}
          </span>
        </Button>
      </div>

      {imageCount > 0 && (
        <Button
          variant="outline"
          onClick={onReset}
          disabled={isProcessing}
          className="w-full"
        >
          {t("reset", lang)}
        </Button>
      )}
    </div>
  );
}
