"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { gsap, isReducedMotion } from "@/components/animations/gsap-core";
import { SectionHeading } from "@/components/ui/section-heading";
import { openChat } from "@/lib/chat-events";
import type { MasterPackageTier } from "@/data/pricing-matrix-data";
import type { BackendPricingData } from "@/lib/services/pricing-shared";

const TIERS: MasterPackageTier[] = ["starter", "business", "pro"];
const MAX_FEATURES = 8;

const formatINR = (value: number) => `₹${value.toLocaleString("en-IN")}`;

function AnimatedPrice({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const shown = useRef({ value });

  useEffect(() => {
    if (!ref.current) return;
    if (isReducedMotion()) {
      shown.current.value = value;
      ref.current.textContent = formatINR(value);
      return;
    }
    const tween = gsap.to(shown.current, {
      value,
      duration: 0.6,
      ease: "power3.out",
      onUpdate: () => {
        if (ref.current) ref.current.textContent = formatINR(Math.round(shown.current.value));
      },
    });
    return () => {
      tween.kill();
    };
  }, [value]);

  return (
    <span ref={ref} id="estimate-total" className="tabular-nums" aria-live="polite">
      {formatINR(value)}
    </span>
  );
}

/** A quick version of the /pricing configurator, using its packages and add-on prices. */
export function EstimatorSection({ pricing }: { pricing: BackendPricingData }) {
  const [tier, setTier] = useState<MasterPackageTier>("starter");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [express, setExpress] = useState(false);

  const addons = useMemo(
    () =>
      pricing.matrixFeatures
        .filter((feature) => feature.popularAddon && feature.billingType === "onetime" && !feature.isCustomQuote && !feature.hasQuantity && feature.addonPrice)
        .slice(0, MAX_FEATURES),
    [pricing.matrixFeatures],
  );

  const activePackage = pricing.matrixPackages[tier];
  const isIncluded = (id: string) => addons.find((feature) => feature.id === id)?.availability[tier] === "included";

  // A feature that the chosen package already includes is never charged as an add-on.
  const chosen = addons.filter((feature) => selectedIds.includes(feature.id) && !isIncluded(feature.id));
  const addonsCost = chosen.reduce((sum, feature) => sum + (feature.addonPrice ?? 0), 0);
  const subtotal = activePackage.startingPrice + addonsCost;
  const expressFee = express ? Math.round(subtotal * (pricing.settings?.expressMultiplier ?? 0.2)) : 0;
  const total = subtotal + expressFee;

  const toggle = (id: string) =>
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));

  const params = new URLSearchParams({ pkg: tier, flow: chosen.length > 0 ? "package_plus_addons" : "package" });
  if (chosen.length > 0) params.set("addons", chosen.map((feature) => feature.id).join(","));
  if (express) params.set("speed", "express");

  const askConsultant = () => {
    const extras = chosen.map((feature) => feature.name).join(", ");
    openChat(
      `I'm looking at the ${activePackage.name} package${extras ? ` with ${extras}` : ""}, about ${formatINR(total)}. Is this the right scope for my project?`,
    );
  };

  return (
    <section id="estimate" className="wrap section">
      <SectionHeading
        eyebrow="Instant estimate"
        title="See what it would cost, right now."
        description="Pick a package and add what you need. No forms and no call required."
      />

      <div className="card mt-7 grid grid-cols-1 overflow-hidden lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)]">
        <div className="space-y-5 p-5 sm:p-6">
          <fieldset>
            <legend className="text-[0.8125rem] font-medium text-fg-soft">Package</legend>
            <div className="mt-2.5 grid grid-cols-1 gap-1.5 sm:grid-cols-3">
              {TIERS.map((id) => {
                const item = pricing.matrixPackages[id];
                const isActive = id === tier;
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setTier(id)}
                    className={`rounded-lg border p-3 text-left transition-colors duration-200 ${isActive ? "border-accent bg-accent text-accent-fg" : "border-line text-fg-soft hover:border-line-strong"}`}
                  >
                    <span className="flex items-center justify-between gap-2 font-display text-sm font-semibold">
                      {item.name}
                      {item.popular && (
                        <span className={`rounded px-1.5 py-0.5 font-sans text-[0.625rem] font-medium ${isActive ? "bg-accent-fg/15 text-accent-fg" : "bg-accent/15 text-accent"}`}>Popular</span>
                      )}
                    </span>
                    <span className={`mt-1 block font-mono text-xs ${isActive ? "text-accent-fg/75" : "text-fg-muted"}`}>from {formatINR(item.startingPrice)}</span>
                  </button>
                );
              })}
            </div>
            <p key={tier} className="anim-pop mt-2.5 text-[0.8125rem] leading-relaxed text-fg-muted">{activePackage.summary}</p>
          </fieldset>

          <fieldset>
            <legend className="text-[0.8125rem] font-medium text-fg-soft">Add what you need</legend>
            <div className="mt-2.5 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {addons.map((feature) => {
                const included = isIncluded(feature.id);
                const isOn = included || selectedIds.includes(feature.id);
                return (
                  <button
                    key={feature.id}
                    type="button"
                    aria-pressed={isOn}
                    disabled={included}
                    title={feature.description}
                    onClick={() => toggle(feature.id)}
                    className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-[0.8125rem] transition-colors duration-200 ${
                      isOn ? "border-line-strong bg-surface-2 text-fg" : "border-line text-fg-muted hover:border-line-strong hover:text-fg"
                    } ${included ? "cursor-default" : ""}`}
                  >
                    <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded transition-colors duration-200 ${included ? "bg-success/20 text-success" : isOn ? "bg-accent text-accent-fg" : "border border-line-strong"}`}>
                      {isOn && <Check className="h-3 w-3" strokeWidth={3} />}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{feature.name}</span>
                    <span className={`shrink-0 font-mono text-[0.6875rem] ${included ? "text-success" : "text-fg-muted"}`}>
                      {included ? "Included" : `+${(feature.addonPrice ?? 0).toLocaleString("en-IN")}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-line px-3 py-2.5 transition-colors hover:border-line-strong">
            <span className="text-[0.8125rem] text-fg-soft">
              Express delivery
              <span className="ml-2 font-mono text-[0.6875rem] text-fg-muted">+{Math.round((pricing.settings?.expressMultiplier ?? 0.2) * 100)}%</span>
            </span>
            <input type="checkbox" checked={express} onChange={(event) => setExpress(event.target.checked)} className="peer sr-only" />
            <span aria-hidden="true" className="relative h-5 w-9 shrink-0 rounded-full bg-surface-3 transition-colors duration-200 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-fg after:transition-transform after:duration-300 after:ease-expo-out peer-checked:bg-accent peer-checked:after:translate-x-4 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent" />
          </label>
        </div>

        <div className="flex flex-col border-t border-line bg-surface-2 p-5 sm:p-6 lg:border-l lg:border-t-0">
          <p className="text-[0.8125rem] text-fg-muted">Estimated project cost</p>
          <p className="mt-1 font-display text-4xl font-semibold tracking-tight">
            <AnimatedPrice value={total} />
          </p>
          <p className="mt-1 font-mono text-xs text-fg-muted">{express ? "Fast-track delivery" : activePackage.deliveryTime}</p>

          <dl className="mt-4 space-y-1.5 border-t border-line pt-3.5 text-[0.8125rem]">
            <div className="flex justify-between gap-3">
              <dt className="text-fg-muted">{activePackage.name} package</dt>
              <dd className="font-mono">{formatINR(activePackage.startingPrice)}</dd>
            </div>
            {chosen.map((feature) => (
              <div key={feature.id} className="anim-pop flex justify-between gap-3">
                <dt className="min-w-0 truncate text-fg-muted">{feature.name}</dt>
                <dd className="shrink-0 font-mono">{formatINR(feature.addonPrice ?? 0)}</dd>
              </div>
            ))}
            {expressFee > 0 && (
              <div className="anim-pop flex justify-between gap-3">
                <dt className="text-fg-muted">Express delivery</dt>
                <dd className="font-mono">{formatINR(expressFee)}</dd>
              </div>
            )}
          </dl>

          <div className="mt-auto space-y-2 pt-5">
            <Link href={`/pricing?${params.toString()}`} className="btn btn-primary w-full">
              <span>Continue with this estimate</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button type="button" onClick={askConsultant} className="btn btn-secondary w-full">
              <Sparkles className="h-4 w-4" />
              <span>Check this scope with AI</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
