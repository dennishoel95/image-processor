"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCredits } from "@/app/actions";

const PACKAGES = [
  {
    id: "credits_50",
    credits: 50,
    price: "$5",
    priceDetail: "$0.10 / image",
    description: "Good for trying it out",
    popular: false,
  },
  {
    id: "credits_200",
    credits: 200,
    price: "$15",
    priceDetail: "$0.075 / image",
    description: "Best value for regular use",
    popular: true,
  },
  {
    id: "credits_500",
    credits: 500,
    price: "$30",
    priceDetail: "$0.06 / image",
    description: "For heavy usage and teams",
    popular: false,
  },
];

export default function CreditsPage() {
  const router = useRouter();
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    getCredits().then((c) => setCredits(c));
  }, []);

  const handlePurchase = async (packageId: string) => {
    setLoading(packageId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-deep text-cream">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Back link */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-sm text-dim hover:text-cream transition-colors mb-12"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to app
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-3xl md:text-4xl font-light text-cream mb-3">
            Buy Credits
          </h1>
          <p className="text-fog text-sm">
            Each image analysis uses 1 credit. Purchase a package to get started.
          </p>
          {credits !== null && (
            <p className="mt-4 text-sm text-warm-dim">
              Current balance: <span className="font-semibold">{credits} credits</span>
            </p>
          )}
        </div>

        {/* Packages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative rounded-xl border p-6 flex flex-col items-center text-center transition-all ${
                pkg.popular
                  ? "border-warm-dim/60 bg-elevated shadow-lg shadow-warm-dim/5"
                  : "border-raised bg-surface hover:border-elevated"
              }`}
            >
              {pkg.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-warm-dim text-deep text-[10px] font-semibold tracking-wider uppercase">
                  Most Popular
                </span>
              )}

              <div className="text-3xl font-display font-light text-cream mt-2">
                {pkg.credits}
              </div>
              <div className="text-xs text-dim uppercase tracking-wider mt-1 mb-4">
                credits
              </div>

              <div className="text-2xl font-semibold text-cream">{pkg.price}</div>
              <div className="text-xs text-dim mt-1 mb-2">{pkg.priceDetail}</div>
              <p className="text-xs text-fog mb-6">{pkg.description}</p>

              <button
                onClick={() => handlePurchase(pkg.id)}
                disabled={loading !== null}
                className={`w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  pkg.popular
                    ? "bg-warm-dim text-deep hover:bg-warm-dim/90"
                    : "bg-elevated border border-raised text-cream hover:bg-raised"
                }`}
              >
                {loading === pkg.id ? "Redirecting..." : "Buy Now"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
