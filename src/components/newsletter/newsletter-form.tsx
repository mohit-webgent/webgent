"use client";

import { useState, useRef } from "react";
import { Mail, CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { trackFormStart, trackFormSubmit } from "@/lib/analytics/client";

interface NewsletterFormProps {
  variant?: "inline" | "card" | "footer";
  title?: string;
  description?: string;
}

export function NewsletterForm({
  variant = "card",
  title = "Subscribe to Technical Insights",
  description = "Get our best architectural deep dives, engineering guides, and product updates delivered to your inbox.",
}: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const hasStartedRef = useRef(false);

  const handleFocus = () => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      trackFormStart("newsletter");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailTrimmed, name: name.trim() || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || "Failed to process subscription. Please try again.");
        return;
      }

      trackFormSubmit("newsletter");
      setSuccess(
        data.data?.message ||
          "Almost there! Please check your email to confirm your subscription (double opt-in)."
      );
      setEmail("");
      setName("");
    } catch {
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (variant === "footer") {
    return (
      <div className="space-y-3">
        <p className="text-xs font-bold text-white uppercase tracking-wider">
          Stay in the Loop
        </p>
        <p className="text-xs text-slate-400">
          Subscribe for software architecture insights and industry updates.
        </p>

        {success ? (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <span>{success}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onFocus={handleFocus}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !email}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all disabled:opacity-50 shrink-0"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>
            {error && (
              <p className="text-[11px] text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{error}</span>
              </p>
            )}
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900 border border-indigo-500/20 p-8 sm:p-10 text-center sm:text-left">
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
            <Mail className="w-3.5 h-3.5" />
            <span>Bi-weekly Engineering Digest</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="w-full lg:w-auto lg:min-w-[380px]">
          {success ? (
            <div className="p-5 rounded-2xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-200 text-xs sm:text-sm flex items-start gap-3 shadow-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-white">Subscription Initiated!</p>
                <p className="text-xs text-slate-300 leading-relaxed">{success}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="email"
                  placeholder="Enter your email address..."
                  value={email}
                  onFocus={handleFocus}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/30 shrink-0 disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-105"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Subscribing...</span>
                    </>
                  ) : (
                    <>
                      <span>Subscribe</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              <p className="text-[11px] text-slate-500">
                Zero spam. Double opt-in confirmation required. Unsubscribe anytime.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
