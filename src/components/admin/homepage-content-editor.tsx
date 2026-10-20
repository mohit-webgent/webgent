"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Save,
  RotateCcw,
  ExternalLink,
  Loader2,
  Sparkles,
  Layers,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  CheckCircle2,
  HelpCircle,
  Type,
  Sliders,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import type {
  HomeHeroContent,
  HomeSectionItem,
  HomeSectionId,
} from "@/lib/services/cms-shared";
import {
  DEFAULT_HERO_CONTENT,
  DEFAULT_HOME_SECTIONS,
  isValidSafeUrl,
} from "@/lib/services/cms-shared";

export interface HomepageContentEditorProps {
  initialHero: HomeHeroContent;
  initialSections: HomeSectionItem[];
}

const SECTION_METADATA: Record<
  HomeSectionId,
  { title: string; subtitle: string; category: string }
> = {
  hero: {
    title: "Hero Section",
    subtitle: "Opening studio visual, kinetic typography, and primary lead generation CTA",
    category: "Introductory",
  },
  capabilities: {
    title: "Interactive Capabilities",
    subtitle: "Sticky discipline cards detailing architecture, engineering, and digital systems",
    category: "Core Services",
  },
  howWeBuild: {
    title: "Signature 'How We Build'",
    subtitle: "Interactive 3D product evolution and engineering methodology walkthrough",
    category: "Process",
  },
  showcase: {
    title: "Horizontal Case Studies",
    subtitle: "Featured production client projects with horizontal scroll storytelling",
    category: "Portfolio",
  },
  testimonials: {
    title: "Arc Testimonials",
    subtitle: "Curved arc carousel displaying approved verified client endorsements",
    category: "Social Proof",
  },
  blog: {
    title: "Engineering Blog",
    subtitle: "Selected architectural deep dives and technical articles",
    category: "Thought Leadership",
  },
  cta: {
    title: "Footer Contact CTA",
    subtitle: "'Have Something Worth Building?' closing inquiry banner",
    category: "Conversion",
  },
};

