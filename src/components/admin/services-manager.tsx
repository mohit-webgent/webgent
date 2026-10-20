"use client";

import React, { useState, useMemo } from "react";
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Tag,
  Image as ImageIcon,
  Check,
  X,
  Loader2,
  Star,
  Home,
  Cpu,
  Database,
  Code,
  Globe,
  Shield,
  Zap,
  Server,
  Workflow,
  Rocket,
  Layout,
  CreditCard,
  MessageCircle,
  BarChart3,
  Cloud,
  Terminal,
  Smartphone,
  Compass,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { MediaPickerModal } from "@/components/admin/media-picker-modal";
import type {
  CmsService,
  CmsFeature,
  ServiceCreateInput,
  FeatureCreateInput,
} from "@/lib/services/cms-services-shared";
import {
  AVAILABLE_SERVICE_ICONS,
  FEATURE_CATEGORIES,
} from "@/lib/services/cms-services-shared";

// Map string icon names to Lucide icon components
const ICON_COMPONENTS: Record<string, React.ComponentType<{ className?: string }>> = {
  Layers,
  Cpu,
  Database,
  Code,
  Globe,
  Shield,
  Zap,
  Sparkles,
  Server,
  Workflow,
  Rocket,
  Layout,
  CreditCard,
  MessageCircle,
  BarChart3,
  Cloud,
  Terminal,
  Smartphone,
  Compass,
  CheckCircle: CheckCircle2,
  Check,
};

function renderServiceIcon(name?: string | null, className = "w-5 h-5") {
  const IconComp = name && ICON_COMPONENTS[name] ? ICON_COMPONENTS[name] : Layers;
  return <IconComp className={className} />;
}

export interface ServicesManagerProps {
  initialServices: CmsService[];
  initialFeatures: CmsFeature[];
}

