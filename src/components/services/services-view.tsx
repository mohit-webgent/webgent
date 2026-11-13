"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Check,
  Cloud,
  Code,
  Compass,
  Cpu,
  CreditCard,
  Database,
  Globe,
  Layers,
  Layout,
  MessageCircle,
  Plus,
  Rocket,
  Server,
  Shield,
  Smartphone,
  Sparkles,
  Terminal,
  Workflow,
  Zap,
} from "lucide-react";
import { RevealGroup } from "@/components/animations/reveal-group";
import { CtaBand } from "@/components/ui/cta-band";
import { PageHero } from "@/components/ui/page-hero";
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

function ServiceIcon({ name, className }: { name?: string | null; className?: string }) {
  const Icon = (name && ICON_COMPONENTS[name]) || Layers;
  return <Icon className={className} />;
}

const priceOf = (service: CmsService) =>
  service.priceLabel || (service.startingPrice !== null ? `From ₹${service.startingPrice?.toLocaleString("en-IN")}` : null);

export interface ServicesViewProps {
  services: CmsService[];
}

export function ServicesView({ services }: ServicesViewProps) {
  const [openId, setOpenId] = useState<string | null>(services[0]?.id ?? null);

  return (
    <>
      <PageHero
        eyebrow="Services"
        title="What we can build for you."
        description="Custom websites, online stores and web applications, designed and built by one developer you can talk to directly."
      />

      <section className="wrap pb-[var(--section-space)]">
        <RevealGroup className="space-y-2">
          {services.map((service, index) => {
            const isOpen = openId === service.id;
            const price = priceOf(service);
            return (
              <article
                key={service.id}
                data-reveal
                className={`overflow-hidden rounded-xl border transition-colors duration-300 ${isOpen ? "border-line-strong bg-surface textured" : "border-line hover:bg-surface/60"}`}
              >
                <h2>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`service-panel-${service.id}`}
                    onClick={() => setOpenId(isOpen ? null : service.id)}
                    className="flex w-full items-center gap-3.5 p-4 text-left sm:gap-5 sm:p-5"
                  >
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors duration-300 ${isOpen ? "bg-accent text-accent-fg" : "bg-surface-2 text-fg-muted"}`}>
                      <ServiceIcon name={service.icon} className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-base font-semibold sm:text-lg">{service.name}</span>
                      {price && <span className="mt-0.5 block font-mono text-xs text-fg-muted md:hidden">{price}</span>}
                    </span>
                    {price && <span className="hidden shrink-0 font-mono text-[0.8125rem] text-fg-soft md:block">{price}</span>}
                    <span className="hidden font-mono text-xs text-fg-muted sm:block">{String(index + 1).padStart(2, "0")}</span>
                    <Plus className={`h-4 w-4 shrink-0 text-fg-muted transition-transform duration-500 ease-expo-out ${isOpen ? "rotate-45" : ""}`} />
                  </button>
                </h2>

                <div
                  id={`service-panel-${service.id}`}
                  className={`grid transition-[grid-template-rows] duration-500 ease-expo-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                >
                  <div className="overflow-hidden" inert={!isOpen}>
                    <div className="grid gap-5 px-4 pb-5 sm:px-5 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:pl-[4.75rem]">
                      <div>
                        <p className="text-sm leading-relaxed text-fg-soft">{service.shortDescription}</p>
                        <Link href={`/services/${service.slug}`} className="btn btn-light btn-sm mt-4">
                          <span>View details</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                      {service.features.length > 0 && (
                        <ul className="grid content-start gap-x-4 gap-y-2 sm:grid-cols-2">
                          {service.features.slice(0, 6).map((feature) => (
                            <li key={feature.id} className="flex items-start gap-2 text-[0.8125rem] text-fg-soft">
                              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                              <span>{feature.title}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </RevealGroup>
      </section>

      <CtaBand
        title="Not sure which one fits?"
        description="Build an itemised estimate in the pricing calculator, or tell me about your project and I'll suggest a scope."
        primaryLabel="Discuss your project"
        secondaryLabel="Open the estimator"
        secondaryHref="/pricing"
        whatsappService="Webgent Services"
        analyticsName="Services"
      />
    </>
  );
}
