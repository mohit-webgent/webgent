"use client";

import { useState, useEffect } from "react";
import {
  User,
  KeyRound,
  Shield,
  Save,
  Loader2,
  Calendar,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { ChangePasswordForm } from "./change-password-form";
import { ImageUpload } from "./image-upload";
import { useToast } from "@/components/ui/toast";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  avatarUrl: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

export function ProfileManager({
  defaultTab = "profile",
}: {
  defaultTab?: "profile" | "security";
}) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"profile" | "security">(defaultTab);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/profile");
        if (res.ok) {
          const json = await res.json();
          setProfile(json.data);
          setName(json.data.name || "");
          setAvatarUrl(json.data.avatarUrl || "");
        } else {
          toast.error("Failed to load user profile");
        }
      } catch {
        toast.error("Network error retrieving profile");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [toast]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), avatarUrl: avatarUrl.trim() || undefined }),
      });

      if (res.ok) {
        const json = await res.json();
        setProfile((prev) => (prev ? { ...prev, ...json.data } : null));
        toast.success("Profile updated successfully");
      } else {
        const json = await res.json();
        toast.error(json.error || "Failed to update profile");
      }
    } catch {
      toast.error("Network error while updating profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <User className="w-6 h-6" />
          </div>
          <span>Account Profile & Security</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your administrative credentials, avatar identity, and access credentials
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "profile"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile Details</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "security"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Change Password</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading profile data...</p>
        </div>
      ) : activeTab === "profile" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Profile Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="text-center space-y-3">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white text-2xl font-bold mx-auto shadow-xl shadow-indigo-600/20 overflow-hidden">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (name || "Admin").slice(0, 2).toUpperCase()
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{name || "Admin"}</h3>
                <p className="text-xs text-slate-400">{profile?.email}</p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[11px] font-semibold">
                <Shield className="w-3.5 h-3.5" />
                <span>{profile?.role || "ADMIN"}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Member Since</span>
                </span>
                <span className="text-slate-200 font-medium">
                  {profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Last Login</span>
                </span>
                <span className="text-slate-200 font-medium">
                  {profile?.lastLoginAt
                    ? new Date(profile.lastLoginAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Active session"}
                </span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>Account Status</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{profile?.status || "ACTIVE"}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Edit Profile Form */}
          <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-base font-bold text-white">Edit Profile Details</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Update your display name and administrative avatar photo
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email Address (Read-only)
                </label>
                <input
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-500 cursor-not-allowed"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Primary authentication email is managed via environment seeds.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Avatar Photo
                </label>
                <div className="space-y-3">
                  <ImageUpload
                    value={avatarUrl}
                    onChange={(url) => setAvatarUrl(url)}
                    folder="testimonials"
                  />
                  <input
                    type="text"
                    placeholder="Or enter image URL directly..."
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Profile Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8">
          <ChangePasswordForm />
        </div>
      )}
    </div>
  );
}