export function ServicesManager({ initialServices, initialFeatures }: ServicesManagerProps) {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<"services" | "features">("services");
  const [services, setServices] = useState<CmsService[]>(initialServices);
  const [features, setFeatures] = useState<CmsFeature[]>(initialFeatures);

  // Search & Filter state
  const [serviceSearch, setServiceSearch] = useState("");
  const [serviceStatusFilter, setServiceStatusFilter] = useState<"all" | "published" | "draft" | "featured" | "home">("all");
  const [featureSearch, setFeatureSearch] = useState("");
  const [featureCategoryFilter, setFeatureCategoryFilter] = useState<string>("all");

  // Modals state
  const [editingService, setEditingService] = useState<CmsService | null>(null);
  const [isCreatingService, setIsCreatingService] = useState(false);
  const [serviceForm, setServiceForm] = useState<Partial<ServiceCreateInput>>({
    name: "",
    slug: "",
    shortDescription: "",
    description: "",
    icon: "Layers",
    coverImage: "",
    startingPrice: undefined,
    priceLabel: "",
    displayOrder: 0,
    featured: false,
    showOnHome: true,
    published: true,
    seoTitle: "",
    seoDescription: "",
    ogImage: "",
    featureIds: [],
  });

  const [editingFeature, setEditingFeature] = useState<CmsFeature | null>(null);
  const [isCreatingFeature, setIsCreatingFeature] = useState(false);
  const [featureForm, setFeatureForm] = useState<Partial<FeatureCreateInput>>({
    title: "",
    description: "",
    icon: "Check",
    category: "General",
    displayOrder: 0,
    enabled: true,
    showOnPublic: true,
    serviceIds: [],
  });

  // Media Picker state
  const [mediaPickerTarget, setMediaPickerTarget] = useState<"coverImage" | "ogImage" | null>(null);

  // Deletion confirmation state
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "service" | "feature";
    id: string;
    title: string;
  } | null>(null);

  // Submitting / Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Auto-slug generator
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  // --------------------------------------------------------------------------
  // Service Handlers
  // --------------------------------------------------------------------------

  const openCreateServiceModal = () => {
    setFormError(null);
    setServiceForm({
      name: "",
      slug: "",
      shortDescription: "",
      description: "",
      icon: "Layers",
      coverImage: "",
      startingPrice: undefined,
      priceLabel: "",
      displayOrder: services.length + 1,
      featured: false,
      showOnHome: true,
      published: true,
      seoTitle: "",
      seoDescription: "",
      ogImage: "",
      featureIds: [],
    });
    setEditingService(null);
    setIsCreatingService(true);
  };

  const openEditServiceModal = (svc: CmsService) => {
    setFormError(null);
    setServiceForm({
      name: svc.name,
      slug: svc.slug,
      shortDescription: svc.shortDescription,
      description: svc.description || "",
      icon: svc.icon || "Layers",
      coverImage: svc.coverImage || "",
      startingPrice: svc.startingPrice ?? undefined,
      priceLabel: svc.priceLabel || "",
      displayOrder: svc.displayOrder,
      featured: svc.featured,
      showOnHome: svc.showOnHome,
      published: svc.published,
      seoTitle: svc.seoTitle || "",
      seoDescription: svc.seoDescription || "",
      ogImage: svc.ogImage || "",
      featureIds: svc.features.map((f) => f.id),
    });
    setEditingService(svc);
    setIsCreatingService(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        ...serviceForm,
        startingPrice:
          serviceForm.startingPrice !== undefined && serviceForm.startingPrice !== null && !isNaN(Number(serviceForm.startingPrice))
            ? Number(serviceForm.startingPrice)
            : null,
      };

      const url = editingService
        ? `/api/admin/services/${editingService.id}`
        : "/api/admin/services";
      const method = editingService ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || json.message || "Failed to save service.");
      }

      const saved: CmsService = json.data;

      if (editingService) {
        setServices((prev) => prev.map((s) => (s.id === saved.id ? saved : s)));
        toast.success(`Service "${saved.name}" updated successfully.`);
      } else {
        setServices((prev) => [...prev, saved]);
        toast.success(`Service "${saved.name}" created successfully.`);
      }

      setIsCreatingService(false);
      setEditingService(null);
    } catch (err: unknown) {
      setFormError((err as Error).message || "Error saving service.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleServicePublish = async (svc: CmsService) => {
    try {
      const updatedStatus = !svc.published;
      const res = await fetch(`/api/admin/services/${svc.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: updatedStatus }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to update status.");

      setServices((prev) =>
        prev.map((s) => (s.id === svc.id ? { ...s, published: updatedStatus } : s)),
      );
      toast.success(
        `Service "${svc.name}" is now ${updatedStatus ? "Published" : "Draft"}.`,
      );
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to toggle status.");
    }
  };

  // --------------------------------------------------------------------------
  // Feature Handlers
  // --------------------------------------------------------------------------

  const openCreateFeatureModal = () => {
    setFormError(null);
    setFeatureForm({
      title: "",
      description: "",
      icon: "Check",
      category: "General",
      displayOrder: features.length + 1,
      enabled: true,
      showOnPublic: true,
      serviceIds: [],
    });
    setEditingFeature(null);
    setIsCreatingFeature(true);
  };

  const openEditFeatureModal = (feat: CmsFeature) => {
    setFormError(null);
    setFeatureForm({
      title: feat.title,
      description: feat.description || "",
      icon: feat.icon || "Check",
      category: feat.category || "General",
      displayOrder: feat.displayOrder,
      enabled: feat.enabled,
      showOnPublic: feat.showOnPublic,
      serviceIds: feat.serviceIds || [],
    });
    setEditingFeature(feat);
    setIsCreatingFeature(true);
  };

  const handleSaveFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const url = editingFeature
        ? `/api/admin/features/${editingFeature.id}`
        : "/api/admin/features";
      const method = editingFeature ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(featureForm),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || json.message || "Failed to save feature.");
      }

      const saved: CmsFeature = json.data;

      if (editingFeature) {
        setFeatures((prev) => prev.map((f) => (f.id === saved.id ? saved : f)));
        toast.success(`Feature "${saved.title}" updated.`);
      } else {
        setFeatures((prev) => [...prev, saved]);
        toast.success(`Feature "${saved.title}" created.`);
      }

      // Also refresh services to update their feature lists
      const svcRes = await fetch("/api/admin/services");
      if (svcRes.ok) {
        const svcJson = await svcRes.json();
        if (svcJson.data) setServices(svcJson.data);
      }

      setIsCreatingFeature(false);
      setEditingFeature(null);
    } catch (err: unknown) {
      setFormError((err as Error).message || "Error saving feature.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleFeatureEnabled = async (feat: CmsFeature) => {
    try {
      const updatedStatus = !feat.enabled;
      const res = await fetch(`/api/admin/features/${feat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: updatedStatus }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to update feature.");

      setFeatures((prev) =>
        prev.map((f) => (f.id === feat.id ? { ...f, enabled: updatedStatus } : f)),
      );
      toast.success(`Feature "${feat.title}" ${updatedStatus ? "Enabled" : "Disabled"}.`);
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to toggle feature status.");
    }
  };

  // --------------------------------------------------------------------------
  // Delete Handler
  // --------------------------------------------------------------------------

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);

    try {
      const endpoint =
        deleteTarget.type === "service"
          ? `/api/admin/services/${deleteTarget.id}`
          : `/api/admin/features/${deleteTarget.id}`;

      const res = await fetch(endpoint, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to delete item.");

      if (deleteTarget.type === "service") {
        setServices((prev) => prev.filter((s) => s.id !== deleteTarget.id));
        toast.success(`Service "${deleteTarget.title}" deleted.`);
      } else {
        setFeatures((prev) => prev.filter((f) => f.id !== deleteTarget.id));
        toast.success(`Feature "${deleteTarget.title}" deleted.`);
        // Refresh services
        const svcRes = await fetch("/api/admin/services");
        if (svcRes.ok) {
          const svcJson = await svcRes.json();
          if (svcJson.data) setServices(svcJson.data);
        }
      }

      setDeleteTarget(null);
    } catch (err: unknown) {
      toast.error((err as Error).message || "Delete failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------------------------------
  // Filtering logic
  // --------------------------------------------------------------------------

  const filteredServices = useMemo(() => {
    return services.filter((svc) => {
      const matchesSearch =
        serviceSearch.trim() === "" ||
        svc.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
        svc.slug.toLowerCase().includes(serviceSearch.toLowerCase()) ||
        svc.shortDescription.toLowerCase().includes(serviceSearch.toLowerCase());

      if (!matchesSearch) return false;

      if (serviceStatusFilter === "published") return svc.published;
      if (serviceStatusFilter === "draft") return !svc.published;
      if (serviceStatusFilter === "featured") return svc.featured;
      if (serviceStatusFilter === "home") return svc.showOnHome;
      return true;
    });
  }, [services, serviceSearch, serviceStatusFilter]);

  const filteredFeatures = useMemo(() => {
    return features.filter((feat) => {
      const matchesSearch =
        featureSearch.trim() === "" ||
        feat.title.toLowerCase().includes(featureSearch.toLowerCase()) ||
        (feat.description && feat.description.toLowerCase().includes(featureSearch.toLowerCase()));

      if (!matchesSearch) return false;

      if (featureCategoryFilter !== "all" && feat.category !== featureCategoryFilter) {
        return false;
      }
      return true;
    });
  }, [features, featureSearch, featureCategoryFilter]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Services & Features CMS
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage public website service offerings, technical feature matrix, and marketing pricing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/services"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <span>View Public /services</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {activeTab === "services" ? (
            <button
              type="button"
              onClick={openCreateServiceModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-xl shadow-lg shadow-sky-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>New Service</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={openCreateFeatureModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>New Feature</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab("services")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "services"
              ? "border-sky-500 text-sky-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Services ({services.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("features")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "features"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Features Matrix ({features.length})</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: SERVICES LIST                                                 */}
      {/* ==================================================================== */}
      {activeTab === "services" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                placeholder="Search services by title, slug, or description..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {(["all", "published", "draft", "featured", "home"] as const).map((filterKey) => (
                <button
                  key={filterKey}
                  type="button"
                  onClick={() => setServiceStatusFilter(filterKey)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors shrink-0 ${
                    serviceStatusFilter === filterKey
                      ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {filterKey}
                </button>
              ))}
            </div>
          </div>

          {/* Services Grid / Cards */}
          {filteredServices.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-3">
              <Layers className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No services found</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {serviceSearch
                  ? "No services match your search terms. Try clearing the query."
                  : "No services are currently configured in this view. Click below to add your first service."}
              </p>
              {!serviceSearch && (
                <button
                  type="button"
                  onClick={openCreateServiceModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-sky-400 bg-sky-500/10 border border-sky-500/20 rounded-lg hover:bg-sky-500/20 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Service</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredServices.map((svc) => (
                <div
                  key={svc.id}
                  className="flex flex-col justify-between p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-md group"
                >
                  <div className="space-y-3">
                    {/* Header line with icon, status and badges */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                          {renderServiceIcon(svc.icon)}
                        </span>
                        <div>
                          <h3 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                            {svc.name}
                          </h3>
                          <span className="text-[11px] font-mono text-slate-400">/{svc.slug}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {svc.featured && (
                          <span
                            title="Featured on public showcase"
                            className="p-1 text-amber-400 bg-amber-500/10 rounded-md"
                          >
                            <Star className="w-3.5 h-3.5 fill-current" />
                          </span>
                        )}
                        {svc.showOnHome && (
                          <span
                            title="Shown on Homepage"
                            className="p-1 text-emerald-400 bg-emerald-500/10 rounded-md"
                          >
                            <Home className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Short Description */}
                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                      {svc.shortDescription}
                    </p>

                    {/* Pricing Display */}
                    {(svc.priceLabel || svc.startingPrice !== null) && (
                      <div className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg w-fit">
                        {svc.priceLabel || `Starting at ₹${svc.startingPrice?.toLocaleString("en-IN")}`}
                      </div>
                    )}

                    {/* Features pill preview */}
                    <div className="pt-2 border-t border-slate-800/80">
                      <div className="text-[11px] text-slate-400 font-medium mb-1.5 flex items-center justify-between">
                        <span>Included Features:</span>
                        <span className="text-slate-300 font-semibold">{svc.features.length}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 max-h-16 overflow-hidden">
                        {svc.features.slice(0, 3).map((feat) => (
                          <span
                            key={feat.id}
                            className="px-2 py-0.5 text-[10px] rounded bg-slate-800 text-slate-300 border border-slate-700 truncate max-w-[140px]"
                          >
                            {feat.title}
                          </span>
                        ))}
                        {svc.features.length > 3 && (
                          <span className="px-1.5 py-0.5 text-[10px] text-slate-400">
                            +{svc.features.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleToggleServicePublish(svc)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors ${
                        svc.published
                          ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                      }`}
                    >
                      {svc.published ? (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Published</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Draft</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={`/services/${svc.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        title="Preview Public Page"
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => openEditServiceModal(svc)}
                        title="Edit Service"
                        className="p-1.5 text-slate-400 hover:text-sky-400 rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteTarget({
                            type: "service",
                            id: svc.id,
                            title: svc.name,
                          })
                        }
                        title="Delete Service"
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: FEATURES MATRIX LIST                                          */}
      {/* ==================================================================== */}
      {activeTab === "features" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={featureSearch}
                onChange={(e) => setFeatureSearch(e.target.value)}
                placeholder="Search features by title or description..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setFeatureCategoryFilter("all")}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors shrink-0 ${
                  featureCategoryFilter === "all"
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                All Categories
              </button>
              {FEATURE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFeatureCategoryFilter(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors shrink-0 ${
                    featureCategoryFilter === cat
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Features Table / List */}
          {filteredFeatures.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-3">
              <Tag className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No features found</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No features match your current filter. Click below to add a modular feature.
              </p>
              <button
                type="button"
                onClick={openCreateFeatureModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-lg hover:bg-indigo-500/20 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Feature</span>
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Feature</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Assigned Services</th>
                      <th className="py-3 px-4">Display Order</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-xs">
                    {filteredFeatures.map((feat) => (
                      <tr key={feat.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              {renderServiceIcon(feat.icon, "w-4 h-4")}
                            </span>
                            <div>
                              <p className="font-semibold text-white">{feat.title}</p>
                              {feat.description && (
                                <p className="text-[11px] text-slate-400 max-w-sm line-clamp-1">
                                  {feat.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                            {feat.category || "General"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800/80 text-sky-400 border border-slate-700">
                            {feat.serviceCount || 0} service{feat.serviceCount === 1 ? "" : "s"}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400">
                          {feat.displayOrder}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleFeatureEnabled(feat)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded transition-colors ${
                              feat.enabled
                                ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                            }`}
                          >
                            {feat.enabled ? "Active" : "Disabled"}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditFeatureModal(feat)}
                              title="Edit Feature"
                              className="p-1.5 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-slate-800 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteTarget({
                                  type: "feature",
                                  id: feat.id,
                                  title: feat.title,
                                })
                              }
                              title="Delete Feature"
                              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: SERVICE CREATE / EDIT                                         */}
      {/* ==================================================================== */}
      {isCreatingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="max-w-2xl w-full my-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                  <Layers className="w-5 h-5" />
                </span>
                <h2 className="text-lg font-bold text-white">
                  {editingService ? "Edit Service" : "Create New Service"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingService(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveService} className="space-y-5">
              {/* Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Service Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={serviceForm.name}
                    onChange={(e) => {
                      const nameVal = e.target.value;
                      setServiceForm((prev) => ({
                        ...prev,
                        name: nameVal,
                        slug: !editingService && (!prev.slug || prev.slug === generateSlug(prev.name || ""))
                          ? generateSlug(nameVal)
                          : prev.slug,
                      }));
                    }}
                    placeholder="e.g. Full-Stack Web Applications"
                    className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      URL Slug <span className="text-rose-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setServiceForm((prev) => ({
                          ...prev,
                          slug: generateSlug(prev.name || ""),
                        }))
                      }
                      className="text-[10px] text-sky-400 hover:underline"
                    >
                      Generate from name
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={serviceForm.slug}
                    onChange={(e) =>
                      setServiceForm((prev) => ({ ...prev, slug: e.target.value }))
                    }
                    placeholder="e.g. full-stack-web-apps"
                    className="w-full px-3.5 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Short Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Short Description (Card Summary) <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={serviceForm.shortDescription}
                  onChange={(e) =>
                    setServiceForm((prev) => ({ ...prev, shortDescription: e.target.value }))
                  }
                  placeholder="Concise 1-2 sentence overview for cards and listings..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Detailed Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Detailed Scope & Overview
                </label>
                <textarea
                  rows={4}
                  value={serviceForm.description || ""}
                  onChange={(e) =>
                    setServiceForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Comprehensive description for the dedicated /services/[slug] page..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Icon Picker & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Service Icon</label>
                  <select
                    value={serviceForm.icon || "Layers"}
                    onChange={(e) =>
                      setServiceForm((prev) => ({ ...prev, icon: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500"
                  >
                    {AVAILABLE_SERVICE_ICONS.map((iconKey) => (
                      <option key={iconKey} value={iconKey}>
                        {iconKey}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Display Order</label>
                  <input
                    type="number"
                    min={0}
                    value={serviceForm.displayOrder}
                    onChange={(e) =>
                      setServiceForm((prev) => ({
                        ...prev,
                        displayOrder: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Pricing Display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Starting Price (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={serviceForm.startingPrice ?? ""}
                    onChange={(e) =>
                      setServiceForm((prev) => ({
                        ...prev,
                        startingPrice: e.target.value === "" ? undefined : parseInt(e.target.value, 10),
                      }))
                    }
                    placeholder="e.g. 24999"
                    className="w-full px-3.5 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Price Label / Badge
                  </label>
                  <input
                    type="text"
                    value={serviceForm.priceLabel || ""}
                    onChange={(e) =>
                      setServiceForm((prev) => ({ ...prev, priceLabel: e.target.value }))
                    }
                    placeholder="e.g. Starting at ₹24,999 or Custom Scope"
                    className="w-full px-3.5 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <p className="col-span-full text-[11px] text-slate-500">
                  Informational marketing rate. Project estimates in the AI Consultant calculator remain calculated deterministically.
                </p>
              </div>

              {/* Cover Image from Supabase Media Library */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Cover Image</label>
                  <button
                    type="button"
                    onClick={() => setMediaPickerTarget("coverImage")}
                    className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Choose from Media Library</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={serviceForm.coverImage || ""}
                  onChange={(e) =>
                    setServiceForm((prev) => ({ ...prev, coverImage: e.target.value }))
                  }
                  placeholder="https://... or choose from Supabase Media Library"
                  className="w-full px-3.5 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Multi-select features included in this service */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Included Features in this Service ({serviceForm.featureIds?.length || 0})</span>
                  <button
                    type="button"
                    onClick={() =>
                      setServiceForm((prev) => ({
                        ...prev,
                        featureIds: prev.featureIds?.length === features.length ? [] : features.map((f) => f.id),
                      }))
                    }
                    className="text-[10px] text-indigo-400 hover:underline"
                  >
                    {serviceForm.featureIds?.length === features.length ? "Deselect All" : "Select All"}
                  </button>
                </label>
                <div className="max-h-44 overflow-y-auto p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 divide-y divide-slate-800/60">
                  {features.map((feat) => {
                    const isChecked = serviceForm.featureIds?.includes(feat.id);
                    return (
                      <label
                        key={feat.id}
                        className="flex items-center justify-between pt-2 first:pt-0 cursor-pointer hover:text-white"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setServiceForm((prev) => ({
                                ...prev,
                                featureIds: checked
                                  ? [...(prev.featureIds || []), feat.id]
                                  : (prev.featureIds || []).filter((id) => id !== feat.id),
                              }));
                            }}
                            className="rounded border-slate-700 text-sky-600 focus:ring-sky-500 bg-slate-900"
                          />
                          <span className="text-xs text-slate-200">{feat.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                          {feat.category || "General"}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Toggles: Featured, Show on Home, Published */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={serviceForm.published ?? true}
                    onChange={(e) =>
                      setServiceForm((prev) => ({ ...prev, published: e.target.checked }))
                    }
                    className="rounded border-slate-700 text-sky-600 focus:ring-sky-500 bg-slate-900"
                  />
                  <span className="text-xs font-medium text-slate-300">Published</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={serviceForm.showOnHome ?? true}
                    onChange={(e) =>
                      setServiceForm((prev) => ({ ...prev, showOnHome: e.target.checked }))
                    }
                    className="rounded border-slate-700 text-sky-600 focus:ring-sky-500 bg-slate-900"
                  />
                  <span className="text-xs font-medium text-slate-300">Show on Home</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={serviceForm.featured ?? false}
                    onChange={(e) =>
                      setServiceForm((prev) => ({ ...prev, featured: e.target.checked }))
                    }
                    className="rounded border-slate-700 text-sky-600 focus:ring-sky-500 bg-slate-900"
                  />
                  <span className="text-xs font-medium text-slate-300">Featured</span>
                </label>
              </div>

              {/* SEO overrides accordion or fields */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  SEO & Social Metadata
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">SEO Title Tag</label>
                    <input
                      type="text"
                      value={serviceForm.seoTitle || ""}
                      onChange={(e) =>
                        setServiceForm((prev) => ({ ...prev, seoTitle: e.target.value }))
                      }
                      placeholder="e.g. Full-Stack Web Development | Webgent"
                      className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">SEO Meta Description</label>
                    <input
                      type="text"
                      value={serviceForm.seoDescription || ""}
                      onChange={(e) =>
                        setServiceForm((prev) => ({ ...prev, seoDescription: e.target.value }))
                      }
                      placeholder="Concise search summary..."
                      className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Modal action buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreatingService(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-xl shadow-lg shadow-sky-600/20 transition-all disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingService ? "Update Service" : "Create Service"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: FEATURE CREATE / EDIT                                         */}
      {/* ==================================================================== */}
      {isCreatingFeature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Tag className="w-5 h-5" />
                </span>
                <h2 className="text-lg font-bold text-white">
                  {editingFeature ? "Edit Feature" : "Create Feature"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingFeature(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveFeature} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Feature Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={featureForm.title}
                  onChange={(e) =>
                    setFeatureForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g. Next.js 14 App Router & RSC"
                  className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Feature Description</label>
                <textarea
                  rows={2}
                  value={featureForm.description || ""}
                  onChange={(e) =>
                    setFeatureForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Concise technical description or deliverable scope..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Category</label>
                  <select
                    value={featureForm.category || "General"}
                    onChange={(e) =>
                      setFeatureForm((prev) => ({ ...prev, category: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    {FEATURE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Icon</label>
                  <select
                    value={featureForm.icon || "Check"}
                    onChange={(e) =>
                      setFeatureForm((prev) => ({ ...prev, icon: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    {AVAILABLE_SERVICE_ICONS.map((iKey) => (
                      <option key={iKey} value={iKey}>
                        {iKey}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Display Order</label>
                  <input
                    type="number"
                    min={0}
                    value={featureForm.displayOrder}
                    onChange={(e) =>
                      setFeatureForm((prev) => ({
                        ...prev,
                        displayOrder: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-2 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={featureForm.enabled ?? true}
                      onChange={(e) =>
                        setFeatureForm((prev) => ({ ...prev, enabled: e.target.checked }))
                      }
                      className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900"
                    />
                    <span className="text-xs font-medium text-slate-300">Enabled</span>
                  </label>
                </div>
              </div>

              {/* Assign to Services */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-slate-300">
                  Assign to Services ({featureForm.serviceIds?.length || 0})
                </label>
                <div className="max-h-36 overflow-y-auto p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 divide-y divide-slate-800/60">
                  {services.map((svc) => {
                    const isChecked = featureForm.serviceIds?.includes(svc.id);
                    return (
                      <label
                        key={svc.id}
                        className="flex items-center gap-2 pt-2 first:pt-0 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setFeatureForm((prev) => ({
                              ...prev,
                              serviceIds: checked
                                ? [...(prev.serviceIds || []), svc.id]
                                : (prev.serviceIds || []).filter((id) => id !== svc.id),
                            }));
                          }}
                          className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900"
                        />
                        <span className="text-xs text-slate-200">{svc.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreatingFeature(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingFeature ? "Update Feature" : "Create Feature"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: DELETE CONFIRMATION                                           */}
      {/* ==================================================================== */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <span className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <Trash2 className="w-5 h-5" />
              </span>
              <h3 className="text-base font-bold text-white">
                Delete {deleteTarget.type === "service" ? "Service" : "Feature"}?
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <strong className="text-white">&ldquo;{deleteTarget.title}&rdquo;</strong>?
              {deleteTarget.type === "service"
                ? " This will remove the service and detach its feature assignments. Individual features will NOT be deleted."
                : " This feature will be removed and unlinked from any assigned services."}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg shadow-rose-600/20 transition-all disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: SUPABASE MEDIA LIBRARY PICKER                                 */}
      {/* ==================================================================== */}
      {mediaPickerTarget && (
        <MediaPickerModal
          isOpen={true}
          onClose={() => setMediaPickerTarget(null)}
          onSelect={(media) => {
            if (mediaPickerTarget === "coverImage") {
              setServiceForm((prev) => ({ ...prev, coverImage: media.url }));
            } else if (mediaPickerTarget === "ogImage") {
              setServiceForm((prev) => ({ ...prev, ogImage: media.url }));
            }
            setMediaPickerTarget(null);
            toast.success(`Selected media asset: ${media.filename}`);
          }}
          folder="all"
          title="Select Service Media Asset"
        />
      )}
    </div>
  );
}
