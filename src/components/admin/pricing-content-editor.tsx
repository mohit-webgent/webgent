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
  Sliders,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-provider";
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
  const confirm = useConfirm();

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
  const handleSaveRef = useRef<(() => void) | undefined>(undefined);
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
          "Saved. The public site may take a few minutes to update.",
        );
      } else {
        toast.success(
          "Pricing Updated",
          "Your pricing changes are live on the site.",
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

  useEffect(() => {
    handleSaveRef.current = handleSave;
  });

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
        toast.success("Reloaded", "Showing the latest saved pricing.");
      } else {
        toast.error("Couldn't reload pricing", json.error?.message || "Unknown error.");
      }
    } catch (err) {
      toast.error("Couldn't reload pricing", err instanceof Error ? err.message : "Network error.");
    } finally {
      setRefreshing(false);
    }
  };

  // Reset to Defaults
  const handleResetToDefaults = async () => {
    if (
      await confirm({
        title: "Reset pricing to defaults?",
        description: "This replaces your custom prices with the defaults. Nothing goes live until you save.",
        confirmText: "Reset pricing",
      })
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header Bar */}
      <div className="bg-surface border border-slate-800/80 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fg tracking-tight flex items-center gap-2.5">
            Pricing & Packages
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Set your packages, base prices, add-ons, feature rates and calculation rules. Saved changes update the pricing page and the AI consultant.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/pricing"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-fg bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all"
            title="Preview public pricing page"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View /pricing
          </Link>

          <button
            type="button"
            onClick={handleRefreshFromServer}
            disabled={refreshing || saving}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-fg bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all disabled:opacity-50"
            title="Reload latest from server"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Reload
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
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-accent-fg bg-accent hover:bg-accent-hover rounded-xl transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Save Changes
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
            <span>You have unsaved changes. Click <strong>Save Changes</strong> or press <strong>Ctrl+S</strong> to publish them.</span>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="text-amber-300 underline font-semibold hover:text-fg cursor-pointer"
          >
            Save now
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-800 space-x-1 overflow-x-auto pb-px">
        {[
          { id: "packages", label: "Core Packages", icon: Package, count: "3 Tiers" },
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
                  ? "border-indigo-500 text-fg bg-slate-900/40 rounded-t-xl"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-slate-500"}`} />
              {tab.label}
              <span className="text-xs px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 font-mono">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: CORE PACKAGES (Starter, Business, Pro) */}
      {activeTab === "packages" && (
        <div className="space-y-6">
          <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl flex items-start gap-3 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-slate-200">Package Pricing</p>
              <p className="mt-0.5 leading-relaxed">
                Set the starting price, badge, delivery time and highlights for each of the three packages.
              </p>
            </div>
          </div>

          {/* Sub-tab selector for the 3 tiers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {SUPPORTED_PACKAGE_TIERS.map((tier) => {
              const pkg = packages[tier];
              const isSelected = selectedPackageTier === tier;
              return (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setSelectedPackageTier(tier)}
                  className={`min-w-0 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 border-indigo-500/60 ring-1 ring-indigo-500/20"
                      : "bg-surface border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                      {pkg.name} Tier
                    </span>
                    {pkg.badge && (
                      <span className="px-2 py-0.5 text-xs font-semibold uppercase rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {pkg.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-fg flex items-center">
                    <span className="text-sm text-slate-400 font-normal mr-1">₹</span>
                    {pkg.startingPrice.toLocaleString("en-IN")}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 truncate">{pkg.tagline}</div>
                </button>
              );
            })}
          </div>

          {/* Active Package Editor Card */}
          {(() => {
            const currentPkg = packages[selectedPackageTier];
            return (
              <div className="bg-surface border border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-fg">
                      Editing {currentPkg.name} Package
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Public pricing card presented on the homepage, pricing matrix, and comparison table.
                    </p>
                  </div>
                  <span className="px-3 py-1 text-xs font-mono font-medium rounded-full bg-slate-800 text-slate-300">
                    Package ID: {currentPkg.id}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Package Name
                    </label>
                    <input
                      type="text"
                      value={currentPkg.name}
                      onChange={(e) => updatePackageField(selectedPackageTier, "name", e.target.value)}
                      className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-fg focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>Starting Price (INR)</span>
                      <span className="text-xs text-slate-500 font-mono">Min ₹1,000</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-slate-500 text-sm">₹</span>
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
                        className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-fg font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Delivery Timeline
                    </label>
                    <div className="relative">
                      <Clock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type="text"
                        value={currentPkg.deliveryTime}
                        onChange={(e) => updatePackageField(selectedPackageTier, "deliveryTime", e.target.value)}
                        placeholder="e.g. 5–7 Business Days"
                        className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-fg focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Tagline
                    </label>
                    <input
                      type="text"
                      value={currentPkg.tagline}
                      onChange={(e) => updatePackageField(selectedPackageTier, "tagline", e.target.value)}
                      className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-fg focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Badge Text (Optional)
                    </label>
                    <input
                      type="text"
                      value={currentPkg.badge || ""}
                      onChange={(e) => updatePackageField(selectedPackageTier, "badge", e.target.value || null)}
                      placeholder="e.g. MOST POPULAR"
                      className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-fg focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Ideal For Description
                    </label>
                    <input
                      type="text"
                      value={currentPkg.idealFor}
                      onChange={(e) => updatePackageField(selectedPackageTier, "idealFor", e.target.value)}
                      className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-fg focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Detailed Summary
                    </label>
                    <textarea
                      rows={2}
                      value={currentPkg.summary}
                      onChange={(e) => updatePackageField(selectedPackageTier, "summary", e.target.value)}
                      className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-fg focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                    />
                  </div>
                </div>

                {/* Key Highlights List */}
                <div className="border-t border-slate-800/80 pt-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-fg flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                        Key Package Deliverables & Highlights
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Bullet points presented on the card checklist.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => addPackageHighlight(selectedPackageTier)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-xl transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Highlight
                    </button>
                  </div>

                  <div className="space-y-2">
                    {currentPkg.keyHighlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-6 text-center text-xs font-mono text-slate-500">
                          {idx + 1}.
                        </span>
                        <input
                          type="text"
                          value={highlight}
                          onChange={(e) =>
                            updatePackageHighlight(selectedPackageTier, idx, e.target.value)
                          }
                          className="flex-1 bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-fg focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => removePackageHighlight(selectedPackageTier, idx)}
                          className="p-2 text-slate-500 hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-500/10 cursor-pointer"
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

      {/* TAB 5: CALCULATION SETTINGS */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          <div className="bg-surface border border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-base font-semibold text-fg">
                Cost Calculation Rules
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                The express delivery surcharge used by /pricing, the home estimator and the AI consultant. Package prices are set under Core Packages; add-on prices come from the /pricing feature list.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
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
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-mono text-fg focus:outline-none focus:border-indigo-500"
                />
                <span className="text-xs text-slate-500 mt-1 block">
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
