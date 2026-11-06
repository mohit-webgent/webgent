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
        <p className="text-xs font-semibold text-fg uppercase tracking-widest font-mono rounded-none">
          Stay in the Loop
        </p>
        <p className="text-xs text-fg-muted">
          Subscribe for software architecture insights and industry updates.
        </p>

        {success ? (
          <div className="p-3 bg-white/[0.04] border border-line-strong text-fg-soft text-xs flex items-start gap-2 rounded-none">
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
                className="w-full px-3.5 py-2 bg-surface border border-line-strong text-xs text-fg placeholder-fg-muted focus:outline-none focus:border-white transition-colors disabled:opacity-50 rounded-none"
              />
              <button
                type="submit"
                disabled={loading || !email}
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-accent-fg font-mono text-xs transition-colors disabled:opacity-40 shrink-0 rounded-none"
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
              <p className="text-xs text-fg-soft flex items-center gap-1 font-mono">
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
    <div className="card grid items-center gap-5 p-5 sm:p-6 lg:grid-cols-12 lg:gap-8">
      <div className="space-y-1.5 lg:col-span-6">
        <h3 className="display-md">{title}</h3>
        <p className="max-w-lg text-sm leading-relaxed text-fg-muted">{description}</p>
      </div>

      <div className="lg:col-span-6">
        {success ? (
          <div className="anim-pop flex items-start gap-2.5 rounded-lg border border-line-strong bg-surface-2 p-3.5 text-sm text-fg-soft">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            <span>{success}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2.5">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                required
                aria-label="Your email"
                placeholder="you@email.com"
                value={email}
                onFocus={handleFocus}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="field min-w-0 flex-1"
              />
              <button type="submit" disabled={loading || !email} className="btn btn-light shrink-0">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                <span>{loading ? "Subscribing" : "Subscribe"}</span>
              </button>
            </div>
            <Turnstile
              id="newsletter-card-turnstile"
              ref={turnstileRef}
              size="compact"
              onVerify={setTurnstileToken}
              onExpire={() => setTurnstileToken("")}
              onError={() => setTurnstileToken("")}
            />
            {error ? (
              <p role="alert" className="text-[0.8125rem] text-red-300">{error}</p>
            ) : (
              <p className="text-xs text-fg-muted">No marketing noise. Unsubscribe in one click.</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
