"use client";

import { useState } from "react";
import { ComparisonSampleCard } from "./comparison-sample";
import { COMPARISON_SAMPLES } from "@/lib/samples/comparison-data";
import { t, type Language } from "@/lib/i18n";

interface ComparisonGalleryProps {
  language: Language;
}

export function ComparisonGallery({ language }: ComparisonGalleryProps) {
  const [expandedId, setExpandedId] = useState<string>(COMPARISON_SAMPLES[0].id);

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? "" : id));
  };

  const mailtoHref = `mailto:dennis@autentisk.io?subject=${encodeURIComponent("Premium - Interesse")}&body=${encodeURIComponent("Jeg vil gjerne vite mer om Premium")}`;

  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-12 md:py-16">
      {/* Section header */}
      <div className="text-center mb-8 md:mb-10">
        <h2 className="font-display font-light text-cream text-2xl md:text-3xl mb-3">
          {t("galleryHeading", language)}
        </h2>
        <div className="shimmer-line max-w-xs mx-auto" />
      </div>

      {/* Sample cards */}
      <div className="flex flex-col gap-3">
        {COMPARISON_SAMPLES.map((sample) => (
          <ComparisonSampleCard
            key={sample.id}
            sample={sample}
            isExpanded={expandedId === sample.id}
            onToggle={() => handleToggle(sample.id)}
            language={language}
          />
        ))}
      </div>

      {/* CTA */}
      <div className="mt-10 text-center">
        <a
          href={mailtoHref}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-warm/40 text-cream font-body font-medium text-sm tracking-wide transition-all duration-300 hover:bg-warm/10 hover:border-warm/70 hover:shadow-[0_0_30px_rgba(197,163,100,0.12)]"
        >
          {t("galleryUpgrade", language)}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
        <p className="text-xs text-dim mt-3">
          {t("galleryNotify", language)}
        </p>
      </div>
    </section>
  );
}
