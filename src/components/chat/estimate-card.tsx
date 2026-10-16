"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
  TrendingUp,
  Clock,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

export interface EstimateCardProps {
  estimate: {
    categoryKey: string;
    categoryDisplayName: string;
    architecture: "static" | "dynamic";
    autoSwitchedToDynamic?: boolean;
    estimatedTimeline: string;
    pages: {
      count: number;
      list: { name: string; slug: string; purpose: string; isEssential: boolean }[];
    };
    features: {
      essential: { id: string; name: string; price: number }[];
      recommended: { id: string; name: string; price: number }[];
      optional: { id: string; name: string; price: number }[];
    };
    cost: {
      currencySymbol: string;
      oneTimeTotalINR: number;
      baseCategoryPriceINR: number;
      recurringMonthlyTotalINR: number;
      recurringBreakdown: { name: string; costINR: number; frequency: string; note?: string }[];
      thirdPartyNotes: string[];
    };
    marketBenchmark?: {
      tierTitle: string;
      marketRangeMinINR: number;
      marketRangeMaxINR: number;
      marketAverageINR: number;
      sourceName: string;
      sourceUrl: string;
      researchDate: string;
      notes: string;
    } | null;
    budgetAnalysis?: {
      userBudgetINR: number;
      calculatedCostINR: number;
      differenceINR: number;
      fitsBudget: boolean;
      recommendation: string;
      compromiseOptions?: string[];
    };
    assumptions: string[];
  };
  onInquireNow: () => void;
}

