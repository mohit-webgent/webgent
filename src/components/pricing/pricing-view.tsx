"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Check,
  Plus,
  RotateCcw,
  ArrowRight,
  Shield,
  Zap,
  Building2,
  ShoppingBag,
  User,
  Sparkles,
  Layers,
  CreditCard,
  MessageCircle,
  Calendar,
  Lock,
  LayoutDashboard,
  BookOpen,
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
  Info,
  Package,
  Wrench,
  Loader2,
} from "lucide-react";
import { Turnstile, TurnstileRef } from "@/components/ui/turnstile";

import { BackendPricingData } from "@/lib/services/pricing";
import {
  MASTER_PACKAGES,
  MASTER_CATEGORIES,
  MASTER_FEATURES,
  MasterPackageTier,
  MatrixFeatureItem,
  FeatureStatus,
  formatCurrencyINR,
  normalizeMatrixFeatureId,
} from "@/data/pricing-matrix-data";

// ---------------------------------------------------------------------------
// Flow Mode Types
// ---------------------------------------------------------------------------
type PricingFlowMode = "package" | "package_plus_addons" | "custom_only";

export interface PricingViewProps {
  initialData?: BackendPricingData;
}

export function PricingView({ initialData }: PricingViewProps) {
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
  const [addonQuantities, setAddonQuantities] = useState<Record<string, number>>({
    website_pages_additional_pages: 1,
    deployment_maintenance_monthly_hours: 1,
    design_frontend_additional_website_pages: 1,
    testing_maintenance_monthly_development_hours: 1,
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
  }, [flowMode, selectedTier, selectedAddonIds, selectedQuoteIds, deliverySpeed, activeCategoryKey]);

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

  // One-time addons vs Monthly ongoing services
  const onetimeAddonsCost = useMemo(() => {
    return activeSelectedAddons
      .filter((f) => f.billingType === "onetime")
      .reduce((sum, f) => {
        const qty = f.hasQuantity ? addonQuantities[f.id] || 1 : 1;
        return sum + (f.addonPrice || 0) * qty;
      }, 0);
  }, [activeSelectedAddons, addonQuantities]);

  const monthlyServicesCost = useMemo(() => {
    return activeSelectedAddons
      .filter((f) => f.billingType === "monthly")
      .reduce((sum, f) => {
        const qty = f.hasQuantity ? addonQuantities[f.id] || 1 : 1;
        return sum + (f.addonPrice || 0) * qty;
      }, 0);
  }, [activeSelectedAddons, addonQuantities]);

  // Base + Onetime subtotal
  const onetimeBaseSubtotal = basePackagePrice + onetimeAddonsCost;
  const expressFee = deliverySpeed === "express" ? Math.round(onetimeBaseSubtotal * 0.2) : 0;
  const grandTotalOnetime = onetimeBaseSubtotal + expressFee;

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
  const renderCategoryIcon = (iconName: string, className = "w-4 h-4") => {
    switch (iconName) {
      case "Layout":
        return <LayoutDashboard className={className} />;
      case "BookOpen":
        return <BookOpen className={className} />;
      case "ShoppingBag":
        return <ShoppingBag className={className} />;
      case "Lock":
        return <Lock className={className} />;
      case "LayoutDashboard":
        return <LayoutDashboard className={className} />;
      case "Database":
        return <Database className={className} />;
      case "CreditCard":
        return <CreditCard className={className} />;
      case "MessageCircle":
        return <MessageCircle className={className} />;
      case "Mail":
        return <Mail className={className} />;
      case "Calendar":
        return <Calendar className={className} />;
      case "User":
        return <User className={className} />;
      case "Sparkles":
        return <Sparkles className={className} />;
      case "Layers":
        return <Layers className={className} />;
      case "Search":
        return <Search className={className} />;
      case "Zap":
        return <Zap className={className} />;
      case "Shield":
        return <Shield className={className} />;
      case "Globe":
        return <Globe className={className} />;
      case "CheckCircle2":
        return <CheckCircle2 className={className} />;
      case "Bot":
        return <Bot className={className} />;
      case "Building2":
        return <Building2 className={className} />;
      default:
        return <Sparkles className={className} />;
    }
  };

  // Status Badge Renderer for Matrix Row
  const renderStatusBadge = (status: FeatureStatus, note?: string) => {
    switch (status) {
      case "included":
        return (
          <span
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] sm:text-[11px] font-mono font-semibold whitespace-nowrap"
            title={note || "Included in package base"}
          >
            <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
            <span className="hidden sm:inline">Included</span>
          </span>
        );
      case "limited":
        return (
          <span
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] sm:text-[11px] font-mono font-medium whitespace-nowrap"
            title={note || "Included with scope limitation"}
          >
            <Info className="w-3 h-3 text-amber-400" />
            <span className="truncate max-w-[80px]">{note || "Limited"}</span>
          </span>
        );
      case "addon":
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/25 text-sky-300 text-[10px] sm:text-[11px] font-mono whitespace-nowrap">
            <Plus className="w-3 h-3 text-sky-400" />
            <span className="hidden sm:inline">Add-on</span>
          </span>
        );
      case "custom_quote":
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] sm:text-[11px] font-mono whitespace-nowrap">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span className="hidden sm:inline">Quote</span>
          </span>
        );
      case "not_included":
      default:
        return (
          <span className="text-[#555555] text-xs font-mono select-none px-1.5 py-0.5" title="Not available in this tier">
            —
          </span>
        );
    }
  };

  // ---------------------------------------------------------------------------
  // Flow Mode Descriptions
  // ---------------------------------------------------------------------------
  const flowOptions: { mode: PricingFlowMode; icon: React.ReactNode; title: string; subtitle: string }[] = [
    {
      mode: "package",
      icon: <Package className="w-5 h-5" />,
      title: "Package + Extra Features",
      subtitle: "Start with a curated base package, then review and customize with add-ons",
    },
    {
      mode: "custom_only",
      icon: <Wrench className="w-5 h-5" />,
      title: "Fully Custom Build",
      subtitle: "Skip base packages — handpick every individual feature from scratch",
    },
  ];

  // Feature matrix is always visible so users can review, explore, and add features
  const showFeatureMatrix = true;

  return (
    <div className="min-h-screen bg-[#080808] text-[#DCDCDA] pt-6 pb-28 sm:pb-20 px-3 sm:px-6 lg:px-10 2xl:px-16 3xl:px-24 font-sans selection:bg-white selection:text-black">
      <div className="w-full max-w-[1760px] 2xl:max-w-[1920px] 3xl:max-w-[2240px] mx-auto space-y-6 sm:space-y-8 relative z-10">
        {/* ========================================================================= */}
        {/* Top Header & Page Navigation                                              */}
        {/* ========================================================================= */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 motion-safe:animate-pulse" />
              <span className="text-[11px] font-mono tracking-widest text-emerald-400 font-semibold uppercase flex items-center gap-1.5">
                <Database className="w-3 h-3" />
                Webgent Pricing
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-light text-[#F5F5F3] tracking-tight">
              Build Your Website, <span className="font-semibold text-white">Your Way</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#A3A3A3] font-light max-w-3xl leading-relaxed">
              Choose a ready-made package, customize with add-ons, or handpick every feature for a fully custom build. All prices are for development only — third-party service charges are not included.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono shrink-0">
            <button
              type="button"
              onClick={handleReset}
              className="min-h-[40px] px-3.5 py-1.5 rounded-xl text-[#D4D4D4] hover:text-white bg-[#141414] hover:bg-[#1E1E1E] border border-white/[0.08] transition-colors flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              aria-label="Reset estimate to defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="min-h-[40px] px-3.5 py-1.5 rounded-xl text-[#D4D4D4] hover:text-white bg-[#141414] hover:bg-[#1E1E1E] border border-white/[0.08] transition-colors flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              aria-label="Copy shareable link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? "Link Copied" : "Share"}</span>
            </button>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* HOW DO YOU WANT TO BUILD? — 3 Flow Mode Selector                          */}
        {/* ========================================================================= */}
        <section aria-label="Build Mode Selection" className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888]">
              Step 1: How do you want to build your website?
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {flowOptions.map((opt) => {
              const isActive =
                opt.mode === "package"
                  ? flowMode === "package" || flowMode === "package_plus_addons"
                  : flowMode === opt.mode;
              return (
                <button
                  key={opt.mode}
                  type="button"
                  onClick={() => setFlowMode(opt.mode)}
                  className={`relative p-4 sm:p-5 rounded-2xl text-left transition-all duration-200 border flex items-start gap-3.5 select-none group ${
                    isActive
                      ? "bg-[#0E1520] border-emerald-400/90 ring-1 ring-emerald-400/50 shadow-[0_10px_30px_rgba(0,0,0,0.6),0_0_15px_rgba(16,185,129,0.12)]"
                      : "bg-[#0D0D10] border-white/[0.08] hover:border-white/[0.22] hover:bg-[#121217]"
                  }`}
                >
                  <span
                    className={`p-2.5 rounded-xl shrink-0 transition-colors ${
                      isActive
                        ? "bg-emerald-400/20 text-emerald-300"
                        : "bg-white/[0.04] text-[#888888] group-hover:text-white"
                    }`}
                  >
                    {opt.icon}
                  </span>
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{opt.title}</span>
                      {isActive && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 uppercase tracking-wider font-bold">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#9E9E9C] leading-relaxed">{opt.subtitle}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* PACKAGE SELECTION (shown when flow is "package" or "package_plus_addons")   */}
        {/* ========================================================================= */}
        {flowMode !== "custom_only" && (
          <section aria-label="Core Engineering Packages" className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888]">
                  Step 2: Choose Your Base Package
                </span>
                <span className="text-xs text-[#555555]">/</span>
                <span className="text-xs text-[#AAAAAA] font-mono">
                  Active: <strong className="text-white uppercase">{packages[selectedTier].name}</strong> ({formatCurrencyINR(packages[selectedTier].startingPrice)})
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 hidden sm:inline">
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
                        ? "bg-[#0E1520] border-emerald-400/90 ring-1 ring-emerald-400/50 shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(16,185,129,0.12)] -translate-y-0.5"
                        : "bg-[#0D0D10] border-white/[0.08] hover:border-white/[0.22] hover:bg-[#121217]"
                    }`}
                  >
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          isSelected
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            : "bg-white/[0.04] text-[#A0A0A0] border-white/[0.08]"
                        }`}
                      >
                        {pkg.name}
                      </span>

                      {pkg.badge && (
                        <span className="text-[9.5px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
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
                        <span className="text-xs font-mono text-[#888888]">starting</span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-white">{pkg.tagline}</p>
                      <p className="text-[11px] sm:text-xs text-[#A3A3A3] leading-relaxed">{pkg.summary}</p>
                      {pkg.idealFor && (
                        <div className="pt-0.5">
                          <span className="text-[10px] sm:text-[11px] font-mono text-emerald-400/90 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20 inline-block leading-normal">
                            <strong className="text-emerald-300">Best For:</strong> {pkg.idealFor}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Highlights — Complete list of all points without truncation */}
                    <div className="space-y-2 pt-3 border-t border-white/[0.08]">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#A0A0A0] font-semibold">
                          What&apos;s Included ({pkg.keyHighlights.length} Features):
                        </span>
                      </div>
                      <ul
                        className="space-y-2 text-xs sm:text-[13px] text-[#D4D4D4] max-h-56 overflow-y-auto pr-1"
                        style={{
                          scrollbarWidth: "thin",
                          scrollbarColor: "rgba(255, 255, 255, 0.15) transparent",
                          WebkitOverflowScrolling: "touch",
                          touchAction: "pan-y",
                        }}
                      >
                        {pkg.keyHighlights.map((hl, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <span className="p-0.5 rounded bg-emerald-400/10 text-emerald-400 shrink-0 mt-0.5">
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            </span>
                            <span className="leading-snug">{hl}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Delivery & Selection Button */}
                    <div className="pt-2 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-[#888888] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#666666]" />
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
                            ? "bg-emerald-400 text-black shadow-sm"
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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0A120E] to-[#050907] border border-emerald-400/30 shadow-lg">
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <p className="text-sm font-semibold text-white">
                    Selected Base Package: <strong className="text-emerald-400 font-mono uppercase">{currentPackage.name}</strong> ({formatCurrencyINR(currentPackage.startingPrice)})
                  </p>
                </div>
                <p className="text-[11px] text-[#9E9E9C]">
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
                  className="px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-semibold text-xs sm:text-sm tracking-wide transition-all duration-200 flex items-center gap-2 shadow-[0_0_20px_rgba(52,211,153,0.3)] hover:shadow-[0_0_30px_rgba(52,211,153,0.5)] active:scale-[0.99] shrink-0"
                >
                  <span>Add Extra Features</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* CUSTOM BUILD HEADER (shown when flow is "custom_only")                     */}
        {/* ========================================================================= */}
        {flowMode === "custom_only" && (
          <section className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0E1520] to-[#0A0F18] border border-sky-400/30 space-y-2">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-sky-400" />
              <span className="text-sm font-semibold text-white">Fully Custom Build Mode</span>
            </div>
            <p className="text-[11px] text-[#9E9E9C] leading-relaxed max-w-3xl">
              No base package selected. Browse the complete feature catalog below and select exactly the features you need.
              Your total will be calculated based on individual feature prices. Third-party service charges (hosting, SMS, payment gateway fees, domain, email service) are not included.
            </p>
          </section>
        )}

        {/* ========================================================================= */}
        {/* FEATURE MATRIX + COST LEDGER (shown for package_plus_addons & custom_only) */}
        {/* ========================================================================= */}
        {showFeatureMatrix && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 2xl:gap-8 items-start">
            {/* ===================================================================== */}
            {/* LEFT PANE: Scrollable Master Feature Matrix                           */}
            {/* ===================================================================== */}
            <div id="extra-features-section" className="lg:col-span-8 xl:col-span-8 2xl:col-span-8 space-y-4 min-w-0">
              {/* Step Label & Quick Move Forward bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888]">
                    {flowMode !== "custom_only"
                      ? "Step 3: Add Extra Features to Your Package (Optional)"
                      : "Step 2: Select Features for Your Custom Build"}
                  </span>
                </div>

                {flowMode !== "custom_only" && (
                  <div className="flex items-center gap-2 bg-[#0E1712] border border-emerald-500/20 px-3 py-1.5 rounded-xl text-xs">
                    <span className="text-[#A3A3A3] text-[11px]">
                      {activeSelectedAddons.length === 0
                        ? "Don't want extra features?"
                        : `${activeSelectedAddons.length} extra feature${activeSelectedAddons.length > 1 ? "s" : ""} added`}
                    </span>
                    <Link
                      href={quotationUrl}
                      className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline font-mono flex items-center gap-1 ml-1"
                    >
                      <span>Move Forward {activeSelectedAddons.length === 0 ? `with ${currentPackage.name}` : ""}</span>
                      <ArrowRight className="w-3.5 h-3.5 inline" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Control Bar: Search + Category Pills + View Toggles */}
              <div className="rounded-2xl p-4 space-y-3 bg-[#0A0A0D] border border-white/[0.08] shadow-lg">
                {/* Row 1: Search & Controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-[#777777] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search client features (e.g., razorpay, blog, appointment calendar, whatsapp, dark mode)..."
                      className="w-full pl-9 pr-8 py-2.5 rounded-xl text-xs bg-[#111116] border border-white/[0.08] text-white placeholder-[#666666] focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 transition-colors"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#777777] hover:text-white"
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
                        className="bg-[#111116] border border-white/[0.08] text-[#D4D4D4] px-2.5 py-1.5 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-400"
                        aria-label="Filter by package status"
                      >
                        <option value="all">All Statuses</option>
                        <option value="included">Included in {packages[selectedTier].name}</option>
                        <option value="addon">Available as Add-on</option>
                        <option value="custom_quote">Custom Quote Required</option>
                      </select>
                    )}

                    <div className="flex items-center gap-1 bg-[#111116] p-0.5 rounded-lg border border-white/[0.08]">
                      <button
                        type="button"
                        onClick={handleExpandAll}
                        className="px-2 py-1 rounded text-[10px] font-mono text-[#A0A0A0] hover:text-white hover:bg-white/[0.04]"
                        title="Expand all categories"
                      >
                        Expand All
                      </button>
                      <span className="text-[#333333]">|</span>
                      <button
                        type="button"
                        onClick={handleCollapseAll}
                        className="px-2 py-1 rounded text-[10px] font-mono text-[#A0A0A0] hover:text-white hover:bg-white/[0.04]"
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
                        : "bg-[#121217] text-[#909090] hover:text-white border border-white/[0.06]"
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
                            ? "bg-emerald-400 text-black font-semibold shadow-sm"
                            : "bg-[#121217] text-[#909090] hover:text-white border border-white/[0.06]"
                        }`}
                      >
                        <span>{cat.shortLabel}</span>
                        <span className="text-[10px] opacity-75 font-mono">({cat.featureCount})</span>
                      </button>
                    );
                  })}
                </div>

                {/* Status info strip */}
                <div className="flex items-center justify-between text-[11px] font-mono text-[#777777] pt-1 border-t border-white/[0.04] flex-wrap gap-1">
                  <span>
                    Showing <strong className="text-[#D4D4D4]">{filteredFeatures.length}</strong> of {features.length} features across {categories.length} categories
                  </span>
                  {flowMode !== "custom_only" && (
                    <span className="text-emerald-400/90">
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
                className="rounded-2xl border border-white/[0.08] bg-[#0A0A0C] overflow-hidden shadow-2xl"
              >
                {/* Sticky Table Header */}
                <div className="sticky top-0 z-20 bg-[#121318] border-b border-white/[0.12] shadow-md">
                  <div className="px-3 sm:px-5 py-2.5 flex items-center text-[10px] sm:text-xs font-mono uppercase tracking-wider text-[#9E9E9C]">
                    <div className="flex-1 min-w-0">
                      Feature & Scope
                    </div>
                    {flowMode !== "custom_only" && (
                      <>
                        <div className="hidden md:block w-20 text-center shrink-0">
                          <span className={selectedTier === "starter" ? "text-emerald-400 font-bold" : ""}>Starter</span>
                        </div>
                        <div className="hidden md:block w-20 text-center shrink-0">
                          <span className={selectedTier === "business" ? "text-emerald-400 font-bold" : ""}>Business</span>
                        </div>
                        <div className="hidden md:block w-20 text-center shrink-0">
                          <span className={selectedTier === "pro" ? "text-emerald-400 font-bold" : ""}>Pro</span>
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
                      <p className="text-sm text-[#A0A0A0]">No features match your search &ldquo;{searchQuery}&rdquo;</p>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setActiveCategoryKey("all");
                          setStatusFilter("all");
                        }}
                        className="text-xs text-emerald-400 underline font-mono"
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
                            className="sticky top-0 z-10 bg-[#0E0F14]/95 backdrop-blur-md px-3 sm:px-5 py-2.5 flex items-center justify-between cursor-pointer border-y border-white/[0.06] hover:bg-[#13141C] transition-colors group"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="p-1 rounded bg-white/[0.05] text-emerald-400 group-hover:bg-emerald-400 group-hover:text-black transition-colors shrink-0">
                                {renderCategoryIcon(category.iconName, "w-3.5 h-3.5")}
                              </span>
                              <div className="flex items-center gap-2 truncate">
                                <span className="text-[10px] sm:text-xs font-mono text-[#777777]">
                                  {String(category.number).padStart(2, "0")}
                                </span>
                                <h3 className="text-xs sm:text-sm font-semibold text-white tracking-tight truncate">
                                  {category.label}
                                </h3>
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white/[0.04] text-[#A0A0A0] shrink-0">
                                  {items.length}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs font-mono text-[#888888] shrink-0">
                              <span className="text-[10px] hidden lg:inline opacity-75 max-w-[200px] truncate">{category.description}</span>
                              {isCategoryExpanded ? (
                                <ChevronUp className="w-4 h-4 text-[#A0A0A0]" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-[#A0A0A0]" />
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
                                        ? "bg-emerald-950/20"
                                        : "hover:bg-white/[0.02]"
                                    }`}
                                  >
                                    {/* Feature Name, Description Toggle & Badge */}
                                    <div className="flex-1 min-w-0 space-y-0.5 pr-2">
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <span className="font-medium text-[#E5E5E3] hover:text-white transition-colors truncate">
                                          {feat.name}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFeatureDetail(feat.id);
                                          }}
                                          className="text-[#666666] hover:text-[#D4D4D4] p-0.5 rounded transition-colors shrink-0"
                                          title="Toggle details & scope"
                                          aria-label={`Toggle description for ${feat.name}`}
                                        >
                                          <Info className="w-3 h-3" />
                                        </button>
                                        {isMonthly && (
                                          <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 shrink-0">
                                            Monthly
                                          </span>
                                        )}
                                      </div>

                                      {/* Expandable description tooltip */}
                                      {isExpanded && (
                                        <div className="pt-1 text-[11px] text-[#9E9E9C] leading-relaxed bg-[#111217] p-2 rounded-lg border border-white/[0.06] mt-1 space-y-1">
                                          <p>{feat.description}</p>
                                          <div className="text-[10px] font-mono text-[#888888] flex flex-wrap gap-2">
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
                                          className="text-[10px] font-mono text-emerald-400 font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 truncate"
                                          title="Included free in selected package"
                                        >
                                          Included ✓
                                        </span>
                                      ) : isCustomQuote ? (
                                        <button
                                          type="button"
                                          onClick={() => toggleAddon(feat.id)}
                                          className={`px-2 py-1 rounded text-[10px] font-mono font-medium transition-all ${
                                            isSelectedAsQuote
                                              ? "bg-purple-400 text-black font-semibold shadow-sm"
                                              : "bg-purple-950/40 text-purple-300 border border-purple-500/30 hover:bg-purple-900/50"
                                          }`}
                                          title="Add to custom quote scope"
                                        >
                                          {isSelectedAsQuote ? "In Quote ✓" : "Quote"}
                                        </button>
                                      ) : feat.addonPrice ? (
                                        <button
                                          type="button"
                                          onClick={() => toggleAddon(feat.id)}
                                          className={`px-2 py-1 rounded text-[10px] font-mono font-medium tabular-nums transition-all flex items-center gap-1 ${
                                            isSelectedAsAddon
                                              ? "bg-emerald-400 text-black font-bold shadow-sm"
                                              : "bg-[#14151B] text-[#D4D4D4] border border-white/[0.08] hover:border-emerald-500/40 hover:text-white"
                                          }`}
                                          title={`Add ${feat.name} to estimate`}
                                        >
                                          {isSelectedAsAddon ? (
                                            <Check className="w-3 h-3 stroke-[3]" />
                                          ) : (
                                            <Plus className="w-3 h-3 text-emerald-400" />
                                          )}
                                          <span>+{formatCurrencyINR(feat.addonPrice)}</span>
                                        </button>
                                      ) : (
                                        <span className="text-[#555555] text-xs font-mono">—</span>
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
                  <div className="p-3 bg-[#0D1210] border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono">
                    <span className="text-[#888888] text-[11px] text-center sm:text-left">
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
                      className="px-4 py-1.5 rounded-lg bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 hover:bg-emerald-400 hover:text-black font-semibold text-xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
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

            {/* ===================================================================== */}
            {/* RIGHT PANE: STICKY LIVE COST LEDGER & ESTIMATOR                       */}
            {/* ===================================================================== */}
            <aside className="lg:col-span-4 xl:col-span-4 2xl:col-span-4 lg:sticky lg:top-20 lg:self-start space-y-4">
              <div className="rounded-2xl p-5 sm:p-6 space-y-5 border border-emerald-400/40 bg-gradient-to-b from-[#0A120E] to-[#050907] shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(16,185,129,0.10)] relative">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3.5">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-semibold block">
                      Live Engineering Estimate
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      Project Cost Breakdown
                    </h2>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Real-Time</span>
                  </div>
                </div>

                {/* Package Base Summary (only shown in package modes) */}
                {flowMode !== "custom_only" && (
                  <div className="space-y-2 p-3.5 rounded-xl bg-[#0F1D16]/70 border border-emerald-500/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">
                          Base Package
                        </span>
                        <span className="text-sm font-bold text-white uppercase">{currentPackage.name}</span>
                      </div>
                      <span className="text-sm font-mono font-bold text-white">
                        {formatCurrencyINR(currentPackage.startingPrice)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#8E8E8C] pt-1.5 border-t border-emerald-500/15">
                      <span>Scope timeline:</span>
                      <span className="text-white">{currentPackage.deliveryTime}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400/90">
                      <span>Bundled features:</span>
                      <span>{includedCountInTier} features included</span>
                    </div>
                  </div>
                )}

                {/* Custom Build label (custom_only mode) */}
                {flowMode === "custom_only" && (
                  <div className="space-y-1 p-3.5 rounded-xl bg-sky-950/30 border border-sky-500/20">
                    <div className="flex items-center gap-2 text-xs font-mono text-sky-300">
                      <Wrench className="w-3.5 h-3.5" />
                      <span className="font-semibold">Custom Build — No Base Package</span>
                    </div>
                    <p className="text-[10px] text-[#9E9E9C] leading-relaxed">
                      Your total is the sum of individually selected features only.
                    </p>
                  </div>
                )}

                {/* Delivery SLA Switcher */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-[#888888] tracking-wider block">
                    Delivery SLA
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setDeliverySpeed("standard")}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        deliverySpeed === "standard"
                          ? "bg-white/[0.08] text-white border-white/20 font-bold"
                          : "bg-[#0A0D10] text-[#888888] border-white/[0.05] hover:text-white"
                      }`}
                    >
                      <span>Standard</span>
                      <span className="block text-[9px] opacity-75">Included</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliverySpeed("express")}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        deliverySpeed === "express"
                          ? "bg-amber-500/20 text-amber-300 border-amber-400/40 font-bold"
                          : "bg-[#0A0D10] text-[#888888] border-white/[0.05] hover:text-white"
                      }`}
                    >
                      <span>Express</span>
                      <span className="block text-[9px] opacity-75">+20% Speedup</span>
                    </button>
                  </div>
                </div>

                {/* Selected Add-ons List (Scrollable if many) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-[#888888]">
                    <span>Selected Add-ons ({activeSelectedAddons.length})</span>
                    {activeSelectedAddons.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedAddonIds([])}
                        className="text-[10px] text-rose-400 hover:underline"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {activeSelectedAddons.length === 0 ? (
                    <p className="text-[11px] text-[#777777] italic p-3 rounded-lg bg-[#0C120F] border border-white/[0.04]">
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
                            className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#0E1712] border border-white/[0.05] text-xs"
                          >
                            <div className="space-y-0.5 min-w-0">
                              <span className="font-medium text-white truncate block">{addon.name}</span>
                              <span className="text-[10px] font-mono text-[#888888]">
                                {addon.billingType === "monthly" ? "Monthly ongoing" : "One-time build"}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {addon.hasQuantity && (
                                <div className="flex items-center gap-1 bg-[#16221B] px-1.5 py-0.5 rounded border border-white/[0.08] text-[10px] font-mono">
                                  <button
                                    type="button"
                                    onClick={() => updateQuantity(addon.id, -1)}
                                    className="text-[#888888] hover:text-white"
                                    title="Decrease quantity"
                                  >
                                    -
                                  </button>
                                  <span className="font-bold text-white px-1">{qty}</span>
                                  <button
                                    type="button"
                                    onClick={() => updateQuantity(addon.id, 1)}
                                    className="text-[#888888] hover:text-white"
                                    title="Increase quantity"
                                  >
                                    +
                                  </button>
                                </div>
                              )}

                              <span className="font-mono text-emerald-400 font-bold tabular-nums">
                                {formatCurrencyINR(linePrice)}
                                {addon.billingType === "monthly" && "/mo"}
                              </span>

                              <button
                                type="button"
                                onClick={() => removeAddon(addon.id)}
                                className="text-[#666666] hover:text-rose-400 p-0.5"
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
                  <div className="space-y-1.5 p-3 rounded-xl bg-purple-950/20 border border-purple-500/30">
                    <div className="flex items-center justify-between text-xs font-mono text-purple-300">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        Custom Scope ({activeSelectedQuotes.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedQuoteIds([])}
                        className="text-[10px] text-rose-400 hover:underline"
                      >
                        Clear
                      </button>
                    </div>
                    <p className="text-[10px] text-[#A0A0A0] leading-relaxed">
                      These modules are scoped individually during consultation:
                    </p>
                    <ul className="space-y-1 text-xs text-[#DCDCDA] pt-1">
                      {activeSelectedQuotes.map((q) => (
                        <li key={q.id} className="flex items-center justify-between gap-1.5 text-[11px]">
                          <span className="truncate">• {q.name}</span>
                          <span className="text-[10px] font-mono text-purple-400 shrink-0">Custom Quote</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Cost Summary Breakdown */}
                <div className="space-y-2 pt-3 border-t border-emerald-500/20 text-xs font-mono">
                  {flowMode !== "custom_only" && (
                    <div className="flex items-center justify-between text-[#8E8E8C]">
                      <span>Base Package:</span>
                      <span className="text-white">{formatCurrencyINR(currentPackage.startingPrice)}</span>
                    </div>
                  )}

                  {onetimeAddonsCost > 0 && (
                    <div className="flex items-center justify-between text-[#8E8E8C]">
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
                    <div className="flex items-center justify-between text-sky-300 pt-1 border-t border-white/[0.04]">
                      <span>Monthly Recurring:</span>
                      <span>{formatCurrencyINR(monthlyServicesCost)}/month</span>
                    </div>
                  )}

                  {/* Grand Total Highlight */}
                  <div className="pt-3 border-t border-emerald-500/30 flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#A0A0A0] block">
                        Estimated One-Time Total
                      </span>
                      <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
                        {formatCurrencyINR(grandTotalOnetime)}
                      </span>
                    </div>

                    {monthlyServicesCost > 0 && (
                      <div className="text-right">
                        <span className="text-[10px] font-mono uppercase text-sky-400 block">+ Monthly</span>
                        <span className="text-sm font-mono font-bold text-sky-300">
                          {formatCurrencyINR(monthlyServicesCost)}/mo
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Third-party disclaimer */}
                <div className="text-[10px] font-mono text-[#666666] leading-relaxed p-2.5 rounded-lg bg-[#0A0D0A] border border-white/[0.04]">
                  <AlertCircle className="w-3 h-3 inline mr-1 text-amber-500/70" />
                  Third-party service charges (hosting, SMS gateway, payment gateway fees, domain, email service) are not included in these prices.
                </div>

                {/* Client Notes / Requirements input */}
                <div className="space-y-1">
                  <label htmlFor="custom-notes" className="text-[10px] font-mono text-[#888888] uppercase">
                    Project Notes (Optional)
                  </label>
                  <textarea
                    id="custom-notes"
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    rows={2}
                    placeholder="Paste reference websites, special workflows, or deadline requirements..."
                    className="w-full p-2 rounded-xl text-xs bg-[#090C0A] border border-white/[0.08] text-white placeholder-[#555555] focus:outline-none focus:ring-1 focus:ring-emerald-400"
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
                    className="w-full min-h-[46px] px-5 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 active:scale-[0.99] text-black font-semibold text-xs sm:text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(52,211,153,0.35)] hover:shadow-[0_0_35px_rgba(52,211,153,0.5)] cursor-pointer"
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

                  <p className="text-[10px] font-mono text-[#777777] text-center">
                    {flowMode !== "custom_only" && activeSelectedAddons.length === 0 && activeSelectedQuotes.length === 0
                      ? `Zero extra features added • Proceed directly with ${currentPackage.name} package`
                      : "Direct consultation with technical leads • 100% full source code ownership"}
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TRANSPARENCY & QUALITY ASSURANCE DISCLAIMERS                               */}
        {/* ========================================================================= */}
        <section aria-label="Pricing Standards" className="rounded-2xl p-5 sm:p-6 bg-[#0D0D10] border border-white/[0.08] space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white tracking-tight uppercase">
              Webgent Engineering Standards &amp; Guarantees
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-[#9E9E9C] leading-relaxed">
            <div className="space-y-1">
              <strong className="text-[#F0F0EE] block">100% Code Ownership</strong>
              <p>Full GitHub repository transfer on launch. You own all design files, source code, and assets. Zero vendor lock-in.</p>
            </div>
            <div className="space-y-1">
              <strong className="text-[#F0F0EE] block">Strict Zero Double-Charging</strong>
              <p>Any feature included in your base package is never billed as an add-on. Add-ons only cover items outside your selected tier.</p>
            </div>
            <div className="space-y-1">
              <strong className="text-[#F0F0EE] block">Third-Party Services at Actuals</strong>
              <p>Hosting, SMS, payment gateways, and email services are set up in your own accounts at zero studio markup. Their charges are not included in our prices.</p>
            </div>
            <div className="space-y-1">
              <strong className="text-[#F0F0EE] block">Guaranteed Warranty Period</strong>
              <p>Every deployment includes post-launch bug-fix warranty support (14 days for Starter, 30 days for Business, 60 days for Pro).</p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* DIRECT PROJECT PLAN SUBMISSION MODAL (Submits request & fires email)        */}
        {/* ========================================================================= */}
        {isSubmitModalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          >
            <div className="w-full max-w-lg rounded-2xl bg-[#0F1116] border border-white/15 p-6 sm:p-8 shadow-2xl relative text-left space-y-5 animate-in zoom-in-95 duration-200">
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="absolute top-5 right-5 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              {submitPlanSuccess ? (
                <div className="text-center py-4 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      Request Submitted Successfully!
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-400 max-w-sm mx-auto leading-relaxed">
                      We have received your configured project plan. A confirmation has been logged and our engineering team will get in touch via email within 24 hours.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#08090C] border border-white/10 text-xs font-mono text-left space-y-1 text-neutral-300">
                    <div className="text-emerald-400 font-semibold">
                      Plan: {flowMode === "custom_only" ? "Custom Feature Build" : `${currentPackage.name} Package`}
                    </div>
                    <div>Estimated Development: {formatCurrencyINR(grandTotalOnetime)}</div>
                    <div>Delivery Speed: {deliverySpeed === "express" ? "Express SLA (+20%)" : "Standard Timeline"}</div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsSubmitModalOpen(false)}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Done
                    </button>
                    <a
                      href={`https://api.whatsapp.com/send?phone=919876543210&text=Hi%20Mohit,%20I%20just%20submitted%20a%20project%20plan%20from%20the%20pricing%20page%20(${flowMode === "custom_only" ? "Custom" : currentPackage.name}%20Package%20-%20${formatCurrencyINR(grandTotalOnetime)}).`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#1A1E26] hover:bg-[#252B37] text-white border border-white/15 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Chat on WhatsApp</span>
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitPlan} className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                      Submit Your Project Plan
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Enter your details below to submit your configuration and dispatch the inquiry directly.
                    </p>
                  </div>

                  {/* Config Snapshot */}
                  <div className="p-3 rounded-xl bg-[#08090C] border border-white/10 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-[10px] uppercase text-neutral-500 block">Plan Selection:</span>
                      <span className="text-white font-bold">
                        {flowMode === "custom_only" ? "Custom Build" : `${currentPackage.name} Package`}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase text-neutral-500 block">Estimated Cost:</span>
                      <span className="text-emerald-400 font-bold">{formatCurrencyINR(grandTotalOnetime)}</span>
                    </div>
                  </div>

                  {submitPlanError && (
                    <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{submitPlanError}</span>
                    </div>
                  )}

                  {/* Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-neutral-300">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={modalName}
                      onChange={(e) => setModalName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3.5 py-2.5 bg-[#08090C] border border-white/10 rounded-xl text-white text-xs placeholder-neutral-600 focus:outline-none focus:border-white transition-colors"
                    />
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-neutral-300">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={modalEmail}
                        onChange={(e) => setModalEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full px-3.5 py-2.5 bg-[#08090C] border border-white/10 rounded-xl text-white text-xs placeholder-neutral-600 focus:outline-none focus:border-white transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-neutral-300">Phone (Optional)</label>
                      <input
                        type="tel"
                        value={modalPhone}
                        onChange={(e) => setModalPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3.5 py-2.5 bg-[#08090C] border border-white/10 rounded-xl text-white text-xs placeholder-neutral-600 focus:outline-none focus:border-white transition-colors"
                      />
                    </div>
                  </div>

                  {/* Project Notes */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-neutral-300">Project Notes (Optional)</label>
                    <textarea
                      rows={2}
                      value={modalNotes}
                      onChange={(e) => setModalNotes(e.target.value)}
                      placeholder="Reference links, deadline expectations, or specific features..."
                      className="w-full px-3.5 py-2 bg-[#08090C] border border-white/10 rounded-xl text-white text-xs placeholder-neutral-600 focus:outline-none focus:border-white transition-colors resize-none"
                    />
                  </div>

                  {/* Cloudflare Turnstile */}
                  <div className="pt-1">
                    <Turnstile
                      id="pricing-plan-turnstile"
                      ref={planTurnstileRef}
                      size="compact"
                      onVerify={(token) => setPlanTurnstileToken(token)}
                      onExpire={() => setPlanTurnstileToken("")}
                      onError={() => setPlanTurnstileToken("")}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 space-y-2">
                    <button
                      type="submit"
                      disabled={isSubmittingPlan}
                      className="w-full py-3 px-5 rounded-xl bg-emerald-400 hover:bg-emerald-300 active:scale-[0.99] text-black font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-40"
                    >
                      {isSubmittingPlan ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Submitting Plan...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Plan & Send Request</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 pt-1">
                      <span>Response SLA &lt; 24h</span>
                      <Link
                        href={quotationUrl}
                        className="text-neutral-400 hover:text-white underline transition-colors"
                        onClick={() => setIsSubmitModalOpen(false)}
                      >
                        Review on Full Contact Page →
                      </Link>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