export function HomepageContentEditor({
  initialHero,
  initialSections,
}: HomepageContentEditorProps) {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<"hero" | "sections">("hero");
  const [hero, setHero] = useState<HomeHeroContent>(initialHero);
  const [savedHero, setSavedHero] = useState<HomeHeroContent>(initialHero);

  const [sections, setSections] = useState<HomeSectionItem[]>(initialSections);
  const [savedSections, setSavedSections] = useState<HomeSectionItem[]>(initialSections);

  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Check if form is dirty
  const isDirty =
    JSON.stringify(hero) !== JSON.stringify(savedHero) ||
    JSON.stringify(sections) !== JSON.stringify(savedSections);

  const handleSaveRef = useRef<() => void>();

  // Warn before leaving if unsaved changes exist
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

  // Move section position up
  const moveSectionUp = (index: number) => {
    if (index === 0) return;
    setSections((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy.map((sec, idx) => ({ ...sec, order: idx + 1 }));
    });
  };

  // Move section position down
  const moveSectionDown = (index: number) => {
    if (index === sections.length - 1) return;
    setSections((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy.map((sec, idx) => ({ ...sec, order: idx + 1 }));
    });
  };

  // Toggle section enabled
  const toggleSectionEnabled = (id: HomeSectionId) => {
    setSections((prev) =>
      prev.map((sec) => (sec.id === id ? { ...sec, enabled: !sec.enabled } : sec)),
    );
  };

  // Reset to last saved state
  const handleResetToSaved = () => {
    setHero(savedHero);
    setSections(savedSections);
    setFieldErrors({});
    toast.info("Reverted to saved homepage configuration.");
  };

  // Reset to default studio settings
  const handleResetToDefaults = () => {
    setHero(DEFAULT_HERO_CONTENT);
    setSections(DEFAULT_HOME_SECTIONS.sections);
    setFieldErrors({});
    toast.info("Loaded default studio settings. Click 'Save Changes' to apply.");
  };

  // Reload fresh state from server
  const [refreshing, setRefreshing] = useState(false);
  const handleRefreshFromServer = async () => {
    if (saving || refreshing) return;
    if (isDirty) {
      const confirmDiscard = window.confirm(
        "You have unsaved changes. Refreshing will overwrite them with the latest server data. Continue?",
      );
      if (!confirmDiscard) return;
    }

    setRefreshing(true);
    try {
      const res = await fetch("/api/admin/pages");
      if (!res.ok) {
        toast.error("Failed to fetch latest content from server.");
        return;
      }
      const data = await res.json();
      if (data.success && data.data) {
        setHero(data.data.hero);
        setSavedHero(data.data.hero);
        setSections(data.data.sections);
        setSavedSections(data.data.sections);
        setFieldErrors({});
        toast.success("Loaded latest homepage content from server.");
      }
    } catch {
      toast.error("Network error while syncing server state.");
    } finally {
      setRefreshing(false);
    }
  };

  // Validate form client-side
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!hero.eyebrow.trim()) errors.eyebrow = "Eyebrow is required";
    if (!hero.headlineLine1.trim()) errors.headlineLine1 = "Headline Line 1 is required";
    if (!hero.headlineLine2.trim()) errors.headlineLine2 = "Headline Line 2 is required";
    if (!hero.headlineLine3.trim()) errors.headlineLine3 = "Headline Line 3 is required";
    if (!hero.subheadline.trim()) errors.subheadline = "Subheadline is required";

    if (!hero.primaryCtaText.trim()) errors.primaryCtaText = "Primary CTA label is required";
    if (!hero.primaryCtaLink.trim()) {
      errors.primaryCtaLink = "Primary CTA URL is required";
    } else if (!isValidSafeUrl(hero.primaryCtaLink.trim())) {
      errors.primaryCtaLink = "Must be a safe root-relative path (e.g. /contact) or valid http(s) URL without unsafe protocols or protocol-relative slashes";
    }

    if (!hero.secondaryCtaText.trim()) errors.secondaryCtaText = "Secondary CTA label is required";
    if (!hero.secondaryCtaLink.trim()) {
      errors.secondaryCtaLink = "Secondary CTA URL is required";
    } else if (!isValidSafeUrl(hero.secondaryCtaLink.trim())) {
      errors.secondaryCtaLink = "Must be a safe root-relative path (e.g. /work) or valid http(s) URL without unsafe protocols or protocol-relative slashes";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save handler with concurrent save prevention and honest cache feedback
  const handleSave = async () => {
    if (saving) return; // Prevent concurrent submissions
    if (!validateForm()) {
      toast.error("Please fix the validation errors before saving.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/pages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hero,
          sections,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error?.message || "Failed to update homepage content");
        if (data.error?.details && Array.isArray(data.error.details)) {
          const remoteErrors: Record<string, string> = {};
          for (const d of data.error.details) {
            remoteErrors[d.field] = d.message;
          }
          setFieldErrors(remoteErrors);
        }
        return;
      }

      setSavedHero(hero);
      setSavedSections(sections);
      setFieldErrors({});

      if (data.meta?.cacheRefreshed === false) {
        toast.warning(
          data.meta?.message ||
            "Saved to database, but cache revalidation encountered warnings. Public view may take a few moments to sync.",
        );
      } else {
        toast.success(data.meta?.message || "Homepage content & layout updated successfully!");
      }
    } catch {
      toast.error("Network error while saving changes. Please retry.");
    } finally {
      setSaving(false);
    }
  };

  handleSaveRef.current = handleSave;

  return (
    <div className="space-y-6">
      {/* =================================================================== */}
      {/* TOP HEADER & ACTION RIBBON                                          */}
      {/* =================================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Homepage Content Editor
            </h1>
            {isDirty ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Unsaved Changes
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Saved
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Manage live hero messaging, CTA redirect paths, and section ordering with instant cache revalidation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleRefreshFromServer}
            disabled={saving || refreshing}
            title="Fetch latest saved homepage state from server"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#181920] hover:bg-[#22242E] disabled:opacity-40 text-neutral-300 hover:text-white border border-white/[0.08] text-xs font-medium transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-amber-400" : "opacity-60"}`} />
            <span>Sync</span>
          </button>

          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#181920] hover:bg-[#22242E] text-neutral-300 hover:text-white border border-white/[0.08] text-xs font-medium transition-colors"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </Link>

          <button
            type="button"
            onClick={handleResetToSaved}
            disabled={!isDirty || saving}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#181920] hover:bg-[#22242E] disabled:opacity-40 disabled:cursor-not-allowed text-neutral-300 hover:text-white border border-white/[0.08] text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Revert</span>
          </button>

          <button
            type="button"
            onClick={handleResetToDefaults}
            disabled={saving}
            title="Reset to default studio content"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#181920] hover:bg-[#22242E] disabled:opacity-40 text-neutral-400 hover:text-white border border-white/[0.08] text-xs font-medium transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || saving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-white hover:bg-neutral-100 disabled:bg-neutral-700 disabled:text-neutral-400 text-black font-semibold text-xs transition-all shadow-md active:translate-y-0.5"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* TAB NAVIGATION                                                      */}
      {/* =================================================================== */}
      <div className="flex border-b border-white/[0.08] gap-4">
        <button
          type="button"
          onClick={() => setActiveTab("hero")}
          className={`flex items-center gap-2 py-3 px-1 border-b-2 text-xs sm:text-sm font-semibold transition-colors ${
            activeTab === "hero"
              ? "border-white text-white"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          <Type className="w-4 h-4" />
          <span>Hero Content &amp; Messaging</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("sections")}
          className={`flex items-center gap-2 py-3 px-1 border-b-2 text-xs sm:text-sm font-semibold transition-colors ${
            activeTab === "sections"
              ? "border-white text-white"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Section Visibility &amp; Ordering</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/[0.08] text-neutral-300">
            {sections.filter((s) => s.enabled).length}/{sections.length}
          </span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: HERO CONTENT & MESSAGING                                    */}
      {/* =================================================================== */}
      {activeTab === "hero" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Editing Form (Col span 7) */}
          <div className="lg:col-span-7 space-y-6 bg-[#101116] border border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-xl">
            <div className="border-b border-white/[0.06] pb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Type className="w-4 h-4 text-neutral-400" />
                <span>Hero Copywriting &amp; CTAs</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Edit the primary typography sequence and conversion buttons displayed above the fold.
              </p>
            </div>

            {/* Eyebrow */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-neutral-300">
                  Eyebrow Moniker <span className="text-rose-400">*</span>
                </label>
                <span className="text-[10px] text-neutral-400">{hero.eyebrow.length}/120</span>
              </div>
              <input
                type="text"
                value={hero.eyebrow}
                maxLength={120}
                onChange={(e) => setHero({ ...hero, eyebrow: e.target.value })}
                placeholder="WEBGENT / DIGITAL ENGINEERING STUDIO"
                className={`w-full px-3.5 py-2.5 rounded-lg bg-[#181920] border text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-white transition-all ${
                  fieldErrors.eyebrow ? "border-rose-500/80" : "border-white/[0.1] hover:border-white/20"
                }`}
              />
              {fieldErrors.eyebrow && (
                <p className="text-[11px] text-rose-400">{fieldErrors.eyebrow}</p>
              )}
            </div>

            {/* Headline Segments (3-part sequence) */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-medium text-neutral-300 block">
                Headline Lines (Sequential Kinetic Reveal) <span className="text-rose-400">*</span>
              </label>

              {/* Line 1 */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-neutral-400">
                  <span>Line 1 (Primary High-Contrast)</span>
                  <span>{hero.headlineLine1.length}/80</span>
                </div>
                <input
                  type="text"
                  value={hero.headlineLine1}
                  maxLength={80}
                  onChange={(e) => setHero({ ...hero, headlineLine1: e.target.value })}
                  placeholder="YOU IMAGINE"
                  className={`w-full px-3.5 py-2.5 rounded-lg bg-[#181920] border text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-white transition-all ${
                    fieldErrors.headlineLine1 ? "border-rose-500/80" : "border-white/[0.1] hover:border-white/20"
                  }`}
                />
                {fieldErrors.headlineLine1 && (
                  <p className="text-[11px] text-rose-400">{fieldErrors.headlineLine1}</p>
                )}
              </div>

              {/* Line 2 */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-neutral-400">
                  <span>Line 2 (Muted Studio Tone)</span>
                  <span>{hero.headlineLine2.length}/80</span>
                </div>
                <input
                  type="text"
                  value={hero.headlineLine2}
                  maxLength={80}
                  onChange={(e) => setHero({ ...hero, headlineLine2: e.target.value })}
                  placeholder="WE ENGINEER"
                  className={`w-full px-3.5 py-2.5 rounded-lg bg-[#181920] border text-xs text-[#A8A8A8] placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-white transition-all ${
                    fieldErrors.headlineLine2 ? "border-rose-500/80" : "border-white/[0.1] hover:border-white/20"
                  }`}
                />
                {fieldErrors.headlineLine2 && (
                  <p className="text-[11px] text-rose-400">{fieldErrors.headlineLine2}</p>
                )}
              </div>

              {/* Line 3 */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-neutral-400">
                  <span>Line 3 (Final Emphatic Line)</span>
                  <span>{hero.headlineLine3.length}/80</span>
                </div>
                <input
                  type="text"
                  value={hero.headlineLine3}
                  maxLength={80}
                  onChange={(e) => setHero({ ...hero, headlineLine3: e.target.value })}
                  placeholder="REALITY."
                  className={`w-full px-3.5 py-2.5 rounded-lg bg-[#181920] border text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-white transition-all ${
                    fieldErrors.headlineLine3 ? "border-rose-500/80" : "border-white/[0.1] hover:border-white/20"
                  }`}
                />
                {fieldErrors.headlineLine3 && (
                  <p className="text-[11px] text-rose-400">{fieldErrors.headlineLine3}</p>
                )}
              </div>
            </div>

            {/* Subheadline Paragraph */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-neutral-300">
                  Supporting Paragraph <span className="text-rose-400">*</span>
                </label>
                <span className="text-[10px] text-neutral-400">{hero.subheadline.length}/400</span>
              </div>
              <textarea
                rows={3}
                value={hero.subheadline}
                maxLength={400}
                onChange={(e) => setHero({ ...hero, subheadline: e.target.value })}
                placeholder="We design and build digital products for ambitious businesses."
                className={`w-full px-3.5 py-2.5 rounded-lg bg-[#181920] border text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-white transition-all resize-none ${
                  fieldErrors.subheadline ? "border-rose-500/80" : "border-white/[0.1] hover:border-white/20"
                }`}
              />
              {fieldErrors.subheadline && (
                <p className="text-[11px] text-rose-400">{fieldErrors.subheadline}</p>
              )}
            </div>

            {/* CTA Buttons Configuration */}
            <div className="space-y-4 pt-3 border-t border-white/[0.06]">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Call to Action Buttons
              </h3>

              {/* Primary CTA */}
              <div className="p-4 rounded-xl bg-[#14151C] border border-white/[0.06] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Primary Action (Satin Tactile Button)</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    High-Emphasis
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Button Text</label>
                    <input
                      type="text"
                      value={hero.primaryCtaText}
                      maxLength={50}
                      onChange={(e) => setHero({ ...hero, primaryCtaText: e.target.value })}
                      placeholder="START YOUR PROJECT"
                      className="w-full px-3 py-2 rounded-lg bg-[#1C1E26] border border-white/[0.08] text-xs text-white focus:outline-none focus:ring-1 focus:ring-white"
                    />
                    {fieldErrors.primaryCtaText && (
                      <p className="text-[10px] text-rose-400 mt-1">{fieldErrors.primaryCtaText}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Destination URL</label>
                    <input
                      type="text"
                      value={hero.primaryCtaLink}
                      maxLength={200}
                      onChange={(e) => setHero({ ...hero, primaryCtaLink: e.target.value })}
                      placeholder="/contact"
                      className="w-full px-3 py-2 rounded-lg bg-[#1C1E26] border border-white/[0.08] text-xs text-white focus:outline-none focus:ring-1 focus:ring-white"
                    />
                    {fieldErrors.primaryCtaLink && (
                      <p className="text-[10px] text-rose-400 mt-1">{fieldErrors.primaryCtaLink}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Secondary CTA */}
              <div className="p-4 rounded-xl bg-[#14151C] border border-white/[0.06] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Secondary Action (Glass Ghost Button)</span>
                  <span className="text-[10px] text-neutral-400 bg-white/[0.05] px-2 py-0.5 rounded border border-white/10">
                    Outline
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Button Text</label>
                    <input
                      type="text"
                      value={hero.secondaryCtaText}
                      maxLength={50}
                      onChange={(e) => setHero({ ...hero, secondaryCtaText: e.target.value })}
                      placeholder="EXPLORE PORTFOLIO"
                      className="w-full px-3 py-2 rounded-lg bg-[#1C1E26] border border-white/[0.08] text-xs text-white focus:outline-none focus:ring-1 focus:ring-white"
                    />
                    {fieldErrors.secondaryCtaText && (
                      <p className="text-[10px] text-rose-400 mt-1">{fieldErrors.secondaryCtaText}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Destination URL</label>
                    <input
                      type="text"
                      value={hero.secondaryCtaLink}
                      maxLength={200}
                      onChange={(e) => setHero({ ...hero, secondaryCtaLink: e.target.value })}
                      placeholder="/work"
                      className="w-full px-3 py-2 rounded-lg bg-[#1C1E26] border border-white/[0.08] text-xs text-white focus:outline-none focus:ring-1 focus:ring-white"
                    />
                    {fieldErrors.secondaryCtaLink && (
                      <p className="text-[10px] text-rose-400 mt-1">{fieldErrors.secondaryCtaLink}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Real-Time Visual Preview Card (Col span 5) */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
            <div className="bg-[#0A0A0E] border border-white/[0.1] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-6">
                <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Live Hero Preview
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  Synchronous
                </span>
              </div>

              {/* Eyebrow Preview */}
              <div className="text-[9px] font-mono tracking-[0.2em] text-[#8A8A8A] uppercase mb-3">
                {hero.eyebrow || "WEBGENT / DIGITAL ENGINEERING STUDIO"}
              </div>

              {/* Headline Preview */}
              <div className="text-2xl sm:text-3xl font-bold tracking-tight leading-[1.05] uppercase text-[#F5F5F3] space-y-1 mb-4">
                <div className="text-white">{hero.headlineLine1 || "YOU IMAGINE"}</div>
                <div className="text-[#A8A8A8]">{hero.headlineLine2 || "WE ENGINEER"}</div>
                <div className="text-white">{hero.headlineLine3 || "REALITY."}</div>
              </div>

              {/* Paragraph Preview */}
              <p className="text-xs text-[#8A8A8A] leading-relaxed mb-6 line-clamp-3">
                {hero.subheadline || "We design and build digital products for ambitious businesses."}
              </p>

              {/* Buttons Preview */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <div className="px-3.5 py-2 rounded-lg bg-white text-black text-[11px] font-semibold tracking-wider uppercase shadow-sm">
                  {hero.primaryCtaText || "START YOUR PROJECT"}
                </div>
                <div className="px-3.5 py-2 rounded-lg bg-white/[0.04] text-[#E5E5E3] border border-white/[0.12] text-[11px] font-semibold tracking-wider uppercase">
                  {hero.secondaryCtaText || "EXPLORE PORTFOLIO"}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-white/[0.06] text-[11px] text-neutral-400 flex items-center gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span>Renders identically across desktop, tablet, and mobile breakpoints.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: SECTION VISIBILITY & ORDERING                                */}
      {/* =================================================================== */}
      {activeTab === "sections" && (
        <div className="space-y-6">
          <div className="bg-[#101116] border border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4 mb-6">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-neutral-400" />
                  <span>Homepage Section Flow &amp; Visibility</span>
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Reorder sections using the arrows (▲/▼) or toggle visibility switches to show/hide sections instantly.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSections(DEFAULT_HOME_SECTIONS.sections)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181920] hover:bg-[#20222C] text-xs text-neutral-300 border border-white/[0.08] transition-colors self-start sm:self-auto"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Default Sequence</span>
              </button>
            </div>

            {/* List of 7 Sections */}
            <div className="space-y-3">
              {sections.map((section, index) => {
                const meta = SECTION_METADATA[section.id] || {
                  title: section.id,
                  subtitle: "Section content block",
                  category: "General",
                };

                return (
                  <div
                    key={section.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border transition-all ${
                      section.enabled
                        ? "bg-[#15161E] border-white/[0.08] hover:border-white/20"
                        : "bg-[#111218]/60 border-white/[0.04] opacity-60"
                    }`}
                  >
                    {/* Left: Position & Title */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="flex flex-col items-center justify-center w-8 h-8 rounded-lg bg-[#1F212B] border border-white/[0.08] text-xs font-mono font-bold text-white shrink-0">
                        {index + 1}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-white truncate">
                            {meta.title}
                          </h3>
                          <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-white/[0.06] text-neutral-400 border border-white/[0.06]">
                            {meta.category}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 truncate mt-0.5">
                          {meta.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Right: Controls (Move Up, Move Down, Toggle Switch) */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      {/* Move Up */}
                      <button
                        type="button"
                        onClick={() => moveSectionUp(index)}
                        disabled={index === 0}
                        title="Move Up"
                        className="p-2 rounded-lg bg-[#1C1E26] hover:bg-[#262833] disabled:opacity-30 disabled:cursor-not-allowed text-neutral-300 hover:text-white border border-white/[0.06] transition-colors"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      {/* Move Down */}
                      <button
                        type="button"
                        onClick={() => moveSectionDown(index)}
                        disabled={index === sections.length - 1}
                        title="Move Down"
                        className="p-2 rounded-lg bg-[#1C1E26] hover:bg-[#262833] disabled:opacity-30 disabled:cursor-not-allowed text-neutral-300 hover:text-white border border-white/[0.06] transition-colors"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Visibility Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleSectionEnabled(section.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          section.enabled
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                            : "bg-neutral-800 text-neutral-400 border-white/[0.06] hover:bg-neutral-700"
                        }`}
                      >
                        {section.enabled ? (
                          <>
                            <Eye className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Enabled</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-neutral-400" />
                            <span>Hidden</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
