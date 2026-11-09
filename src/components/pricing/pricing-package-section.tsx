"use client";

import {
  Check,
  Clock,
  ChevronDown,
} from "lucide-react";
import { formatCurrencyINR } from "@/data/pricing-matrix-data";
import type { MasterPackageTier } from "@/data/pricing-matrix-data";
import type { PricingConfigurator } from "./use-pricing-configurator";

export function PricingPackageSection({ configurator }: { configurator: PricingConfigurator }) {
  const {
    packages,
    flowMode,
    selectedTier,
    setSelectedTier,
    currentPackage,
  } = configurator;

  return (
    <>
        {/* ========================================================================= */}
        {/* PACKAGE SELECTION (shown when flow is "package" or "package_plus_addons")   */}
        {/* ========================================================================= */}
        {flowMode !== "custom_only" && (
          <section aria-label="Core Engineering Packages" className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-fg-muted">
                  Step 2: Choose Your Base Package
                </span>
                <span className="hidden text-xs text-fg-muted sm:inline">/</span>
                <span className="text-xs text-fg-muted font-mono">
                  Active: <strong className="text-white uppercase">{packages[selectedTier].name}</strong> ({formatCurrencyINR(packages[selectedTier].startingPrice)})
                </span>
              </div>
              <span className="hidden text-xs font-mono text-fg-muted sm:inline">
                Third-party service charges not included
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
              {(["starter", "business", "pro"] as MasterPackageTier[]).map((tierKey) => {
                const pkg = packages[tierKey];
                const isSelected = selectedTier === tierKey;

                return (
                  <div
                    key={tierKey}
                    onClick={() => setSelectedTier(tierKey)}
                    className={`relative p-5 sm:p-6 rounded-2xl cursor-pointer transition-all duration-200 border flex flex-col justify-between gap-4 text-left select-none ${
                      isSelected
                        ? "bg-surface-2 border-accent/90 ring-1 ring-accent/50 -translate-y-0.5"
                        : "bg-surface border-line hover:border-line-strong hover:bg-surface-2"
                    }`}
                  >
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          isSelected
                            ? "bg-accent/20 text-accent border-accent/40"
                            : "bg-white/[0.04] text-fg-muted border-line"
                        }`}
                      >
                        {pkg.name}
                      </span>

                      {pkg.badge && (
                        <span className="text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                          {pkg.badge}
                        </span>
                      )}
                    </div>

                    {/* Title & Price */}
                    <div className="space-y-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-mono">
                          {formatCurrencyINR(pkg.startingPrice)}
                        </span>
                        <span className="text-xs font-mono text-fg-muted">starting</span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-white">{pkg.tagline}</p>
                      <p className="text-xs sm:text-xs text-fg-muted leading-relaxed">{pkg.summary}</p>
                      {pkg.idealFor && (
                        <div className="pt-0.5">
                          <span className="inline-block text-sm leading-snug text-fg-muted">
                            <strong className="font-medium text-fg-soft">Best for:</strong> {pkg.idealFor}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Highlights — Complete list of all points without truncation */}
                    <div className="space-y-2 pt-3 border-t border-line">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-xs font-mono uppercase tracking-wider text-fg-muted font-semibold">
                          What&apos;s Included ({pkg.keyHighlights.length} Features):
                        </span>
                      </div>
                      <ul
                        className="space-y-2 text-xs sm:text-[13px] text-fg-soft max-h-56 overflow-y-auto pr-1"
                        style={{
                          scrollbarWidth: "thin",
                          scrollbarColor: "rgba(255, 255, 255, 0.15) transparent",
                          WebkitOverflowScrolling: "touch",
                          touchAction: "pan-y",
                        }}
                      >
                        {pkg.keyHighlights.map((hl: string, i: number) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <span className="mt-0.5 shrink-0 text-accent">
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            </span>
                            <span className="leading-snug">{hl}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Delivery & Selection Button */}
                    <div className="pt-2 flex items-center justify-between gap-2">
                      <span className="text-xs font-mono text-fg-muted flex items-center gap-1">
                        <Clock className="w-3 h-3 text-fg-muted" />
                        {pkg.deliveryTime}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTier(tierKey);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                          isSelected
                            ? "bg-accent text-black shadow-sm"
                            : "bg-white/[0.06] text-white hover:bg-white/10"
                        }`}
                      >
                        {isSelected ? "Selected ✓" : "Select"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Package Navigation Banner: Directs user to Extra Features section (Get Started button removed) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-surface to-canvas border border-accent/30 shadow-lg">
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  <p className="text-sm font-semibold text-white">
                    Selected Base Package: <strong className="text-accent font-mono uppercase">{currentPackage.name}</strong> ({formatCurrencyINR(currentPackage.startingPrice)})
                  </p>
                </div>
                <p className="text-xs text-fg-muted">
                  Next Step: Review or customize with extra features below. If no extra features are needed, you can move forward from the estimate.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("extra-features-section");
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent text-black font-semibold text-xs sm:text-sm tracking-wide transition-all duration-200 flex items-center gap-2 active:scale-[0.99] shrink-0"
                >
                  <span>Add Extra Features</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>
        )}

    </>
  );
}
