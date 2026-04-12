"use client";

import { FieldRow } from "./field-row";
import { t, type Language } from "@/lib/i18n";
import type { ComparisonSample as SampleType } from "@/lib/samples/comparison-data";

interface ComparisonSampleProps {
  sample: SampleType;
  isExpanded: boolean;
  onToggle: () => void;
  language: Language;
}

const FIELD_ORDER: { key: keyof SampleType["free"]; i18nKey: string; isPremiumOnly: boolean }[] = [
  { key: "descriptiveName", i18nKey: "galleryFileName", isPremiumOnly: false },
  { key: "altText", i18nKey: "altText", isPremiumOnly: false },
  { key: "metaDescription", i18nKey: "description", isPremiumOnly: false },
  { key: "keywords", i18nKey: "keywords", isPremiumOnly: false },
  { key: "title", i18nKey: "title", isPremiumOnly: true },
  { key: "locationName", i18nKey: "locationName", isPremiumOnly: true },
  { key: "city", i18nKey: "city", isPremiumOnly: true },
  { key: "stateProvince", i18nKey: "stateProvince", isPremiumOnly: true },
  { key: "country", i18nKey: "country", isPremiumOnly: true },
];

export function ComparisonSampleCard({ sample, isExpanded, onToggle, language }: ComparisonSampleProps) {
  const freeLabel = t("galleryFree", language);
  const premiumLabel = t("galleryPremium", language);
  const lockTooltip = t("galleryLockTooltip", language);

  return (
    <div className="rounded-xl border border-elevated overflow-hidden bg-surface/50">
      {/* Clickable header: image + summary */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3 text-left hover:bg-elevated/50 transition-colors"
      >
        {/* Thumbnail */}
        <div className="w-16 h-12 md:w-20 md:h-14 rounded-lg overflow-hidden flex-shrink-0 bg-elevated">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={sample.imagePath}
            alt={sample.free.altText}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Summary text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-cream truncate">
            {sample.free.descriptiveName}
          </p>
          <p className="text-xs text-dim truncate mt-0.5">
            {sample.free.altText}
          </p>
        </div>

        {/* Expand/collapse icon */}
        <svg
          className={`w-4 h-4 text-dim transition-transform flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div>
          {/* Full image */}
          <div className="relative aspect-video bg-elevated">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={sample.imagePath}
              alt={sample.premium.altText}
              className="w-full h-full object-cover"
            />
            {/* Photographer credit */}
            <a
              href={sample.photographerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-2 right-2 text-[9px] text-white/60 hover:text-white/90 bg-black/40 rounded px-1.5 py-0.5 backdrop-blur-sm transition-colors"
            >
              {sample.photographer} / Unsplash
            </a>
          </div>

          {/* Column headers (desktop only) */}
          <div className="hidden md:grid grid-cols-2 border-t border-elevated">
            <div className="px-3 py-2 text-[10px] font-semibold text-dim uppercase tracking-wider border-r border-elevated">
              {freeLabel}
            </div>
            <div className="px-3 py-2 text-[10px] font-semibold text-warm-dim uppercase tracking-wider">
              {premiumLabel}
            </div>
          </div>

          {/* Field rows */}
          <div className="border-t border-elevated">
            {FIELD_ORDER.map((field) => (
              <FieldRow
                key={field.key}
                label={t(field.i18nKey, language)}
                freeValue={sample.free[field.key]}
                premiumValue={sample.premium[field.key]}
                isPremiumOnly={field.isPremiumOnly}
                freeLabel={freeLabel}
                premiumLabel={premiumLabel}
                lockTooltip={lockTooltip}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
