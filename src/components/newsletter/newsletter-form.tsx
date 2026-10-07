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
          "Almost there! Please check your email to confirm your subscription (double opt-in).",
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
        <p className="text-xs font-semibold text-[#F5F5F3] uppercase tracking-wider font-mono">
          Stay in the Loop
        </p>
        <p className="text-xs text-[#909090]">
          Subscribe for software architecture insights and industry updates.
        </p>

        {success ? (
          <div className="p-3 rounded-lg bg-white/[0.04] border border-white/[0.10] text-[#D0D0CE] text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#F5F5F3]" />
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
                className="w-full px-3.5 py-2 rounded-lg bg-[#0D0D0D] border border-white/[0.10] text-xs text-[#F5F5F3] placeholder-[#666666] focus:outline-none focus:border-white/20 transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !email}
                className="px-3.5 py-2 rounded-lg bg-[#E8E8E6] hover:bg-[#FFFFFF] text-[#080808] font-medium text-xs transition-colors disabled:opacity-40 shrink-0"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            {error && (
              <p className="text-[11px] text-[#D0D0CE] flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0 text-white" />
                <span>{error}</span>
              </p>
            )}
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-[#0D0D0D] border border-white/[0.08] p-6 sm:p-8 md:p-10 text-center sm:text-left">
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.03] border border-white/[0.08] text-[#A0A0A0] text-xs font-mono">
            <Mail className="w-3.5 h-3.5" />
            <span>Bi-weekly Engineering Digest</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-[#F5F5F3] tracking-tight">{title}</h3>
          <p className="text-xs sm:text-sm text-[#909090] leading-relaxed">{description}</p>
        </div>

        <div className="w-full lg:w-auto lg:min-w-[360px] max-w-full">
          {success ? (
            <div className="p-5 rounded-lg bg-white/[0.04] border border-white/[0.10] text-[#D0D0CE] text-xs sm:text-sm flex items-start gap-3 shadow-lg">
              <CheckCircle2 className="w-5 h-5 text-[#F5F5F3] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-[#F5F5F3]">Subscription Initiated</p>
                <p className="text-xs text-[#909090] leading-relaxed">{success}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="email"
                  placeholder="Enter your corporate email..."
                  value={email}
                  onFocus={handleFocus}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#080808] border border-white/[0.10] text-xs text-[#F5F5F3] placeholder-[#666666] focus:outline-none focus:border-white/20 transition-colors disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="px-6 py-2.5 rounded-lg bg-[#E8E8E6] hover:bg-[#FFFFFF] text-[#080808] font-medium text-xs transition-colors shrink-0 disabled:opacity-40 flex items-center justify-center gap-2"
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
                <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.10] text-[#D0D0CE] text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-white" />
                  <span>{error}</span>
                </div>
              )}

              <p className="text-[11px] text-[#666666]">
                Zero spam. Double opt-in confirmation required. Unsubscribe anytime.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
