"use client";

interface FieldRowProps {
  label: string;
  freeValue: string | string[];
  premiumValue: string | string[];
  isPremiumOnly: boolean;
  freeLabel: string;
  premiumLabel: string;
  lockTooltip: string;
}

function formatValue(value: string | string[]): string {
  if (Array.isArray(value)) return value.join(", ");
  return value || "—";
}

export function FieldRow({
  label,
  freeValue,
  premiumValue,
  isPremiumOnly,
  freeLabel,
  premiumLabel,
  lockTooltip,
}: FieldRowProps) {
  const freeText = formatValue(freeValue);
  const premiumText = formatValue(premiumValue);

  return (
    <div className="border-b border-elevated last:border-b-0">
      {/* Field label */}
      <div className="px-3 py-1.5 bg-deep/50">
        <span className="text-[10px] font-medium text-dim uppercase tracking-wider">
          {label}
        </span>
      </div>

      {/* Values row */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Free cell */}
        <div className="px-3 py-2 border-b md:border-b-0 md:border-r border-elevated">
          <span className="text-[9px] font-medium text-dim uppercase tracking-wider md:hidden">
            {freeLabel}
          </span>
          {isPremiumOnly ? (
            <div className="flex items-center gap-2 py-1" title={lockTooltip}>
              <div className="flex-1 h-4 rounded bg-elevated/60 blur-[2px]" />
              <span className="flex-shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium text-warm-dim border border-warm-dim/30 bg-warm-dim/5">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                Premium
              </span>
            </div>
          ) : (
            <p className="text-xs text-fog leading-relaxed">{freeText}</p>
          )}
        </div>

        {/* Premium cell */}
        <div className="px-3 py-2">
          <span className="text-[9px] font-medium text-dim uppercase tracking-wider md:hidden">
            {premiumLabel}
          </span>
          <p className="text-xs text-cream leading-relaxed">{premiumText}</p>
        </div>
      </div>
    </div>
  );
}
