"use client";

import React, { useState, useMemo } from "react";
import {
  Save,
  RotateCcw,
  Loader2,
  HelpCircle,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Sparkles,
  Copy,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import type { SiteFaqItem, SiteFaqsConfig } from "@/lib/services/cms-shared";
import { DEFAULT_SITE_FAQS } from "@/lib/services/cms-shared";

export interface FaqContentEditorProps {
  initialConfig: SiteFaqsConfig;
}

const PRESET_CATEGORIES = [
  "Process",
  "Hosting",
  "Ownership",
  "Pricing",
  "Technology",
  "Support",
  "General",
];

export function FaqContentEditor({ initialConfig }: FaqContentEditorProps) {
  const toast = useToast();

  const [faqs, setFaqs] = useState<SiteFaqItem[]>(() =>
    initialConfig.faqs.map((f, i) => ({
      ...f,
      order: f.order ?? i + 1,
      published: f.published !== false,
      category: f.category || "General",
    })),
  );

  const [savedFaqs, setSavedFaqs] = useState<SiteFaqItem[]>(() =>
    initialConfig.faqs.map((f, i) => ({
      ...f,
      order: f.order ?? i + 1,
      published: f.published !== false,
      category: f.category || "General",
    })),
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "published" | "draft">("all");
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  // New FAQ form state
  const [isAddingFaq, setIsAddingFaq] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [newCategory, setNewCategory] = useState("General");
  const [customCategoryInput, setCustomCategoryInput] = useState("");
  const [newPublished, setNewPublished] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Dirty state tracking
  const isDirty = useMemo(() => {
    return JSON.stringify(faqs) !== JSON.stringify(savedFaqs);
  }, [faqs, savedFaqs]);

  // Derived categories
  const allCategories = useMemo(() => {
    const set = new Set<string>(PRESET_CATEGORIES);
    faqs.forEach((f) => {
      if (f.category) set.add(f.category);
    });
    return Array.from(set);
  }, [faqs]);

  // Filtered FAQ list
  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (faq.category && faq.category.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === "all" || faq.category === selectedCategory;

      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "published" && faq.published !== false) ||
        (selectedStatus === "draft" && faq.published === false);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [faqs, searchQuery, selectedCategory, selectedStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = faqs.length;
    const published = faqs.filter((f) => f.published !== false).length;
    const drafts = total - published;
    const categoriesCount = new Set(faqs.map((f) => f.category || "General")).size;
    return { total, published, drafts, categoriesCount };
  }, [faqs]);

  // Handlers
  const handleTogglePublished = (id: string) => {
    setFaqs((prev) =>
      prev.map((faq) =>
        faq.id === id ? { ...faq, published: !faq.published } : faq,
      ),
    );
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    setFaqs((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next.map((item, i) => ({ ...item, order: i + 1 }));
    });
  };

  const handleMoveDown = (index: number) => {
    if (index >= faqs.length - 1) return;
    setFaqs((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next.map((item, i) => ({ ...item, order: i + 1 }));
    });
  };

  const handleUpdateFaq = (
    id: string,
    field: keyof SiteFaqItem,
    value: string | boolean | number,
  ) => {
    setFaqs((prev) =>
      prev.map((faq) => (faq.id === id ? { ...faq, [field]: value } : faq)),
    );
  };

  const handleDeleteFaq = (id: string) => {
    setFaqs((prev) =>
      prev.filter((faq) => faq.id !== id).map((f, i) => ({ ...f, order: i + 1 })),
    );
    setDeleteConfirmId(null);
    if (expandedFaqId === id) setExpandedFaqId(null);
    toast.info("FAQ deleted", "Item removed from staging configuration.");
  };

  const handleDuplicateFaq = (faq: SiteFaqItem) => {
    const newId = `faq-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`;
    const duplicate: SiteFaqItem = {
      ...faq,
      id: newId,
      question: `${faq.question} (Copy)`,
      order: faqs.length + 1,
      published: false,
    };
    setFaqs((prev) => [...prev, duplicate]);
    setExpandedFaqId(newId);
    toast.success("FAQ duplicated", "Draft duplicate appended to the list.");
  };

  const handleAddFaqSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) {
      toast.error("Validation error", "Both question and answer are required.");
      return;
    }

    const cat =
      newCategory === "__custom__"
        ? customCategoryInput.trim() || "General"
        : newCategory;

    const newId = `faq-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`;
    const newItem: SiteFaqItem = {
      id: newId,
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
      category: cat,
      order: faqs.length + 1,
      published: newPublished,
    };

    setFaqs((prev) => [...prev, newItem]);
    setIsAddingFaq(false);
    setNewQuestion("");
    setNewAnswer("");
    setNewCategory("General");
    setCustomCategoryInput("");
    setNewPublished(true);
    setExpandedFaqId(newId);
    toast.success("FAQ created", "New question added to staging configuration.");
  };

  const handleResetToDefaults = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all FAQs to standard production defaults? Unsaved modifications will be lost.",
      )
    ) {
      setFaqs(
        DEFAULT_SITE_FAQS.faqs.map((f, i) => ({
          ...f,
          order: i + 1,
          published: true,
          category: f.category || "General",
        })),
      );
      toast.info("Reset to defaults", "Default FAQs loaded into staging editor.");
    }
  };

  const handleDiscardChanges = () => {
    setFaqs(savedFaqs);
    setSaveError(null);
    toast.info("Changes discarded", "Reverted to last saved database state.");
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);

    // Client-side quick checks
    for (const f of faqs) {
      if (!f.question.trim()) {
        setSaveError("All FAQs must have a question (minimum 3 characters).");
        setIsSaving(false);
        return;
      }
      if (!f.answer.trim()) {
        setSaveError("All FAQs must have an answer (minimum 5 characters).");
        setIsSaving(false);
        return;
      }
    }

    try {
      const payload = {
        faqs: faqs.map((f, i) => ({
          ...f,
          order: i + 1,
          category: f.category?.trim() || "General",
        })),
      };

      const res = await fetch("/api/admin/faqs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const errorMsg =
          data.error?.message ||
          data.message ||
          "Failed to save FAQ configuration.";
        setSaveError(errorMsg);
        toast.error("Save failed", errorMsg);
        setIsSaving(false);
        return;
      }

      setSavedFaqs(payload.faqs);
      setFaqs(payload.faqs);

      const cacheRefreshed = Boolean(data.meta?.cacheRefreshed);
      if (cacheRefreshed) {
        toast.success(
          "FAQs updated",
          "All changes persisted and public Redis cache invalidated.",
        );
      } else {
        toast.warning(
          "FAQs saved with cache warning",
          "Data persisted to PostgreSQL. Cache revalidation encountered warnings.",
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
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0E1015] border border-white/10 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Frequently Asked Questions
            </h1>
            {isDirty && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
                Unsaved Changes
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-400">
            Create, categorize, reorder, and toggle visibility of customer Q&As across Webgent.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
          <button
            type="button"
            onClick={handleResetToDefaults}
            disabled={isSaving}
            className="px-3.5 py-2 rounded-xl bg-[#14171F] hover:bg-[#1C212C] text-neutral-300 border border-white/10 text-xs font-medium transition-colors flex items-center gap-1.5"
            title="Reset to default production questions"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Defaults</span>
          </button>

          {isDirty && (
            <button
              type="button"
              onClick={handleDiscardChanges}
              disabled={isSaving}
              className="px-3.5 py-2 rounded-xl bg-[#14171F] hover:bg-[#1C212C] text-neutral-300 border border-white/10 text-xs font-medium transition-colors"
            >
              Discard
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsAddingFaq(true)}
            disabled={isSaving || isAddingFaq}
            className="px-3.5 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New FAQ</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !isDirty}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-[0.99] text-white font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save FAQs</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Callout */}
      {saveError && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Statistics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[#0E1015] border border-white/10 space-y-0.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
            Total Questions
          </span>
          <div className="text-xl font-bold text-white">{stats.total}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#0E1015] border border-white/10 space-y-0.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">
            Published
          </span>
          <div className="text-xl font-bold text-emerald-400">{stats.published}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#0E1015] border border-white/10 space-y-0.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400">
            Drafts / Hidden
          </span>
          <div className="text-xl font-bold text-amber-400">{stats.drafts}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#0E1015] border border-white/10 space-y-0.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
            Categories
          </span>
          <div className="text-xl font-bold text-white">{stats.categoriesCount}</div>
        </div>
      </div>

      {/* Add New FAQ Form Panel */}
      {isAddingFaq && (
        <form
          onSubmit={handleAddFaqSubmit}
          className="p-5 rounded-2xl bg-[#0E1015] border border-purple-500/30 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-white">Create New FAQ</h3>
            </div>
            <button
              type="button"
              onClick={() => setIsAddingFaq(false)}
              className="text-xs text-neutral-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-neutral-300">Question *</label>
              <span className="text-[10px] font-mono text-neutral-500">
                {newQuestion.length}/300
              </span>
            </div>
            <input
              type="text"
              required
              maxLength={300}
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="e.g. Do you support ongoing cloud maintenance?"
              className="w-full px-3.5 py-2 bg-[#08090C] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-neutral-300">Answer *</label>
              <span className="text-[10px] font-mono text-neutral-500">
                {newAnswer.length}/3000
              </span>
            </div>
            <textarea
              required
              rows={4}
              maxLength={3000}
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Detailed explanation answering the customer's question..."
              className="w-full px-3.5 py-2 bg-[#08090C] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500 transition-colors resize-y leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#08090C] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
              >
                {PRESET_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="__custom__">+ Custom Category...</option>
              </select>

              {newCategory === "__custom__" && (
                <input
                  type="text"
                  placeholder="Enter custom category name..."
                  value={customCategoryInput}
                  onChange={(e) => setCustomCategoryInput(e.target.value)}
                  className="w-full mt-2 px-3.5 py-1.5 bg-[#08090C] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                />
              )}
            </div>

            <div className="space-y-1.5 flex flex-col justify-end">
              <label className="text-xs font-medium text-neutral-300 block">
                Visibility Status
              </label>
              <button
                type="button"
                onClick={() => setNewPublished(!newPublished)}
                className={`w-full py-2 px-3.5 rounded-xl border text-xs font-medium flex items-center justify-between transition-colors ${
                  newPublished
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-neutral-800/40 border-white/10 text-neutral-400"
                }`}
              >
                <span>{newPublished ? "Published (Visible)" : "Draft (Hidden)"}</span>
                {newPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingFaq(false)}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
            >
              Add Question
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#0E1015] border border-white/10">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions, answers, categories..."
            className="w-full pl-9 pr-3.5 py-1.5 bg-[#08090C] border border-white/10 rounded-xl text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <Filter className="w-3.5 h-3.5 text-neutral-500" />
            <span>Category:</span>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 bg-[#08090C] border border-white/10 rounded-xl text-white text-xs focus:outline-none"
          >
            <option value="all">All Categories</option>
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as "all" | "published" | "draft")}
            className="px-2.5 py-1.5 bg-[#08090C] border border-white/10 rounded-xl text-white text-xs focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>

      {/* FAQ Items List */}
      {filteredFaqs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0E1015] border border-white/10 space-y-2">
          <HelpCircle className="w-8 h-8 text-neutral-600 mx-auto" />
          <div className="text-sm font-semibold text-white">No questions found</div>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            {searchQuery || selectedCategory !== "all" || selectedStatus !== "all"
              ? "No FAQs match the current filter criteria. Clear filters to see all entries."
              : "No questions currently defined. Click 'New FAQ' to create one."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFaqs.map((faq, index) => {
            const isExpanded = expandedFaqId === faq.id;
            const isDeleting = deleteConfirmId === faq.id;

            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  faq.published !== false
                    ? "bg-[#0E1015] border-white/10 hover:border-white/20"
                    : "bg-[#090A0D] border-amber-500/20"
                }`}
              >
                {/* Header row */}
                <div className="p-4 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Order indicator */}
                    <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-mono text-neutral-400">
                      #{faq.order ?? index + 1}
                    </span>

                    {/* Category pill */}
                    <span className="flex-shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {faq.category || "General"}
                    </span>

                    {/* Question text */}
                    <button
                      type="button"
                      onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                      className="text-left font-semibold text-xs sm:text-sm text-white hover:text-purple-300 transition-colors truncate"
                    >
                      {faq.question}
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {/* Status Pill Toggle */}
                    <button
                      type="button"
                      onClick={() => handleTogglePublished(faq.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono flex items-center gap-1 border transition-colors cursor-pointer ${
                        faq.published !== false
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                          : "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                      }`}
                      title={faq.published !== false ? "Click to set Draft" : "Click to Publish"}
                    >
                      {faq.published !== false ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Published</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" />
                          <span>Draft</span>
                        </>
                      )}
                    </button>

                    {/* Reorder Buttons */}
                    <button
                      type="button"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="p-1.5 rounded-lg bg-[#14171F] hover:bg-[#1C212C] text-neutral-400 hover:text-white border border-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === faqs.length - 1}
                      className="p-1.5 rounded-lg bg-[#14171F] hover:bg-[#1C212C] text-neutral-400 hover:text-white border border-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Duplicate Button */}
                    <button
                      type="button"
                      onClick={() => handleDuplicateFaq(faq)}
                      className="p-1.5 rounded-lg bg-[#14171F] hover:bg-[#1C212C] text-neutral-400 hover:text-white border border-white/10 transition-colors"
                      title="Duplicate Question"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {/* Expand/Collapse Toggle */}
                    <button
                      type="button"
                      onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                      className="p-1.5 rounded-lg bg-[#14171F] hover:bg-[#1C212C] text-neutral-400 hover:text-white border border-white/10 transition-colors"
                      title={isExpanded ? "Collapse" : "Expand to edit"}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Delete button */}
                    {isDeleting ? (
                      <div className="flex items-center gap-1 bg-red-950/60 p-1 rounded-lg border border-red-500/40">
                        <span className="text-[10px] text-red-300 font-mono pl-1">Confirm?</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteFaq(faq.id)}
                          className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold"
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 text-[10px]"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(faq.id)}
                        className="p-1.5 rounded-lg bg-[#14171F] hover:bg-red-950/60 text-neutral-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 transition-colors"
                        title="Delete Question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Edit Form */}
                {isExpanded && (
                  <div className="p-5 border-t border-white/10 bg-[#07080B] space-y-4 animate-in fade-in duration-150">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-neutral-300">
                          Question *
                        </label>
                        <span className="text-[10px] font-mono text-neutral-500">
                          {faq.question.length}/300
                        </span>
                      </div>
                      <input
                        type="text"
                        maxLength={300}
                        value={faq.question}
                        onChange={(e) => handleUpdateFaq(faq.id, "question", e.target.value)}
                        className="w-full px-3.5 py-2 bg-[#0E1015] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-neutral-300">
                          Answer *
                        </label>
                        <span className="text-[10px] font-mono text-neutral-500">
                          {faq.answer.length}/3000
                        </span>
                      </div>
                      <textarea
                        rows={4}
                        maxLength={3000}
                        value={faq.answer}
                        onChange={(e) => handleUpdateFaq(faq.id, "answer", e.target.value)}
                        className="w-full px-3.5 py-2 bg-[#0E1015] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500 transition-colors resize-y leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-neutral-300">
                          Category
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={faq.category || "General"}
                            onChange={(e) => handleUpdateFaq(faq.id, "category", e.target.value)}
                            placeholder="Category name"
                            className="w-full px-3.5 py-2 bg-[#0E1015] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-neutral-300">
                          Unique ID (Stable)
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={faq.id}
                          className="w-full px-3.5 py-2 bg-neutral-900/50 border border-white/5 rounded-xl text-neutral-400 text-xs font-mono select-all"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
