"use client";

import {
  Check,
  RotateCcw,
  Shield,
  Share2,
  Wrench,
} from "lucide-react";
import type { BackendPricingData } from "@/lib/services/pricing";
import { CtaBand } from "@/components/ui/cta-band";
import { FaqAccordion } from "@/components/ui/faq-accordion";
import { PageHero } from "@/components/ui/page-hero";
import { flowOptions } from "./pricing-helpers";
import { PricingCostLedger } from "./pricing-cost-ledger";
import { PricingFeatureMatrix } from "./pricing-feature-matrix";
import { PricingPackageSection } from "./pricing-package-section";
import { PricingPlanModal } from "./pricing-plan-modal";
import { usePricingConfigurator } from "./use-pricing-configurator";

export interface PricingViewProps {
  initialData?: BackendPricingData;
  faqs?: { id: string; question: string; answer: string }[];
}

const showFeatureMatrix = true;

export function PricingView({ initialData, faqs = [] }: PricingViewProps) {
  const configurator = usePricingConfigurator(initialData);
  const {
    flowMode,
    setFlowMode,
    copiedLink,
    handleReset,
    handleCopyLink,
  } = configurator;

  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title="Build your website, your way."
        description="Choose a ready-made package, add what you need, or handpick every feature. Prices cover development; third-party services are billed separately."
      >
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleReset} className="btn btn-secondary btn-sm" aria-label="Reset estimate to defaults">
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </button>
          <button type="button" onClick={handleCopyLink} className="btn btn-secondary btn-sm" aria-label="Copy shareable link">
            {copiedLink ? <Check className="h-4 w-4 text-accent" /> : <Share2 className="h-4 w-4" />}
            <span>{copiedLink ? "Link copied" : "Share"}</span>
          </button>
        </div>
      </PageHero>

      <div className="wrap space-y-8 pb-28 sm:space-y-10 sm:pb-20">

        {/* ========================================================================= */}
        {/* HOW DO YOU WANT TO BUILD? — 3 Flow Mode Selector                          */}
        {/* ========================================================================= */}
        <section aria-label="Build Mode Selection" className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-fg-muted">
              Step 1: How do you want to build your website?
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {flowOptions.map((opt) => {
              const isActive =
                opt.mode === "package"
                  ? flowMode === "package" || flowMode === "package_plus_addons"
                  : flowMode === opt.mode;
              return (
                <button
                  key={opt.mode}
                  type="button"
                  onClick={() => setFlowMode(opt.mode)}
                  className={`relative p-4 sm:p-5 rounded-2xl text-left transition-all duration-200 border flex items-start gap-3.5 select-none group ${
                    isActive
                      ? "bg-surface-2 border-accent/90 ring-1 ring-accent/50"
                      : "bg-surface border-line hover:border-line-strong hover:bg-surface-2"
                  }`}
                >
                  <span
                    className={`p-2.5 rounded-xl shrink-0 transition-colors ${
                      isActive
                        ? "bg-accent/20 text-accent"
                        : "bg-white/[0.04] text-fg-muted group-hover:text-white"
                    }`}
                  >
                    {opt.icon}
                  </span>
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{opt.title}</span>
                      {isActive && (
                        <span className="text-xs font-mono px-1.5 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/40 uppercase tracking-wider font-bold">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-fg-muted leading-relaxed">{opt.subtitle}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <PricingPackageSection configurator={configurator} />
        {/* ========================================================================= */}
        {/* CUSTOM BUILD HEADER (shown when flow is "custom_only")                     */}
        {/* ========================================================================= */}
        {flowMode === "custom_only" && (
          <section className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-surface-2 to-surface border border-accent/30 space-y-2">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-white">Fully Custom Build Mode</span>
            </div>
            <p className="text-xs text-fg-muted leading-relaxed max-w-3xl">
              No base package selected. Browse the complete feature catalog below and select exactly the features you need.
              Your total will be calculated based on individual feature prices. Third-party service charges (hosting, SMS, payment gateway fees, domain, email service) are not included.
            </p>
          </section>
        )}

        {/* ========================================================================= */}
        {/* FEATURE MATRIX + COST LEDGER (shown for package_plus_addons & custom_only) */}
        {/* ========================================================================= */}
        {showFeatureMatrix && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 2xl:gap-8 items-start">
            <PricingFeatureMatrix configurator={configurator} />
            <PricingCostLedger configurator={configurator} />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TRANSPARENCY & QUALITY ASSURANCE DISCLAIMERS                               */}
        {/* ========================================================================= */}
        <section aria-label="Pricing Standards" className="rounded-2xl p-5 sm:p-6 bg-surface border border-line space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-white tracking-tight uppercase">
              Webgent Engineering Standards &amp; Guarantees
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-fg-muted leading-relaxed">
            <div className="space-y-1">
              <strong className="text-fg block">100% Code Ownership</strong>
              <p>Full GitHub repository transfer on launch. You own all design files, source code, and assets. Zero vendor lock-in.</p>
            </div>
            <div className="space-y-1">
              <strong className="text-fg block">Strict Zero Double-Charging</strong>
              <p>Any feature included in your base package is never billed as an add-on. Add-ons only cover items outside your selected tier.</p>
            </div>
            <div className="space-y-1">
              <strong className="text-fg block">Third-Party Services at Actuals</strong>
              <p>Hosting, SMS, payment gateways, and email services are set up in your own accounts at zero studio markup. Their charges are not included in our prices.</p>
            </div>
            <div className="space-y-1">
              <strong className="text-fg block">Guaranteed Warranty Period</strong>
              <p>Every deployment includes post-launch bug-fix warranty support (14 days for Starter, 30 days for Business, 60 days for Pro).</p>
            </div>
          </div>
        </section>
        {faqs.length > 0 && (
          <section aria-labelledby="pricing-faq" className="pt-16">
            <div className="grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="eyebrow mb-5">Questions</p>
                <h2 id="pricing-faq" className="display-md">
                  Good to know.
                </h2>
              </div>
              <div className="lg:col-span-8">
                <FaqAccordion items={faqs} />
              </div>
            </div>
          </section>
        )}

        <PricingPlanModal configurator={configurator} />
      </div>

      <CtaBand
        title="Need something more specific?"
        description="Have particular requirements or a scope that doesn't fit a package? Tell me about it and I'll put together a custom estimate."
        primaryLabel="Request a custom estimate"
        whatsappService="a custom Webgent project"
        analyticsName="Pricing"
      />
    </>
  );
}
