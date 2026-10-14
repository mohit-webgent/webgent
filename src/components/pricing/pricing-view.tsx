"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Check,
  Plus,
  Minus,
  RotateCcw,
  ArrowRight,
  Shield,
  Zap,
  Building2,
  ShoppingBag,
  HeartPulse,
  User,
  Sparkles,
  Home,
  Utensils,
  GraduationCap,
  Layers,
  CreditCard,
  MessageCircle,
  Send,
  Calendar,
  Lock,
  LayoutDashboard,
  BookOpen,
  Image as ImageIcon,
  Mail,
  Search,
  Globe,
  Bot,
  CheckCircle2,
  Share2,
  Clock,
  FileText,
  X,
  Database,
  ArrowDownCircle,
} from "lucide-react";
import { BackendPricingData } from "@/lib/services/pricing";
import {
  WEBSITE_CATEGORIES,
  WEBSITE_TYPES,
  POPULAR_FEATURES,
  BASE_PAGES_INCLUDED,
  COST_PER_EXTRA_PAGE,
  DISCOUNT_FOR_ONE_PAGE,
  FeatureOption,
} from "@/data/configurator-data";

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

const FILTER_GROUPS: { id: string; label: string; match: (f: FeatureOption) => boolean }[] = [
  { id: "all", label: "All Features", match: () => true },
  {
    id: "communication",
    label: "Lead Gen & Chat",
    match: (f) =>
      f.categoryTag === "Communication" ||
      f.categoryTag === "Automation" ||
      f.id.includes("whatsapp") ||
      f.id.includes("form") ||
      f.id.includes("email"),
  },
  {
    id: "commerce",
    label: "Payments & Store",
    match: (f) =>
      f.categoryTag === "Payments" ||
      f.categoryTag === "E-Commerce" ||
      f.id.includes("payment") ||
      f.id.includes("cart"),
  },
  {
    id: "portal",
    label: "Booking & Portals",
    match: (f) =>
      f.categoryTag === "Functionality" ||
      f.categoryTag === "Security" ||
      f.categoryTag === "Management" ||
      f.id.includes("booking") ||
      f.id.includes("auth") ||
      f.id.includes("admin"),
  },
  {
    id: "growth",
    label: "SEO, Speed & Media",
    match: (f) =>
      f.categoryTag === "Growth" ||
      f.categoryTag === "Performance" ||
      f.categoryTag === "Design" ||
      f.categoryTag === "Content" ||
      f.id.includes("seo") ||
      f.id.includes("speed") ||
      f.id.includes("animation") ||
      f.id.includes("gallery") ||
      f.id.includes("blog"),
  },
  {
    id: "advanced",
    label: "AI & Multi-Language",
    match: (f) =>
      f.categoryTag === "AI Integration" ||
      f.id.includes("ai") ||
      f.id.includes("multilanguage"),
  },
];

interface PricingViewProps {
  initialData?: BackendPricingData;
}

