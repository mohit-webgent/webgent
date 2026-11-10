"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Save,
  Loader2,
  Mail,
  Share2,
  Sliders,
  RotateCcw,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { getApiErrorMessage } from "@/lib/api/client-error";

export function SettingsManager() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"contact" | "social" | "features">("contact");
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [originalSettings, setOriginalSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const json = await res.json();
          setSettings(json.data || {});
          setOriginalSettings(json.data || {});
        } else {
          toast.error("Failed to load settings");
        }
      } catch {
        toast.error("Error connecting to server");
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [toast]);

  const handleChange = (key: string, val: string) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
  };

  const handleToggle = (key: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: prev[key] === "true" ? "false" : "true",
    }));
  };

  const handleReset = () => {
    setSettings(originalSettings);
    toast.info("Settings reverted to saved values");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setOriginalSettings(settings);
        toast.success("Settings saved");
      } else {
        const json = await res.json();
        toast.error(getApiErrorMessage(json, "Failed to update settings"));
      }
    } catch {
      toast.error("Network error while saving settings");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "contact", label: "Contact Details", icon: Mail },
    { id: "social", label: "Social Media", icon: Share2 },
    { id: "features", label: "Website Switches", icon: Sliders },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-fg tracking-tight flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Settings className="w-6 h-6" />
            </div>
            <span>Site Settings</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Your contact information, social links and website switches.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-fg transition-all disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Changes</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent text-accent-fg text-xs font-semibold transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save All Settings</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-slate-800 p-4 space-y-1 bg-slate-900/40">
          <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            Sections
          </div>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? "bg-indigo-600/20 text-fg border border-indigo-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-indigo-400" : "text-slate-500"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-9 p-6 sm:p-8">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Loading system settings...</p>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              {activeTab === "contact" && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-base font-bold text-fg">Contact & Company</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Public inquiry email, support phone, and office details
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Primary Contact Email
                      </label>
                      <input
                        type="email"
                        value={settings.contact_email || ""}
                        onChange={(e) => handleChange("contact_email", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-fg focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Support Phone Number
                      </label>
                      <input
                        type="text"
                        value={settings.contact_phone || ""}
                        onChange={(e) => handleChange("contact_phone", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-fg focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Office Physical Address
                      </label>
                      <input
                        type="text"
                        value={settings.office_address || ""}
                        onChange={(e) => handleChange("office_address", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-fg focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Business Operating Hours
                      </label>
                      <input
                        type="text"
                        value={settings.business_hours || ""}
                        onChange={(e) => handleChange("business_hours", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-fg focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "social" && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-base font-bold text-fg">Social Media Profiles</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Links featured on the public website footer and navigation
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        GitHub URL
                      </label>
                      <input
                        type="url"
                        value={settings.github_url || ""}
                        onChange={(e) => handleChange("github_url", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-fg focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Twitter / X URL
                      </label>
                      <input
                        type="url"
                        value={settings.twitter_url || ""}
                        onChange={(e) => handleChange("twitter_url", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-fg focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        LinkedIn URL
                      </label>
                      <input
                        type="url"
                        value={settings.linkedin_url || ""}
                        onChange={(e) => handleChange("linkedin_url", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-fg focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Discord URL
                      </label>
                      <input
                        type="url"
                        value={settings.discord_url || ""}
                        onChange={(e) => handleChange("discord_url", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-fg focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "features" && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-base font-bold text-fg">Website Switches</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      These take effect on the live website as soon as you save.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                      <div>
                        <p className="text-xs font-bold text-fg">AI Consultant Chat</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Show the AI consultant on the website. When off, the chat button disappears and visitors are sent to the contact page.
                        </p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={settings.enable_ai_chat === "true"}
                        aria-label="Live AI chat widget"
                        onClick={() => handleToggle("enable_ai_chat")}
                        className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                          settings.enable_ai_chat === "true" ? "bg-indigo-600" : "bg-slate-800"
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            settings.enable_ai_chat === "true" ? "translate-x-6" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                      <div>
                        <p className="text-xs font-bold text-fg">Maintenance Mode</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Replace every public page with a short &ldquo;back soon&rdquo; screen showing your email and WhatsApp. The admin console stays available so you can switch it off.
                        </p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={settings.maintenance_mode === "true"}
                        aria-label="Maintenance mode"
                        onClick={() => handleToggle("maintenance_mode")}
                        className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                          settings.maintenance_mode === "true" ? "bg-amber-600" : "bg-slate-800"
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            settings.maintenance_mode === "true" ? "translate-x-6" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </form>
          )}
        </div>
      </div>
    </div>
  );
}
