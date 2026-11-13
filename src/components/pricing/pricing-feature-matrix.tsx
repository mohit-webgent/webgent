"use client";

import {
  Check,
  Plus,
  ArrowRight,
  Search,
  ChevronDown,
  ChevronUp,
  Info,
  X,
} from "lucide-react";
import Link from "next/link";
import { formatCurrencyINR } from "@/data/pricing-matrix-data";
import { renderCategoryIcon, renderStatusBadge } from "./pricing-helpers";
import type { PricingConfigurator } from "./use-pricing-configurator";

export function PricingFeatureMatrix({ configurator }: { configurator: PricingConfigurator }) {
  const {
    features,
    packages,
    categories,
    flowMode,
    selectedTier,
    selectedAddonIds,
    selectedQuoteIds,
    searchQuery,
    setSearchQuery,
    activeCategoryKey,
    setActiveCategoryKey,
    statusFilter,
    setStatusFilter,
    expandedCategories,
    expandedDetails,
    customNotes,
    setIsSubmitModalOpen,
    setModalNotes,
    setSubmitPlanSuccess,
    setSubmitPlanError,
    scrollContainerRef,
    filteredFeatures,
    groupedFeatures,
    toggleAddon,
    handleExpandAll,
    handleCollapseAll,
    toggleCategory,
    toggleFeatureDetail,
    currentPackage,
    activeSelectedAddons,
    includedCountInTier,
    quotationUrl,
  } = configurator;

  return (
    <>
            {/* ===================================================================== */}
            {/* LEFT PANE: Scrollable Master Feature Matrix                           */}
            {/* ===================================================================== */}
            <div id="extra-features-section" className="lg:col-span-8 xl:col-span-8 2xl:col-span-8 space-y-4 min-w-0">
              {/* Step Label & Quick Move Forward bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-widest text-fg-muted">
                    {flowMode !== "custom_only"
                      ? "Step 3: Add Extra Features to Your Package (Optional)"
                      : "Step 2: Select Features for Your Custom Build"}
                  </span>
                </div>

                {flowMode !== "custom_only" && (
                  <div className="flex items-center gap-2 bg-surface border border-accent/20 px-3 py-1.5 rounded-xl text-xs">
                    <span className="text-fg-muted text-xs">
                      {activeSelectedAddons.length === 0
                        ? "Don't want extra features?"
                        : `${activeSelectedAddons.length} extra feature${activeSelectedAddons.length > 1 ? "s" : ""} added`}
                    </span>
                    <Link
                      href={quotationUrl}
                      className="text-xs font-semibold text-accent hover:text-accent underline font-mono flex items-center gap-1 ml-1"
                    >
                      <span>Move Forward {activeSelectedAddons.length === 0 ? `with ${currentPackage.name}` : ""}</span>
                      <ArrowRight className="w-3.5 h-3.5 inline" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Control Bar: Search + Category Pills + View Toggles */}
              <div className="rounded-2xl p-4 space-y-3 bg-canvas textured border border-line shadow-lg">
                {/* Row 1: Search & Controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-fg-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search client features (e.g., razorpay, blog, appointment calendar, whatsapp, dark mode)..."
                      className="w-full pl-9 pr-8 py-2.5 rounded-xl text-xs bg-surface-2 border border-line text-white placeholder-fg-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-colors"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-muted hover:text-white"
                        aria-label="Clear search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Status Filter + Expand/Collapse */}
                  <div className="flex items-center gap-1.5 shrink-0 text-xs font-mono flex-wrap">
                    {flowMode !== "custom_only" && (
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as "all" | "included" | "addon" | "custom_quote")}
                        className="bg-surface-2 border border-line text-fg-soft px-2.5 py-1.5 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-accent"
                        aria-label="Filter by package status"
                      >
                        <option value="all">All Statuses</option>
                        <option value="included">Included in {packages[selectedTier].name}</option>
                        <option value="addon">Available as Add-on</option>
                        <option value="custom_quote">Custom Quote Required</option>
                      </select>
                    )}

                    <div className="flex items-center gap-1 bg-surface-2 p-0.5 rounded-lg border border-line">
                      <button
                        type="button"
                        onClick={handleExpandAll}
                        className="px-2 py-1 rounded text-xs font-mono text-fg-muted hover:text-white hover:bg-white/[0.04]"
                        title="Expand all categories"
                      >
                        Expand All
                      </button>
                      <span className="text-canvas">|</span>
                      <button
                        type="button"
                        onClick={handleCollapseAll}
                        className="px-2 py-1 rounded text-xs font-mono text-fg-muted hover:text-white hover:bg-white/[0.04]"
                        title="Collapse all categories"
                      >
                        Collapse All
                      </button>
                    </div>
                  </div>
                </div>

                {/* Row 2: Horizontal Scrollable Category Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 pt-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveCategoryKey("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono shrink-0 transition-all ${
                      activeCategoryKey === "all"
                        ? "bg-white text-black font-semibold shadow-sm"
                        : "bg-surface-2 text-fg-muted hover:text-white border border-line"
                    }`}
                  >
                    All ({categories.length})
                  </button>

                  {categories.map((cat) => {
                    const isActive = activeCategoryKey === cat.key;
                    return (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => setActiveCategoryKey(cat.key)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-mono shrink-0 flex items-center gap-1.5 transition-all ${
                          isActive
                            ? "bg-accent text-black font-semibold shadow-sm"
                            : "bg-surface-2 text-fg-muted hover:text-white border border-line"
                        }`}
                      >
                        <span>{cat.shortLabel}</span>
                        <span className="text-xs opacity-75 font-mono">({cat.featureCount})</span>
                      </button>
                    );
                  })}
                </div>

                {/* Status info strip */}
                <div className="flex items-center justify-between text-xs font-mono text-fg-muted pt-1 border-t border-line flex-wrap gap-1">
                  <span>
                    Showing <strong className="text-fg-soft">{filteredFeatures.length}</strong> of {features.length} features across {categories.length} categories
                  </span>
                  {flowMode !== "custom_only" && (
                    <span className="text-fg-muted">
                      {includedCountInTier} included free in {packages[selectedTier].name}
                    </span>
                  )}
                </div>
              </div>

              {/* =================================================================== */}
              {/* SCROLLABLE COMPACT COMPARISON TABLE CONTAINER                        */}
              {/* =================================================================== */}
              <div
                ref={scrollContainerRef}
                className="rounded-2xl border border-line bg-canvas textured overflow-hidden shadow-2xl"
              >
                {/* Sticky Table Header */}
                <div className="sticky top-0 z-20 bg-surface-2 border-b border-line shadow-md">
                  <div className="px-3 sm:px-5 py-2.5 flex items-center text-xs sm:text-xs font-mono uppercase tracking-wider text-fg-muted">
                    <div className="flex-1 min-w-0">
                      Feature & Scope
                    </div>
                    {flowMode !== "custom_only" && (
                      <>
                        <div className="hidden md:block w-20 text-center shrink-0">
                          <span className={selectedTier === "starter" ? "text-accent font-bold" : ""}>Starter</span>
                        </div>
                        <div className="hidden md:block w-20 text-center shrink-0">
                          <span className={selectedTier === "business" ? "text-accent font-bold" : ""}>Business</span>
                        </div>
                        <div className="hidden md:block w-20 text-center shrink-0">
                          <span className={selectedTier === "pro" ? "text-accent font-bold" : ""}>Pro</span>
                        </div>
                      </>
                    )}
                    <div className="w-24 sm:w-28 text-right shrink-0">
                      {flowMode === "custom_only" ? "Price" : "Add-on"}
                    </div>
                  </div>
                </div>

                {/* Scrollable Rows Container */}
                <div
                  className="max-h-[600px] sm:max-h-[660px] 2xl:max-h-[760px] overflow-y-auto divide-y divide-white/[0.04] scrollbar-thin select-text"
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "rgba(52, 211, 153, 0.4) rgba(255, 255, 255, 0.04)",
                    WebkitOverflowScrolling: "touch",
                    touchAction: "pan-y",
                  }}
                >
                  {groupedFeatures.length === 0 ? (
                    <div className="p-12 text-center space-y-2">
                      <p className="text-sm text-fg-muted">No features match your search &ldquo;{searchQuery}&rdquo;</p>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setActiveCategoryKey("all");
                          setStatusFilter("all");
                        }}
                        className="text-xs text-accent underline font-mono"
                      >
                        Clear search and show all categories
                      </button>
                    </div>
                  ) : (
                    groupedFeatures.map(({ category, items }) => {
                      const isCategoryExpanded = Boolean(expandedCategories[category.key]);

                      return (
                        <div key={category.key} className="bg-transparent">
                          {/* Category Accordion Header */}
                          <div
                            onClick={() => toggleCategory(category.key)}
                            className="sticky top-0 z-10 bg-surface/95 backdrop-blur-md px-3 sm:px-5 py-2.5 flex items-center justify-between cursor-pointer border-y border-line hover:bg-surface-2 transition-colors group"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="p-1 rounded bg-white/[0.05] text-accent group-hover:bg-accent group-hover:text-black transition-colors shrink-0">
                                {renderCategoryIcon(category.iconName, "w-3.5 h-3.5")}
                              </span>
                              <div className="flex items-center gap-2 truncate">
                                <span className="text-xs sm:text-xs font-mono text-fg-muted">
                                  {String(category.number).padStart(2, "0")}
                                </span>
                                <h3 className="text-xs sm:text-sm font-semibold text-white tracking-tight truncate">
                                  {category.label}
                                </h3>
                                <span className="text-xs font-mono px-1.5 py-0.5 rounded-full bg-white/[0.04] text-fg-muted shrink-0">
                                  {items.length}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs font-mono text-fg-muted shrink-0">
                              <span className="text-xs hidden lg:inline opacity-75 max-w-[200px] truncate">{category.description}</span>
                              {isCategoryExpanded ? (
                                <ChevronUp className="w-4 h-4 text-fg-muted" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-fg-muted" />
                              )}
                            </div>
                          </div>

                          {/* Category Feature Rows */}
                          {isCategoryExpanded && (
                            <div className="divide-y divide-white/[0.03]">
                              {items.map((feat) => {
                                const isIncludedInCurrent = flowMode !== "custom_only" && feat.availability[selectedTier] === "included";
                                const isSelectedAsAddon = selectedAddonIds.includes(feat.id);
                                const isSelectedAsQuote = selectedQuoteIds.includes(feat.id);
                                const isExpanded = Boolean(expandedDetails[feat.id]);
                                const isMonthly = feat.billingType === "monthly";
                                const isCustomQuote = feat.isCustomQuote || (flowMode !== "custom_only" && feat.availability[selectedTier] === "custom_quote");

                                return (
                                  <div
                                    key={feat.id}
                                    className={`px-3 sm:px-5 py-2 sm:py-2.5 flex items-center gap-2 text-xs transition-colors ${
                                      isSelectedAsAddon || isSelectedAsQuote
                                        ? "bg-accent/20"
                                        : "hover:bg-white/[0.02]"
                                    }`}
                                  >
                                    {/* Feature Name, Description Toggle & Badge */}
                                    <div className="flex-1 min-w-0 space-y-0.5 pr-2">
                                      <div className="flex items-start gap-1.5 min-w-0">
                                        <span className="font-medium text-fg hover:text-white transition-colors line-clamp-2 sm:line-clamp-1">
                                          {feat.name}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFeatureDetail(feat.id);
                                          }}
                                          className="text-fg-muted hover:text-fg-soft p-0.5 rounded transition-colors shrink-0"
                                          title="Toggle details & scope"
                                          aria-label={`Toggle description for ${feat.name}`}
                                        >
                                          <Info className="w-3 h-3" />
                                        </button>
                                        {isMonthly && (
                                          <span className="text-xs font-mono px-1 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 shrink-0">
                                            Monthly
                                          </span>
                                        )}
                                      </div>

                                      {/* Expandable description tooltip */}
                                      {isExpanded && (
                                        <div className="pt-1 text-xs text-fg-muted leading-relaxed bg-surface-2 p-2 rounded-lg border border-line mt-1 space-y-1">
                                          <p>{feat.description}</p>
                                          <div className="text-xs font-mono text-fg-muted flex flex-wrap gap-2">
                                            <span>Starter: {feat.availability.starter}</span>
                                            <span>•</span>
                                            <span>Business: {feat.availability.business}</span>
                                            <span>•</span>
                                            <span>Pro: {feat.availability.pro}</span>
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    {/* Package Availability Columns (hidden in custom_only mode) */}
                                    {flowMode !== "custom_only" && (
                                      <>
                                        <div className="hidden md:flex w-20 justify-center items-center shrink-0">
                                          {renderStatusBadge(feat.availability.starter, feat.availabilityNotes?.starter)}
                                        </div>
                                        <div className="hidden md:flex w-20 justify-center items-center shrink-0">
                                          {renderStatusBadge(feat.availability.business, feat.availabilityNotes?.business)}
                                        </div>
                                        <div className="hidden md:flex w-20 justify-center items-center shrink-0">
                                          {renderStatusBadge(feat.availability.pro, feat.availabilityNotes?.pro)}
                                        </div>
                                      </>
                                    )}

                                    {/* Addon Price & Add Button */}
                                    <div className="w-24 sm:w-28 text-right flex items-center justify-end gap-1.5 shrink-0">
                                      {isIncludedInCurrent ? (
                                        <span
                                          className="text-xs font-mono text-accent font-semibold px-1.5 py-0.5 rounded bg-accent/10 border border-accent/20 truncate"
                                          title="Included free in selected package"
                                        >
                                          Included ✓
                                        </span>
                                      ) : isCustomQuote ? (
                                        <button
                                          type="button"
                                          onClick={() => toggleAddon(feat.id)}
                                          className={`px-2 py-1 rounded text-xs font-mono font-medium transition-all ${
                                            isSelectedAsQuote
                                              ? "bg-accent text-black font-semibold shadow-sm"
                                              : "bg-accent/40 text-accent border border-accent/30 hover:bg-accent/50"
                                          }`}
                                          title="Add to custom quote scope"
                                        >
                                          {isSelectedAsQuote ? "In Quote ✓" : "Quote"}
                                        </button>
                                      ) : feat.addonPrice ? (
                                        <button
                                          type="button"
                                          onClick={() => toggleAddon(feat.id)}
                                          className={`px-2 py-1 rounded text-xs font-mono font-medium tabular-nums transition-all flex items-center gap-1 ${
                                            isSelectedAsAddon
                                              ? "bg-accent text-black font-bold shadow-sm"
                                              : "bg-surface-2 text-fg-soft border border-line hover:border-accent/40 hover:text-white"
                                          }`}
                                          title={`Add ${feat.name} to estimate`}
                                        >
                                          {isSelectedAsAddon ? (
                                            <Check className="w-3 h-3 stroke-[3]" />
                                          ) : (
                                            <Plus className="w-3 h-3 text-accent" />
                                          )}
                                          <span>{formatCurrencyINR(feat.addonPrice)}</span>
                                        </button>
                                      ) : (
                                        <span className="text-fg-muted text-xs font-mono">—</span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Table Bottom Move-Forward Footer Bar */}
                {flowMode !== "custom_only" && (
                  <div className="p-3 bg-surface border-t border-line flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono">
                    <span className="text-fg-muted text-xs text-center sm:text-left">
                      {activeSelectedAddons.length === 0
                        ? `Happy with the ${currentPackage.name} base package without extra features?`
                        : `${activeSelectedAddons.length} add-on${activeSelectedAddons.length > 1 ? "s" : ""} selected for your project.`}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setModalNotes(customNotes);
                        setIsSubmitModalOpen(true);
                        setSubmitPlanSuccess(false);
                        setSubmitPlanError(null);
                      }}
                      className="px-4 py-1.5 rounded-lg bg-accent/20 text-accent border border-accent/30 hover:bg-accent hover:text-black font-semibold text-xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <span>
                        {activeSelectedAddons.length === 0
                          ? `Proceed with ${currentPackage.name} (${formatCurrencyINR(currentPackage.startingPrice)})`
                          : "Proceed with Final Quote"}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

    </>
  );
}
