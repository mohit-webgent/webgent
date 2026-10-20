"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Save,
  RotateCcw,
  RefreshCw,
  ExternalLink,
  Loader2,
  Package,
  Layers,
  Database,
  Sparkles,
  Sliders,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Search,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import type {
  BackendPricingData,
  PackageDetails,
  WebsiteCategory,
  WebsiteTypeOption,
  FeatureOption,
  PricingOverridesPayload,
} from "@/lib/services/pricing-shared";
import {
  DEFAULT_PRICING_OVERRIDES_PAYLOAD,
  SUPPORTED_PACKAGE_TIERS,
} from "@/lib/services/pricing-shared";

export interface PricingContentEditorProps {
  initialData: BackendPricingData;
}

interface EditorSettingsState {
  basePagesIncluded: number;
  costPerExtraPage: number;
  discountForOnePage: number;
  currency: string;
  currencySymbol: string;
  minProjectCost: number;
  expressMultiplier: number;
}

export function PricingContentEditor({ initialData }: PricingContentEditorProps) {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<
    "packages" | "categories" | "types" | "features" | "settings"
  >("packages");

  // Form states
  const [packages, setPackages] = useState<Record<string, PackageDetails>>(
    initialData.matrixPackages || DEFAULT_PRICING_OVERRIDES_PAYLOAD.matrixPackages,
  );
  const [categories, setCategories] = useState<WebsiteCategory[]>(
    initialData.categories || DEFAULT_PRICING_OVERRIDES_PAYLOAD.categories,
  );
  const [types, setTypes] = useState<WebsiteTypeOption[]>(
    initialData.types || DEFAULT_PRICING_OVERRIDES_PAYLOAD.types,
  );
  const [features, setFeatures] = useState<FeatureOption[]>(
    initialData.features || DEFAULT_PRICING_OVERRIDES_PAYLOAD.features,
  );
  const [settings, setSettings] = useState<EditorSettingsState>({
    basePagesIncluded:
      initialData.settings?.basePagesIncluded ??
      DEFAULT_PRICING_OVERRIDES_PAYLOAD.settings.basePagesIncluded,
    costPerExtraPage:
      initialData.settings?.costPerExtraPage ??
      DEFAULT_PRICING_OVERRIDES_PAYLOAD.settings.costPerExtraPage,
    discountForOnePage:
      initialData.settings?.discountForOnePage ??
      DEFAULT_PRICING_OVERRIDES_PAYLOAD.settings.discountForOnePage,
    currency: initialData.settings?.currency ?? "INR",
    currencySymbol: initialData.settings?.currencySymbol ?? "₹",
    minProjectCost:
      initialData.settings?.minProjectCost ??
      DEFAULT_PRICING_OVERRIDES_PAYLOAD.settings.minProjectCost ??
      4999,
    expressMultiplier:
      initialData.settings?.expressMultiplier ??
      DEFAULT_PRICING_OVERRIDES_PAYLOAD.settings.expressMultiplier ??
      0.2,
  });

  // Saved snapshot for dirty detection
  const [savedSnapshot, setSavedSnapshot] = useState<string>(() =>
    JSON.stringify({
      matrixPackages: initialData.matrixPackages || DEFAULT_PRICING_OVERRIDES_PAYLOAD.matrixPackages,
      categories: initialData.categories || DEFAULT_PRICING_OVERRIDES_PAYLOAD.categories,
      types: initialData.types || DEFAULT_PRICING_OVERRIDES_PAYLOAD.types,
      features: initialData.features || DEFAULT_PRICING_OVERRIDES_PAYLOAD.features,
      settings: initialData.settings,
    }),
  );

  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [featureSearch, setFeatureSearch] = useState("");
  const [selectedPackageTier, setSelectedPackageTier] = useState<"starter" | "business" | "pro">(
    "starter",
  );

  // Compute dirty status
  const currentSnapshot = JSON.stringify({
    matrixPackages: packages,
    categories,
    types,
    features,
    settings,
  });
  const isDirty = currentSnapshot !== savedSnapshot;

  // Unsaved changes confirmation before navigating away
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Keyboard shortcut Ctrl+S / Cmd+S
  const handleSaveRef = useRef<() => void>();
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (isDirty && !saving) {
          handleSaveRef.current?.();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDirty, saving]);

  // Handle Save
  const handleSave = async () => {
    if (saving) return;
    setSaving(true);

    try {
      const payload: PricingOverridesPayload = {
        matrixPackages: {
          starter: packages.starter,
          business: packages.business,
          pro: packages.pro,
        },
        categories,
        types,
        features,
        settings,
      };

      const res = await fetch("/api/admin/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const errorMsg =
          data.error?.message || "Failed to update pricing configuration.";
        toast.error("Save Failed", errorMsg);
        return;
      }

      setSavedSnapshot(JSON.stringify(payload));

      if (data.meta?.cacheRefreshed === false) {
        toast.warning(
          "Saved with Notice",
          "Pricing saved to database. Warning: Public CDN cache revalidation encountered errors.",
        );
      } else {
        toast.success(
          "Pricing Updated",
          "All pricing packages, rates, and calculator engines synchronized.",
        );
      }
    } catch (err) {
      toast.error(
        "Network Error",
        err instanceof Error ? err.message : "Failed to connect to admin API.",
      );
    } finally {
      setSaving(false);
    }
  };

  handleSaveRef.current = handleSave;

  // Handle Refresh from Server
  const handleRefreshFromServer = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const res = await fetch("/api/admin/pricing", { cache: "no-store" });
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        const d: BackendPricingData = json.data;
        setPackages(d.matrixPackages || DEFAULT_PRICING_OVERRIDES_PAYLOAD.matrixPackages);
        setCategories(d.categories || DEFAULT_PRICING_OVERRIDES_PAYLOAD.categories);
        setTypes(d.types || DEFAULT_PRICING_OVERRIDES_PAYLOAD.types);
        setFeatures(d.features || DEFAULT_PRICING_OVERRIDES_PAYLOAD.features);
        if (d.settings) {
          setSettings((prev) => ({ ...prev, ...d.settings }));
        }
        setSavedSnapshot(
          JSON.stringify({
            matrixPackages: d.matrixPackages || DEFAULT_PRICING_OVERRIDES_PAYLOAD.matrixPackages,
            categories: d.categories || DEFAULT_PRICING_OVERRIDES_PAYLOAD.categories,
            types: d.types || DEFAULT_PRICING_OVERRIDES_PAYLOAD.types,
            features: d.features || DEFAULT_PRICING_OVERRIDES_PAYLOAD.features,
            settings: d.settings,
          }),
        );
        toast.success("Synchronized", "Reloaded current pricing data from server.");
      } else {
        toast.error("Sync Failed", json.error?.message || "Unknown error.");
      }
    } catch (err) {
      toast.error("Sync Error", err instanceof Error ? err.message : "Network error.");
    } finally {
      setRefreshing(false);
    }
  };

  // Reset to Defaults
  const handleResetToDefaults = () => {
    if (
      window.confirm(
        "Are you sure you want to restore standard Webgent default pricing rates? All custom overrides will be reset.",
      )
    ) {
      setPackages({
        starter: { ...DEFAULT_PRICING_OVERRIDES_PAYLOAD.matrixPackages.starter },
        business: { ...DEFAULT_PRICING_OVERRIDES_PAYLOAD.matrixPackages.business },
        pro: { ...DEFAULT_PRICING_OVERRIDES_PAYLOAD.matrixPackages.pro },
      });
      setCategories([...DEFAULT_PRICING_OVERRIDES_PAYLOAD.categories]);
      setTypes([...DEFAULT_PRICING_OVERRIDES_PAYLOAD.types]);
      setFeatures(
        DEFAULT_PRICING_OVERRIDES_PAYLOAD.features.map((f) => ({
          ...f,
          costNote: f.costNote ?? undefined,
        })),
      );
      setSettings({
        basePagesIncluded: DEFAULT_PRICING_OVERRIDES_PAYLOAD.settings.basePagesIncluded,
        costPerExtraPage: DEFAULT_PRICING_OVERRIDES_PAYLOAD.settings.costPerExtraPage,
        discountForOnePage: DEFAULT_PRICING_OVERRIDES_PAYLOAD.settings.discountForOnePage,
        currency: DEFAULT_PRICING_OVERRIDES_PAYLOAD.settings.currency,
        currencySymbol: DEFAULT_PRICING_OVERRIDES_PAYLOAD.settings.currencySymbol,
        minProjectCost: DEFAULT_PRICING_OVERRIDES_PAYLOAD.settings.minProjectCost ?? 4999,
        expressMultiplier: DEFAULT_PRICING_OVERRIDES_PAYLOAD.settings.expressMultiplier ?? 0.2,
      });
      toast.info(
        "Reset to Defaults",
        "Values reset. Click 'Save Changes' to commit to database.",
      );
    }
  };

  // Helpers to update package
  const updatePackageField = (
    tier: "starter" | "business" | "pro",
    field: keyof PackageDetails,
    val: unknown,
  ) => {
    setPackages((prev) => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        [field]: val,
      },
    }));
  };

  const addPackageHighlight = (tier: "starter" | "business" | "pro") => {
    setPackages((prev) => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        keyHighlights: [...prev[tier].keyHighlights, "New Feature Highlight"],
      },
    }));
  };

  const updatePackageHighlight = (
    tier: "starter" | "business" | "pro",
    index: number,
    val: string,
  ) => {
    setPackages((prev) => {
      const updated = [...prev[tier].keyHighlights];
      updated[index] = val;
      return {
        ...prev,
        [tier]: {
          ...prev[tier],
          keyHighlights: updated,
        },
      };
    });
  };

  const removePackageHighlight = (
    tier: "starter" | "business" | "pro",
    index: number,
  ) => {
    setPackages((prev) => {
      if (prev[tier].keyHighlights.length <= 1) {
        toast.error("Minimum 1 highlight required");
        return prev;
      }
      return {
        ...prev,
        [tier]: {
          ...prev[tier],
          keyHighlights: prev[tier].keyHighlights.filter((_, i) => i !== index),
        },
      };
    });
  };

  // Filtered features
  const filteredFeatures = features.filter(
    (f) =>
      f.name.toLowerCase().includes(featureSearch.toLowerCase()) ||
      f.categoryTag.toLowerCase().includes(featureSearch.toLowerCase()) ||
      f.id.toLowerCase().includes(featureSearch.toLowerCase()),
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header Bar */}
      <div className="bg-[#0f0f11] border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Authoritative Configurator
            </span>
            <span className="px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Prisma: pricing_overrides
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            Pricing & Packages Manager
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
            Configure core package tiers, category base prices, architecture add-ons, feature rates, and calculation rules. Changes propagate to <code className="text-zinc-300">/pricing</code> and AI Consultant automatically.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/pricing"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-all"
            title="Preview public pricing page"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View /pricing
          </Link>

          <button
            type="button"
            onClick={handleRefreshFromServer}
            disabled={refreshing || saving}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-all disabled:opacity-50"
            title="Reload latest from server"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Sync Server
          </button>

          <button
            type="button"
            onClick={handleResetToDefaults}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-xl transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-black bg-white hover:bg-zinc-200 active:bg-zinc-300 rounded-xl transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Save Changes {isDirty && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Dirty Warning Pill */}
      {isDirty && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-amber-200 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>You have unsaved pricing edits. Click <strong>Save Changes</strong> (or press <strong>Ctrl+S</strong>) to persist.</span>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="text-amber-300 underline font-semibold hover:text-white cursor-pointer"
          >
            Save now
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-zinc-800 space-x-1 overflow-x-auto pb-px">
        {[
          { id: "packages", label: "Core Packages", icon: Package, count: "3 Tiers" },
          { id: "categories", label: "Category Rates", icon: Layers, count: `${categories.length}` },
          { id: "types", label: "Architecture Add-ons", icon: Database, count: `${types.length}` },
          { id: "features", label: "Feature Catalog", icon: Sparkles, count: `${features.length}` },
          { id: "settings", label: "Calculation Rules", icon: Sliders, count: "Settings" },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "border-emerald-500 text-white bg-zinc-900/40 rounded-t-xl"
                  : "border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-zinc-500"}`} />
              {tab.label}
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-400 font-mono">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: CORE PACKAGES (Starter, Business, Pro) */}
      {activeTab === "packages" && (
        <div className="space-y-6">
          <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-start gap-3 text-xs text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-zinc-200">Authoritative Package Tier Rates</p>
              <p className="mt-0.5 leading-relaxed">
                Configure commercial starting prices, badges, delivery timelines, and key highlights for the 3 main tiers. The 40-feature comparative deliverable matrix (<code className="text-zinc-300">MASTER_FEATURES</code>) provides the structural engineering baseline for multi-tier deliverables.
              </p>
            </div>
          </div>

          {/* Sub-tab selector for the 3 tiers */}
          <div className="flex gap-2">
            {SUPPORTED_PACKAGE_TIERS.map((tier) => {
              const pkg = packages[tier];
              const isSelected = selectedPackageTier === tier;
              return (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setSelectedPackageTier(tier)}
                  className={`flex-1 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-zinc-900 border-emerald-500/60 ring-1 ring-emerald-500/20"
                      : "bg-[#0f0f11] border-zinc-800/80 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs uppercase font-bold tracking-wider text-zinc-400">
                      {pkg.name} Tier
                    </span>
                    {pkg.badge && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {pkg.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-white flex items-center">
                    <span className="text-sm text-zinc-400 font-normal mr-1">₹</span>
                    {pkg.startingPrice.toLocaleString("en-IN")}
                  </div>
                  <div className="text-xs text-zinc-400 mt-1 truncate">{pkg.tagline}</div>
                </button>
              );
            })}
          </div>

          {/* Active Package Editor Card */}
          {(() => {
            const currentPkg = packages[selectedPackageTier];
            return (
              <div className="bg-[#0f0f11] border border-zinc-800/80 rounded-2xl p-6 space-y-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      Editing {currentPkg.name} Package
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Public pricing card presented on the homepage, pricing matrix, and comparison table.
                    </p>
                  </div>
                  <span className="px-3 py-1 text-xs font-mono font-medium rounded-full bg-zinc-800 text-zinc-300">
                    Package ID: {currentPkg.id}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Package Name
                    </label>
                    <input
                      type="text"
                      value={currentPkg.name}
                      onChange={(e) => updatePackageField(selectedPackageTier, "name", e.target.value)}
                      className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center justify-between">
                      <span>Starting Price (INR)</span>
                      <span className="text-[10px] text-zinc-500 font-mono">Min ₹1,000</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-zinc-500 text-sm">₹</span>
                      <input
                        type="number"
                        min="1000"
                        step="500"
                        value={currentPkg.startingPrice}
                        onChange={(e) =>
                          updatePackageField(
                            selectedPackageTier,
                            "startingPrice",
                            parseInt(e.target.value, 10) || 0,
                          )
                        }
                        className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Delivery Timeline
                    </label>
                    <div className="relative">
                      <Clock className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                      <input
                        type="text"
                        value={currentPkg.deliveryTime}
                        onChange={(e) => updatePackageField(selectedPackageTier, "deliveryTime", e.target.value)}
                        placeholder="e.g. 5–7 Business Days"
                        className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Tagline
                    </label>
                    <input
                      type="text"
                      value={currentPkg.tagline}
                      onChange={(e) => updatePackageField(selectedPackageTier, "tagline", e.target.value)}
                      className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Badge Text (Optional)
                    </label>
                    <input
                      type="text"
                      value={currentPkg.badge || ""}
                      onChange={(e) => updatePackageField(selectedPackageTier, "badge", e.target.value || null)}
                      placeholder="e.g. MOST POPULAR"
                      className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Ideal For Description
                    </label>
                    <input
                      type="text"
                      value={currentPkg.idealFor}
                      onChange={(e) => updatePackageField(selectedPackageTier, "idealFor", e.target.value)}
                      className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Detailed Summary
                    </label>
                    <textarea
                      rows={2}
                      value={currentPkg.summary}
                      onChange={(e) => updatePackageField(selectedPackageTier, "summary", e.target.value)}
                      className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                    />
                  </div>
                </div>

                {/* Key Highlights List */}
                <div className="border-t border-zinc-800/80 pt-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Key Package Deliverables & Highlights
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Bullet points presented on the card checklist.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => addPackageHighlight(selectedPackageTier)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Highlight
                    </button>
                  </div>

                  <div className="space-y-2">
                    {currentPkg.keyHighlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-6 text-center text-xs font-mono text-zinc-500">
                          {idx + 1}.
                        </span>
                        <input
                          type="text"
                          value={highlight}
                          onChange={(e) =>
                            updatePackageHighlight(selectedPackageTier, idx, e.target.value)
                          }
                          className="flex-1 bg-zinc-900/80 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => removePackageHighlight(selectedPackageTier, idx)}
                          className="p-2 text-zinc-500 hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-500/10 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 2: CATEGORY STARTING RATES */}
      {activeTab === "categories" && (
        <div className="space-y-4">
          <div className="bg-[#0f0f11] border border-zinc-800/80 rounded-2xl p-5 mb-4">
            <h2 className="text-sm font-semibold text-white">Project Category Starting Rates</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Defines the initial baseline scope and cost for each business discipline in the interactive budget calculator and AI Consultant quoting engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat, idx) => (
              <div
                key={cat.id}
                className="bg-[#0f0f11] border border-zinc-800/80 rounded-2xl p-5 space-y-4 shadow-md hover:border-zinc-700 transition-all"
              >
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">{cat.title}</h3>
                    <span className="text-[10px] font-mono text-zinc-500">ID: {cat.id}</span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-zinc-800 text-zinc-300">
                    {cat.deliveryDays}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Starting Price (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-zinc-500 text-xs">₹</span>
                      <input
                        type="number"
                        min="1000"
                        step="500"
                        value={cat.startingPrice}
                        onChange={(e) => {
                          const updated = [...categories];
                          updated[idx] = {
                            ...cat,
                            startingPrice: parseInt(e.target.value, 10) || 0,
                          };
                          setCategories(updated);
                        }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-7 pr-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={cat.subtitle}
                      onChange={(e) => {
                        const updated = [...categories];
                        updated[idx] = { ...cat, subtitle: e.target.value };
                        setCategories(updated);
                      }}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                        Delivery Days
                      </label>
                      <input
                        type="text"
                        value={cat.deliveryDays}
                        onChange={(e) => {
                          const updated = [...categories];
                          updated[idx] = { ...cat, deliveryDays: e.target.value };
                          setCategories(updated);
                        }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                        Rec. Pages
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={cat.recommendedPages}
                        onChange={(e) => {
                          const updated = [...categories];
                          updated[idx] = {
                            ...cat,
                            recommendedPages: parseInt(e.target.value, 10) || 1,
                          };
                          setCategories(updated);
                        }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ARCHITECTURE TYPES (Static vs. Dynamic) */}
      {activeTab === "types" && (
        <div className="space-y-4">
          <div className="bg-[#0f0f11] border border-zinc-800/80 rounded-2xl p-5 mb-4">
            <h2 className="text-sm font-semibold text-white">Architecture Options & Add-on Fees</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Static websites have 0 additional cost. Dynamic websites include database setup, server backend, and CMS/dashboard integration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {types.map((typeOption, idx) => (
              <div
                key={typeOption.id}
                className="bg-[#0f0f11] border border-zinc-800/80 rounded-2xl p-6 space-y-4 shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white capitalize">{typeOption.title}</h3>
                    <span className="text-xs text-zinc-400">{typeOption.subtitle}</span>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-md bg-zinc-800 text-emerald-400">
                    {typeOption.id === "static" ? "Base (₹0)" : `+₹${typeOption.additionalCost.toLocaleString("en-IN")}`}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={typeOption.title}
                      onChange={(e) => {
                        const updated = [...types];
                        updated[idx] = { ...typeOption, title: e.target.value };
                        setTypes(updated);
                      }}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={typeOption.subtitle}
                      onChange={(e) => {
                        const updated = [...types];
                        updated[idx] = { ...typeOption, subtitle: e.target.value };
                        setTypes(updated);
                      }}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Additional Architecture Cost (INR)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-zinc-500 text-sm">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="500"
                        value={typeOption.additionalCost}
                        onChange={(e) => {
                          const updated = [...types];
                          updated[idx] = {
                            ...typeOption,
                            additionalCost: parseInt(e.target.value, 10) || 0,
                          };
                          setTypes(updated);
                        }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3.5 py-2 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={typeOption.description}
                      onChange={(e) => {
                        const updated = [...types];
                        updated[idx] = { ...typeOption, description: e.target.value };
                        setTypes(updated);
                      }}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Best For
                    </label>
                    <input
                      type="text"
                      value={typeOption.bestFor}
                      onChange={(e) => {
                        const updated = [...types];
                        updated[idx] = { ...typeOption, bestFor: e.target.value };
                        setTypes(updated);
                      }}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: FEATURE CATALOG & ADD-ONS */}
      {activeTab === "features" && (
        <div className="space-y-4">
          <div className="bg-[#0f0f11] border border-zinc-800/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Popular Features & Add-on Prices</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Manage standalone pricing for interactive features, payment gateways, booking calendars, and integrations.
              </p>
            </div>
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search features..."
                value={featureSearch}
                onChange={(e) => setFeatureSearch(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFeatures.map((feat) => {
              const originalIndex = features.findIndex((f) => f.id === feat.id);
              return (
                <div
                  key={feat.id}
                  className="bg-[#0f0f11] border border-zinc-800/80 rounded-2xl p-4 space-y-3 shadow-md hover:border-zinc-700 transition-all"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
                    <div>
                      <h4 className="text-sm font-bold text-white leading-tight">{feat.name}</h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                          {feat.categoryTag}
                        </span>
                        {feat.includedInDynamic && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                            Bundled Dynamic
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2 min-h-[32px]">
                    {feat.simpleDescription}
                  </p>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Add-on Rate (INR)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-zinc-500 text-xs">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="500"
                        value={feat.price}
                        onChange={(e) => {
                          const updated = [...features];
                          updated[originalIndex] = {
                            ...feat,
                            price: parseInt(e.target.value, 10) || 0,
                          };
                          setFeatures(updated);
                        }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-7 pr-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: CALCULATION SETTINGS */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          <div className="bg-[#0f0f11] border border-zinc-800/80 rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="border-b border-zinc-800 pb-4">
              <h2 className="text-base font-semibold text-white">
                Global Cost Calculation Engine Rules
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Defines page step increments, multi-page discounts, and express delivery surcharges across the entire platform.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Base Pages Included in Starting Price
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={settings.basePagesIncluded}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      basePagesIncluded: parseInt(e.target.value, 10) || 1,
                    }))
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[11px] text-zinc-500 mt-1 block">Default: 5 pages</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Cost per Extra Page (INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-zinc-500 text-sm">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={settings.costPerExtraPage}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        costPerExtraPage: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <span className="text-[11px] text-zinc-500 mt-1 block">Default: ₹1,000 / page</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Discount for 1-Page Landing Sites (INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-zinc-500 text-sm">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={settings.discountForOnePage}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        discountForOnePage: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <span className="text-[11px] text-zinc-500 mt-1 block">
                  Subtracted if pageCount = 1 (Default: ₹2,000)
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Minimum Project Floor Cost (INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-zinc-500 text-sm">₹</span>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    value={settings.minProjectCost ?? 4999}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        minProjectCost: parseInt(e.target.value, 10) || 1000,
                      }))
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <span className="text-[11px] text-zinc-500 mt-1 block">Default: ₹4,999 floor</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Express Delivery Surcharge (0.2 = 20%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.expressMultiplier ?? 0.2}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      expressMultiplier: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[11px] text-zinc-500 mt-1 block">
                  Multiplier added to subtotal for priority delivery (Default: 0.20)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
