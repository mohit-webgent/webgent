"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Star,
  Sparkles,
  ShieldCheck,
  Zap,
  Clock,
  Layers,
  Cpu,
  Database,
  Code,
  Globe,
  Shield,
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
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { buildWhatsAppUrl } from "@/config/whatsapp";
import type { CmsService } from "@/lib/services/cms-services-shared";

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

function renderServiceIcon(name?: string | null, className = "w-7 h-7") {
  const IconComp = name && ICON_COMPONENTS[name] ? ICON_COMPONENTS[name] : Layers;
  return <IconComp className={className} />;
}

export interface ServiceDetailViewProps {
  service: CmsService;
}

export function ServiceDetailView({ service }: ServiceDetailViewProps) {
  // Group features by category
  const featuresByCategory = React.useMemo(() => {
    const map: Record<string, typeof service.features> = {};
    (service?.features || []).forEach((feat) => {
      const cat = feat.category || "General";
      if (!map[cat]) map[cat] = [];
      map[cat].push(feat);
    });
    return map;
  }, [service]);

  return (
    <div className="relative min-h-screen bg-[#070707] text-[#F5F5F3] pt-8 sm:pt-16 pb-24 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-[700px] h-[400px] bg-gradient-to-b from-sky-500/10 via-transparent to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-[1440px] w-full mx-auto px-5 sm:px-8 lg:px-12">
        {/* Breadcrumb nav */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#808080] mb-8 sm:mb-12">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/services" className="hover:text-white transition-colors">
            Services
          </Link>
          <span>/</span>
          <span className="text-white truncate">{service.name}</span>
        </div>

        {/* Back Link */}
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Services</span>
        </Link>

        {/* Main Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start mb-16">
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center gap-3">
              <span className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-sky-400">
                {renderServiceIcon(service.icon)}
              </span>

              {service.featured && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400 uppercase tracking-wider">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>Featured Discipline</span>
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase leading-[1.1]">
              {service.name}
            </h1>

            <p className="text-sm sm:text-lg text-[#A0A0A0] leading-relaxed">
              {service.shortDescription}
            </p>

            {service.coverImage && (
              <div className="relative w-full h-[260px] sm:h-[380px] rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl mt-6">
                <Image
                  src={service.coverImage}
                  alt={service.name}
                  fill
                  priority
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 800px"
                />
              </div>
            )}

            {/* Detailed Scope Section */}
            {service.description && (
              <div className="pt-8 border-t border-white/[0.08] space-y-4">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Architecture & Scope Overview
                </h2>
                <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line space-y-3">
                  {service.description}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Card */}
          <div className="lg:col-span-4 sticky top-28 space-y-6">
            <div className="rounded-2xl bg-[#0D0D0D] border border-white/[0.08] p-6 sm:p-7 space-y-6 shadow-xl">
              <div className="space-y-1">
                <p className="text-xs font-mono uppercase tracking-wider text-[#A0A0A0]">
                  Investment Benchmark
                </p>
                <p className="text-2xl font-bold text-white font-mono">
                  {service.priceLabel ||
                    (service.startingPrice
                      ? `Starting at ₹${service.startingPrice.toLocaleString("en-IN")}`
                      : "Custom Scope")}
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/[0.08] text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Production-tested Next.js architecture</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Zap className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Sub-second TTFB & Core Web Vitals optimization</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Direct pair-engineering with founder</span>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-white/[0.08]">
                <Link
                  href={`/contact?service=${encodeURIComponent(service.name)}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold text-black bg-[#F5F5F3] hover:bg-white rounded-xl transition-all shadow-md active:scale-95"
                >
                  <span>Initiate Project Consultation</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>

                <a
                  href={buildWhatsAppUrl({ serviceName: service.name })}
                  target="_blank"
                  rel="noopener noreferrer"
                  id={`service-whatsapp-${service.slug}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white hover:text-black bg-[#25D366]/15 hover:bg-[#25D366] border border-[#25D366]/40 hover:border-[#25D366] rounded-xl transition-all shadow-sm active:scale-95 group"
                >
                  <WhatsAppIcon className="w-4 h-4 text-[#25D366] group-hover:text-black fill-current transition-colors" />
                  <span>Chat on WhatsApp about this Service</span>
                </a>

                <Link
                  href="/pricing"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl transition-all"
                >
                  <span>Configure in Pricing Calculator</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Features Breakdown by Category */}
        {Object.keys(featuresByCategory).length > 0 && (
          <div className="pt-12 border-t border-white/[0.08] space-y-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight uppercase">
                Included Features & Technical Matrix
              </h2>
              <p className="text-xs sm:text-sm text-[#909090] mt-1">
                Modular components and deliverables bundled with this service offering.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(featuresByCategory).map(([category, items]) => (
                <div
                  key={category}
                  className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] space-y-4 shadow-lg"
                >
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <span className="text-xs font-mono uppercase tracking-wider text-sky-400 font-semibold">
                      {category}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {items.length} item{items.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  <ul className="space-y-3.5">
                    {items.map((feat) => (
                      <li key={feat.id} className="space-y-1">
                        <div className="flex items-start gap-2">
                          <span className="p-0.5 rounded bg-emerald-500/10 text-emerald-400 mt-0.5 shrink-0">
                            <Check className="w-3 h-3" />
                          </span>
                          <span className="text-xs font-semibold text-white leading-snug">
                            {feat.title}
                          </span>
                        </div>
                        {feat.description && (
                          <p className="text-[11px] text-slate-400 pl-5 leading-relaxed">
                            {feat.description}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
