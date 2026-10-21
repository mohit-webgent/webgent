"use client";

import { useState, useRef } from "react";
import { Loader2, ArrowRight, Check } from "lucide-react";
import { trackFormStart, trackFormSubmit } from "@/lib/analytics/client";
import { Turnstile, TurnstileRef } from "@/components/ui/turnstile";

interface NewsletterFormProps {
  variant?: "inline" | "card" | "footer";
  title?: string;
  description?: string;
}

export function NewsletterForm({
  variant = "card",
  title = "Engineering Insights",
  description = "A private fortnightly monograph on distributed architecture, system design, and high-scale engineering.",
}: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const hasStartedRef = useRef(false);
  const turnstileRef = useRef<TurnstileRef>(null);

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
        body: JSON.stringify({
          email: emailTrimmed,
          turnstileToken: turnstileToken || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || "Failed to process subscription. Please try again.");
        turnstileRef.current?.reset();
        setTurnstileToken("");
        return;
      }

      trackFormSubmit("newsletter");
      setSuccess(
        data.data?.message ||
          "Subscription registered. Please check your inbox to confirm opt-in.",
      );
      setEmail("");
      setTurnstileToken("");
      turnstileRef.current?.reset();
    } catch {
      setError("An unexpected network error occurred. Please try again.");
      turnstileRef.current?.reset();
      setTurnstileToken("");
    } finally {
      setLoading(false);
    }
  };

  // FOOTER VARIANT (Sharp, dark, zero roundedness)
  if (variant === "footer") {
    return (
      <div className="space-y-3 rounded-none">
        <p className="text-xs font-semibold text-[#F5F5F3] uppercase tracking-widest font-mono rounded-none">
          Stay in the Loop
        </p>
        <p className="text-xs text-[#909090]">
          Subscribe for software architecture insights and industry updates.
        </p>

        {success ? (
          <div className="p-3 bg-white/[0.04] border border-white/[0.15] text-[#D0D0CE] text-xs flex items-start gap-2 rounded-none">
            <Check className="w-3.5 h-3.5 shrink-0 mt-0.5 text-white" />
            <span>{success}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2 rounded-none">
            <div className="flex rounded-none">
              <input
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onFocus={handleFocus}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full px-3.5 py-2 bg-[#0D0D0D] border border-white/[0.15] text-xs text-[#F5F5F3] placeholder-[#666666] focus:outline-none focus:border-white transition-colors disabled:opacity-50 rounded-none"
              />
              <button
                type="submit"
                disabled={loading || !email}
                className="px-4 py-2 bg-[#E8E8E6] hover:bg-white text-black font-mono text-xs transition-colors disabled:opacity-40 shrink-0 rounded-none"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <div className="pt-1">
              <Turnstile
                id="newsletter-footer-turnstile"
                ref={turnstileRef}
                size="compact"
                onVerify={setTurnstileToken}
                onExpire={() => setTurnstileToken("")}
                onError={() => setTurnstileToken("")}
              />
            </div>
            {error && (
              <p className="text-[11px] text-[#D0D0CE] flex items-center gap-1 font-mono">
                <span>&bull; {error}</span>
              </p>
            )}
          </form>
        )}
      </div>
    );
  }

  // =========================================================================
  // CARD VARIANT: Classic, Architectural, Balanced Height (Rounded & Compact)
  // =========================================================================
  return (
    <div className="relative w-full bg-[#FBFBFA] text-[#0A0A0A] border border-[#0A0A0A]/20 shadow-[0_24px_65px_rgba(0,0,0,0.65)] py-6 sm:py-8 px-6 sm:px-10 select-none rounded-2xl overflow-hidden">
      {/* Precision Inner Hairline Frame */}
      <div className="pointer-events-none absolute inset-2.5 sm:inset-3 border border-[#0A0A0A]/[0.12] rounded-xl" />

      {/* Hairline Corner Alignment Marks */}
      <div className="pointer-events-none absolute top-2.5 left-3 text-[9px] font-mono text-[#0A0A0A]/40 leading-none select-none">
        +
      </div>
      <div className="pointer-events-none absolute top-2.5 right-3 text-[9px] font-mono text-[#0A0A0A]/40 leading-none select-none">
        +
      </div>
      <div className="pointer-events-none absolute bottom-2.5 left-3 text-[9px] font-mono text-[#0A0A0A]/40 leading-none select-none">
        +
      </div>
      <div className="pointer-events-none absolute bottom-2.5 right-3 text-[9px] font-mono text-[#0A0A0A]/40 leading-none select-none">
        +
      </div>

      {/* Balanced 2-Column Architectural Layout */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center gap-6 lg:gap-10">
        {/* Left Column: Classic Luxury Typography */}
        <div className="lg:col-span-7 space-y-2">
          <h3 className="text-xl sm:text-2xl lg:text-[1.8rem] font-serif text-[#0A0A0A] tracking-tight leading-[1.15]">
            {title}
          </h3>

          <p className="text-xs sm:text-[13px] text-[#4A4A48] font-serif italic max-w-lg leading-relaxed">
            &ldquo;{description}&rdquo;
          </p>
        </div>

        {/* Right Column: Sharp Subscription Form & Editorial Metadata */}
        <div className="lg:col-span-5 lg:border-l lg:border-[#0A0A0A]/12 lg:pl-8">
          {success ? (
            <div className="p-4 bg-white border border-[#0A0A0A] text-[#0A0A0A] space-y-1.5 shadow-sm rounded-xl">
              <div className="text-xs font-mono font-bold uppercase tracking-widest text-[#0A0A0A] flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#0A0A0A]" />
                REGISTRATION CONFIRMED
              </div>
              <p className="text-xs text-[#555555] font-serif italic">
                {success}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-2">
              {/* Form Header Stamp */}
              <div className="flex items-center justify-between text-[9.5px] font-mono uppercase tracking-[0.18em] text-[#0A0A0A]/60 font-semibold px-0.5">
                <span>DIRECT INBOX DISPATCH</span>
                <span>FORTNIGHTLY RELEASE</span>
              </div>

              {/* Inline Input & Button */}
              <div className="flex flex-col sm:flex-row items-stretch border border-[#0A0A0A] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] rounded-xl overflow-hidden">
                <input
                  type="email"
                  required
                  placeholder="Enter corporate email..."
                  value={email}
                  onFocus={handleFocus}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2.5 sm:py-3 bg-transparent text-xs sm:text-[13px] text-[#0A0A0A] placeholder-[#888888] font-mono focus:outline-none border-0"
                />

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="px-6 py-2.5 sm:py-3 bg-[#0A0A0A] hover:bg-[#222222] text-[#FBFBFA] text-xs font-mono font-bold tracking-[0.18em] uppercase transition-colors shrink-0 flex items-center justify-center gap-2 border-0 disabled:opacity-40 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                      <span>SENDING</span>
                    </>
                  ) : (
                    <>
                      <span>SUBSCRIBE</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              {/* Cloudflare Turnstile */}
              <div className="pt-1">
                <Turnstile
                  id="newsletter-card-turnstile"
                  ref={turnstileRef}
                  size="compact"
                  onVerify={setTurnstileToken}
                  onExpire={() => setTurnstileToken("")}
                  onError={() => setTurnstileToken("")}
                />
              </div>

              {/* Error or Disclaimer */}
              <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-[0.15em] text-[#777777] px-0.5 pt-0.5">
                {error ? (
                  <span className="text-[#A81D1D] font-mono font-semibold">&bull; {error}</span>
                ) : (
                  <>
                    <span>ZERO MARKETING NOISE</span>
                    <span>1-CLICK UNSUBSCRIBE</span>
                  </>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
