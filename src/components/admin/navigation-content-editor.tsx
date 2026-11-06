"use client";

import React, { useState, useMemo } from "react";
import {
  Save,
  RotateCcw,
  Loader2,
  Compass,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  AlertCircle,
  ExternalLink,
  Layers,
  Sparkles,
  Link2,
  Globe,
  Tag,
  Share2,
  Info,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-provider";
import type {
  NavItem,
  NavigationMenuConfig,
  FooterLinkItem,
  FooterConfig,
} from "@/lib/services/cms-shared";
import {
  DEFAULT_NAVIGATION_MENU,
  DEFAULT_FOOTER_CONFIG,
  isValidSafeUrl,
} from "@/lib/services/cms-shared";

export interface NavigationContentEditorProps {
  initialNavigation: NavigationMenuConfig;
  initialFooter: FooterConfig;
}

export function NavigationContentEditor({
  initialNavigation,
  initialFooter,
}: NavigationContentEditorProps) {
  const toast = useToast();
  const confirm = useConfirm();

  const [activeTab, setActiveTab] = useState<"nav" | "footer" | "preview">("nav");

  // Navigation Items State
  const [navItems, setNavItems] = useState<NavItem[]>(() =>
    initialNavigation.items.map((item, i) => ({
      ...item,
      id: item.id || `nav-${i + 1}`,
      order: item.order ?? i + 1,
      isExternal: Boolean(item.isExternal),
      published: item.published !== false,
    })),
  );

  const [savedNavItems, setSavedNavItems] = useState<NavItem[]>(() =>
    initialNavigation.items.map((item, i) => ({
      ...item,
      id: item.id || `nav-${i + 1}`,
      order: item.order ?? i + 1,
      isExternal: Boolean(item.isExternal),
      published: item.published !== false,
    })),
  );

  // Footer Config State
  const [footerConfig, setFooterConfig] = useState<FooterConfig>(() => ({
    brandTagline: initialFooter.brandTagline || DEFAULT_FOOTER_CONFIG.brandTagline,
    systemsLinks: initialFooter.systemsLinks.map((item, i) => ({
      ...item,
      id: item.id || `footer-sys-${i + 1}`,
      isExternal: Boolean(item.isExternal),
      published: item.published !== false,
    })),
    coreStack: [...initialFooter.coreStack],
    connectLinks: initialFooter.connectLinks.map((item, i) => ({
      ...item,
      id: item.id || `footer-conn-${i + 1}`,
      isExternal: Boolean(item.isExternal),
      published: item.published !== false,
    })),
    copyrightText: initialFooter.copyrightText || DEFAULT_FOOTER_CONFIG.copyrightText,
  }));

  const [savedFooterConfig, setSavedFooterConfig] = useState<FooterConfig>(() => ({
    brandTagline: initialFooter.brandTagline || DEFAULT_FOOTER_CONFIG.brandTagline,
    systemsLinks: initialFooter.systemsLinks.map((item, i) => ({
      ...item,
      id: item.id || `footer-sys-${i + 1}`,
      isExternal: Boolean(item.isExternal),
      published: item.published !== false,
    })),
    coreStack: [...initialFooter.coreStack],
    connectLinks: initialFooter.connectLinks.map((item, i) => ({
      ...item,
      id: item.id || `footer-conn-${i + 1}`,
      isExternal: Boolean(item.isExternal),
      published: item.published !== false,
    })),
    copyrightText: initialFooter.copyrightText || DEFAULT_FOOTER_CONFIG.copyrightText,
  }));

  // New core stack tag input
  const [newStackTag, setNewStackTag] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Dirty detection
  const isDirty = useMemo(() => {
    return (
      JSON.stringify(navItems) !== JSON.stringify(savedNavItems) ||
      JSON.stringify(footerConfig) !== JSON.stringify(savedFooterConfig)
    );
  }, [navItems, savedNavItems, footerConfig, savedFooterConfig]);

  // URL sanity check
  const urlValidationErrors = useMemo(() => {
    const errors: string[] = [];
    navItems.forEach((item) => {
      if (!isValidSafeUrl(item.href)) {
        errors.push(`Header Nav "${item.title || "Untitled"}": Invalid URL "${item.href}"`);
      }
    });
    footerConfig.systemsLinks.forEach((item) => {
      if (!isValidSafeUrl(item.href)) {
        errors.push(`Footer Systems Link "${item.title || "Untitled"}": Invalid URL "${item.href}"`);
      }
    });
    footerConfig.connectLinks.forEach((item) => {
      if (!isValidSafeUrl(item.href)) {
        errors.push(`Footer Connect Link "${item.title || "Untitled"}": Invalid URL "${item.href}"`);
      }
    });
    return errors;
  }, [navItems, footerConfig]);

  // --------------------------------------------------------------------------
  // Header Nav Handlers
  // --------------------------------------------------------------------------
  const handleAddNavItem = () => {
    const newId = `nav-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`;
    const newItem: NavItem = {
      id: newId,
      title: "New Link",
      href: "/new-page",
      order: navItems.length + 1,
      isExternal: false,
      published: true,
    };
    setNavItems((prev) => [...prev, newItem]);
    toast.success("Navigation item added", "Configure label and destination below.");
  };

  const handleUpdateNavItem = (
    id: string,
    field: keyof NavItem,
    value: string | boolean | number,
  ) => {
    setNavItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const handleDeleteNavItem = (id: string) => {
    if (navItems.length <= 1) {
      toast.error("Cannot delete", "At least one header navigation item is required.");
      return;
    }
    setNavItems((prev) =>
      prev.filter((item) => item.id !== id).map((item, i) => ({ ...item, order: i + 1 })),
    );
    toast.info("Item removed", "Save to publish this change.");
  };

  const handleMoveNavUp = (index: number) => {
    if (index <= 0) return;
    setNavItems((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next.map((item, i) => ({ ...item, order: i + 1 }));
    });
  };

  const handleMoveNavDown = (index: number) => {
    if (index >= navItems.length - 1) return;
    setNavItems((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next.map((item, i) => ({ ...item, order: i + 1 }));
    });
  };

  // --------------------------------------------------------------------------
  // Footer Handlers
  // --------------------------------------------------------------------------
  const handleAddSystemsLink = () => {
    const newId = `footer-sys-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`;
    const newItem: FooterLinkItem = {
      id: newId,
      title: "New Page",
      href: "/work",
      isExternal: false,
      published: true,
    };
    setFooterConfig((prev) => ({
      ...prev,
      systemsLinks: [...prev.systemsLinks, newItem],
    }));
  };

  const handleUpdateSystemsLink = (
    id: string,
    field: keyof FooterLinkItem,
    value: string | boolean,
  ) => {
    setFooterConfig((prev) => ({
      ...prev,
      systemsLinks: prev.systemsLinks.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const handleDeleteSystemsLink = (id: string) => {
    setFooterConfig((prev) => ({
      ...prev,
      systemsLinks: prev.systemsLinks.filter((item) => item.id !== id),
    }));
  };

  const handleAddConnectLink = () => {
    const newId = `footer-conn-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`;
    const newItem: FooterLinkItem = {
      id: newId,
      title: "Social Profile",
      href: "https://",
      isExternal: true,
      published: true,
    };
    setFooterConfig((prev) => ({
      ...prev,
      connectLinks: [...prev.connectLinks, newItem],
    }));
  };

  const handleUpdateConnectLink = (
    id: string,
    field: keyof FooterLinkItem,
    value: string | boolean,
  ) => {
    setFooterConfig((prev) => ({
      ...prev,
      connectLinks: prev.connectLinks.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const handleDeleteConnectLink = (id: string) => {
    setFooterConfig((prev) => ({
      ...prev,
      connectLinks: prev.connectLinks.filter((item) => item.id !== id),
    }));
  };

  const handleAddStackTag = () => {
    if (!newStackTag.trim()) return;
    if (footerConfig.coreStack.includes(newStackTag.trim())) {
      toast.warning("Duplicate tag", "Technology already exists in core stack.");
      return;
    }
    setFooterConfig((prev) => ({
      ...prev,
      coreStack: [...prev.coreStack, newStackTag.trim()],
    }));
    setNewStackTag("");
  };

  const handleDeleteStackTag = (tag: string) => {
    if (footerConfig.coreStack.length <= 1) {
      toast.error("Cannot remove", "Core stack requires at least one technology tag.");
      return;
    }
    setFooterConfig((prev) => ({
      ...prev,
      coreStack: prev.coreStack.filter((t) => t !== tag),
    }));
  };

  // --------------------------------------------------------------------------
  // Global Actions
  // --------------------------------------------------------------------------
  const handleResetToDefaults = async () => {
    if (
      await confirm({
        title: "Reset navigation to defaults?",
        description: "This replaces the header menu and footer with the defaults. Unsaved edits will be lost.",
        confirmText: "Reset navigation",
      })
    ) {
      setNavItems(
        DEFAULT_NAVIGATION_MENU.items.map((item, i) => ({
          ...item,
          id: item.id || `nav-${i + 1}`,
          order: i + 1,
          isExternal: Boolean(item.isExternal),
          published: true,
        })),
      );
      setFooterConfig({
        brandTagline: DEFAULT_FOOTER_CONFIG.brandTagline,
        systemsLinks: DEFAULT_FOOTER_CONFIG.systemsLinks.map((item, i) => ({
          ...item,
          id: item.id || `footer-sys-${i + 1}`,
          isExternal: Boolean(item.isExternal),
          published: true,
        })),
        coreStack: [...DEFAULT_FOOTER_CONFIG.coreStack],
        connectLinks: DEFAULT_FOOTER_CONFIG.connectLinks.map((item, i) => ({
          ...item,
          id: item.id || `footer-conn-${i + 1}`,
          isExternal: Boolean(item.isExternal),
          published: true,
        })),
        copyrightText: DEFAULT_FOOTER_CONFIG.copyrightText,
      });
      toast.info("Reset to defaults", "Default navigation and footer loaded. Save to publish them.");
    }
  };

  const handleDiscardChanges = () => {
    setNavItems(savedNavItems);
    setFooterConfig(savedFooterConfig);
    setSaveError(null);
    toast.info("Changes discarded", "Reverted to last saved database state.");
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);

    if (urlValidationErrors.length > 0) {
      setSaveError(
        `Invalid URL detected: ${urlValidationErrors[0]}. Please correct unsafe schemes or invalid URLs before saving.`,
      );
      setIsSaving(false);
      return;
    }

    try {
      const payload = {
        navigation: {
          items: navItems.map((item, i) => ({
            ...item,
            order: i + 1,
            title: item.title.trim(),
            href: item.href.trim(),
          })),
        },
        footer: {
          brandTagline: footerConfig.brandTagline.trim(),
          systemsLinks: footerConfig.systemsLinks.map((item) => ({
            ...item,
            title: item.title.trim(),
            href: item.href.trim(),
          })),
          coreStack: footerConfig.coreStack.map((s) => s.trim()).filter(Boolean),
          connectLinks: footerConfig.connectLinks.map((item) => ({
            ...item,
            title: item.title.trim(),
            href: item.href.trim(),
          })),
          copyrightText: footerConfig.copyrightText?.trim() || "All rights reserved.",
        },
      };

      const res = await fetch("/api/admin/navigation", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const errorMsg =
          data.error?.message ||
          data.message ||
          "Failed to save navigation and footer configuration.";
        setSaveError(errorMsg);
        toast.error("Save failed", errorMsg);
        setIsSaving(false);
        return;
      }

      setSavedNavItems(payload.navigation.items);
      setNavItems(payload.navigation.items);
      setSavedFooterConfig(payload.footer);
      setFooterConfig(payload.footer);

      const cacheRefreshed = Boolean(data.meta?.cacheRefreshed);
      if (cacheRefreshed) {
        toast.success(
          "Navigation & Footer updated",
          "Your changes are live on the site.",
        );
      } else {
        toast.warning(
          "Navigation saved",
          "The public site may take a few minutes to update.",
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setSaveError(msg);
      toast.error("Network error", msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Action Ribbon */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-surface border border-line shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Compass className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-fg tracking-tight">
              Navigation & Menus
            </h1>
            {isDirty && (
              <span className="px-2 py-0.5 rounded-full text-xs font-mono uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Unsaved Changes
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Configure header navbar links, footer columns, core tech stack tags, and brand copyright.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
          <button
            type="button"
            onClick={handleResetToDefaults}
            disabled={isSaving}
            className="px-3.5 py-2 rounded-xl bg-surface-2 hover:bg-surface-3 text-slate-300 border border-line text-xs font-medium transition-colors flex items-center gap-1.5"
            title="Reset navigation and footer to default values"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Defaults</span>
          </button>

          {isDirty && (
            <button
              type="button"
              onClick={handleDiscardChanges}
              disabled={isSaving}
              className="px-3.5 py-2 rounded-xl bg-surface-2 hover:bg-surface-3 text-slate-300 border border-line text-xs font-medium transition-colors"
            >
              Discard
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !isDirty || urlValidationErrors.length > 0}
            className="px-5 py-2 rounded-xl bg-accent hover:bg-accent active:scale-[0.99] text-accent-fg font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Navigation</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* URL Validation Warning Banner */}
      {urlValidationErrors.length > 0 && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold block">Unsafe URL Scheme Detected</span>
            <ul className="list-disc pl-4 space-y-0.5 text-xs text-red-300">
              {urlValidationErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {saveError && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-line gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("nav")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === "nav"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-slate-400 hover:text-fg"
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Header Navigation ({navItems.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("footer")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === "footer"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-slate-400 hover:text-fg"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Footer Configuration</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === "preview"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-slate-400 hover:text-fg"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Live Visual Preview</span>
        </button>
      </div>

      {/* TAB 1: HEADER NAVIGATION */}
      {activeTab === "nav" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-surface border border-line">
            <div className="space-y-0.5">
              <h3 className="text-sm font-semibold text-fg">Main Header Menu Items</h3>
              <p className="text-xs text-slate-400">
                Ordered navigation links displayed in top navigation bar across all public pages.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddNavItem}
              className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Menu Item</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {navItems.map((item, index) => {
              const isUrlSafe = isValidSafeUrl(item.href);

              return (
                <div
                  key={item.id || index}
                  className={`p-4 rounded-xl border transition-all ${
                    item.published !== false
                      ? "bg-surface border-line"
                      : "bg-canvas border-amber-500/20"
                  }`}
                >
                  <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                    {/* Position & Label Input */}
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-white/5 border border-line flex items-center justify-center text-xs font-mono text-slate-400 shrink-0">
                        #{index + 1}
                      </span>

                      <div className="flex-1 space-y-1">
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleUpdateNavItem(item.id!, "title", e.target.value)}
                          placeholder="Menu Label (e.g. Work)"
                          className="w-full px-3 py-1.5 bg-canvas border border-line rounded-lg text-fg text-xs font-semibold focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Destination Href Input */}
                    <div className="flex-1 space-y-1">
                      <div className="relative">
                        <input
                          type="text"
                          value={item.href}
                          onChange={(e) => handleUpdateNavItem(item.id!, "href", e.target.value)}
                          placeholder="/work or https://..."
                          className={`w-full px-3 py-1.5 bg-canvas border rounded-lg text-xs font-mono focus:outline-none transition-colors ${
                            isUrlSafe
                              ? "border-line text-fg focus:border-indigo-500"
                              : "border-red-500 text-red-300"
                          }`}
                        />
                        {!isUrlSafe && (
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-red-400 font-sans">
                            Invalid URL
                          </span>
                        )}
                      </div>
                    </div>

                    {/* External Toggle & Published Toggle */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleUpdateNavItem(item.id!, "isExternal", !item.isExternal)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-colors flex items-center gap-1 cursor-pointer ${
                          item.isExternal
                            ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300"
                            : "bg-white/5 border-line text-slate-400"
                        }`}
                        title="External link opens in new tab"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>{item.isExternal ? "External" : "Internal"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUpdateNavItem(item.id!, "published", !item.published)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-colors flex items-center gap-1 cursor-pointer ${
                          item.published !== false
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                        }`}
                        title={item.published !== false ? "Visible in header" : "Hidden from header"}
                      >
                        {item.published !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{item.published !== false ? "Visible" : "Hidden"}</span>
                      </button>

                      {/* Reorder arrows */}
                      <button
                        type="button"
                        onClick={() => handleMoveNavUp(index)}
                        disabled={index === 0}
                        className="p-1.5 rounded-lg bg-surface-2 hover:bg-surface-3 text-slate-400 hover:text-fg border border-line disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMoveNavDown(index)}
                        disabled={index === navItems.length - 1}
                        className="p-1.5 rounded-lg bg-surface-2 hover:bg-surface-3 text-slate-400 hover:text-fg border border-line disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeleteNavItem(item.id!)}
                        className="p-1.5 rounded-lg bg-surface-2 hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-line transition-colors"
                        title="Delete Menu Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: FOOTER CONFIGURATION */}
      {activeTab === "footer" && (
        <div className="space-y-6">
          {/* Brand Tagline & Copyright */}
          <div className="p-5 rounded-2xl bg-surface border border-line space-y-4">
            <h3 className="text-sm font-semibold text-fg flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400" />
              <span>Brand Presentation & Legal</span>
            </h3>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300">Brand Tagline</label>
                <span className="text-xs font-mono text-slate-500">
                  {footerConfig.brandTagline.length}/500
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={500}
                value={footerConfig.brandTagline}
                onChange={(e) =>
                  setFooterConfig((prev) => ({ ...prev, brandTagline: e.target.value }))
                }
                className="w-full px-3.5 py-2 bg-canvas border border-line rounded-xl text-fg text-xs focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                placeholder="Designing and engineering high-performance digital platforms..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Copyright Text Notice</label>
              <input
                type="text"
                value={footerConfig.copyrightText || ""}
                onChange={(e) =>
                  setFooterConfig((prev) => ({ ...prev, copyrightText: e.target.value }))
                }
                placeholder="All rights reserved."
                className="w-full px-3.5 py-2 bg-canvas border border-line rounded-xl text-fg text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Systems Column Links */}
          <div className="p-5 rounded-2xl bg-surface border border-line space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-sm font-semibold text-fg flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-indigo-400" />
                  <span>Column 2: Systems Links ({footerConfig.systemsLinks.length})</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Internal product links displayed in the second column of the footer.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddSystemsLink}
                className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Link</span>
              </button>
            </div>

            <div className="space-y-2">
              {footerConfig.systemsLinks.map((item, index) => {
                const isUrlSafe = isValidSafeUrl(item.href);

                return (
                  <div
                    key={item.id || index}
                    className="p-3 rounded-xl bg-canvas border border-line flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
                  >
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleUpdateSystemsLink(item.id!, "title", e.target.value)}
                      placeholder="Title"
                      className="px-3 py-1 bg-transparent border border-line rounded-lg text-fg text-xs flex-1"
                    />

                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={item.href}
                        onChange={(e) => handleUpdateSystemsLink(item.id!, "href", e.target.value)}
                        placeholder="/destination"
                        className={`w-full px-3 py-1 bg-transparent border rounded-lg text-xs font-mono ${
                          isUrlSafe ? "border-line text-slate-300" : "border-red-500 text-red-300"
                        }`}
                      />
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateSystemsLink(item.id!, "isExternal", !item.isExternal)
                        }
                        className={`px-2 py-0.5 rounded text-xs font-mono border ${
                          item.isExternal
                            ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300"
                            : "bg-white/5 border-line text-slate-400"
                        }`}
                      >
                        {item.isExternal ? "External" : "Internal"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateSystemsLink(item.id!, "published", !item.published)
                        }
                        className={`px-2 py-0.5 rounded text-xs font-mono border ${
                          item.published !== false
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                        }`}
                      >
                        {item.published !== false ? "Visible" : "Hidden"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteSystemsLink(item.id!)}
                        className="p-1 rounded text-slate-500 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Core Stack Tags */}
          <div className="p-5 rounded-2xl bg-surface border border-line space-y-4">
            <div className="space-y-0.5">
              <h3 className="text-sm font-semibold text-fg flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-400" />
                <span>Column 3: Core Stack Technologies</span>
              </h3>
              <p className="text-xs text-slate-400">
                Pill list highlighting Webgent&apos;s engineering foundation.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {footerConfig.coreStack.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 rounded-xl bg-white/5 border border-line text-slate-300 text-xs flex items-center gap-2 group"
                >
                  <span>{tech}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteStackTag(tech)}
                    className="text-slate-500 hover:text-red-400 transition-colors"
                    title={`Remove ${tech}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2 max-w-sm pt-1">
              <input
                type="text"
                value={newStackTag}
                onChange={(e) => setNewStackTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddStackTag();
                  }
                }}
                placeholder="e.g. Redis & Upstash"
                className="flex-1 px-3 py-1.5 bg-canvas border border-line rounded-xl text-fg text-xs focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddStackTag}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-fg text-xs font-medium cursor-pointer"
              >
                Add Tech
              </button>
            </div>
          </div>

          {/* Connect / Social Links */}
          <div className="p-5 rounded-2xl bg-surface border border-line space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-sm font-semibold text-fg flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-indigo-400" />
                  <span>Column 4: Connect Links ({footerConfig.connectLinks.length})</span>
                </h3>
                <p className="text-xs text-slate-400">
                  External social profiles and consultation inquiries.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddConnectLink}
                className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Social Link</span>
              </button>
            </div>

            <div className="space-y-2">
              {footerConfig.connectLinks.map((item, index) => {
                const isUrlSafe = isValidSafeUrl(item.href);

                return (
                  <div
                    key={item.id || index}
                    className="p-3 rounded-xl bg-canvas border border-line flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
                  >
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleUpdateConnectLink(item.id!, "title", e.target.value)}
                      placeholder="Title (e.g. GitHub)"
                      className="px-3 py-1 bg-transparent border border-line rounded-lg text-fg text-xs flex-1"
                    />

                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={item.href}
                        onChange={(e) => handleUpdateConnectLink(item.id!, "href", e.target.value)}
                        placeholder="https://github.com/..."
                        className={`w-full px-3 py-1 bg-transparent border rounded-lg text-xs font-mono ${
                          isUrlSafe ? "border-line text-slate-300" : "border-red-500 text-red-300"
                        }`}
                      />
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateConnectLink(item.id!, "isExternal", !item.isExternal)
                        }
                        className={`px-2 py-0.5 rounded text-xs font-mono border ${
                          item.isExternal
                            ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300"
                            : "bg-white/5 border-line text-slate-400"
                        }`}
                      >
                        {item.isExternal ? "External" : "Internal"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateConnectLink(item.id!, "published", !item.published)
                        }
                        className={`px-2 py-0.5 rounded text-xs font-mono border ${
                          item.published !== false
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                        }`}
                      >
                        {item.published !== false ? "Visible" : "Hidden"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteConnectLink(item.id!)}
                        className="p-1 rounded text-slate-500 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LIVE PREVIEW */}
      {activeTab === "preview" && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0" />
            <span>
              This preview simulates how your active published links render across the public website layout.
            </span>
          </div>

          {/* Simulated Header */}
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-500">
              Header Navbar Simulation (Published Only)
            </span>
            <div className="p-4 rounded-2xl bg-canvas border border-line flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-fg text-xs">
                <span className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center font-mono">
                  W
                </span>
                <span>Webgent</span>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                {navItems
                  .filter((item) => item.published !== false)
                  .map((item) => (
                    <span
                      key={item.id}
                      className="hover:text-fg transition-colors flex items-center gap-1 cursor-default"
                    >
                      {item.title}
                      {item.isExternal && <ExternalLink className="w-2.5 h-2.5 opacity-60" />}
                    </span>
                  ))}
              </div>
            </div>
          </div>

          {/* Simulated Footer */}
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-500">
              Footer Grid Simulation (Published Only)
            </span>
            <div className="p-6 rounded-2xl bg-canvas border border-line space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs text-slate-400">
                {/* Brand */}
                <div className="space-y-2">
                  <div className="font-bold text-fg">Webgent</div>
                  <p className="text-xs leading-relaxed text-slate-400">
                    {footerConfig.brandTagline}
                  </p>
                </div>

                {/* Systems */}
                <div className="space-y-2">
                  <div className="font-mono uppercase text-xs text-fg font-semibold">
                    Systems
                  </div>
                  <ul className="space-y-1.5 text-xs">
                    {footerConfig.systemsLinks
                      .filter((l) => l.published !== false)
                      .map((l) => (
                        <li key={l.id} className="hover:text-fg">
                          {l.title}
                        </li>
                      ))}
                  </ul>
                </div>

                {/* Core Stack */}
                <div className="space-y-2">
                  <div className="font-mono uppercase text-xs text-fg font-semibold">
                    Core Stack
                  </div>
                  <ul className="space-y-1.5 text-xs">
                    {footerConfig.coreStack.map((tech) => (
                      <li key={tech} className="hover:text-fg">
                        {tech}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Connect */}
                <div className="space-y-2">
                  <div className="font-mono uppercase text-xs text-fg font-semibold">
                    Connect
                  </div>
                  <ul className="space-y-1.5 text-xs">
                    {footerConfig.connectLinks
                      .filter((l) => l.published !== false)
                      .map((l) => (
                        <li key={l.id} className="hover:text-fg flex items-center gap-1">
                          <span>{l.title}</span>
                          {l.isExternal && <ExternalLink className="w-2.5 h-2.5 opacity-60" />}
                        </li>
                      ))}
                  </ul>
                </div>
              </div>

              <div className="border-t border-line pt-4 flex items-center justify-between text-xs font-mono text-slate-500">
                <span>
                  &copy; {new Date().getFullYear()} Webgent. {footerConfig.copyrightText}
                </span>
                <span>Back to Top ↑</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
