"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Star, Sparkles } from "lucide-react";
import { CtaLink } from "@/components/ui/cta-link";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { buildWhatsAppUrl } from "@/config/whatsapp";
import type { CmsService } from "@/lib/services/cms-services-shared";
import {
  Layers,
  Cpu,
  Database,
  Code,
  Globe,
  Shield,
  Zap,
  Server,
  Workflow,
  Rocket,
  Layout,
  CreditCard,
  MessageCircle,
  BarChart3,
  Cloud,
  Terminal,
  Smartphone,
  Compass,
} from "lucide-react";

const ICON_COMPONENTS: Record<string, React.ComponentType<{ className?: string }>> = {
  Layers,
  Cpu,
  Database,
  Code,
  Globe,
  Shield,
  Zap,
  Sparkles,
  Server,
  Workflow,
  Rocket,
  Layout,
  CreditCard,
  MessageCircle,
  BarChart3,
  Cloud,
  Terminal,
  Smartphone,
  Compass,
};

function renderServiceIcon(name?: string | null, className = "w-6 h-6") {
  const IconComp = name && ICON_COMPONENTS[name] ? ICON_COMPONENTS[name] : Layers;
  return <IconComp className={className} />;
}

export interface ServicesViewProps {
  services: CmsService[];
}

export function ServicesView({ services }: ServicesViewProps) {
  return (
    <div className="relative min-h-screen bg-[#070707] text-[#F5F5F3] pt-12 sm:pt-20 pb-24 overflow-hidden">
      {/* Background radial gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-sky-500/10 via-transparent to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-[1760px] 2xl:max-w-[1920px] 3xl:max-w-[2240px] w-full mx-auto px-5 sm:px-8 lg:px-12 2xl:px-16 3xl:px-24">
        {/* Header Section */}
        <div className="space-y-4 max-w-3xl mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono uppercase tracking-[0.2em] text-[#A0A0A0]">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Core Disciplines & Systems</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white uppercase leading-[1.08]">
            Engineered for <span className="text-sky-400">Scale</span> & Velocity.
          </h1>

          <p className="text-sm sm:text-base text-[#909090] leading-relaxed max-w-2xl">
            We architect and build bespoke full-stack applications, high-converting digital storefronts, and automated backend infrastructure for modern brands and growing companies.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 lg:gap-10">
          {services.map((svc) => (
            <div
              key={svc.id}
              className="relative rounded-2xl bg-[#0D0D0D] border border-white/[0.08] hover:border-sky-500/30 p-7 sm:p-9 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.8)] group"
            >
              <div className="space-y-6">
                {/* Top ribbon: Icon & Price */}
                <div className="flex items-start justify-between gap-4">
                  <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sky-400 group-hover:scale-105 group-hover:bg-sky-500/10 group-hover:border-sky-500/20 transition-all">
                    {renderServiceIcon(svc.icon)}
                  </div>

                  <div className="flex items-center gap-2">
                    {svc.featured && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400 uppercase tracking-wider">
                        <Star className="w-3 h-3 fill-current" />
                        <span>Featured</span>
                      </span>
                    )}
                    {(svc.priceLabel || svc.startingPrice !== null) && (
                      <span className="px-3 py-1 rounded-lg text-xs font-mono font-medium bg-white/[0.05] border border-white/[0.1] text-white">
                        {svc.priceLabel || `Starting at ₹${svc.startingPrice?.toLocaleString("en-IN")}`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Title & Short Description */}
                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-white group-hover:text-sky-300 transition-colors tracking-tight">
                    {svc.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#909090] leading-relaxed">
                    {svc.shortDescription}
                  </p>
                </div>

                {/* Features Checklist */}
                {svc.features.length > 0 && (
                  <div className="space-y-2.5 pt-4 border-t border-white/[0.06]">
                    <p className="text-xs font-mono uppercase tracking-wider text-[#A0A0A0]">
                      Key Deliverables & Specifications:
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {svc.features.map((feat) => (
                        <li key={feat.id} className="flex items-start gap-2 text-slate-300">
                          <span className="p-0.5 rounded bg-sky-500/10 text-sky-400 mt-0.5 shrink-0">
                            <Check className="w-3 h-3" />
                          </span>
                          <span className="leading-snug">{feat.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="mt-8 pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <Link
                  href={`/services/${svc.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors group/link"
                >
                  <span>Explore Architecture & Scope</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href={`/contact?service=${encodeURIComponent(svc.name)}`}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-black bg-[#F5F5F3] hover:bg-white rounded-xl transition-all shadow-md active:scale-95"
                >
                  <span>Consult on Scope</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 sm:mt-16 relative overflow-hidden py-7 sm:py-8 px-6 sm:px-10 rounded-2xl bg-white border border-black/10 text-center space-y-3.5 max-w-4xl mx-auto shadow-2xl">
          {/* Subtle decorative radial vignette */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,0,0,0.03),transparent_70%)]"
          />

          <div className="relative z-10 space-y-2 max-w-2xl mx-auto">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-black tracking-tight uppercase">
              Have a custom architecture or enterprise scope in mind?
            </h3>
            <p className="text-xs sm:text-sm text-[#3A3A3C] max-w-xl mx-auto leading-relaxed">
              Configure an itemized budget estimate using our interactive calculator or schedule a technical discovery call with our founder.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 pt-1">
            <CtaLink
              href="/pricing"
              label="Explore Pricing Estimator"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-black hover:bg-[#1E1E24] rounded-xl transition-all shadow-md active:scale-95"
            >
              <span>Explore Interactive Estimator</span>
              <ArrowRight className="w-4 h-4" />
            </CtaLink>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-black bg-transparent hover:bg-black/[0.05] border border-black/25 hover:border-black/60 rounded-xl transition-all"
            >
              <span>Schedule Technical Consultation</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <a
              href={buildWhatsAppUrl({ serviceName: "Webgent Engineering Services" })}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-black bg-[#25D366] hover:bg-[#20ba59] rounded-xl transition-all shadow-md active:scale-95"
            >
              <WhatsAppIcon className="w-4 h-4 fill-current" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
