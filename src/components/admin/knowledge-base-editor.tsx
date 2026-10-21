"use client";

import { useState } from "react";
import {
  Sparkles,
  Plus,
  Save,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  X,
  Shield,
  BookOpen,
} from "lucide-react";
import type {
  ApprovedKnowledgeItem,
  CustomRuleItem,
  KnowledgeBaseConfig,
} from "@/lib/services/knowledge-base-service";

interface KnowledgeBaseEditorProps {
  initialConfig: KnowledgeBaseConfig;
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  about: { label: "Company & Identity", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
  credentials: { label: "Founder & Team", color: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
  pricing: { label: "Pricing & Scope", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  tech_stack: { label: "Tech Architecture", color: "bg-sky-500/10 text-sky-400 border-sky-500/20" },
  policy: { label: "Policy & SLA", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  custom: { label: "Custom Knowledge", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
};

export function KnowledgeBaseEditor({ initialConfig }: KnowledgeBaseEditorProps) {
  const [activeTab, setActiveTab] = useState<"knowledge" | "rules">("knowledge");
  const [knowledgeList, setKnowledgeList] = useState<ApprovedKnowledgeItem[]>(
    initialConfig.knowledge || [],
  );
  const [rulesList, setRulesList] = useState<CustomRuleItem[]>(initialConfig.rules || []);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal editing knowledge
  const [editingKnowledge, setEditingKnowledge] = useState<ApprovedKnowledgeItem | null>(null);
  const [isNewKnowledge, setIsNewKnowledge] = useState(false);
  const [knowTitle, setKnowTitle] = useState("");
  const [knowCategory, setKnowCategory] = useState<ApprovedKnowledgeItem["category"]>("custom");
  const [knowContent, setKnowContent] = useState("");
  const [knowKeywords, setKnowKeywords] = useState("");
  const [knowEnabled, setKnowEnabled] = useState(true);

  // New rule inline state
  const [newRuleText, setNewRuleText] = useState("");
  const [newRuleSeverity, setNewRuleSeverity] = useState<"strict" | "preference">("strict");

  const handleOpenAddKnowledge = () => {
    setIsNewKnowledge(true);
    setEditingKnowledge({
      id: `custom_${Date.now()}`,
      title: "",
      category: "custom",
      content: "",
      keywords: [],
      enabled: true,
      updatedAt: new Date().toISOString(),
    });
    setKnowTitle("");
    setKnowCategory("custom");
    setKnowContent("");
    setKnowKeywords("");
    setKnowEnabled(true);
  };

  const handleOpenEditKnowledge = (item: ApprovedKnowledgeItem) => {
    setIsNewKnowledge(false);
    setEditingKnowledge(item);
    setKnowTitle(item.title);
    setKnowCategory(item.category);
    setKnowContent(item.content);
    setKnowKeywords(item.keywords.join(", "));
    setKnowEnabled(item.enabled);
  };

  const handleSaveKnowledgeModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKnowledge) return;

    const keywordsArray = knowKeywords
      .split(",")
      .map((k) => k.trim().toLowerCase())
      .filter((k) => k.length > 0);

    const updatedItem: ApprovedKnowledgeItem = {
      ...editingKnowledge,
      title: knowTitle.trim(),
      category: knowCategory,
      content: knowContent.trim(),
      keywords: keywordsArray,
      enabled: knowEnabled,
      updatedAt: new Date().toISOString(),
    };

    if (isNewKnowledge) {
      setKnowledgeList((prev) => [updatedItem, ...prev]);
    } else {
      setKnowledgeList((prev) =>
        prev.map((k) => (k.id === editingKnowledge.id ? updatedItem : k)),
      );
    }

    setEditingKnowledge(null);
  };

  const handleDeleteKnowledge = (id: string) => {
    if (!confirm("Remove this knowledge document?")) return;
    setKnowledgeList((prev) => prev.filter((k) => k.id !== id));
  };

  const handleToggleKnowledge = (id: string) => {
    setKnowledgeList((prev) =>
      prev.map((k) => (k.id === id ? { ...k, enabled: !k.enabled } : k)),
    );
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleText.trim()) return;

    const newRule: CustomRuleItem = {
      id: `rule_${Date.now()}`,
      rule: newRuleText.trim(),
      enabled: true,
      severity: newRuleSeverity,
    };

    setRulesList((prev) => [...prev, newRule]);
    setNewRuleText("");
  };

  const handleDeleteRule = (id: string) => {
    setRulesList((prev) => prev.filter((r) => r.id !== id));
  };

  const handleToggleRule = (id: string) => {
    setRulesList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)),
    );
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/admin/knowledge", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          knowledge: knowledgeList,
          rules: rulesList,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || json.message || "Failed to save knowledge base.");
      }

      setSuccessMessage(
        "Knowledge base and custom rules saved successfully! In-memory AI index updated.",
      );
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI Consultant Ground Truth
            </span>
            <span className="px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-md bg-slate-800 text-slate-300 border border-slate-700">
              {knowledgeList.length} Facts · {rulesList.length} Rules
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <BookOpen className="w-6 h-6" />
            </div>
            <span>Approved Knowledge & Prompt Rules</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Configure authoritative company facts, founder background, and custom prompt guardrails consumed directly by the Google Gemini AI Consultant.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Publishing Changes..." : "Publish to AI Consultant"}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-3 text-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center gap-3 text-xs animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800">
        <button
          onClick={() => setActiveTab("knowledge")}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeTab === "knowledge" ? "text-amber-400" : "text-slate-400 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span>Approved Knowledge Documents ({knowledgeList.length})</span>
          </span>
          {activeTab === "knowledge" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("rules")}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeTab === "rules" ? "text-amber-400" : "text-slate-400 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Prompt Rules & Tone Guardrails ({rulesList.length})</span>
          </span>
          {activeTab === "rules" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
          )}
        </button>
      </div>

      {/* Tab 1: Knowledge Documents */}
      {activeTab === "knowledge" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              These verified documents are retrieved into Google Gemini context during visitor consultations.
            </p>
            <button
              onClick={handleOpenAddKnowledge}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Add Knowledge Entry</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {knowledgeList.map((item) => {
              const catConfig = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.custom;
              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    item.enabled
                      ? "bg-slate-900/80 border-slate-800"
                      : "bg-slate-950/40 border-slate-800/60 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${catConfig.color}`}
                    >
                      {catConfig.label}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleKnowledge(item.id)}
                        title={item.enabled ? "Disable for AI retrieval" : "Enable for AI retrieval"}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                          item.enabled
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-slate-800 text-slate-500 border-slate-700"
                        }`}
                      >
                        {item.enabled ? "Active" : "Disabled"}
                      </button>

                      <button
                        onClick={() => handleOpenEditKnowledge(item)}
                        className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteKnowledge(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3 line-clamp-4">
                    {item.content}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {item.keywords.map((kw, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 rounded bg-slate-950 text-[10px] font-mono text-slate-400 border border-slate-800"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Custom Rules */}
      {activeTab === "rules" && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Add New Prompt Rule or Guardrail</h3>
            <form onSubmit={handleAddRule} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  required
                  value={newRuleText}
                  onChange={(e) => setNewRuleText(e.target.value)}
                  placeholder="e.g. Never recommend WordPress or Wix when user asks about scalability..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />

                <select
                  value={newRuleSeverity}
                  onChange={(e) => setNewRuleSeverity(e.target.value as "strict" | "preference")}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="strict">Strict Guardrail</option>
                  <option value="preference">Style / Preference</option>
                </select>

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Rule</span>
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">Active Prompt Directives</h3>
            <div className="space-y-2.5">
              {rulesList.map((r, index) => (
                <div
                  key={r.id}
                  className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                    r.enabled ? "bg-slate-900/60 border-slate-800" : "bg-slate-950/40 border-slate-900 opacity-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                      {index + 1}
                    </span>
                    <div>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border mr-2 ${
                          r.severity === "strict"
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            : "bg-sky-500/10 text-sky-400 border-sky-500/20"
                        }`}
                      >
                        {r.severity}
                      </span>
                      <span className="text-xs text-slate-200">{r.rule}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleRule(r.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                        r.enabled
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-slate-800 text-slate-500 border-slate-700"
                      }`}
                    >
                      {r.enabled ? "Active" : "Muted"}
                    </button>
                    <button
                      onClick={() => handleDeleteRule(r.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Knowledge Modal */}
      {editingKnowledge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>{isNewKnowledge ? "Add Knowledge Document" : "Edit Knowledge Document"}</span>
              </h3>
              <button
                onClick={() => setEditingKnowledge(null)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveKnowledgeModal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  value={knowTitle}
                  onChange={(e) => setKnowTitle(e.target.value)}
                  placeholder="e.g. Core Milestone Payment Structure"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={knowCategory}
                    onChange={(e) =>
                      setKnowCategory(e.target.value as ApprovedKnowledgeItem["category"])
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="about">Company & Identity</option>
                    <option value="credentials">Founder & Team</option>
                    <option value="pricing">Pricing & Scope</option>
                    <option value="tech_stack">Tech Architecture</option>
                    <option value="policy">Policy & SLA</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={knowEnabled ? "true" : "false"}
                    onChange={(e) => setKnowEnabled(e.target.value === "true")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="true">Active (Retrieve in AI)</option>
                    <option value="false">Disabled (Ignore)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Content Facts & Truth Grounding
                </label>
                <textarea
                  required
                  rows={5}
                  value={knowContent}
                  onChange={(e) => setKnowContent(e.target.value)}
                  placeholder="Explain factual requirements, timelines, technical specifications, or business boundaries clearly..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400 leading-relaxed font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Keywords / Triggers (comma-separated)
                </label>
                <input
                  type="text"
                  value={knowKeywords}
                  onChange={(e) => setKnowKeywords(e.target.value)}
                  placeholder="payments, milestones, upfront, refund, warranty"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingKnowledge(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl"
                >
                  Done
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
