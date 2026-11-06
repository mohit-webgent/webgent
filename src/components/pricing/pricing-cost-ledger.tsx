"use client";

import {
  ArrowRight,
  Sparkles,
  AlertCircle,
  Wrench,
  X,
} from "lucide-react";
import { formatCurrencyINR } from "@/data/pricing-matrix-data";
import type { PricingConfigurator } from "./use-pricing-configurator";

export function PricingCostLedger({ configurator }: { configurator: PricingConfigurator }) {
  const {
    flowMode,
    setSelectedAddonIds,
    setSelectedQuoteIds,
    addonQuantities,
    deliverySpeed,
    setDeliverySpeed,
    customNotes,
    setCustomNotes,
    setIsSubmitModalOpen,
    setModalNotes,
    setSubmitPlanSuccess,
    setSubmitPlanError,
    removeAddon,
    updateQuantity,
    currentPackage,
    activeSelectedAddons,
    activeSelectedQuotes,
    onetimeAddonsCost,
    monthlyServicesCost,
    expressFee,
    grandTotalOnetime,
    includedCountInTier,
  } = configurator;

  return (
    <>
            {/* ===================================================================== */}
            {/* RIGHT PANE: STICKY LIVE COST LEDGER & ESTIMATOR                       */}
            {/* ===================================================================== */}
            <aside className="lg:col-span-4 xl:col-span-4 2xl:col-span-4 lg:sticky lg:top-20 lg:self-start space-y-4">
              <div className="rounded-2xl p-5 sm:p-6 space-y-5 border border-accent/40 bg-gradient-to-b from-surface to-canvas relative">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-accent/20 pb-3.5">
                  <div className="space-y-0.5">
                    <span className="block text-xs font-mono uppercase tracking-widest text-fg-muted">
                      Live Engineering Estimate
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      Project Cost Breakdown
                    </h2>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs sm:text-xs font-mono text-accent bg-accent/10 px-2.5 py-1 rounded-full border border-accent/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    <span>Real-Time</span>
                  </div>
                </div>

                {/* Package Base Summary (only shown in package modes) */}
                {flowMode !== "custom_only" && (
                  <div className="space-y-2 p-3.5 rounded-xl bg-surface-2/70 border border-accent/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="block text-xs font-mono uppercase tracking-wider text-fg-muted">
                          Base Package
                        </span>
                        <span className="text-sm font-bold text-white uppercase">{currentPackage.name}</span>
                      </div>
                      <span className="text-sm font-mono font-bold text-white">
                        {formatCurrencyINR(currentPackage.startingPrice)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono text-fg-muted pt-1.5 border-t border-accent/15">
                      <span>Scope timeline:</span>
                      <span className="text-white">{currentPackage.deliveryTime}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono text-fg-muted">
                      <span>Bundled features:</span>
                      <span>{includedCountInTier} features included</span>
                    </div>
                  </div>
                )}

                {/* Custom Build label (custom_only mode) */}
                {flowMode === "custom_only" && (
                  <div className="space-y-1 p-3.5 rounded-xl bg-accent/30 border border-accent/20">
                    <div className="flex items-center gap-2 text-xs font-mono text-accent">
                      <Wrench className="w-3.5 h-3.5" />
                      <span className="font-semibold">Custom Build — No Base Package</span>
                    </div>
                    <p className="text-xs text-fg-muted leading-relaxed">
                      Your total is the sum of individually selected features only.
                    </p>
                  </div>
                )}

                {/* Delivery SLA Switcher */}
                <div className="space-y-1.5">
                  <span className="text-xs font-mono uppercase text-fg-muted tracking-wider block">
                    Delivery SLA
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setDeliverySpeed("standard")}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        deliverySpeed === "standard"
                          ? "bg-white/[0.08] text-white border-line-strong font-bold"
                          : "bg-surface text-fg-muted border-line hover:text-white"
                      }`}
                    >
                      <span>Standard</span>
                      <span className="block text-xs opacity-75">Included</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliverySpeed("express")}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        deliverySpeed === "express"
                          ? "bg-amber-500/20 text-amber-300 border-amber-400/40 font-bold"
                          : "bg-surface text-fg-muted border-line hover:text-white"
                      }`}
                    >
                      <span>Express</span>
                      <span className="block text-xs opacity-75">+20% Speedup</span>
                    </button>
                  </div>
                </div>

                {/* Selected Add-ons List (Scrollable if many) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-fg-muted">
                    <span>Selected Add-ons ({activeSelectedAddons.length})</span>
                    {activeSelectedAddons.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedAddonIds([])}
                        className="text-xs text-rose-400 hover:underline"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {activeSelectedAddons.length === 0 ? (
                    <p className="text-xs text-fg-muted italic p-3 rounded-lg bg-surface border border-line">
                      {flowMode === "custom_only"
                        ? "Select features from the catalog to build your custom project."
                        : "No extra add-ons selected. Choose from the catalog to add features."}
                    </p>
                  ) : (
                    <div
                      className="max-h-44 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin"
                      style={{
                        scrollbarWidth: "thin",
                        scrollbarColor: "rgba(52, 211, 153, 0.35) transparent",
                        WebkitOverflowScrolling: "touch",
                        touchAction: "pan-y",
                      }}
                    >
                      {activeSelectedAddons.map((addon) => {
                        const qty = addon.hasQuantity ? addonQuantities[addon.id] || 1 : 1;
                        const linePrice = (addon.addonPrice || 0) * qty;

                        return (
                          <div
                            key={addon.id}
                            className="flex items-center justify-between gap-2 p-2 rounded-lg bg-surface border border-line text-xs"
                          >
                            <div className="space-y-0.5 min-w-0">
                              <span className="font-medium text-white truncate block">{addon.name}</span>
                              <span className="text-xs font-mono text-fg-muted">
                                {addon.billingType === "monthly" ? "Monthly ongoing" : "One-time build"}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {addon.hasQuantity && (
                                <div className="flex items-center gap-1 bg-surface-3 px-1.5 py-0.5 rounded border border-line text-xs font-mono">
                                  <button
                                    type="button"
                                    onClick={() => updateQuantity(addon.id, -1)}
                                    className="text-fg-muted hover:text-white"
                                    title="Decrease quantity"
                                  >
                                    -
                                  </button>
                                  <span className="font-bold text-white px-1">{qty}</span>
                                  <button
                                    type="button"
                                    onClick={() => updateQuantity(addon.id, 1)}
                                    className="text-fg-muted hover:text-white"
                                    title="Increase quantity"
                                  >
                                    +
                                  </button>
                                </div>
                              )}

                              <span className="font-mono text-accent font-bold tabular-nums">
                                {formatCurrencyINR(linePrice)}
                                {addon.billingType === "monthly" && "/mo"}
                              </span>

                              <button
                                type="button"
                                onClick={() => removeAddon(addon.id)}
                                className="text-fg-muted hover:text-rose-400 p-0.5"
                                title="Remove add-on"
                                aria-label={`Remove ${addon.name}`}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Custom Quote Scope Items */}
                {activeSelectedQuotes.length > 0 && (
                  <div className="space-y-1.5 p-3 rounded-xl bg-accent/20 border border-accent/30">
                    <div className="flex items-center justify-between text-xs font-mono text-accent">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-accent" />
                        Custom Scope ({activeSelectedQuotes.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedQuoteIds([])}
                        className="text-xs text-rose-400 hover:underline"
                      >
                        Clear
                      </button>
                    </div>
                    <p className="text-xs text-fg-muted leading-relaxed">
                      These modules are scoped individually during consultation:
                    </p>
                    <ul className="space-y-1 text-xs text-fg-soft pt-1">
                      {activeSelectedQuotes.map((q) => (
                        <li key={q.id} className="flex items-center justify-between gap-1.5 text-xs">
                          <span className="truncate">• {q.name}</span>
                          <span className="text-xs font-mono text-accent shrink-0">Custom Quote</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Cost Summary Breakdown */}
                <div className="space-y-2 pt-3 border-t border-accent/20 text-xs font-mono">
                  {flowMode !== "custom_only" && (
                    <div className="flex items-center justify-between text-fg-muted">
                      <span>Base Package:</span>
                      <span className="text-white">{formatCurrencyINR(currentPackage.startingPrice)}</span>
                    </div>
                  )}

                  {onetimeAddonsCost > 0 && (
                    <div className="flex items-center justify-between text-fg-muted">
                      <span>{flowMode === "custom_only" ? "Selected Features:" : "One-Time Add-ons:"}</span>
                      <span className="text-white">+{formatCurrencyINR(onetimeAddonsCost)}</span>
                    </div>
                  )}

                  {expressFee > 0 && (
                    <div className="flex items-center justify-between text-amber-300">
                      <span>Express SLA (+20%):</span>
                      <span>+{formatCurrencyINR(expressFee)}</span>
                    </div>
                  )}

                  {monthlyServicesCost > 0 && (
                    <div className="flex items-center justify-between text-accent pt-1 border-t border-line">
                      <span>Monthly Recurring:</span>
                      <span>{formatCurrencyINR(monthlyServicesCost)}/month</span>
                    </div>
                  )}

                  {/* Grand Total Highlight */}
                  <div className="pt-3 border-t border-accent/30 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs font-mono uppercase text-fg-muted block">
                        Estimated One-Time Total
                      </span>
                      <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
                        {formatCurrencyINR(grandTotalOnetime)}
                      </span>
                    </div>

                    {monthlyServicesCost > 0 && (
                      <div className="text-right">
                        <span className="text-xs font-mono uppercase text-accent block">+ Monthly</span>
                        <span className="text-sm font-mono font-bold text-accent">
                          {formatCurrencyINR(monthlyServicesCost)}/mo
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Third-party disclaimer */}
                <div className="text-xs font-mono text-fg-muted leading-relaxed p-2.5 rounded-lg bg-canvas border border-line">
                  <AlertCircle className="w-3 h-3 inline mr-1 text-amber-500/70" />
                  Third-party service charges (hosting, SMS gateway, payment gateway fees, domain, email service) are not included in these prices.
                </div>

                {/* Client Notes / Requirements input */}
                <div className="space-y-1">
                  <label htmlFor="custom-notes" className="text-xs font-mono text-fg-muted uppercase">
                    Project Notes (Optional)
                  </label>
                  <textarea
                    id="custom-notes"
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    rows={2}
                    placeholder="Paste reference websites, special workflows, or deadline requirements..."
                    className="w-full p-2 rounded-xl text-xs bg-canvas border border-line text-white placeholder-fg-muted focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>

                {/* Primary Action Button */}
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setModalNotes(customNotes);
                      setIsSubmitModalOpen(true);
                      setSubmitPlanSuccess(false);
                      setSubmitPlanError(null);
                    }}
                    className="w-full min-h-[46px] px-5 py-3 rounded-xl bg-accent hover:bg-accent active:scale-[0.99] text-black font-semibold text-xs sm:text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>
                      {flowMode === "custom_only"
                        ? "Submit Plan & Request Quote"
                        : activeSelectedAddons.length > 0 || activeSelectedQuotes.length > 0
                          ? "Submit Plan & Request Quote"
                          : `Proceed with ${currentPackage.name} (${formatCurrencyINR(grandTotalOnetime)})`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <p className="text-xs font-mono text-fg-muted text-center">
                    {flowMode !== "custom_only" && activeSelectedAddons.length === 0 && activeSelectedQuotes.length === 0
                      ? `Zero extra features added • Proceed directly with ${currentPackage.name} package`
                      : "Direct consultation with technical leads • 100% full source code ownership"}
                  </p>
                </div>
              </div>
            </aside>
    </>
  );
}
