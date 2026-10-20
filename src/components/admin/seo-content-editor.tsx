"use client";

import React, { useState, useTransition } from "react";
import {
  Globe,
  Search,
  Share2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Save,
  Laptop,
  Smartphone,
  Eye,
  Info,
  ShieldCheck,
} from "lucide-react";
import type { SiteSeoSettings, GlobalSeoConfig, PageSeoOverride } from "@/lib/services/cms-shared";
import { DEFAULT_SITE_SEO_SETTINGS, isValidSafeUrl, isTrustedCanonicalOrigin } from "@/lib/services/cms-shared";

interface SeoContentEditorProps {
  initialSettings: SiteSeoSettings;
}

const PUBLIC_ROUTES: Array<{ id: string; name: string; path: string }> = [
  { id: "/", name: "Homepage", path: "/" },
  { id: "/about", name: "About Founder", path: "/about" },
  { id: "/work", name: "Case Studies / Work", path: "/work" },
  { id: "/pricing", name: "Pricing & Calculator", path: "/pricing" },
  { id: "/blog", name: "Engineering Blog", path: "/blog" },
  { id: "/contact", name: "Contact & Inquiries", path: "/contact" },
  { id: "/testimonials", name: "Client Testimonials", path: "/testimonials" },
];

export function SeoContentEditor({ initialSettings }: SeoContentEditorProps) {
  const [settings, setSettings] = useState<SiteSeoSettings>(initialSettings);
  const [activeTab, setActiveTab] = useState<"global" | "pages" | "preview">("global");
  const [selectedRoute, setSelectedRoute] = useState<string>("/");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [isPending, startTransition] = useTransition();

  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
    details?: string[];
  } | null>(null);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Update global SEO field
  const updateGlobal = <K extends keyof GlobalSeoConfig>(key: K, value: GlobalSeoConfig[K]) => {
    setSettings((prev) => ({
      ...prev,
      global: {
        ...prev.global,
        [key]: value,
      },
    }));
    setHasUnsavedChanges(true);
  };

  // Update page-specific override
  const updatePageOverride = <K extends keyof PageSeoOverride>(
    route: string,
    key: K,
    value: PageSeoOverride[K],
  ) => {
    setSettings((prev) => {
      const existing = prev.pages[route] || { route };
      return {
        ...prev,
        pages: {
          ...prev.pages,
          [route]: {
            ...existing,
            [key]: value,
          },
        },
      };
    });
    setHasUnsavedChanges(true);
  };

  // Reset page override to defaults
  const resetPageOverride = (route: string) => {
    setSettings((prev) => {
      const defaultPage = DEFAULT_SITE_SEO_SETTINGS.pages[route] || { route };
      return {
        ...prev,
        pages: {
          ...prev.pages,
          [route]: { ...defaultPage },
        },
      };
    });
    setHasUnsavedChanges(true);
  };

  // Reset all to default
  const handleResetAll = () => {
    if (confirm("Are you sure you want to restore standard production SEO defaults? This will overwrite your unsaved edits.")) {
      setSettings(DEFAULT_SITE_SEO_SETTINGS);
      setHasUnsavedChanges(true);
    }
  };

  // Submit & persist to API
  const handleSave = () => {
    setNotification(null);

    // Front-end validation
    if (!settings.global.siteName.trim()) {
      setNotification({ type: "error", message: "Site Name is required." });
      return;
    }
    if (!settings.global.defaultTitle.trim()) {
      setNotification({ type: "error", message: "Default Site Title is required." });
      return;
    }
    if (!settings.global.titleTemplate.includes("%s")) {
      setNotification({
        type: "error",
        message: "Title Template must include the '%s' placeholder (e.g. '%s | Webgent').",
      });
      return;
    }
    if (!isTrustedCanonicalOrigin(settings.global.canonicalBaseUrl)) {
      setNotification({
        type: "error",
        message:
          "Canonical Base URL must match the configured production site origin or a trusted domain (e.g. 'https://webgent.vercel.app').",
      });
      return;
    }
    if (!isValidSafeUrl(settings.global.defaultOgImage)) {
      setNotification({
        type: "error",
        message: "Default OpenGraph image must be a safe, valid absolute or relative URL.",
      });
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/seo", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(settings),
        });

        const data = await res.json();

        if (!res.ok) {
          const errorDetails = data.errors?.map(
            (e: { field: string; message: string }) => `${e.field}: ${e.message}`,
          );
          setNotification({
            type: "error",
            message: data.message || "Failed to save SEO settings.",
            details: errorDetails,
          });
          return;
        }

        setHasUnsavedChanges(false);
        setNotification({
          type: "success",
          message: data.meta?.cacheRefreshed
            ? "SEO configuration persisted and public cache purged successfully."
            : "SEO saved to database. Warning: Redis cache refresh encountered notices.",
        });
      } catch (err) {
        setNotification({
          type: "error",
          message: "A network error occurred while persisting SEO configuration.",
          details: [String(err)],
        });
      }
    });
  };

  // Derived preview data for active route
  const currentOverride = settings.pages[selectedRoute];
  const effectiveTitle =
    currentOverride?.title?.trim() ||
    (selectedRoute === "/"
      ? settings.global.defaultTitle
      : settings.global.titleTemplate.replace(
          "%s",
          PUBLIC_ROUTES.find((r) => r.path === selectedRoute)?.name || "Page",
        ));

  const effectiveDescription =
    currentOverride?.description?.trim() || settings.global.defaultDescription;

  const effectiveCanonical =
    currentOverride?.canonicalUrl?.trim() ||
    `${settings.global.canonicalBaseUrl.replace(/\/+$/, "")}${selectedRoute === "/" ? "" : selectedRoute}`;

  const isNoIndex =
    currentOverride?.noIndex !== undefined
      ? currentOverride.noIndex
      : !settings.global.defaultRobotsIndex;

  const effectiveOgImage =
    currentOverride?.ogImage?.trim() || settings.global.defaultOgImage;

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Status Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-border/40 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Globe className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Global SEO & Metadata Studio</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage search engine indexing, canonical origin, OpenGraph cards, and per-route metadata.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetAll}
            disabled={isPending}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl border border-border/70 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restore Defaults
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isPending || !hasUnsavedChanges}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            {isPending ? "Saving..." : hasUnsavedChanges ? "Save Changes" : "Saved"}
          </button>
        </div>
      </div>

      {/* Unsaved indicator banner */}
      {hasUnsavedChanges && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-medium">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>You have unsaved SEO configuration changes. Click &apos;Save Changes&apos; to publish and purge cache.</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-[10px] uppercase font-bold tracking-wider">
            Unsaved
          </span>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-xl border text-xs ${
            notification.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : notification.type === "error"
              ? "bg-destructive/10 border-destructive/20 text-destructive"
              : "bg-blue-500/10 border-blue-500/20 text-blue-400"
          }`}
        >
          <div className="flex items-start gap-2.5">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <p className="font-semibold">{notification.message}</p>
              {notification.details && notification.details.length > 0 && (
                <ul className="list-disc list-inside space-y-0.5 text-[11px] opacity-90 pl-1">
                  {notification.details.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status Badges Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border/40 bg-card/40">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Search Indexing</span>
          <div className="flex items-center gap-2 mt-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                settings.global.defaultRobotsIndex ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
              }`}
            />
            <span className="text-sm font-semibold">
              {settings.global.defaultRobotsIndex ? "Active (index, follow)" : "Paused (noindex)"}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {settings.global.defaultRobotsIndex ? "Search crawlers allowed" : "Crawlers blocked site-wide"}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-border/40 bg-card/40">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Canonical Base</span>
          <div className="text-sm font-semibold truncate mt-1.5 font-mono text-primary">
            {settings.global.canonicalBaseUrl || "Not configured"}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Verified production origin</p>
        </div>

        <div className="p-4 rounded-xl border border-border/40 bg-card/40">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Route Overrides</span>
          <div className="text-sm font-semibold mt-1.5">
            {Object.keys(settings.pages).length} Routes Configured
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Per-page custom titles & meta</p>
        </div>

        <div className="p-4 rounded-xl border border-border/40 bg-card/40">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Social Card Format</span>
          <div className="text-sm font-semibold mt-1.5 flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="capitalize">{settings.global.twitterCard.replace(/_/g, " ")}</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Twitter / X & OpenGraph tags</p>
        </div>
      </div>

      {/* Global NoIndex Alert Banner if disabled */}
      {!settings.global.defaultRobotsIndex && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>WARNING: Site-Wide Indexing is Disabled (`noindex`)</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Search engines (Google, Bing, DuckDuckGo) are instructed not to index any page on this site.
            Enable &apos;Search Engine Indexing&apos; below once you are ready for production discovery.
          </p>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border/40 pb-px">
        <button
          type="button"
          onClick={() => setActiveTab("global")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 cursor-pointer ${
            activeTab === "global"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
          }`}
        >
          <Globe className="w-4 h-4" />
          Global SEO & Directives
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("pages")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 cursor-pointer ${
            activeTab === "pages"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
          }`}
        >
          <Search className="w-4 h-4" />
          Page-Level Route Overrides
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 cursor-pointer ${
            activeTab === "preview"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
          }`}
        >
          <Eye className="w-4 h-4" />
          SERP & Social Card Simulator
        </button>
      </div>

      {/* 2. TAB CONTENT */}
      {/* ========================================================================= */}
      {/* TAB 1: GLOBAL SEO DEFAULTS */}
      {/* ========================================================================= */}
      {activeTab === "global" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-border/40 bg-card/40 space-y-6">
            <div>
              <h2 className="text-base font-semibold">Site Identity & Meta Titles</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Baseline titles applied across the entire site when a route does not define its own custom override.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground flex items-center justify-between">
                  <span>Site Brand Name</span>
                  <span className="text-[10px] text-muted-foreground">Required</span>
                </label>
                <input
                  type="text"
                  value={settings.global.siteName}
                  onChange={(e) => updateGlobal("siteName", e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-background border border-border/60 focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g. Webgent"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground flex items-center justify-between">
                  <span>Title Template</span>
                  <span className="text-[10px] text-muted-foreground">Must contain &apos;%s&apos;</span>
                </label>
                <input
                  type="text"
                  value={settings.global.titleTemplate}
                  onChange={(e) => updateGlobal("titleTemplate", e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-background border border-border/60 focus:outline-none focus:ring-1 focus:ring-primary font-mono text-[11px]"
                  placeholder="%s | Webgent"
                />
                <p className="text-[10px] text-muted-foreground">
                  Preview: &quot;{settings.global.titleTemplate.replace("%s", "About Us")}&quot;
                </p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-medium text-foreground flex items-center justify-between">
                  <span>Default Site Title (Root Fallback)</span>
                  <span className="text-[10px] text-muted-foreground">
                    {settings.global.defaultTitle.length}/150 chars
                  </span>
                </label>
                <input
                  type="text"
                  value={settings.global.defaultTitle}
                  onChange={(e) => updateGlobal("defaultTitle", e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-background border border-border/60 focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Webgent — Modern Web Development & Engineering Solutions"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground">Default Meta Description</label>
                  <span
                    className={`text-[10px] font-mono ${
                      settings.global.defaultDescription.length > 160
                        ? "text-amber-500 font-semibold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {settings.global.defaultDescription.length} / 160 recommended (max 300)
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={settings.global.defaultDescription}
                  onChange={(e) => updateGlobal("defaultDescription", e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-background border border-border/60 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  placeholder="Describe your site for search engines..."
                />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-border/40 bg-card/40 space-y-6">
            <div>
              <h2 className="text-base font-semibold">Canonical Origin & Social Sharing</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Verified production URL origin and social sharing card presets (Twitter, LinkedIn, Facebook).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground flex items-center justify-between">
                  <span>Canonical Base URL</span>
                  <span className="text-[10px] text-muted-foreground">Production Origin</span>
                </label>
                <input
                  type="text"
                  value={settings.global.canonicalBaseUrl}
                  onChange={(e) => updateGlobal("canonicalBaseUrl", e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-background border border-border/60 focus:outline-none focus:ring-1 focus:ring-primary font-mono text-[11px]"
                  placeholder="https://webgent.vercel.app"
                />
                <p className="text-[10px] text-muted-foreground">
                  Must be http(s) origin without trailing slash.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground flex items-center justify-between">
                  <span>Twitter / X Creator Handle</span>
                  <span className="text-[10px] text-muted-foreground">e.g. @webgent</span>
                </label>
                <input
                  type="text"
                  value={settings.global.twitterHandle}
                  onChange={(e) => updateGlobal("twitterHandle", e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-background border border-border/60 focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="@webgent"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-medium text-foreground flex items-center justify-between">
                  <span>Default OpenGraph Image URL</span>
                  <span className="text-[10px] text-muted-foreground">1200 x 630 recommended</span>
                </label>
                <input
                  type="text"
                  value={settings.global.defaultOgImage}
                  onChange={(e) => updateGlobal("defaultOgImage", e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-background border border-border/60 focus:outline-none focus:ring-1 focus:ring-primary font-mono text-[11px]"
                  placeholder="https://webgent.vercel.app/api/og?title=Webgent"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Twitter Card Type</label>
                <select
                  value={settings.global.twitterCard}
                  onChange={(e) =>
                    updateGlobal("twitterCard", e.target.value as "summary" | "summary_large_image")
                  }
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-background border border-border/60 focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="summary_large_image">Large Image Card (summary_large_image)</option>
                  <option value="summary">Small Square Card (summary)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-border/40 bg-card/40 space-y-6">
            <div>
              <h2 className="text-base font-semibold">Search Engine Crawler Directives (Robots)</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Control whether web crawlers are permitted to index pages and follow links site-wide.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start justify-between p-4 rounded-xl border border-border/50 bg-background/50">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-foreground">Allow Search Indexing</span>
                  <p className="text-[11px] text-muted-foreground">
                    Instructs Google, Bing, and other crawlers to index this website (`robots: index`).
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.global.defaultRobotsIndex}
                  onChange={(e) => updateGlobal("defaultRobotsIndex", e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer mt-1"
                />
              </div>

              <div className="flex items-start justify-between p-4 rounded-xl border border-border/50 bg-background/50">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-foreground">Allow Link Following</span>
                  <p className="text-[11px] text-muted-foreground">
                    Instructs crawlers to follow hyperlinks on the page (`robots: follow`).
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.global.defaultRobotsFollow}
                  onChange={(e) => updateGlobal("defaultRobotsFollow", e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer mt-1"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PAGE-LEVEL ROUTE OVERRIDES */}
      {/* ========================================================================= */}
      {activeTab === "pages" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Route selector list */}
          <div className="lg:col-span-4 space-y-2">
            <div className="px-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Select Public Route
            </div>
            <div className="space-y-1.5">
              {PUBLIC_ROUTES.map((route) => {
                const override = settings.pages[route.path];
                const hasCustomTitle = Boolean(override?.title?.trim());
                const isCustom = hasCustomTitle || Boolean(override?.description?.trim());
                const isSelected = selectedRoute === route.path;

                return (
                  <button
                    key={route.id}
                    type="button"
                    onClick={() => setSelectedRoute(route.path)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-primary/10 border-primary text-foreground font-medium"
                        : "bg-card/40 border-border/40 hover:bg-card/70 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-medium">{route.name}</div>
                      <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                        {route.path}
                      </div>
                    </div>
                    {isCustom ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary/20 text-primary font-medium">
                        Custom
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-muted text-muted-foreground">
                        Default
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-3.5 rounded-xl border border-border/40 bg-muted/20 text-[11px] text-muted-foreground space-y-1">
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-primary" />
                <span>Dynamic Project & Blog Pages</span>
              </div>
              <p>
                Individual portfolio projects (`/work/[slug]`) and blog articles (`/blog/[slug]`)
                dynamically derive their titles, summaries, and social share badges from their respective
                database records.
              </p>
            </div>
          </div>

          {/* Override Form for selected route */}
          <div className="lg:col-span-8 p-6 rounded-2xl border border-border/40 bg-card/40 space-y-6">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <div>
                <h2 className="text-base font-semibold">
                  Route Override: {PUBLIC_ROUTES.find((r) => r.path === selectedRoute)?.name}
                </h2>
                <p className="text-xs font-mono text-primary mt-0.5">{selectedRoute}</p>
              </div>

              <button
                type="button"
                onClick={() => resetPageOverride(selectedRoute)}
                className="text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border border-border/50 hover:bg-muted"
              >
                Reset Route to Default
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground">Custom Page Title</label>
                  <span className="text-[10px] text-muted-foreground">
                    {(currentOverride?.title || "").length}/150 chars
                  </span>
                </div>
                <input
                  type="text"
                  value={currentOverride?.title || ""}
                  onChange={(e) => updatePageOverride(selectedRoute, "title", e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-background border border-border/60 focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder={`Leave empty to inherit standard title for ${selectedRoute}`}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground">Custom Meta Description</label>
                  <span className="text-[10px] text-muted-foreground">
                    {(currentOverride?.description || "").length}/300 chars
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={currentOverride?.description || ""}
                  onChange={(e) => updatePageOverride(selectedRoute, "description", e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-background border border-border/60 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  placeholder="Custom search description for this specific route..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Custom Canonical URL</label>
                <input
                  type="text"
                  value={currentOverride?.canonicalUrl || ""}
                  onChange={(e) => updatePageOverride(selectedRoute, "canonicalUrl", e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-background border border-border/60 focus:outline-none focus:ring-1 focus:ring-primary font-mono text-[11px]"
                  placeholder={`Default: ${settings.global.canonicalBaseUrl}${selectedRoute === "/" ? "" : selectedRoute}`}
                />
                <p className="text-[10px] text-muted-foreground">
                  Leave blank to auto-generate from canonical base origin.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">Custom OpenGraph Image URL</label>
                  <input
                    type="text"
                    value={currentOverride?.ogImage || ""}
                    onChange={(e) => updatePageOverride(selectedRoute, "ogImage", e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-background border border-border/60 focus:outline-none focus:ring-1 focus:ring-primary font-mono text-[11px]"
                    placeholder="Leave empty to use global default"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/50 bg-background/50 mt-auto">
                  <div className="space-y-0.5">
                    <span className="text-xs font-medium text-foreground">Disallow Indexing for Route</span>
                    <p className="text-[10px] text-muted-foreground">Apply `noindex` only to this page</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(currentOverride?.noIndex)}
                    onChange={(e) => updatePageOverride(selectedRoute, "noIndex", e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SERP & SOCIAL CARD SIMULATOR */}
      {/* ========================================================================= */}
      {activeTab === "preview" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 p-4 rounded-xl border border-border/40 bg-card/40">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-muted-foreground">Simulate Route:</span>
              <select
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg bg-background border border-border/60 font-medium"
              >
                {PUBLIC_ROUTES.map((r) => (
                  <option key={r.id} value={r.path}>
                    {r.name} ({r.path})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-lg border border-border/40">
              <button
                type="button"
                onClick={() => setPreviewDevice("desktop")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-md transition-all ${
                  previewDevice === "desktop"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                Desktop
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice("mobile")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-md transition-all ${
                  previewDevice === "mobile"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                Mobile
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Google Search Result Preview */}
            <div className="p-6 rounded-2xl border border-border/40 bg-card/40 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" />
                  Google SERP Search Snippet
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isNoIndex
                      ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  }`}
                >
                  {isNoIndex ? "NOINDEX (Hidden)" : "INDEXABLE"}
                </span>
              </div>

              <div
                className={`p-4 rounded-xl border border-border/50 bg-[#1f1f1f] text-white font-sans ${
                  previewDevice === "mobile" ? "max-w-sm mx-auto" : "w-full"
                }`}
              >
                {/* Search Header */}
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                    W
                  </div>
                  <div className="text-[11px] leading-tight text-neutral-300 truncate">
                    <span className="font-semibold text-white">{settings.global.siteName}</span>
                    <span className="text-neutral-500 mx-1">›</span>
                    <span className="font-mono text-[10px] text-neutral-400">
                      {effectiveCanonical.replace(/^https?:\/\//, "")}
                    </span>
                  </div>
                </div>

                {/* Search Title */}
                <h3 className="text-base text-[#8ab4f8] hover:underline cursor-pointer font-medium leading-snug line-clamp-2">
                  {effectiveTitle}
                </h3>

                {/* Search Description */}
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed line-clamp-3">
                  {effectiveDescription}
                </p>
              </div>

              {/* Quality Indicators */}
              <div className="space-y-2 pt-2 border-t border-border/30 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Title length ({effectiveTitle.length} chars):</span>
                  <span
                    className={
                      effectiveTitle.length >= 40 && effectiveTitle.length <= 60
                        ? "text-emerald-400 font-medium"
                        : "text-amber-400 font-medium"
                    }
                  >
                    {effectiveTitle.length < 40
                      ? "A bit short (< 40)"
                      : effectiveTitle.length <= 60
                      ? "Optimal length (40-60 chars)"
                      : "May truncate in SERP (> 60)"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Description length ({effectiveDescription.length} chars):</span>
                  <span
                    className={
                      effectiveDescription.length >= 120 && effectiveDescription.length <= 160
                        ? "text-emerald-400 font-medium"
                        : "text-amber-400 font-medium"
                    }
                  >
                    {effectiveDescription.length < 120
                      ? "Short (< 120)"
                      : effectiveDescription.length <= 160
                      ? "Optimal length (120-160 chars)"
                      : "May truncate (> 160)"}
                  </span>
                </div>
              </div>
            </div>

            {/* Social Share Card Preview (OpenGraph / Twitter) */}
            <div className="p-6 rounded-2xl border border-border/40 bg-card/40 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-primary" />
                  Social Share Preview (OpenGraph / Twitter)
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {settings.global.twitterCard}
                </span>
              </div>

              <div className="rounded-xl overflow-hidden border border-border/60 bg-background/80 shadow-md">
                {/* Social Image banner */}
                <div className="aspect-[1200/630] w-full bg-neutral-900 relative overflow-hidden flex items-center justify-center">
                  {effectiveOgImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={effectiveOgImage}
                      alt={effectiveTitle}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : null}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-gradient-to-t from-black/80 to-transparent text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary/30 text-primary-foreground border border-primary/40 font-mono mb-1">
                      {settings.global.siteName}
                    </span>
                    <span className="text-sm font-bold text-white max-w-sm line-clamp-1">{effectiveTitle}</span>
                  </div>
                </div>

                {/* Card meta text */}
                <div className="p-3.5 space-y-1">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                    {settings.global.canonicalBaseUrl.replace(/^https?:\/\//, "")}
                  </div>
                  <div className="text-xs font-semibold text-foreground line-clamp-1">
                    {effectiveTitle}
                  </div>
                  <div className="text-[11px] text-muted-foreground line-clamp-2">
                    {effectiveDescription}
                  </div>
                </div>
              </div>

              {/* Tag inspector summary */}
              <div className="p-3 rounded-xl bg-muted/20 border border-border/40 text-[10px] font-mono space-y-1 overflow-x-auto text-muted-foreground">
                <div>&lt;title&gt;{effectiveTitle}&lt;/title&gt;</div>
                <div>&lt;link rel=&quot;canonical&quot; href=&quot;{effectiveCanonical}&quot; /&gt;</div>
                <div>
                  &lt;meta name=&quot;robots&quot; content=&quot;
                  {isNoIndex ? "noindex, nofollow" : "index, follow"}&quot; /&gt;
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Disclaimer */}
          <div className="p-4 rounded-xl border border-border/40 bg-card/30 text-xs text-muted-foreground flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Search Engine Best Practices & Compliance</p>
              <p className="text-[11px] mt-0.5">
                Configuring complete meta tags, OpenGraph cards, Twitter handles, and canonical URLs adheres strictly
                to modern web standards. Search engine ranking depends on dynamic page quality, domain authority, and
                content relevance; metadata settings provide structured discoverability and crawler compliance.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
