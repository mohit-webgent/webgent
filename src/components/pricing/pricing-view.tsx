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
  X,
  Database,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { BackendPricingData } from "@/lib/services/pricing";
import {
  WEBSITE_CATEGORIES,
  WEBSITE_TYPES,
  POPULAR_FEATURES,
  PAGE_SETTINGS,
  PRICING_SETTINGS,
  normalizeFeatureId,
  featureRequiresDynamic,
  calculatePricing,
  FeatureOption,
  TRUST_BADGES,
  LAUNCH_PRICING_CONFIG,
  PRICING_TERMS,
  PRICING_FAQS,
} from "@/lib/pricing.config";

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

const FILTER_GROUPS: { id: string; label: string; count?: number; match: (f: FeatureOption) => boolean }[] = [
  { id: "all", label: "All Features", match: () => true },
  {
    id: "communication",
    label: "Lead Gen & Chat",
    match: (f) =>
      f.categoryTag === "Communication" ||
      f.categoryTag === "Automation" ||
      f.id.includes("whatsapp") ||
      f.id.includes("form") ||
      f.id.includes("email") ||
      f.id.includes("chat") ||
      f.id.includes("newsletter"),
  },
  {
    id: "commerce",
    label: "Payments & Store",
    match: (f) =>
      f.categoryTag === "Payments" ||
      f.categoryTag === "E-Commerce" ||
      f.id.includes("payment") ||
      f.id.includes("cart") ||
      f.id.includes("coupon") ||
      f.id.includes("inventory") ||
      f.id.includes("invoice"),
  },
  {
    id: "portal",
    label: "Booking & Portals",
    match: (f) =>
      f.categoryTag === "Functionality" ||
      f.categoryTag === "Security" ||
      f.categoryTag === "Management" ||
      f.id.includes("booking") ||
      f.id.includes("login") ||
      f.id.includes("auth") ||
      f.id.includes("dashboard") ||
      f.id.includes("admin") ||
      f.id.includes("calculator"),
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
      f.id.includes("blog") ||
      f.id.includes("review") ||
      f.id.includes("video") ||
      f.id.includes("faq") ||
      f.id.includes("pdf") ||
      f.id.includes("analytics") ||
      f.id.includes("schema") ||
      f.id.includes("pwa") ||
      f.id.includes("dark_mode"),
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

interface DependencyNotice {
  type: "auto-switched" | "blocked-static";
  title: string;
  message: string;
  featureName?: string;
  costDiff?: number;
}

interface PricingViewProps {
  initialData?: BackendPricingData;
}

export function PricingView({ initialData }: PricingViewProps) {
  const searchParams = useSearchParams();

  // Backend data state (initialized from centralized config / SSR, revalidated via API if available)
  const [backendData, setBackendData] = useState<BackendPricingData>(
    initialData || {
      categories: WEBSITE_CATEGORIES,
      types: WEBSITE_TYPES,
      features: POPULAR_FEATURES,
      settings: {
        basePagesIncluded: PAGE_SETTINGS.basePagesIncluded,
        costPerExtraPage: PAGE_SETTINGS.costPerExtraPage,
        discountForOnePage: PAGE_SETTINGS.discountForOnePage,
        currency: PRICING_SETTINGS.currency,
        currencySymbol: PRICING_SETTINGS.currencySymbol,
      },
    }
  );

  // Client-side background sync with /api/pricing to guarantee live sync
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
        console.warn("Pricing live sync fallback to centralized data:", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const categories = backendData.categories;
  const types = backendData.types;
  const allFeatures = backendData.features;
  const settings = backendData.settings;

  // ---------------------------------------------------------------------------
  // Initial State from URL params or defaults
  // ---------------------------------------------------------------------------
  const initialCategory = useMemo(() => {
    const cat = searchParams.get("cat");
    return cat && categories.some((c) => c.id === cat) ? cat : "business";
  }, [searchParams, categories]);

  const initialDelivery = useMemo(() => {
    const del = searchParams.get("delivery");
    return del === "express" ? "express" : "standard";
  }, [searchParams]);

  const initialPages = useMemo(() => {
    const raw = searchParams.get("pages");
    const p = parseInt(raw || "", 10);
    if (!isNaN(p)) {
      return Math.max(1, Math.min(30, p));
    }
    const cat = categories.find((c) => c.id === initialCategory);
    return cat ? cat.recommendedPages : 5;
  }, [searchParams, initialCategory, categories]);

  const initialFeatures = useMemo(() => {
    const raw = searchParams.get("feat");
    if (raw !== null) {
      if (!raw.trim()) return [];
      return raw
        .split(",")
        .map((id) => normalizeFeatureId(id.trim()))
        .filter((id) => allFeatures.some((f) => f.id === id));
    }
    const cat = categories.find((c) => c.id === initialCategory);
    return cat
      ? cat.defaultFeatures.map(normalizeFeatureId)
      : ["contact_form", "whatsapp_chat", "seo_basic"];
  }, [searchParams, initialCategory, categories, allFeatures]);

  const initialType = useMemo(() => {
    if (initialFeatures.some(featureRequiresDynamic)) {
      return "dynamic";
    }
    const raw = searchParams.get("type");
    return raw === "dynamic" ? "dynamic" : "static";
  }, [searchParams, initialFeatures]);

  // Component State
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(initialCategory);
  const [selectedTypeId, setSelectedTypeId] = useState<"static" | "dynamic">(initialType);
  const [pageCount, setPageCount] = useState<number>(initialPages);
  const [deliverySpeed, setDeliverySpeed] = useState<"standard" | "express">(initialDelivery);
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<string[]>(initialFeatures);
  const [dependencyNotice, setDependencyNotice] = useState<DependencyNotice | null>(null);

  // Feature Catalog Filters & Search
  const [featureCategoryFilter, setFeatureCategoryFilter] = useState<string>("all");
  const [featureSearchQuery, setFeatureSearchQuery] = useState<string>("");
  const [expandedFeatureIds, setExpandedFeatureIds] = useState<Record<string, boolean>>({});

  const [customNotes, setCustomNotes] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Synchronize state changes to URL query string
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategoryId) params.set("cat", selectedCategoryId);
    if (selectedTypeId) params.set("type", selectedTypeId);
    if (pageCount) params.set("pages", String(pageCount));
    if (deliverySpeed) params.set("delivery", deliverySpeed);
    if (selectedFeatureIds.length > 0) {
      params.set("feat", selectedFeatureIds.join(","));
    }

    const qs = params.toString();
    const newPath = qs ? `/pricing?${qs}` : "/pricing";
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname + window.location.search;
      if (currentPath !== newPath) {
        window.history.replaceState(null, "", newPath);
      }
    }
  }, [selectedCategoryId, selectedTypeId, pageCount, deliverySpeed, selectedFeatureIds]);

  // Pure Calculation invocation from centralized config
  const calculation = useMemo(() => {
    return calculatePricing(
      {
        categoryId: selectedCategoryId,
        typeId: selectedTypeId,
        pageCount,
        deliverySpeed,
        selectedFeatureIds,
      },
      {
        categories,
        types,
        features: allFeatures,
        pageSettings: {
          basePagesIncluded: settings.basePagesIncluded,
          costPerExtraPage: settings.costPerExtraPage,
          discountForOnePage: settings.discountForOnePage,
        },
      }
    );
  }, [
    selectedCategoryId,
    selectedTypeId,
    pageCount,
    deliverySpeed,
    selectedFeatureIds,
    categories,
    types,
    allFeatures,
    settings,
  ]);

  const {
    category: currentCategory,
    type: currentType,
    baseCategoryPrice,
    typePrice,
    pagesPrice,
    featuresCost,
    expressPrice,
    selectedFeaturesList,
    grandTotal,
    estimatedDays,
  } = calculation;

  // Toggle Feature Selection
  const toggleFeature = useCallback(
    (rawFeatId: string) => {
      const featId = normalizeFeatureId(rawFeatId);
      const feat = allFeatures.find((f) => f.id === featId || f.id === rawFeatId);
      const isCurrentlySelected =
        selectedFeatureIds.includes(featId) || selectedFeatureIds.includes(rawFeatId);

      if (isCurrentlySelected) {
        // Deselecting feature
        const updatedFeatures = selectedFeatureIds.filter(
          (id) => id !== featId && id !== rawFeatId && normalizeFeatureId(id) !== featId
        );
        setSelectedFeatureIds(updatedFeatures);

        if (dependencyNotice?.featureName === feat?.name) {
          setDependencyNotice(null);
        }
      } else {
        // Selecting feature
        const updatedFeatures = [...selectedFeatureIds, featId];
        setSelectedFeatureIds(updatedFeatures);

        // Check if feature requires Dynamic and we are currently on Static
        if (selectedTypeId === "static" && featureRequiresDynamic(featId)) {
          setSelectedTypeId("dynamic");
          const dynamicType = types.find((t) => t.id === "dynamic");
          const dynamicCost = dynamicType?.additionalCost || 8000;
          setDependencyNotice({
            type: "auto-switched",
            title: "Switched to Dynamic Website (+₹8,000)",
            message: `"${feat?.name || "This feature"}" requires a backend & database to function. Architecture automatically updated to Dynamic Website (+${formatINR(dynamicCost)}).`,
            featureName: feat?.name,
            costDiff: dynamicCost,
          });
        }
      }
    },
    [selectedFeatureIds, selectedTypeId, allFeatures, types, dependencyNotice]
  );

  // Toggle Description Expansion
  const toggleFeatureExpansion = (featId: string) => {
    setExpandedFeatureIds((prev) => ({
      ...prev,
      [featId]: !prev[featId],
    }));
  };

  // Handle Category Change
  const handleCategoryChange = (catId: string) => {
    setSelectedCategoryId(catId);
    const cat = categories.find((c) => c.id === catId);
    if (cat) {
      setPageCount(cat.recommendedPages);
      const normalizedDefaults = cat.defaultFeatures.map(normalizeFeatureId);
      setSelectedFeatureIds(normalizedDefaults);

      if (normalizedDefaults.some(featureRequiresDynamic)) {
        setSelectedTypeId("dynamic");
      }
    }
  };

  // Handle Architecture Change with Blocking Logic
  const handleTypeChange = (typeId: "static" | "dynamic") => {
    if (typeId === "static") {
      const conflicting = selectedFeatureIds
        .map((id) => allFeatures.find((f) => f.id === id || f.id === normalizeFeatureId(id)))
        .filter((f): f is FeatureOption => Boolean(f && featureRequiresDynamic(f.id)));

      if (conflicting.length > 0) {
        const names = conflicting.map((f) => f.name).join(", ");
        setDependencyNotice({
          type: "blocked-static",
          title: "Static Website Architecture Blocked",
          message: `Cannot switch to Static Website because the following selected feature(s) require a backend & database: ${names}. Deselect them first to switch to Static.`,
        });
        return;
      }
    }

    setSelectedTypeId(typeId);
    setDependencyNotice(null);
  };

  const handlePagesChange = (newCount: number) => {
    setPageCount(Math.max(1, Math.min(30, newCount)));
  };

  const handleReset = () => {
    setSelectedCategoryId("business");
    setSelectedTypeId("static");
    setPageCount(5);
    setDeliverySpeed("standard");
    setCustomNotes("");
    setDependencyNotice(null);
    setSelectedFeatureIds(["contact_form", "whatsapp_chat", "seo_basic"]);
  };

  const handleSelectRecommended = () => {
    if (currentCategory && currentCategory.defaultFeatures) {
      const normalizedDefaults = currentCategory.defaultFeatures.map(normalizeFeatureId);
      setSelectedFeatureIds(normalizedDefaults);
      if (normalizedDefaults.some(featureRequiresDynamic)) {
        setSelectedTypeId("dynamic");
      }
    }
  };

  const handleClearFeatures = () => {
    setSelectedFeatureIds([]);
    setDependencyNotice(null);
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Pre-filled URL for Contact Page
  const quotationUrl = useMemo(() => {
    const featuresSummary = selectedFeaturesList
      .map(
        (f) =>
          `• ${f.name} (${
            f.includedInDynamic && selectedTypeId === "dynamic"
              ? "Included Free"
              : formatINR(f.price)
          })`
      )
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

  // Category Tag badge styling helper to make sections visually rich
  const getCategoryTagStyle = (tag: string) => {
    switch (tag) {
      case "Communication":
        return "bg-sky-500/15 text-sky-300 border-sky-500/30";
      case "Payments":
      case "E-Commerce":
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
      case "Security":
      case "Management":
        return "bg-indigo-500/15 text-indigo-300 border-indigo-500/30";
      case "Content":
      case "Design":
        return "bg-rose-500/15 text-rose-300 border-rose-500/30";
      case "Growth":
      case "Performance":
        return "bg-amber-500/15 text-amber-300 border-amber-500/30";
      case "AI Integration":
        return "bg-purple-500/15 text-purple-300 border-purple-500/30";
      default:
        return "bg-teal-500/15 text-teal-300 border-teal-500/30";
    }
  };

  // Filtered features for the single catalog
  const displayedFeatures = useMemo(() => {
    let list = allFeatures;
    const activeGroup = FILTER_GROUPS.find((g) => g.id === featureCategoryFilter);
    if (activeGroup && activeGroup.id !== "all") {
      list = list.filter(activeGroup.match);
    }
    if (featureSearchQuery.trim()) {
      const q = featureSearchQuery.toLowerCase();
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.simpleDescription.toLowerCase().includes(q) ||
          f.categoryTag.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allFeatures, featureCategoryFilter, featureSearchQuery]);

  return (
    <div className="min-h-screen bg-[#080808] text-[#DCDCDA] pt-8 pb-36 lg:pb-20 px-3 sm:px-6 lg:px-10 font-sans selection:bg-white selection:text-black">
      <div className="max-w-[1440px] mx-auto space-y-8 relative z-10">
        {/* ========================================================================= */}
        {/* Page Top Header */}
        {/* ========================================================================= */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 motion-safe:animate-pulse" />
              <span className="text-[11px] font-mono tracking-widest text-emerald-400 font-semibold uppercase flex items-center gap-1.5">
                <Database className="w-3 h-3" />
                Backend-Connected Studio Pricing
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-light text-[#F5F5F3] tracking-tight break-words">
              Website Cost & <span className="font-semibold text-white">Requirements Estimator</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#A3A3A3] font-light max-w-2xl leading-relaxed">
              Transparent, fixed studio rates. Customize your project parameters and select from 30 modular features. The sticky cost ledger on the right updates live.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono shrink-0">
            <button
              type="button"
              onClick={handleReset}
              className="min-h-[44px] px-4 py-2 rounded-xl text-[#D4D4D4] hover:text-white bg-[#141414] hover:bg-[#1E1E1E] border border-white/[0.08] transition-colors flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808]"
              aria-label="Reset estimator to defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="min-h-[44px] px-4 py-2 rounded-xl text-[#D4D4D4] hover:text-white bg-[#141414] hover:bg-[#1E1E1E] border border-white/[0.08] transition-colors flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808]"
              aria-label="Copy shareable link for this configuration"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? "Link Copied" : "Share"}</span>
            </button>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* Main 2-Column Grid: Configurator (Left) + Sticky Cost Ledger (Right)       */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ===================================================================== */}
          {/* LEFT COLUMN: Distinct Step Sections + Vibrant Feature Marketplace    */}
          {/* ===================================================================== */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-7">
            {/* ----------------------------------------------------------------- */}
            {/* SECTION 1: Website Industry / Category (Cyan / Electric Theme)     */}
            {/* ----------------------------------------------------------------- */}
            <div className="rounded-2xl p-5 sm:p-7 space-y-5 border border-sky-500/20 bg-gradient-to-b from-[#09111D] to-[#070B12] shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 border-b border-sky-500/15 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono tracking-widest uppercase font-bold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30">
                      Step 1
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      Website Industry & Category
                    </h2>
                  </div>
                  <p className="text-xs text-[#9CA3AF] font-light">
                    Select your business model. Sets recommended page count and default baseline features.
                  </p>
                </div>

                <span className="text-xs font-mono text-sky-400 font-bold tabular-nums shrink-0 px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20">
                  Base: {formatINR(currentCategory.startingPrice)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {categories.map((cat) => {
                  const isSelected = selectedCategoryId === cat.id;

                  return (
                    <div
                      key={cat.id}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isSelected}
                      onClick={() => handleCategoryChange(cat.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleCategoryChange(cat.id);
                        }
                      }}
                      className={`min-h-[74px] p-3 rounded-xl border text-left cursor-pointer transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070B12] ${
                        isSelected
                          ? "bg-sky-950/40 border-sky-400 text-white shadow-lg ring-1 ring-sky-400/40"
                          : "bg-[#0E1524]/70 border-white/[0.06] hover:border-sky-500/40 hover:bg-[#121C30] text-[#D4D4D4]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div
                          className={`p-1.5 rounded-lg shrink-0 ${
                            isSelected ? "bg-sky-400 text-black font-bold" : "bg-white/[0.06] text-sky-300"
                          }`}
                        >
                          {renderIcon(cat.icon, "w-3.5 h-3.5")}
                        </div>
                        <span className="text-xs font-mono font-bold text-white tabular-nums">
                          {formatINR(cat.startingPrice)}
                        </span>
                      </div>
                      <h3 className="text-xs font-semibold text-white truncate">{cat.title}</h3>
                      <p className="text-[11px] text-[#9CA3AF] truncate mt-0.5 font-mono">
                        {cat.deliveryDays} • {cat.recommendedPages} Pages
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* SECTION 2: Architecture & CMS (Indigo / Violet Theme)              */}
            {/* ----------------------------------------------------------------- */}
            <div className="rounded-2xl p-5 sm:p-7 space-y-5 border border-indigo-500/20 bg-gradient-to-b from-[#0E0F22] to-[#080914] shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 border-b border-indigo-500/15 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono tracking-widest uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                      Step 2
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      Technical Architecture & CMS
                    </h2>
                  </div>
                  <p className="text-xs text-[#9CA3AF] font-light">
                    Static for zero-maintenance marketing sites. Dynamic for CMS, databases, portals, and e-commerce.
                  </p>
                </div>

                <span className="text-xs font-mono text-indigo-400 font-bold tabular-nums shrink-0 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                  {selectedTypeId === "dynamic" ? "+₹8,000" : "Included"}
                </span>
              </div>

              {/* Inline Dependency Notice (Auto-switched or Blocked) */}
              {dependencyNotice && (
                <div
                  className={`p-3.5 rounded-xl border transition-all text-xs flex items-start justify-between gap-3 ${
                    dependencyNotice.type === "auto-switched"
                      ? "bg-blue-950/50 border-blue-400/50 text-blue-200"
                      : "bg-amber-950/50 border-amber-400/50 text-amber-200"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {dependencyNotice.type === "auto-switched" ? (
                      <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span>{dependencyNotice.title}</span>
                        {dependencyNotice.costDiff ? (
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 tabular-nums">
                            +{formatINR(dependencyNotice.costDiff)}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs leading-relaxed text-[#DCDCDA]">
                        {dependencyNotice.message}
                      </p>
                      {dependencyNotice.type === "blocked-static" && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFeatureIds((prev) =>
                              prev.filter((id) => !featureRequiresDynamic(id))
                            );
                            setSelectedTypeId("static");
                            setDependencyNotice(null);
                          }}
                          className="mt-1.5 text-xs font-semibold text-amber-300 underline hover:text-white transition-colors block text-left min-h-[44px] flex items-center"
                        >
                          Deselect dynamic features and switch to Static
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDependencyNotice(null)}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                    aria-label="Dismiss notice"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {types.map((type) => {
                  const isSelected = selectedTypeId === type.id;
                  return (
                    <div
                      key={type.id}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isSelected}
                      onClick={() => handleTypeChange(type.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleTypeChange(type.id);
                        }
                      }}
                      className={`min-h-[96px] p-4 rounded-xl border text-left cursor-pointer transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080914] ${
                        isSelected
                          ? "bg-indigo-950/40 border-indigo-400 text-white shadow-lg ring-1 ring-indigo-400/40"
                          : "bg-[#14152A]/60 border-white/[0.06] hover:border-indigo-500/40 hover:bg-[#181A36] text-[#D4D4D4]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{type.title}</span>
                        <span
                          className={`text-xs font-mono font-bold tabular-nums ${
                            type.additionalCost === 0 ? "text-emerald-400" : "text-indigo-300"
                          }`}
                        >
                          {type.additionalCost === 0 ? "Included (₹0)" : `+${formatINR(type.additionalCost)}`}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-[#A3A3A3] block mt-1">
                        {type.subtitle}
                      </span>
                      <p className="text-xs text-[#A3A3A3] mt-2 leading-relaxed">
                        {type.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* SECTION 3 & 4: Pages & Delivery Speed SLA (Amber / Gold Theme)     */}
            {/* ----------------------------------------------------------------- */}
            <div className="rounded-2xl p-5 sm:p-7 space-y-6 border border-amber-500/20 bg-gradient-to-b from-[#141108] to-[#0A0905] shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 border-b border-amber-500/15 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono tracking-widest uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      Steps 3 & 4
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      Page Scope & Delivery Speed SLA
                    </h2>
                  </div>
                  <p className="text-xs text-[#9CA3AF] font-light">
                    Adjust required custom pages and select your target deployment speed.
                  </p>
                </div>

                <span className="text-xs font-mono text-amber-400 font-bold tabular-nums shrink-0 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  {pageCount} Pages • {deliverySpeed === "express" ? "Express" : "Standard"}
                </span>
              </div>

              {/* Pages Interactive Controls */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#D4D4D4] font-semibold">
                    3. Total Custom Pages Required
                  </label>
                  <span className="text-xs font-mono text-amber-400 font-bold tabular-nums">
                    {pageCount === 1
                      ? "-₹2,000 (Landing Page)"
                      : pageCount <= 5
                      ? "5 Pages in Base Package"
                      : `+${formatINR((pageCount - 5) * settings.costPerExtraPage)}`}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#1A160D]/80 border border-amber-500/20">
                  <div className="space-y-0.5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold font-mono text-white tabular-nums">{pageCount}</span>
                      <span className="text-xs text-[#D4D4D4]">Pages Total</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#A3A3A3] block">
                      {pageCount === 1
                        ? "Single-page landing (₹2,000 discount applied)"
                        : pageCount <= 5
                        ? "Standard 5 pages included in base package"
                        : `5 Base Included + ${pageCount - 5} Extra Pages @ ₹${settings.costPerExtraPage}/page`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handlePagesChange(pageCount - 1)}
                      disabled={pageCount <= 1}
                      aria-label="Decrease page count"
                      className="w-11 h-11 rounded-lg bg-[#252014] border border-amber-500/30 flex items-center justify-center text-white hover:bg-[#332C1B] disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-1">
                      {[1, 5, 8, 12].map((cnt) => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => handlePagesChange(cnt)}
                          className={`min-h-[44px] min-w-[36px] sm:min-w-[44px] px-2 sm:px-3 py-2 rounded-lg text-xs font-mono transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                            pageCount === cnt
                              ? "bg-amber-400 text-black font-bold shadow-sm"
                              : "bg-[#252014] text-[#D4D4D4] hover:text-white border border-amber-500/20 hover:bg-[#332C1B]"
                          }`}
                        >
                          {cnt === 1 ? "1P" : `${cnt}P`}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePagesChange(pageCount + 1)}
                      disabled={pageCount >= 30}
                      aria-label="Increase page count"
                      className="w-11 h-11 rounded-lg bg-[#252014] border border-amber-500/30 flex items-center justify-center text-white hover:bg-[#332C1B] disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Delivery Speed SLA */}
              <div className="space-y-3 pt-2 border-t border-amber-500/15">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#D4D4D4] font-semibold">
                  4. Project Delivery Speed SLA
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    role="button"
                    tabIndex={0}
                    aria-pressed={deliverySpeed === "standard"}
                    onClick={() => setDeliverySpeed("standard")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setDeliverySpeed("standard");
                      }
                    }}
                    className={`min-h-[76px] p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0905] ${
                      deliverySpeed === "standard"
                        ? "bg-amber-950/40 border-amber-400 text-white shadow-lg ring-1 ring-amber-400/40"
                        : "bg-[#1A160D]/60 border-white/[0.06] text-[#D4D4D4] hover:border-amber-500/40 hover:bg-[#252014]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">Standard Delivery</span>
                      <span className="text-xs font-mono text-emerald-400 font-bold">Included</span>
                    </div>
                    <span className="text-xs text-[#A3A3A3] block mt-1.5 font-mono">
                      {currentCategory.deliveryDays} (Standard Timeline)
                    </span>
                  </div>

                  <div
                    role="button"
                    tabIndex={0}
                    aria-pressed={deliverySpeed === "express"}
                    onClick={() => setDeliverySpeed("express")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setDeliverySpeed("express");
                      }
                    }}
                    className={`min-h-[76px] p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0905] ${
                      deliverySpeed === "express"
                        ? "bg-amber-950/40 border-amber-400 text-white shadow-lg ring-1 ring-amber-400/40"
                        : "bg-[#1A160D]/60 border-white/[0.06] text-[#D4D4D4] hover:border-amber-500/40 hover:bg-[#252014]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">Express Delivery</span>
                      <span className="text-xs font-mono text-amber-300 font-bold">+20%</span>
                    </div>
                    <span className="text-xs text-[#A3A3A3] block mt-1.5 font-mono">
                      Fast-Track Priority (3–5 Days)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* SECTION 5: MODULAR FEATURE MARKETPLACE (Vibrant Emerald Showcase)  */}
            {/* ----------------------------------------------------------------- */}
            <div
              id="features-catalog"
              className="rounded-2xl p-5 sm:p-7 space-y-6 border border-emerald-500/30 bg-gradient-to-b from-[#091711] via-[#060F0B] to-[#040907] shadow-2xl relative"
            >
              {/* Studio Marketplace Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-500/20 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono tracking-widest uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Step 5 • Marketplace
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                      <span>Modular Studio Features Catalog</span>
                      <span className="text-xs font-mono font-normal text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30">
                        {allFeatures.length} Add-ons
                      </span>
                    </h2>
                  </div>
                  <p className="text-xs text-[#A3A3A3] font-light max-w-xl">
                    Every modern feature modularly priced. Click any card to select, or click &quot;Details&quot; to expand transparent technical specifications.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono shrink-0">
                  <button
                    type="button"
                    onClick={handleSelectRecommended}
                    className="min-h-[44px] px-3.5 py-2 rounded-xl text-emerald-300 hover:text-white bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  >
                    Recommended
                  </button>
                  <button
                    type="button"
                    onClick={handleClearFeatures}
                    className="min-h-[44px] px-3.5 py-2 rounded-xl text-[#A3A3A3] hover:text-white bg-black/40 hover:bg-white/10 border border-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Category Filter Pills & Search */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-mono">
                  {FILTER_GROUPS.map((group) => {
                    const isActive = featureCategoryFilter === group.id;
                    const groupCount =
                      group.id === "all"
                        ? allFeatures.length
                        : allFeatures.filter(group.match).length;

                    return (
                      <button
                        key={group.id}
                        type="button"
                        onClick={() => setFeatureCategoryFilter(group.id)}
                        className={`min-h-[44px] px-3.5 py-2 rounded-xl transition-all duration-150 whitespace-nowrap flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                          isActive
                            ? "bg-emerald-400 text-black font-bold shadow-lg shadow-emerald-400/20"
                            : "bg-[#0D1812] text-[#A3A3A3] hover:text-white border border-emerald-500/20 hover:bg-[#12221A]"
                        }`}
                      >
                        <span>{group.label}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            isActive ? "bg-black/20 text-black" : "bg-white/10 text-emerald-400"
                          }`}
                        >
                          {groupCount}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-emerald-400/70 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search 30 features (e.g. payment, booking, whatsapp, blog, invoice, seo)..."
                    value={featureSearchQuery}
                    onChange={(e) => setFeatureSearchQuery(e.target.value)}
                    className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl bg-[#0B1410] border border-emerald-500/25 text-xs text-[#F5F5F3] placeholder-[#737373] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:border-transparent transition-colors"
                  />
                  {featureSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setFeatureSearchQuery("")}
                      className="absolute right-3 top-2.5 text-[#A3A3A3] hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
                      aria-label="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Status info bar */}
              <div className="flex items-center justify-between text-xs font-mono text-[#A3A3A3] px-1">
                <span>Showing {displayedFeatures.length} of {allFeatures.length} modular features</span>
                <span className="text-emerald-400 font-bold tabular-nums">
                  {selectedFeaturesList.length} Selected (+{formatINR(featuresCost)})
                </span>
              </div>

              {/* Grid of Modular Feature Cards (Responsive 2 to 3 Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {displayedFeatures.map((feat) => {
                  const isSelected =
                    selectedFeatureIds.includes(feat.id) ||
                    selectedFeatureIds.includes(normalizeFeatureId(feat.id));
                  const isBundledInDynamic = Boolean(feat.includedInDynamic && selectedTypeId === "dynamic");
                  const isExpanded = Boolean(expandedFeatureIds[feat.id]);

                  return (
                    <div
                      key={feat.id}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isSelected}
                      onClick={() => toggleFeature(feat.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggleFeature(feat.id);
                        }
                      }}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-150 flex flex-col justify-between gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060F0B] ${
                        isBundledInDynamic && isSelected
                          ? "bg-emerald-950/35 border-emerald-400/90 ring-1 ring-emerald-400/50 text-white shadow-md"
                          : isSelected
                          ? "bg-emerald-950/30 border-emerald-400 ring-1 ring-emerald-400/50 text-white shadow-lg"
                          : "bg-[#0C1510]/80 border-white/[0.07] hover:border-emerald-500/40 hover:bg-[#101D16] text-[#D4D4D4]"
                      }`}
                    >
                      {/* Top Row: Category Tag Chip & Price */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getCategoryTagStyle(
                            feat.categoryTag
                          )}`}
                        >
                          {feat.categoryTag}
                        </span>

                        <span
                          className={`text-xs font-mono font-bold tabular-nums ${
                            isBundledInDynamic && isSelected
                              ? "text-emerald-400"
                              : isSelected
                              ? "text-emerald-400"
                              : "text-white"
                          }`}
                        >
                          {isBundledInDynamic && isSelected ? "Included Free" : `+${formatINR(feat.price)}`}
                        </span>
                      </div>

                      {/* Middle: Icon, Title & Obvious Selected State */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div
                            className={`p-2 rounded-lg shrink-0 transition-colors ${
                              isBundledInDynamic && isSelected
                                ? "bg-emerald-400 text-black font-bold"
                                : isSelected
                                ? "bg-emerald-400 text-black font-bold"
                                : "bg-white/[0.06] text-emerald-400"
                            }`}
                          >
                            {renderIcon(feat.icon, "w-4 h-4")}
                          </div>

                          <div className="space-y-0.5 min-w-0">
                            <h3 className="font-semibold text-xs text-white leading-snug">
                              {feat.name}
                            </h3>
                            <p
                              className={`text-xs text-[#A3A3A3] leading-relaxed ${
                                isExpanded ? "" : "line-clamp-1"
                              }`}
                            >
                              {feat.simpleDescription}
                            </p>
                          </div>
                        </div>

                        {/* Selected State Badge (Never relies on color alone) */}
                        <div className="shrink-0 flex items-center">
                          {isSelected ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-400 text-black text-[10px] font-bold font-mono shadow-sm">
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>Added</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.08] text-[#D4D4D4] text-[10px] font-mono hover:text-white border border-white/[0.08]">
                              <Plus className="w-3 h-3" />
                              <span>Add</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Expandable Details Container */}
                      {isExpanded && feat.costNote && (
                        <div className="text-[11px] text-amber-200/90 font-mono bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5 mt-1 leading-relaxed">
                          Note: {feat.costNote}
                        </div>
                      )}

                      {/* Bottom Toggle Button for Expandable Details */}
                      <div className="pt-1 flex items-center justify-between border-t border-white/[0.06]">
                        <button
                          type="button"
                          aria-expanded={isExpanded}
                          aria-controls={`feature-desc-${feat.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFeatureExpansion(feat.id);
                          }}
                          className="min-h-[44px] inline-flex items-center gap-1 text-[11px] font-mono text-[#A3A3A3] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-md px-1"
                        >
                          <span>{isExpanded ? "Hide Details" : "View Details"}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-[#D4D4D4]" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-[#D4D4D4]" />
                          )}
                        </button>

                        {feat.popularFor && feat.popularFor.includes(selectedCategoryId) && (
                          <span className="text-[10px] font-mono text-emerald-400 font-semibold truncate max-w-[120px]">
                            ★ {currentCategory.title.split(" ")[0]} Pick
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* SECTION 6: Custom Notes & Competitor Reference (Minimal Zinc)      */}
            {/* ----------------------------------------------------------------- */}
            <div className="rounded-2xl p-5 sm:p-7 space-y-3 border border-zinc-700/40 bg-[#0C0C0E] shadow-xl">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest uppercase font-bold px-2 py-0.5 rounded-full bg-zinc-700/30 text-zinc-300 border border-zinc-700/40">
                  Step 6
                </span>
                <label
                  htmlFor="custom-notes"
                  className="block text-xs font-mono uppercase tracking-wider text-[#D4D4D4] font-semibold"
                >
                  Custom Notes or Reference URL (Optional)
                </label>
              </div>
              <textarea
                id="custom-notes"
                rows={3}
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="Mention any specific feature, reference website URL, design link, or target launch deadline..."
                className="w-full px-4 py-3 rounded-xl bg-[#141418] border border-white/[0.08] text-xs text-white placeholder-[#737373] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 resize-none transition-colors"
              />
            </div>
          </div>

          {/* ===================================================================== */}
          {/* RIGHT COLUMN: STICKY Project Cost Breakdown Panel (5 Cols)           */}
          {/* ===================================================================== */}
          <aside className="lg:col-span-5 xl:col-span-5 lg:sticky lg:top-20 lg:self-start space-y-6">
            <div className="rounded-2xl p-5 sm:p-7 space-y-6 border border-emerald-400/40 bg-gradient-to-b from-[#0A120E] to-[#050907] shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(16,185,129,0.10)] relative">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-semibold block">
                    LIVE CALCULATION
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    Project Cost Breakdown
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-[#A3A3A3] block">Target SLA</span>
                  <span className="text-xs font-mono font-bold text-emerald-400 tabular-nums">
                    {estimatedDays}
                  </span>
                </div>
              </div>

              {/* Dynamic Line-Items Ledger */}
              <div className="space-y-3 text-xs divide-y divide-white/[0.06]">
                {/* 1. Category */}
                <div className="flex items-start justify-between gap-3 pt-1">
                  <div>
                    <span className="text-[10px] font-mono text-[#A3A3A3] uppercase block">
                      1. Website Category
                    </span>
                    <span className="font-semibold text-white">{currentCategory.title}</span>
                  </div>
                  <span className="font-mono font-semibold text-white shrink-0 tabular-nums">
                    {formatINR(baseCategoryPrice)}
                  </span>
                </div>

                {/* 2. Architecture */}
                <div className="flex items-start justify-between gap-3 pt-3">
                  <div>
                    <span className="text-[10px] font-mono text-[#A3A3A3] uppercase block">
                      2. Architecture
                    </span>
                    <span className="font-semibold text-white">{currentType.title}</span>
                  </div>
                  <span className="font-mono font-semibold text-white shrink-0 tabular-nums">
                    {typePrice === 0 ? "Included" : `+${formatINR(typePrice)}`}
                  </span>
                </div>

                {/* 3. Pages */}
                <div className="flex items-start justify-between gap-3 pt-3">
                  <div>
                    <span className="text-[10px] font-mono text-[#A3A3A3] uppercase block">
                      3. Pages ({pageCount})
                    </span>
                    <span className="font-semibold text-white">{pageCount} Custom Pages</span>
                  </div>
                  <span className="font-mono font-semibold text-white shrink-0 tabular-nums">
                    {pagesPrice > 0 ? `+${formatINR(pagesPrice)}` : pagesPrice < 0 ? `-₹2,000` : "Included in Base"}
                  </span>
                </div>

                {/* 4. Delivery SLA */}
                {deliverySpeed === "express" && (
                  <div className="flex items-start justify-between gap-3 pt-3">
                    <div>
                      <span className="text-[10px] font-mono text-[#A3A3A3] uppercase block">
                        4. Delivery Speed
                      </span>
                      <span className="font-semibold text-white">Express Priority (+20%)</span>
                    </div>
                    <span className="font-mono font-semibold text-white shrink-0 tabular-nums">
                      +{formatINR(expressPrice)}
                    </span>
                  </div>
                )}

                {/* 5. Selected Features List */}
                <div className="pt-3 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#A3A3A3] uppercase">
                    <span>Selected Features ({selectedFeaturesList.length})</span>
                    <span className="text-emerald-400 font-bold tabular-nums">
                      +{formatINR(featuresCost)}
                    </span>
                  </div>

                  {selectedFeaturesList.length === 0 ? (
                    <p className="text-xs text-[#A3A3A3] italic py-1">
                      No additional features selected (Standard contact form included).
                    </p>
                  ) : (
                    <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                      {selectedFeaturesList.map((feat) => {
                        const isBundled = Boolean(feat.includedInDynamic && selectedTypeId === "dynamic");
                        return (
                          <div
                            key={feat.id}
                            className="flex items-center justify-between text-xs text-[#D4D4D4] hover:text-white group py-0.5"
                          >
                            <div className="flex items-center gap-1.5 truncate pr-2">
                              <button
                                type="button"
                                onClick={() => toggleFeature(feat.id)}
                                className="min-w-[32px] min-h-[32px] flex items-center justify-center text-[#A3A3A3] hover:text-red-400 transition-colors rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-400"
                                aria-label={`Remove ${feat.name}`}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                              <span className="truncate">{feat.name}</span>
                            </div>
                            <span className="font-mono text-white shrink-0 tabular-nums">
                              {isBundled ? "Included Free" : `+${formatINR(feat.price)}`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Grand Total Live Counter */}
              <div className="pt-4 border-t border-emerald-500/20 space-y-2">
                <div className="flex items-baseline justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#A3A3A3] block">
                        Total Investment Estimate
                      </span>
                      {LAUNCH_PRICING_CONFIG.enabled && (
                        <span
                          title={LAUNCH_PRICING_CONFIG.description}
                          className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[10px] font-mono font-medium tracking-wide"
                        >
                          {LAUNCH_PRICING_CONFIG.label}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#A3A3A3]">
                      Includes design, engineering, QA & launch
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight tabular-nums">
                      {formatINR(grandTotal)}
                    </div>
                  </div>
                </div>

                <p className="text-[11px] font-mono text-[#A3A3A3] pt-1 leading-relaxed">
                  *Transparent rates. 100% full source code ownership. Domain & hosting direct to client at actuals. Third-party provider usage fees billed at actuals.
                </p>
              </div>

              {/* CTA Action */}
              <div className="space-y-2.5">
                <Link
                  href={quotationUrl}
                  className="min-h-[48px] inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-xl bg-white hover:bg-[#E8E8E6] text-black font-semibold text-xs tracking-wide transition-all shadow-xl hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808]"
                >
                  <span>Request This Quote</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <p className="text-xs text-[#A3A3A3] text-center font-normal leading-relaxed">
                  This sends your requirements to us. Final quote is confirmed after discussion.
                </p>
              </div>

              {/* Trust Badges */}
              {TRUST_BADGES.filter((b) => b.enabled).length > 0 && (
                <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-emerald-500/20 text-[11px] font-mono text-[#D4D4D4]">
                  {TRUST_BADGES.filter((b) => b.enabled).map((badge) => (
                    <div key={badge.id} className="flex items-center gap-2">
                      {badge.iconName === "CheckCircle2" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      <span>{badge.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* ========================================================================= */}
        {/* Full-Width Bottom Section: Terms of Engagement & FAQ                     */}
        {/* ========================================================================= */}
        <section id="terms-and-faq" className="pt-12 border-t border-white/[0.08] space-y-10">
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#A3A3A3]">
                POLICIES & TRANSPARENCY
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F5F3]">
              Terms of Engagement & FAQ
            </h2>
            <p className="text-xs sm:text-sm text-[#A3A3A3] max-w-2xl leading-relaxed">
              Clear payment milestones, revisions, bug-fix guarantees, and honest answers to common questions.
            </p>
          </div>

          {/* Key Engagement Terms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-[#0D0D0D] border border-white/[0.08] space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-semibold">
                <CreditCard className="w-4 h-4" />
                <span>Payment Milestones</span>
              </div>
              <h3 className="text-sm font-semibold text-white">
                {PRICING_TERMS.advancePercentage}% Advance / {PRICING_TERMS.deliveryPercentage}% on Delivery
              </h3>
              <p className="text-xs text-[#A3A3A3] leading-relaxed">
                Initial deposit begins UI/UX design and architecture. Final balance is payable only after your review and final staging approval.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#0D0D0D] border border-white/[0.08] space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-semibold">
                <RotateCcw className="w-4 h-4" />
                <span>Included Revisions</span>
              </div>
              <h3 className="text-sm font-semibold text-white">
                {PRICING_TERMS.revisionRounds} Comprehensive Review Rounds
              </h3>
              <p className="text-xs text-[#A3A3A3] leading-relaxed">
                Feedback iterations during the Figma design phase and functional staging preview to ensure every detail matches your brand.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#0D0D0D] border border-white/[0.08] space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-semibold">
                <Shield className="w-4 h-4" />
                <span>Post-Launch Warranty</span>
              </div>
              <h3 className="text-sm font-semibold text-white">
                {PRICING_TERMS.freeSupportDays} Days Free Bug-Fix Support
              </h3>
              <p className="text-xs text-[#A3A3A3] leading-relaxed">
                Complimentary post-deployment stabilization covering technical bugs, browser compatibility, and minor layout adjustments.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#0D0D0D] border border-white/[0.08] space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-semibold">
                <Building2 className="w-4 h-4" />
                <span>Taxes & GST</span>
              </div>
              <h3 className="text-sm font-semibold text-white">
                {PRICING_TERMS.gst.enabled ? "Tax Invoice (GST Applicable)" : "Tax Exempt"}
              </h3>
              <p className="text-xs text-[#A3A3A3] leading-relaxed">
                {PRICING_TERMS.gst.statement}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#0D0D0D] border border-white/[0.08] space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-semibold">
                <Clock className="w-4 h-4" />
                <span>Timeline Kickoff</span>
              </div>
              <h3 className="text-sm font-semibold text-white">
                Content-Ready Start
              </h3>
              <p className="text-xs text-[#A3A3A3] leading-relaxed">
                {PRICING_TERMS.timelineNote}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#0D0D0D] border border-white/[0.08] space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-semibold">
                <Layers className="w-4 h-4" />
                <span>Extra Page Definition</span>
              </div>
              <h3 className="text-sm font-semibold text-white">
                Clear Page Boundaries
              </h3>
              <p className="text-xs text-[#A3A3A3] leading-relaxed">
                {PRICING_TERMS.extraPageDefinition} Standard pricing includes 5 base pages.
              </p>
            </div>
          </div>

          {/* Frequently Asked Questions */}
          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-semibold text-white">Frequently Asked Questions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PRICING_FAQS.map((faq) => (
                <div
                  key={faq.id}
                  className="p-5 rounded-xl bg-[#0C0C0C] border border-white/[0.08] space-y-2 text-left"
                >
                  <h4 className="text-xs sm:text-sm font-semibold text-[#F5F5F3]">
                    {faq.question}
                  </h4>
                  <p className="text-xs text-[#A3A3A3] leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mobile Spacer to guarantee sticky bar never covers content or footer */}
        <div className="h-28 lg:hidden pointer-events-none" aria-hidden="true" />
      </div>

      {/* ========================================================================= */}
      {/* Mobile Floating Sticky Bottom Bar (lg:hidden)                             */}
      {/* ========================================================================= */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0C0C0C]/95 backdrop-blur-md border-t border-white/[0.14] px-4 py-3 shadow-2xl">
        <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
          <div className="space-y-0.5 min-w-0">
            <span className="text-[11px] font-mono text-[#A3A3A3] block truncate">
              {currentCategory.title.split(" ")[0]} • {pageCount}P • {selectedFeaturesList.length} Feat
            </span>
            <div className="text-xl font-bold text-white font-mono tabular-nums">
              {formatINR(grandTotal)}
            </div>
          </div>

          <Link
            href={quotationUrl}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-white hover:bg-[#E8E8E6] text-black font-semibold text-xs tracking-wide transition-colors shrink-0 whitespace-nowrap flex items-center gap-1.5 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <span>Request Quote</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Lift site-wide chat widget above mobile sticky bottom bar on mobile viewports */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 1023px) {
              div:has(> #webgent-chat-widget-button),
              #webgent-chat-widget-button {
                bottom: 5.5rem !important;
              }
            }
          `,
        }}
      />
    </div>
  );
}
