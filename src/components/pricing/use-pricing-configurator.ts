"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import type { TurnstileRef } from "@/components/ui/turnstile";
import type { BackendPricingData } from "@/lib/services/pricing";
import {
  MASTER_PACKAGES,
  MASTER_CATEGORIES,
  MASTER_FEATURES,
  MasterPackageTier,
  MatrixFeatureItem,
  formatCurrencyINR,
  normalizeMatrixFeatureId,
} from "@/data/pricing-matrix-data";
import { calculatePackageEstimate, DEFAULT_EXPRESS_MULTIPLIER } from "@/lib/package-pricing";

export type PricingFlowMode = "package" | "package_plus_addons" | "custom_only";

/** All state, filtering, totals and submission for the pricing configurator. */
export function usePricingConfigurator(initialData?: BackendPricingData) {
  const searchParams = useSearchParams();

  // Master data sources
  const packages = initialData?.matrixPackages || MASTER_PACKAGES;
  const categories = initialData?.matrixCategories || MASTER_CATEGORIES;
  const features = initialData?.matrixFeatures || MASTER_FEATURES;

  // ---------------------------------------------------------------------------
  // URL Param Initialization
  // ---------------------------------------------------------------------------
  const initialTier: MasterPackageTier = useMemo(() => {
    const raw = searchParams.get("pkg")?.toLowerCase();
    if (raw === "starter" || raw === "business" || raw === "pro") {
      return raw as MasterPackageTier;
    }
    const cat = searchParams.get("cat");
    if (cat === "enterprise" || cat === "ecommerce") return "pro";
    if (cat === "starter" || cat === "portfolio") return "starter";
    return "business";
  }, [searchParams]);

  const initialFlow: PricingFlowMode = useMemo(() => {
    const raw = searchParams.get("flow");
    if (raw === "package" || raw === "package_plus_addons" || raw === "custom_only") {
      return raw;
    }
    return "package";
  }, [searchParams]);

  const initialAddons = useMemo(() => {
    const raw = searchParams.get("addons") || searchParams.get("feat");
    if (!raw) return [];
    const list = raw
      .split(",")
      .map((s) => s.trim())
      .map((id) => normalizeMatrixFeatureId(id))
      .filter((id) => features.some((f) => f.id === id));
    return Array.from(new Set(list));
  }, [searchParams, features]);

  const initialDelivery: "standard" | "express" = useMemo(() => {
    return searchParams.get("speed") === "express" ? "express" : "standard";
  }, [searchParams]);

  // ---------------------------------------------------------------------------
  // Interactive State
  // ---------------------------------------------------------------------------
  const [flowMode, setFlowMode] = useState<PricingFlowMode>(initialFlow);
  const [selectedTier, setSelectedTier] = useState<MasterPackageTier>(initialTier);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>(initialAddons);
  const [selectedQuoteIds, setSelectedQuoteIds] = useState<string[]>([]);
  const [addonQuantities, setAddonQuantities] = useState<Record<string, number>>(() => {
    const quantities: Record<string, number> = {
      website_pages_additional_pages: 1,
      deployment_maintenance_monthly_hours: 1,
      design_frontend_additional_website_pages: 1,
      testing_maintenance_monthly_development_hours: 1,
    };
    // "qty=feature_id:3,other_id:2" lets a shared link, such as one from the AI consultant, carry quantities.
    for (const pair of (searchParams.get("qty") ?? "").split(",")) {
      const [rawId, rawQty] = pair.split(":");
      const id = normalizeMatrixFeatureId((rawId ?? "").trim());
      const qty = Number(rawQty);
      if (id && Number.isInteger(qty) && qty >= 1 && qty <= 100) quantities[id] = qty;
    }
    return quantities;
  });
  const [deliverySpeed, setDeliverySpeed] = useState<"standard" | "express">(initialDelivery);

  // Search, Filters & View Options
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeCategoryKey, setActiveCategoryKey] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "included" | "addon" | "custom_quote">("all");

  // Accordion Expand/Collapse State (Category groups)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    categories.forEach((cat, idx) => {
      initial[cat.key] = idx < 4;
    });
    return initial;
  });

  // Feature tooltip / detail expansion
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});

  const [customNotes, setCustomNotes] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Direct Plan Submit Modal State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [modalName, setModalName] = useState("");
  const [modalEmail, setModalEmail] = useState("");
  const [modalPhone, setModalPhone] = useState("");
  const [modalNotes, setModalNotes] = useState("");
  const [isSubmittingPlan, setIsSubmittingPlan] = useState(false);
  const [submitPlanSuccess, setSubmitPlanSuccess] = useState(false);
  const [submitPlanError, setSubmitPlanError] = useState<string | null>(null);
  const [planTurnstileToken, setPlanTurnstileToken] = useState("");
  const planTurnstileRef = useRef<TurnstileRef>(null);

  // ---------------------------------------------------------------------------
  // URL Synchronization
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("flow", flowMode);
    if (flowMode !== "custom_only") {
      params.set("pkg", selectedTier);
    }
    if (selectedAddonIds.length > 0) {
      params.set("addons", selectedAddonIds.join(","));
    }
    const chosenQuantities = selectedAddonIds
      .filter((id) => (addonQuantities[id] ?? 1) > 1)
      .map((id) => `${id}:${addonQuantities[id]}`);
    if (chosenQuantities.length > 0) {
      params.set("qty", chosenQuantities.join(","));
    }
    if (selectedQuoteIds.length > 0) {
      params.set("quotes", selectedQuoteIds.join(","));
    }
    if (deliverySpeed === "express") {
      params.set("speed", "express");
    }
    if (activeCategoryKey !== "all") {
      params.set("cat", activeCategoryKey);
    }
    const newQuery = params.toString();
    const currentUrl = window.location.pathname + (newQuery ? `?${newQuery}` : "");
    window.history.replaceState(null, "", currentUrl);
  }, [flowMode, selectedTier, selectedAddonIds, selectedQuoteIds, addonQuantities, deliverySpeed, activeCategoryKey]);

  // Addons remain preserved across flow mode transitions

  // ---------------------------------------------------------------------------
  // Feature Search & Filtering Logic
  // ---------------------------------------------------------------------------
  const filteredFeatures = useMemo(() => {
    let list = features;

    if (activeCategoryKey !== "all") {
      list = list.filter((f) => f.category === activeCategoryKey);
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q)
      );
    }

    if (flowMode !== "custom_only" && statusFilter !== "all") {
      list = list.filter((f) => {
        const stat = f.availability[selectedTier];
        if (statusFilter === "included") return stat === "included" || stat === "limited";
        if (statusFilter === "addon") return stat === "addon";
        if (statusFilter === "custom_quote") return stat === "custom_quote";
        return true;
      });
    }

    return list;
  }, [features, activeCategoryKey, searchQuery, statusFilter, selectedTier, flowMode]);

  // Auto-expand categories when search active
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const allOpen: Record<string, boolean> = {};
      categories.forEach((cat) => {
        allOpen[cat.key] = true;
      });
      setExpandedCategories(allOpen);
    }
  }, [searchQuery, categories]);

  // Group filtered features by category
  const groupedFeatures = useMemo(() => {
    const groups: { category: typeof categories[0]; items: MatrixFeatureItem[] }[] = [];
    categories.forEach((cat) => {
      const items = filteredFeatures.filter((f) => f.category === cat.key);
      if (items.length > 0) {
        groups.push({ category: cat, items });
      }
    });
    return groups;
  }, [categories, filteredFeatures]);

  // ---------------------------------------------------------------------------
  // Addon & Quote Toggle Handlers
  // ---------------------------------------------------------------------------
  const toggleAddon = useCallback(
    (featureId: string) => {
      const feat = features.find((f) => f.id === featureId);
      if (!feat) return;

      // In package & package_plus_addons mode, prevent adding features already included
      if (flowMode !== "custom_only" && feat.availability[selectedTier] === "included") return;

      // Handle custom quote items
      if (feat.isCustomQuote || (flowMode !== "custom_only" && feat.availability[selectedTier] === "custom_quote")) {
        setSelectedQuoteIds((prev) =>
          prev.includes(featureId) ? prev.filter((id) => id !== featureId) : [...prev, featureId]
        );
        return;
      }

      setSelectedAddonIds((prev) =>
        prev.includes(featureId) ? prev.filter((id) => id !== featureId) : [...prev, featureId]
      );
    },
    [features, selectedTier, flowMode]
  );

  const removeAddon = useCallback((featureId: string) => {
    setSelectedAddonIds((prev) => prev.filter((id) => id !== featureId));
    setSelectedQuoteIds((prev) => prev.filter((id) => id !== featureId));
  }, []);

  const updateQuantity = useCallback((featureId: string, delta: number) => {
    setAddonQuantities((prev) => {
      const current = prev[featureId] || 1;
      const next = Math.max(1, Math.min(25, current + delta));
      return { ...prev, [featureId]: next };
    });
  }, []);

  const handleExpandAll = () => {
    const allOpen: Record<string, boolean> = {};
    categories.forEach((cat) => {
      allOpen[cat.key] = true;
    });
    setExpandedCategories(allOpen);
  };

  const handleCollapseAll = () => {
    setExpandedCategories({});
  };

  const toggleCategory = (catKey: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catKey]: !prev[catKey],
    }));
  };

  const toggleFeatureDetail = (featId: string) => {
    setExpandedDetails((prev) => ({
      ...prev,
      [featId]: !prev[featId],
    }));
  };

  const handleReset = () => {
    setFlowMode("package");
    setSelectedTier("business");
    setSelectedAddonIds([]);
    setSelectedQuoteIds([]);
    setDeliverySpeed("standard");
    setSearchQuery("");
    setActiveCategoryKey("all");
    setStatusFilter("all");
    setCustomNotes("");
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // ---------------------------------------------------------------------------
  // Budget & Investment Calculations
  // ---------------------------------------------------------------------------
  const currentPackage = packages[selectedTier];
  const basePackagePrice = flowMode === "custom_only" ? 0 : currentPackage.startingPrice;

  // Active selected add-on objects
  const activeSelectedAddons = useMemo(() => {
    const list: MatrixFeatureItem[] = [];
    for (const id of selectedAddonIds) {
      const feat = features.find((f) => f.id === id);
      if (feat) {
        // In package modes, skip features already included
        if (flowMode !== "custom_only" && feat.availability[selectedTier] === "included") {
          continue;
        }
        list.push(feat);
      }
    }
    return list;
  }, [selectedAddonIds, features, selectedTier, flowMode]);

  const activeSelectedQuotes = useMemo(() => {
    const list: MatrixFeatureItem[] = [];
    for (const id of selectedQuoteIds) {
      const feat = features.find((f) => f.id === id);
      if (feat) {
        list.push(feat);
      }
    }
    return list;
  }, [selectedQuoteIds, features]);

  // Totals come from the shared calculation, so the AI consultant and home estimator quote the same amounts.
  const estimate = useMemo(
    () =>
      calculatePackageEstimate({
        tier: selectedTier,
        featureIds: activeSelectedAddons.map((f) => f.id),
        quantities: addonQuantities,
        express: deliverySpeed === "express",
        includePackagePrice: flowMode !== "custom_only",
        packages,
        features,
        expressMultiplier: initialData?.settings?.expressMultiplier ?? DEFAULT_EXPRESS_MULTIPLIER,
      }),
    [selectedTier, activeSelectedAddons, addonQuantities, deliverySpeed, flowMode, packages, features, initialData],
  );

  const onetimeAddonsCost = estimate.addonsTotalINR;
  const monthlyServicesCost = estimate.monthlyTotalINR;
  const onetimeBaseSubtotal = estimate.subtotalINR;
  const expressFee = estimate.expressFeeINR;
  const grandTotalOnetime = estimate.totalINR;

  // Features included free in package count
  const includedCountInTier = useMemo(() => {
    return features.filter((f) => f.availability[selectedTier] === "included").length;
  }, [features, selectedTier]);

  // ---------------------------------------------------------------------------
  // Quotation Link Construction for /contact
  // ---------------------------------------------------------------------------
  const quotationUrl = useMemo(() => {
    const addonsSummary = activeSelectedAddons
      .map((f) => {
        const qty = f.hasQuantity ? ` (Qty: ${addonQuantities[f.id] || 1})` : "";
        const billing = f.billingType === "monthly" ? "/mo" : "";
        return `• ${f.name}${qty}: ${formatCurrencyINR((f.addonPrice || 0) * (addonQuantities[f.id] || 1))}${billing}`;
      })
      .join("\n");

    const quotesSummary = activeSelectedQuotes
      .map((f) => `• ${f.name} [Custom Architecture Quote Required]`)
      .join("\n");

    const flowLabel =
      flowMode === "package"
        ? "Package Only"
        : flowMode === "package_plus_addons"
        ? "Package + Custom Add-ons"
        : "Fully Custom Build (No Package)";

    const message = `Webgent Project Configuration:
- Build Mode: ${flowLabel}
${flowMode !== "custom_only" ? `- Base Package: ${currentPackage.name} (${formatCurrencyINR(currentPackage.startingPrice)})` : "- Base Package: None (Custom Feature Selection)"}
- Delivery SLA: ${deliverySpeed === "express" ? "Express Delivery (+20% SLA)" : "Standard Timeline"}
- One-Time Estimated Development: ${formatCurrencyINR(grandTotalOnetime)}
${monthlyServicesCost > 0 ? `- Monthly Support / Maintenance: ${formatCurrencyINR(monthlyServicesCost)}/mo\n` : ""}${flowMode !== "custom_only" ? `- Included Package Features: ${includedCountInTier} features bundled in base package\n` : ""}${activeSelectedAddons.length > 0 ? `\nSelected Add-ons (${activeSelectedAddons.length}):\n${addonsSummary}\n` : ""}${activeSelectedQuotes.length > 0 ? `\nCustom Quote Requirements (${activeSelectedQuotes.length}):\n${quotesSummary}\n` : ""}${customNotes.trim() ? `\nClient Notes / Reference Links:\n${customNotes.trim()}\n` : ""}
Note: Third-party service charges (hosting, SMS, payment gateway fees, domain, email service) are not included.
100% full source code ownership. Zero vendor lock-in.`;

    const getBudgetBucket = (total: number): string => {
      if (total < 15000) return "under_5k";
      if (total <= 30000) return "5k_10k";
      if (total <= 60000) return "10k_25k";
      return "25k_plus";
    };

    const params = new URLSearchParams({
      service: flowMode === "custom_only" ? "Custom Build" : `${currentPackage.name} Package`,
      budget: getBudgetBucket(grandTotalOnetime),
      message: message,
    });

    return `/contact?${params.toString()}`;
  }, [
    flowMode,
    currentPackage,
    deliverySpeed,
    grandTotalOnetime,
    monthlyServicesCost,
    includedCountInTier,
    activeSelectedAddons,
    activeSelectedQuotes,
    addonQuantities,
    customNotes,
  ]);

  // ---------------------------------------------------------------------------
  // Direct Plan Submit Handler (submits inquiry & triggers email immediately)
  // ---------------------------------------------------------------------------
  const handleSubmitPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitPlanError(null);

    if (!modalName.trim() || !modalEmail.trim()) {
      setSubmitPlanError("Please enter your name and email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(modalEmail.trim())) {
      setSubmitPlanError("Please enter a valid email address.");
      return;
    }

    setIsSubmittingPlan(true);

    const formattedMessage = [
      `[PROJECT PLAN INQUIRY FROM PRICING CALCULATOR]`,
      `• Selected Build Mode: ${flowMode === "custom_only" ? "Custom Feature Selection" : currentPackage.name + " Package"}`,
      `• Estimated One-Time Total: ${formatCurrencyINR(grandTotalOnetime)}`,
      monthlyServicesCost > 0 ? `• Monthly Ongoing Maintenance: ${formatCurrencyINR(monthlyServicesCost)}/mo` : null,
      `• Delivery SLA: ${deliverySpeed === "express" ? "Express Delivery (+20% SLA)" : "Standard Timeline"}`,
      activeSelectedAddons.length > 0
        ? `• Selected Add-ons (${activeSelectedAddons.length}): ${activeSelectedAddons.map((a) => a.name).join(", ")}`
        : null,
      activeSelectedQuotes.length > 0
        ? `• Custom Quote Modules: ${activeSelectedQuotes.map((q) => q.name).join(", ")}`
        : null,
      modalNotes.trim() ? `\n[CLIENT NOTES]\n${modalNotes.trim()}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: modalName.trim(),
          email: modalEmail.trim().toLowerCase(),
          phone: modalPhone.trim() || undefined,
          service: flowMode === "custom_only" ? "Custom Build" : `${currentPackage.name} Package`,
          budget:
            grandTotalOnetime < 30000
              ? "< ₹30,000"
              : grandTotalOnetime < 75000
              ? "₹30,000 – ₹75,000"
              : grandTotalOnetime < 150000
              ? "₹75,000 – ₹1,50,000"
              : "₹1,50,000+",
          message: formattedMessage,
          turnstileToken: planTurnstileToken || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSubmitPlanError(data.error?.message || "Failed to submit plan. Please try again.");
        planTurnstileRef.current?.reset();
        setPlanTurnstileToken("");
        setIsSubmittingPlan(false);
        return;
      }

      setSubmitPlanSuccess(true);
      planTurnstileRef.current?.reset();
      setPlanTurnstileToken("");
    } catch {
      setSubmitPlanError("A network error occurred. Please try again or reach out directly on WhatsApp.");
      planTurnstileRef.current?.reset();
      setPlanTurnstileToken("");
    } finally {
      setIsSubmittingPlan(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Category Icon Renderer Helper
  // ---------------------------------------------------------------------------

  return {
    packages,
    categories,
    features,
    flowMode,
    setFlowMode,
    selectedTier,
    setSelectedTier,
    selectedAddonIds,
    setSelectedAddonIds,
    selectedQuoteIds,
    setSelectedQuoteIds,
    addonQuantities,
    setAddonQuantities,
    deliverySpeed,
    setDeliverySpeed,
    searchQuery,
    setSearchQuery,
    activeCategoryKey,
    setActiveCategoryKey,
    statusFilter,
    setStatusFilter,
    expandedCategories,
    setExpandedCategories,
    expandedDetails,
    setExpandedDetails,
    customNotes,
    setCustomNotes,
    copiedLink,
    setCopiedLink,
    isSubmitModalOpen,
    setIsSubmitModalOpen,
    modalName,
    setModalName,
    modalEmail,
    setModalEmail,
    modalPhone,
    setModalPhone,
    modalNotes,
    setModalNotes,
    isSubmittingPlan,
    setIsSubmittingPlan,
    submitPlanSuccess,
    setSubmitPlanSuccess,
    submitPlanError,
    setSubmitPlanError,
    planTurnstileToken,
    setPlanTurnstileToken,
    searchParams,
    initialTier,
    initialFlow,
    initialDelivery,
    scrollContainerRef,
    planTurnstileRef,
    filteredFeatures,
    groupedFeatures,
    toggleAddon,
    removeAddon,
    updateQuantity,
    handleExpandAll,
    handleCollapseAll,
    toggleCategory,
    toggleFeatureDetail,
    handleReset,
    handleCopyLink,
    currentPackage,
    basePackagePrice,
    activeSelectedAddons,
    activeSelectedQuotes,
    onetimeAddonsCost,
    monthlyServicesCost,
    onetimeBaseSubtotal,
    expressFee,
    grandTotalOnetime,
    includedCountInTier,
    quotationUrl,
    handleSubmitPlan,
  };
}

export type PricingConfigurator = ReturnType<typeof usePricingConfigurator>;
