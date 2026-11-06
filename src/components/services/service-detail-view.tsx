"use client";

import { RevealGroup } from "@/components/animations/reveal-group";
import { TextReveal } from "@/components/animations/text-reveal";
import { CtaBand } from "@/components/ui/cta-band";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Sparkles,
  ShieldCheck,
  Zap,
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
    <>
      <header className="relative isolate overflow-hidden pb-12 pt-10 sm:pt-14">
        <div className="wrap">
          <Link href="/services" className="inline-flex items-center gap-2 text-sm text-fg-muted transition-colors hover:text-fg">
            <ArrowLeft className="h-4 w-4" />
            All services
          </Link>
          <div className="mt-8 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
              {renderServiceIcon(service.icon, "h-6 w-6")}
            </span>
          </div>
          <TextReveal as="h1" immediate className="display-lg mt-6 max-w-4xl">
            {service.name}
          </TextReveal>
          <p className="lede fade-up mt-5 max-w-2xl">{service.shortDescription}</p>
        </div>
      </header>

      <div className="wrap grid gap-12 pb-20 lg:grid-cols-12 lg:gap-16">
        <div className="min-w-0 space-y-12 lg:col-span-8">
          {service.coverImage && (
            <div className="relative aspect-[16/9] overflow-hidden rounded-[1.25rem] border border-line">
              <Image
                src={service.coverImage}
                alt=""
                fill
                priority
                unoptimized={!/^(\/|https:\/\/[^/]+\.supabase\.co\/|https:\/\/images\.unsplash\.com\/)/.test(service.coverImage)}
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 800px"
              />
            </div>
          )}

          {service.description && (
            <section>
              <h2 className="display-md">What&apos;s included</h2>
              <p className="mt-5 whitespace-pre-line text-lg leading-relaxed text-fg-soft">{service.description}</p>
            </section>
          )}

          {Object.keys(featuresByCategory).length > 0 && (
            <RevealGroup as="section" className="space-y-5">
              <h2 className="display-md">Features</h2>
              <div className="grid gap-5 md:grid-cols-2">
                {Object.entries(featuresByCategory).map(([category, items]) => (
                  <div key={category} data-reveal className="card p-6">
                    <h3 className="font-mono text-xs font-normal uppercase tracking-[0.14em] text-accent">{category}</h3>
                    <ul className="mt-4 space-y-4">
                      {items.map((feature) => (
                        <li key={feature.id} className="flex items-start gap-2.5">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                          <div>
                            <p className="font-medium">{feature.title}</p>
                            {feature.description && <p className="mt-1 text-sm leading-relaxed text-fg-muted">{feature.description}</p>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </RevealGroup>
          )}
        </div>

        <aside className="lg:col-span-4">
          <div className="card space-y-6 p-6 sm:p-7 lg:sticky lg:top-24">
            <div>
              <p className="text-sm text-fg-muted">Investment</p>
              <p className="mt-1 font-display text-3xl font-semibold">
                {service.priceLabel ||
                  (service.startingPrice ? `From ₹${service.startingPrice.toLocaleString("en-IN")}` : "Custom scope")}
              </p>
            </div>
            <ul className="space-y-3 border-t border-line pt-6 text-sm text-fg-soft">
              {["You own 100% of the source code", "Pay 50% to start, 50% after your final review", "Work directly with the developer"].map((point) => (
                <li key={point} className="flex items-start gap-2.5">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {point}
                </li>
              ))}
            </ul>
            <div className="space-y-2.5 border-t border-line pt-6">
              <Link href={`/contact?service=${encodeURIComponent(service.name)}`} className="btn btn-primary w-full">
                <span>Discuss this service</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <a
                id={`service-whatsapp-${service.slug}`}
                href={buildWhatsAppUrl({ serviceName: service.name })}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary w-full"
              >
                <WhatsAppIcon className="h-4 w-4 fill-current text-whatsapp" />
                <span>Chat on WhatsApp</span>
              </a>
              <Link href="/pricing" className="btn w-full text-fg-soft hover:text-fg">
                <span>Build an estimate</span>
              </Link>
            </div>
          </div>
        </aside>
      </div>

      <CtaBand
        title={`Ready to start on ${service.name}?`}
        description="Tell me what you need and I'll come back with a clear scope, timeline and price."
        primaryHref={`/contact?service=${encodeURIComponent(service.name)}`}
        whatsappService={service.name}
        analyticsName="Service Detail"
      />
    </>
  );
}