export function PricingView({ initialData }: PricingViewProps) {
  const searchParams = useSearchParams();

  // Backend data state (initialized from SSR, revalidated via API if available)
  const [backendData, setBackendData] = useState<BackendPricingData>(
    initialData || {
      categories: WEBSITE_CATEGORIES,
      types: WEBSITE_TYPES,
      features: POPULAR_FEATURES,
      settings: {
        basePagesIncluded: BASE_PAGES_INCLUDED,
        costPerExtraPage: COST_PER_EXTRA_PAGE,
        discountForOnePage: DISCOUNT_FOR_ONE_PAGE,
        currency: "INR",
        currencySymbol: "₹",
      },
    }
  );

  // Client-side background sync with /api/pricing to guarantee 100% backend dependency
  useEffect(() => {
    let isMounted = true;
    fetch("/api/pricing")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (isMounted && json && json.success && json.data) {
          setBackendData(json.data);
        }
      })
      .catch((err) => {
        console.warn("Pricing live sync fallback to SSR data:", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const categories = backendData.categories;
  const types = backendData.types;
  const allFeatures = backendData.features;
  const settings = backendData.settings;

  // Initial State from URL params or defaults
  const initialCategory = searchParams.get("cat") || "business";
  const initialType = (searchParams.get("type") as "static" | "dynamic") || "static";
  const initialPages = parseInt(searchParams.get("pages") || "5", 10);
  const initialFeatures = useMemo(() => {
    const raw = searchParams.get("feat");
    if (!raw) {
      const cat = categories.find((c) => c.id === initialCategory);
      return cat ? cat.defaultFeatures : ["contact_form", "whatsapp_chat", "seo_basic"];
    }
    return raw.split(",").filter(Boolean);
  }, [searchParams, initialCategory, categories]);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(initialCategory);
  const [selectedTypeId, setSelectedTypeId] = useState<"static" | "dynamic">(initialType);
  const [pageCount, setPageCount] = useState<number>(Math.max(1, Math.min(30, initialPages)));
  const [deliverySpeed, setDeliverySpeed] = useState<"standard" | "express">("standard");
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<string[]>(initialFeatures);
  const [topCategoryFilter, setTopCategoryFilter] = useState<string>("all");
  const [formSearchQuery, setFormSearchQuery] = useState<string>("");
  const [customNotes, setCustomNotes] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Selected category object
  const currentCategory = useMemo(() => {
    return categories.find((c) => c.id === selectedCategoryId) || categories[0];
  }, [selectedCategoryId, categories]);

  // Selected type object
  const currentType = useMemo(() => {
    return types.find((t) => t.id === selectedTypeId) || types[0];
  }, [selectedTypeId, types]);

  // Synchronize state changes to URL query string without causing full reload
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategoryId !== "business") params.set("cat", selectedCategoryId);
    if (selectedTypeId !== "static") params.set("type", selectedTypeId);
    if (pageCount !== 5) params.set("pages", String(pageCount));
    if (selectedFeatureIds.length > 0) params.set("feat", selectedFeatureIds.join(","));

    const qs = params.toString();
    const newPath = qs ? `/pricing?${qs}` : "/pricing";
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", newPath);
    }
  }, [selectedCategoryId, selectedTypeId, pageCount, selectedFeatureIds]);

  // Reactive toggle feature function
  const toggleFeature = useCallback(
    (featId: string) => {
      // If dynamic architecture is selected, Admin Panel is automatically included
      if (featId === "admin_panel" && selectedTypeId === "dynamic") return;

      setSelectedFeatureIds((prev) => {
        if (prev.includes(featId)) {
          return prev.filter((id) => id !== featId);
        } else {
          return [...prev, featId];
        }
      });
    },
    [selectedTypeId]
  );

  // Handle Category Change
  const handleCategoryChange = (catId: string) => {
    setSelectedCategoryId(catId);
    const cat = categories.find((c) => c.id === catId);
    if (cat) {
      setPageCount(cat.recommendedPages);
      // Set to the category's curated defaults
      setSelectedFeatureIds(cat.defaultFeatures);
    }
  };

  // Handle Architecture Change
  const handleTypeChange = (typeId: "static" | "dynamic") => {
    setSelectedTypeId(typeId);
    if (typeId === "dynamic") {
      setSelectedFeatureIds((prev) =>
        prev.includes("admin_panel") ? prev : [...prev, "admin_panel"]
      );
    }
  };

  // Change Pages
  const handlePagesChange = (newCount: number) => {
    setPageCount(Math.max(1, Math.min(30, newCount)));
  };

  // Reset all to standard defaults
  const handleReset = () => {
    setSelectedCategoryId("business");
    setSelectedTypeId("static");
    setPageCount(5);
    setDeliverySpeed("standard");
    setCustomNotes("");
    setSelectedFeatureIds(["contact_form", "whatsapp_chat", "seo_basic"]);
  };

  // Select recommended features for current category
  const handleSelectRecommended = () => {
    if (currentCategory && currentCategory.defaultFeatures) {
      setSelectedFeatureIds(currentCategory.defaultFeatures);
    }
  };

  // Clear all optional features
  const handleClearFeatures = () => {
    if (selectedTypeId === "dynamic") {
      setSelectedFeatureIds(["admin_panel"]);
    } else {
      setSelectedFeatureIds([]);
    }
  };

  // Share estimate URL
  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Dynamic Live Calculation
  const {
    baseCategoryPrice,
    typePrice,
    pagesPrice,
    featuresCost,
    expressPrice,
    selectedFeaturesList,
    grandTotal,
    estimatedDays,
  } = useMemo(() => {
    const base = currentCategory.startingPrice;
    const typeCost = currentType.additionalCost;

    let pagesCost = 0;
    if (pageCount === 1) {
      pagesCost = -settings.discountForOnePage;
    } else if (pageCount > settings.basePagesIncluded) {
      pagesCost = (pageCount - settings.basePagesIncluded) * settings.costPerExtraPage;
    }

    let featCost = 0;
    const fList: FeatureOption[] = [];

    selectedFeatureIds.forEach((id) => {
      const feat = allFeatures.find((f) => f.id === id);
      if (!feat) return;

      const isBundledInDynamic = feat.id === "admin_panel" && selectedTypeId === "dynamic";
      if (!isBundledInDynamic) {
        featCost += feat.price;
      }
      fList.push(feat);
    });

    const standardTotal = Math.max(4999, base + typeCost + pagesCost + featCost);
    const expressCost = deliverySpeed === "express" ? Math.round(standardTotal * 0.2) : 0;
    const total = standardTotal + expressCost;

    let days = currentCategory.deliveryDays;
    if (deliverySpeed === "express") {
      days = "Fast-Track Priority (3–5 Days)";
    } else if (selectedTypeId === "dynamic" || pageCount > 8 || fList.length > 5) {
      days = "2–3 Weeks";
    }

    return {
      baseCategoryPrice: base,
      typePrice: typeCost,
      pagesPrice: pagesCost,
      featuresCost: featCost,
      expressPrice: expressCost,
      selectedFeaturesList: fList,
      subtotal: standardTotal,
      grandTotal: total,
      estimatedDays: days,
    };
  }, [
    currentCategory,
    currentType,
    pageCount,
    selectedFeatureIds,
    selectedTypeId,
    deliverySpeed,
    allFeatures,
    settings,
  ]);

  // Pre-filled URL for Contact Page
  const quotationUrl = useMemo(() => {
    const featuresSummary = selectedFeaturesList
      .map((f) => `• ${f.name} (${f.id === "admin_panel" && selectedTypeId === "dynamic" ? "Included Free" : formatINR(f.price)})`)
      .join("\n");

    const message = `Website Requirements Specification:
- Category: ${currentCategory.title} (${formatINR(currentCategory.startingPrice)})
- Architecture: ${currentType.title} (${currentType.additionalCost > 0 ? `+${formatINR(currentType.additionalCost)}` : "Included"})
- Pages: ${pageCount} Custom Pages (${pagesPrice > 0 ? `+${formatINR(pagesPrice)}` : pagesPrice < 0 ? `-₹2,000` : "Included in Base"})
- Delivery SLA: ${deliverySpeed === "express" ? "Express Delivery (+20%)" : "Standard Timeline"}
- Selected Features (${selectedFeaturesList.length} items, Total: ${formatINR(featuresCost)}):
${featuresSummary || "• Standard contact form only"}
${customNotes.trim() ? `- Notes / Reference: ${customNotes.trim()}` : ""}
- Total Estimated Investment: ${formatINR(grandTotal)}
- Target Delivery Timeline: ${estimatedDays}
- Note: Domain & hosting direct to client at actuals. 100% full source code ownership.`;

    const getBudgetBucket = (total: number): string => {
      if (total < 25000) return "under_5k";
      if (total <= 50000) return "5k_10k";
      if (total <= 100000) return "10k_25k";
      return "25k_plus";
    };

    const params = new URLSearchParams({
      service: currentCategory.title,
      budget: getBudgetBucket(grandTotal),
      message: message,
    });

    return `/contact?${params.toString()}`;
  }, [
    currentCategory,
    currentType,
    pageCount,
    pagesPrice,
    deliverySpeed,
    selectedFeaturesList,
    featuresCost,
    customNotes,
    grandTotal,
    estimatedDays,
    selectedTypeId,
  ]);

  // Icon mapping helper
  const renderIcon = (name: string, className: string = "w-4 h-4") => {
    switch (name) {
      case "Building2":
        return <Building2 className={className} />;
      case "ShoppingBag":
        return <ShoppingBag className={className} />;
      case "HeartPulse":
        return <HeartPulse className={className} />;
      case "User":
        return <User className={className} />;
      case "Sparkles":
        return <Sparkles className={className} />;
      case "Home":
        return <Home className={className} />;
      case "Utensils":
        return <Utensils className={className} />;
      case "GraduationCap":
        return <GraduationCap className={className} />;
      case "Layers":
        return <Layers className={className} />;
      case "CreditCard":
        return <CreditCard className={className} />;
      case "MessageCircle":
        return <MessageCircle className={className} />;
      case "Send":
        return <Send className={className} />;
      case "Calendar":
        return <Calendar className={className} />;
      case "Lock":
        return <Lock className={className} />;
      case "LayoutDashboard":
        return <LayoutDashboard className={className} />;
      case "BookOpen":
        return <BookOpen className={className} />;
      case "Image":
        return <ImageIcon className={className} />;
      case "Mail":
        return <Mail className={className} />;
      case "Search":
        return <Search className={className} />;
      case "Zap":
        return <Zap className={className} />;
      case "Globe":
        return <Globe className={className} />;
      case "Bot":
        return <Bot className={className} />;
      default:
        return <Check className={className} />;
    }
  };

  // Filtered top features
  const displayedTopFeatures = useMemo(() => {
    const activeGroup = FILTER_GROUPS.find((g) => g.id === topCategoryFilter);
    if (!activeGroup || activeGroup.id === "all") return allFeatures;
    return allFeatures.filter(activeGroup.match);
  }, [allFeatures, topCategoryFilter]);

  // Filtered form features for the checklist
  const displayedFormFeatures = useMemo(() => {
    if (!formSearchQuery.trim()) return allFeatures;
    const q = formSearchQuery.toLowerCase();
    return allFeatures.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.simpleDescription.toLowerCase().includes(q) ||
        f.categoryTag.toLowerCase().includes(q)
    );
  }, [allFeatures, formSearchQuery]);

  return (
    <div className="min-h-screen bg-[#080808] text-[#DCDCDA] pt-8 pb-24 sm:pt-12 sm:pb-32 px-4 sm:px-6 lg:px-10 font-sans selection:bg-white selection:text-black">
      <div className="max-w-[1400px] mx-auto space-y-10 relative z-10">
        {/* ========================================================================= */}
        {/* Page Top Header */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono tracking-widest text-emerald-400 font-semibold uppercase flex items-center gap-1.5">
                <Database className="w-3 h-3" />
                Backend-Connected Studio Pricing
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-light text-[#F5F5F3] tracking-tight">
              Website Cost & <span className="font-semibold text-white">Requirements Estimator</span>
            </h1>
            <p className="text-xs text-[#888888] font-light max-w-2xl">
              Transparent 2026 rates. Browse features at the top or configure your requirements in the form below. Total price recalculates live with every selection.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg text-[#888888] hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg text-[#888888] hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] transition-colors flex items-center gap-1.5"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? "Link Copied" : "Share"}</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 1. TOP SECTION: Complete Interactive Feature Catalog & Rates */}
        {/* ========================================================================= */}
        <div id="features-catalog" className="bg-[#0B0B0B] border border-white/[0.09] rounded-2xl p-5 sm:p-6 space-y-5 shadow-2xl">
          {/* Header Row with Live Stats */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">
                  All Feature Rates & Add-on Catalog
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-[#A0A0A0]">
                  {allFeatures.length} Modular Features
                </span>
              </div>
              <p className="text-xs text-[#808080]">
                Click any feature card or button to immediately add or remove it from your project estimate.
              </p>
            </div>

            {/* Live Top Summary Ribbon */}
            <div className="flex items-center gap-3 bg-[#121212] border border-white/[0.08] px-3.5 py-2 rounded-xl text-xs font-mono">
              <div className="space-y-0.5">
                <span className="text-[10px] text-[#707070] block uppercase tracking-wider">
                  Features Added
                </span>
                <span className="text-white font-bold">
                  {selectedFeaturesList.length} Selected (+{formatINR(featuresCost)})
                </span>
              </div>
              <div className="h-6 w-px bg-white/[0.1]" />
              <div className="space-y-0.5">
                <span className="text-[10px] text-[#707070] block uppercase tracking-wider">
                  Live Project Total
                </span>
                <span
                  key={grandTotal}
                  className="text-emerald-400 font-extrabold text-sm sm:text-base animate-pulse"
                >
                  {formatINR(grandTotal)}
                </span>
              </div>
              <a
                href="#requirements-form"
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-white text-[11px] font-medium transition-colors ml-1"
              >
                <span>Edit Form</span>
                <ArrowDownCircle className="w-3.5 h-3.5 text-emerald-400" />
              </a>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-mono">
            {FILTER_GROUPS.map((group) => {
              const isActive = topCategoryFilter === group.id;
              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => setTopCategoryFilter(group.id)}
                  className={`px-3 py-1.5 rounded-lg transition-all duration-150 whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? "bg-white text-black font-semibold shadow-md"
                      : "bg-[#141414] text-[#808080] hover:text-white border border-white/[0.06] hover:bg-white/[0.04]"
                  }`}
                >
                  <span>{group.label}</span>
                </button>
              );
            })}
          </div>

          {/* Full Grid of All Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {displayedTopFeatures.map((feat) => {
              const isSelected = selectedFeatureIds.includes(feat.id);
              const isBundledInDynamic = feat.id === "admin_panel" && selectedTypeId === "dynamic";

              return (
                <div
                  key={feat.id}
                  onClick={() => !isBundledInDynamic && toggleFeature(feat.id)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-200 flex items-center justify-between gap-2.5 group ${
                    isBundledInDynamic
                      ? "bg-emerald-950/20 border-emerald-500/30 cursor-default"
                      : isSelected
                      ? "bg-white/[0.08] border-emerald-400 text-white shadow-lg ring-1 ring-emerald-400/40"
                      : "bg-[#101010] border-white/[0.06] hover:border-white/[0.20] hover:bg-white/[0.02] text-[#B0B0AE]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                        isBundledInDynamic
                          ? "bg-emerald-500/20 text-emerald-400"
                          : isSelected
                          ? "bg-emerald-400 text-black shadow-sm"
                          : "bg-white/[0.05] text-[#A0A0A0] group-hover:text-white"
                      }`}
                    >
                      {renderIcon(feat.icon, "w-3.5 h-3.5")}
                    </div>
                    <span className="font-semibold text-xs text-white truncate leading-snug group-hover:text-emerald-300 transition-colors">
                      {feat.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-xs font-mono font-bold ${
                        isBundledInDynamic
                          ? "text-emerald-400"
                          : isSelected
                          ? "text-emerald-400"
                          : "text-white"
                      }`}
                    >
                      {isBundledInDynamic ? "Included" : `+${formatINR(feat.price)}`}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                        isBundledInDynamic
                          ? "bg-emerald-500/20 text-emerald-400"
                          : isSelected
                          ? "bg-emerald-400 text-black shadow-sm"
                          : "bg-white/[0.04] text-[#888888] group-hover:text-white group-hover:bg-white/[0.10]"
                      }`}
                    >
                      {isBundledInDynamic || isSelected ? (
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      ) : (
                        <Plus className="w-3 h-3" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. MAIN 50/50 SPLIT: Requirements Form (Left) & Live Quote Ledger (Right) */}
        {/* ========================================================================= */}
        <div id="requirements-form" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ===================================================================== */}
          {/* LEFT 50% (Col Span 6): The Detailed Requirements Form */}
          {/* ===================================================================== */}
          <div className="lg:col-span-6 bg-[#0B0B0B] border border-white/[0.09] rounded-2xl p-5 sm:p-7 space-y-7 shadow-2xl">
            {/* Form Title */}
            <div className="border-b border-white/[0.06] pb-4 space-y-1">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Project Requirements Form</span>
                </h2>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded">
                  Live Recalculation
                </span>
              </div>
              <p className="text-xs text-[#808080] font-light">
                Fill or toggle your project specifications. Watch the itemized ledger on the right update instantly.
              </p>
            </div>

            {/* Field 1: Website Category / Industry */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#A0A0A0]">
                  1. Website Industry / Category
                </label>
                <span className="text-[11px] font-mono text-emerald-400 font-bold">
                  Base: {formatINR(currentCategory.startingPrice)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {categories.map((cat) => {
                  const isSelected = selectedCategoryId === cat.id;

                  return (
                    <div
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.id)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? "bg-white/[0.09] border-emerald-400 text-white shadow-md ring-1 ring-emerald-400/30"
                          : "bg-[#121212] border-white/[0.06] hover:border-white/[0.16] hover:bg-white/[0.02] text-[#A0A09E]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div
                          className={`p-1.5 rounded ${
                            isSelected ? "bg-emerald-400 text-black" : "bg-white/[0.05] text-[#888888]"
                          }`}
                        >
                          {renderIcon(cat.icon, "w-3.5 h-3.5")}
                        </div>
                        <span className="text-xs font-mono font-bold text-white">
                          {formatINR(cat.startingPrice)}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-white truncate">{cat.title}</h4>
                      <p className="text-[10px] text-[#707070] truncate mt-0.5">
                        {cat.deliveryDays} • {cat.recommendedPages} Pages
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Field 2: Static vs Dynamic Architecture */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#A0A0A0]">
                  2. Website Architecture & CMS
                </label>
                <span className="text-[11px] font-mono text-[#808080]">
                  {selectedTypeId === "dynamic" ? "+₹8,000 (Admin Included)" : "Included (₹0)"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {types.map((type) => {
                  const isSelected = selectedTypeId === type.id;
                  return (
                    <div
                      key={type.id}
                      onClick={() => handleTypeChange(type.id)}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? "bg-white/[0.09] border-emerald-400 text-white shadow-md ring-1 ring-emerald-400/30"
                          : "bg-[#121212] border-white/[0.06] hover:border-white/[0.16] hover:bg-white/[0.02] text-[#A0A09E]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{type.title}</span>
                        <span
                          className={`text-[11px] font-mono font-bold ${
                            type.additionalCost === 0 ? "text-emerald-400" : "text-white"
                          }`}
                        >
                          {type.additionalCost === 0 ? "Included (₹0)" : `+${formatINR(type.additionalCost)}`}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#707070] mt-1.5 leading-relaxed">
                        {type.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Field 3: Total Custom Pages Required */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#A0A0A0]">
                  3. Total Custom Pages Required
                </label>
                <span className="text-[11px] font-mono text-emerald-400">
                  {pageCount === 1
                    ? "-₹2,000 (Landing Page)"
                    : pageCount <= 5
                    ? "5 Pages in Base Package"
                    : `+${formatINR((pageCount - 5) * settings.costPerExtraPage)}`}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#121212] border border-white/[0.08]">
                <div className="space-y-0.5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-mono text-white">{pageCount}</span>
                    <span className="text-xs text-[#888888]">Pages Total</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#777777] block">
                    {pageCount === 1
                      ? "Single-page landing (₹2,000 discount applied)"
                      : pageCount <= 5
                      ? "Standard 5 pages included in base package"
                      : `5 Base Included + ${pageCount - 5} Extra Pages @ ₹${settings.costPerExtraPage}/page`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePagesChange(pageCount - 1)}
                    disabled={pageCount <= 1}
                    className="w-9 h-9 rounded-lg bg-[#181818] border border-white/[0.10] flex items-center justify-center text-white hover:bg-white/[0.10] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1">
                    {[1, 5, 8, 12].map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => handlePagesChange(cnt)}
                        className={`px-2.5 py-1.5 rounded text-[11px] font-mono transition-colors ${
                          pageCount === cnt
                            ? "bg-white text-black font-bold shadow-sm"
                            : "bg-[#181818] text-[#808080] hover:text-white border border-white/[0.06]"
                        }`}
                      >
                        {cnt === 1 ? "1 (Landing)" : `${cnt} P`}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePagesChange(pageCount + 1)}
                    disabled={pageCount >= 30}
                    className="w-9 h-9 rounded-lg bg-[#181818] border border-white/[0.10] flex items-center justify-center text-white hover:bg-white/[0.10] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Field 4: Project Delivery Speed SLA */}
            <div className="space-y-3">
              <label className="block text-xs font-mono uppercase tracking-wider text-[#A0A0A0]">
                4. Project Delivery Speed SLA
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setDeliverySpeed("standard")}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    deliverySpeed === "standard"
                      ? "bg-white/[0.09] border-emerald-400 text-white shadow-md ring-1 ring-emerald-400/30"
                      : "bg-[#121212] border-white/[0.06] text-[#A0A09E] hover:border-white/[0.16]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">Standard Delivery</span>
                    <span className="text-[11px] font-mono text-emerald-400 font-bold">Included</span>
                  </div>
                  <span className="text-[11px] text-[#707070] block mt-1">
                    {currentCategory.deliveryDays} (Standard SLA)
                  </span>
                </div>

                <div
                  onClick={() => setDeliverySpeed("express")}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    deliverySpeed === "express"
                      ? "bg-white/[0.09] border-emerald-400 text-white shadow-md ring-1 ring-emerald-400/30"
                      : "bg-[#121212] border-white/[0.06] text-[#A0A09E] hover:border-white/[0.16]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">Express Delivery</span>
                    <span className="text-[11px] font-mono text-white font-bold">+20%</span>
                  </div>
                  <span className="text-[11px] text-[#707070] block mt-1">
                    Fast-Track Priority (3–5 Days)
                  </span>
                </div>
              </div>
            </div>

            {/* Field 5: Detailed Features Checklist with Live Toggles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#A0A0A0]">
                    5. Features & Add-ons Selection
                  </label>
                  <span className="text-[10px] text-[#707070] block">
                    {selectedFeatureIds.length} Features Selected (+{formatINR(featuresCost)})
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <button
                    type="button"
                    onClick={handleSelectRecommended}
                    className="text-[#888888] hover:text-white underline underline-offset-2"
                  >
                    Recommended
                  </button>
                  <span className="text-[#444444]">•</span>
                  <button
                    type="button"
                    onClick={handleClearFeatures}
                    className="text-[#888888] hover:text-white underline underline-offset-2"
                  >
                    Clear Optional
                  </button>
                </div>
              </div>

              {/* Quick Search inside Form */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#666666] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter features by name or keyword..."
                  value={formSearchQuery}
                  onChange={(e) => setFormSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#121212] border border-white/[0.08] text-xs text-[#F5F5F3] placeholder-[#666666] focus:outline-none focus:border-white/20 transition-colors"
                />
              </div>

              {/* Feature Items List */}
              <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin">
                {displayedFormFeatures.map((feat) => {
                  const isChecked = selectedFeatureIds.includes(feat.id);
                  const isBundledInDynamic = feat.id === "admin_panel" && selectedTypeId === "dynamic";

                  return (
                    <div
                      key={feat.id}
                      onClick={() => !isBundledInDynamic && toggleFeature(feat.id)}
                      className={`px-3 py-2 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all duration-150 ${
                        isBundledInDynamic
                          ? "bg-emerald-950/20 border-emerald-500/30 cursor-default"
                          : isChecked
                          ? "bg-white/[0.07] border-emerald-400/70 text-white shadow-sm"
                          : "bg-[#121212] border-white/[0.05] hover:border-white/[0.14] text-[#B0B0AE]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                            isBundledInDynamic
                              ? "bg-emerald-400 text-black border-emerald-400"
                              : isChecked
                              ? "bg-emerald-400 text-black border-emerald-400"
                              : "border-white/20 bg-white/[0.02]"
                          }`}
                        >
                          {(isChecked || isBundledInDynamic) && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>

                        <span className="text-xs font-semibold text-white truncate block">
                          {feat.name}
                        </span>
                      </div>

                      <span
                        className={`text-xs font-mono font-bold shrink-0 ${
                          isBundledInDynamic
                            ? "text-emerald-400"
                            : isChecked
                            ? "text-emerald-400"
                            : "text-white"
                        }`}
                      >
                        {isBundledInDynamic ? "Included Free" : `+${formatINR(feat.price)}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Field 6: Project Notes & Reference URL */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-[#A0A0A0]">
                6. Custom Notes or Competitor Reference (Optional)
              </label>
              <textarea
                rows={2}
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="Mention any specific feature, reference website, design link, or target launch date..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#121212] border border-white/[0.10] text-xs text-white placeholder-[#666666] focus:outline-none focus:border-white/30 resize-none transition-colors"
              />
            </div>
          </div>

          {/* ===================================================================== */}
          {/* RIGHT 50% (Col Span 6): Sticky Dynamic Live Quote Summary */}
          {/* ===================================================================== */}
          <div className="lg:col-span-6 sticky top-24">
            <div className="bg-[#0C0C0C] border border-white/[0.14] rounded-2xl p-5 sm:p-7 shadow-2xl space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-semibold block">
                    LIVE DYNAMIC SPECIFICATION
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    Project Cost Breakdown
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-[#888888] block">Timeline SLA</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">{estimatedDays}</span>
                </div>
              </div>

              {/* Dynamic Line-Items Ledger */}
              <div className="space-y-2.5 text-xs divide-y divide-white/[0.05]">
                {/* Category */}
                <div className="flex items-start justify-between gap-3 pt-1">
                  <div>
                    <span className="text-[10px] font-mono text-[#777777] uppercase block">
                      1. Website Category
                    </span>
                    <span className="font-semibold text-white">{currentCategory.title}</span>
                  </div>
                  <span className="font-mono font-semibold text-white shrink-0">
                    {formatINR(baseCategoryPrice)}
                  </span>
                </div>

                {/* Architecture */}
                <div className="flex items-start justify-between gap-3 pt-2.5">
                  <div>
                    <span className="text-[10px] font-mono text-[#777777] uppercase block">
                      2. Architecture
                    </span>
                    <span className="font-semibold text-white">{currentType.title}</span>
                  </div>
                  <span className="font-mono font-semibold text-white shrink-0">
                    {typePrice === 0 ? "Included" : `+${formatINR(typePrice)}`}
                  </span>
                </div>

                {/* Pages */}
                <div className="flex items-start justify-between gap-3 pt-2.5">
                  <div>
                    <span className="text-[10px] font-mono text-[#777777] uppercase block">
                      3. Pages ({pageCount})
                    </span>
                    <span className="font-semibold text-white">{pageCount} Custom Pages</span>
                  </div>
                  <span className="font-mono font-semibold text-white shrink-0">
                    {pagesPrice > 0 ? `+${formatINR(pagesPrice)}` : pagesPrice < 0 ? `-₹2,000` : "Included in Base"}
                  </span>
                </div>

                {/* Delivery SLA */}
                {deliverySpeed === "express" && (
                  <div className="flex items-start justify-between gap-3 pt-2.5">
                    <div>
                      <span className="text-[10px] font-mono text-[#777777] uppercase block">
                        4. Delivery Speed
                      </span>
                      <span className="font-semibold text-white">Express Priority (+20%)</span>
                    </div>
                    <span className="font-mono font-semibold text-white shrink-0">
                      +{formatINR(expressPrice)}
                    </span>
                  </div>
                )}

                {/* Selected Features */}
                <div className="pt-2.5 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#777777] uppercase">
                    <span>
                      5. Selected Features ({selectedFeaturesList.length})
                    </span>
                    <span className="text-emerald-400 font-semibold">
                      +{formatINR(featuresCost)}
                    </span>
                  </div>

                  {selectedFeaturesList.length === 0 ? (
                    <p className="text-[11px] text-[#666666] italic py-1">
                      No additional features selected (Standard contact form included).
                    </p>
                  ) : (
                    <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                      {selectedFeaturesList.map((feat) => {
                        const isBundled = feat.id === "admin_panel" && selectedTypeId === "dynamic";
                        return (
                          <div
                            key={feat.id}
                            className="flex items-center justify-between text-[11px] text-[#A0A09E] hover:text-white group"
                          >
                            <div className="flex items-center gap-1.5 truncate pr-2">
                              {!isBundled && (
                                <button
                                  type="button"
                                  onClick={() => toggleFeature(feat.id)}
                                  className="text-[#666666] hover:text-red-400 transition-colors p-0.5 rounded"
                                  title="Remove feature"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                              <span className="truncate">{feat.name}</span>
                            </div>
                            <span className="font-mono text-white shrink-0">
                              {isBundled ? "Included Free" : `+${formatINR(feat.price)}`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Total Summary Box with live price pulse */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-[#A0A0A0] font-medium">Total Project Investment:</span>
                  <span
                    key={grandTotal}
                    className="text-2xl sm:text-3xl font-extrabold text-white font-mono transition-all animate-pulse"
                  >
                    {formatINR(grandTotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 pt-2 border-t border-white/[0.06]">
                  <span>Target SLA:</span>
                  <span className="font-bold">{estimatedDays}</span>
                </div>

                <p className="text-[10px] font-mono text-[#666666] pt-1 leading-tight">
                  *Zero hidden charges. Domain & hosting direct to client at actuals. 100% full source code ownership.
                </p>
              </div>

              {/* CTA Action */}
              <div className="space-y-2.5">
                <Link
                  href={quotationUrl}
                  className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-xl bg-[#E8E8E6] hover:bg-white text-black font-semibold text-xs tracking-wide transition-all shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>Submit Requirements & Lock Quote</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <p className="text-[10px] text-[#777777] text-center font-light">
                  Pre-fills this exact specification into our technical inquiry form.
                </p>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.06] text-[10px] font-mono text-[#808080]">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>100% IP Ownership</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>95+ Speed Score</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Milestone Escrow</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Guaranteed SLA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Floating Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0C0C0C]/95 backdrop-blur-md border-t border-white/[0.14] p-3.5 shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-[#808080] block truncate">
              {currentCategory.title.split(" ")[0]} • {pageCount}P • {selectedFeaturesList.length} Feat
            </span>
            <div className="text-lg font-bold text-white font-mono">
              {formatINR(grandTotal)}
            </div>
          </div>

          <Link
            href={quotationUrl}
            className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs transition-colors shrink-0 flex items-center gap-1.5 shadow-md"
          >
            <span>Lock Quote</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