export function EstimateCard({ estimate, onInquireNow }: EstimateCardProps) {
  const [showPages, setShowPages] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [showBenchmark, setShowBenchmark] = useState(false);

  const {
    categoryDisplayName,
    architecture,
    estimatedTimeline,
    pages,
    features,
    cost,
    marketBenchmark,
    budgetAnalysis,
  } = estimate;

  return (
    <div className="mt-2.5 rounded-2xl bg-[#0F101A] border border-emerald-500/30 p-3 space-y-3 text-left shadow-lg">
      {/* Header Badge & Category */}
      <div className="flex items-center justify-between gap-2 border-b border-white/[0.08] pb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-[11.5px] font-bold text-white truncate tracking-tight">
            {categoryDisplayName} Blueprint
          </span>
        </div>
        <span
          className={`text-[9.5px] px-2 py-0.5 rounded-full font-mono font-medium tracking-wide border ${
            architecture === "dynamic"
              ? "bg-purple-950/40 text-purple-300 border-purple-500/30"
              : "bg-emerald-950/40 text-emerald-300 border-emerald-500/30"
          }`}
        >
          {architecture === "dynamic" ? "Dynamic (PostgreSQL)" : "Static Website"}
        </span>
      </div>

      {/* Main Pricing & Timeline Hero Metric */}
      <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#141523] border border-white/[0.06]">
        <div>
          <span className="text-[10px] text-[#8E8E8C] block uppercase tracking-wider font-semibold">
            One-Time Dev Fee
          </span>
          <span className="text-base sm:text-lg font-black text-emerald-400 tracking-tight">
            {cost.currencySymbol}
            {cost.oneTimeTotalINR.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-[#8E8E8C] block uppercase tracking-wider font-semibold flex items-center justify-end gap-1">
            <Clock className="w-3 h-3 text-teal-400" />
            <span>Timeline</span>
          </span>
          <span className="text-xs sm:text-sm font-bold text-[#E5E5E3] block leading-snug">
            {estimatedTimeline}
          </span>
        </div>
      </div>

      {/* Monthly Care (if applicable) */}
      {cost.recurringMonthlyTotalINR > 0 && (
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-teal-950/20 border border-teal-500/20 text-[10.5px]">
          <span className="text-[#A5D6A7]">Optional Monthly Care / Retainer:</span>
          <span className="font-bold text-teal-300">
            {cost.currencySymbol}
            {cost.recurringMonthlyTotalINR.toLocaleString("en-IN")}/mo
          </span>
        </div>
      )}

      {/* Budget Assessment Box (if user volunteered a budget) */}
      {budgetAnalysis && (
        <div
          className={`p-2.5 rounded-xl border text-[11px] leading-relaxed ${
            budgetAnalysis.fitsBudget
              ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-200"
              : "bg-amber-950/30 border-amber-500/30 text-amber-200"
          }`}
        >
          <div className="flex items-center gap-1.5 font-bold mb-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>
              Target Budget: {cost.currencySymbol}
              {budgetAnalysis.userBudgetINR.toLocaleString("en-IN")} (
              {budgetAnalysis.fitsBudget ? "Within Budget" : "Exceeds Target"})
            </span>
          </div>
          <p className="text-[10.5px] opacity-90">{budgetAnalysis.recommendation}</p>
          {budgetAnalysis.compromiseOptions && budgetAnalysis.compromiseOptions.length > 0 && (
            <ul className="mt-1.5 space-y-0.5 pl-3 list-disc text-[10px] opacity-85">
              {budgetAnalysis.compromiseOptions.map((opt, idx) => (
                <li key={idx}>{opt}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Collapsible: Recommended Pages */}
      <div className="border border-white/[0.07] rounded-xl overflow-hidden bg-[#12131F]">
        <button
          type="button"
          onClick={() => setShowPages((prev) => !prev)}
          className="w-full px-2.5 py-2 flex items-center justify-between text-[11px] text-[#D4D4D2] hover:text-white transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5 font-semibold">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Recommended Pages ({pages.count})</span>
          </span>
          {showPages ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showPages && (
          <div className="p-2.5 pt-0 border-t border-white/[0.05] space-y-1.5 text-[10.5px]">
            {pages.list.map((p, idx) => (
              <div key={idx} className="p-1.5 rounded-lg bg-black/30 border border-white/[0.04]">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-semibold text-white flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{p.name}</span>
                  </span>
                  <span className="text-[9px] font-mono text-[#7A7A78]">{p.slug}</span>
                </div>
                <p className="text-[10px] text-[#8E8E8C] mt-0.5 leading-snug">{p.purpose}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Collapsible: Features Checklist */}
      <div className="border border-white/[0.07] rounded-xl overflow-hidden bg-[#12131F]">
        <button
          type="button"
          onClick={() => setShowFeatures((prev) => !prev)}
          className="w-full px-2.5 py-2 flex items-center justify-between text-[11px] text-[#D4D4D2] hover:text-white transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>
              Features ({features.essential.length} Essential · {features.recommended.length} Recommended)
            </span>
          </span>
          {showFeatures ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showFeatures && (
          <div className="p-2.5 pt-0 border-t border-white/[0.05] space-y-2 text-[10.5px]">
            <div>
              <span className="text-[9.5px] uppercase tracking-wider text-emerald-400 font-bold block mb-1">
                Essential for Launch
              </span>
              <div className="flex flex-wrap gap-1">
                {features.essential.map((f) => (
                  <span
                    key={f.id}
                    className="px-2 py-0.5 rounded-md bg-emerald-950/40 text-emerald-300 border border-emerald-500/20 text-[10px]"
                  >
                    ✓ {f.name}
                  </span>
                ))}
              </div>
            </div>

            {features.recommended.length > 0 && (
              <div>
                <span className="text-[9.5px] uppercase tracking-wider text-teal-400 font-bold block mb-1">
                  Recommended Drivers
                </span>
                <div className="flex flex-wrap gap-1">
                  {features.recommended.map((f) => (
                    <span
                      key={f.id}
                      className="px-2 py-0.5 rounded-md bg-teal-950/40 text-teal-300 border border-teal-500/20 text-[10px]"
                    >
                      + {f.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Collapsible: Market Benchmark Comparison */}
      {marketBenchmark && (
        <div className="border border-white/[0.07] rounded-xl overflow-hidden bg-[#12131F]">
          <button
            type="button"
            onClick={() => setShowBenchmark((prev) => !prev)}
            className="w-full px-2.5 py-2 flex items-center justify-between text-[11px] text-[#D4D4D2] hover:text-white transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5 font-semibold">
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
              <span>Market Benchmark Rates</span>
            </span>
            {showBenchmark ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showBenchmark && (
            <div className="p-2.5 pt-0 border-t border-white/[0.05] space-y-2 text-[10.5px]">
              <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/[0.04]">
                <span className="text-[#8E8E8C]">Indian Agency Market Range:</span>
                <span className="font-bold text-white font-mono">
                  {cost.currencySymbol}
                  {marketBenchmark.marketRangeMinINR.toLocaleString("en-IN")} – {cost.currencySymbol}
                  {marketBenchmark.marketRangeMaxINR.toLocaleString("en-IN")}
                </span>
              </div>
              <p className="text-[10px] text-[#8E8E8C] leading-snug">{marketBenchmark.notes}</p>
              <div className="text-[9px] text-[#666666] flex items-center gap-1 border-t border-white/[0.04] pt-1">
                <span>Source: {marketBenchmark.sourceName}</span>
                <span>·</span>
                <span>{marketBenchmark.researchDate}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom CTA Button */}
      <button
        type="button"
        onClick={onInquireNow}
        className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.99] text-black font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
      >
        <span>Prepare Project Inquiry with this Scope</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
