"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ArrowUp, ArrowUpRight, Sparkles } from "lucide-react";
import { CtaLink } from "@/components/ui/cta-link";
import { openChat } from "@/lib/chat-events";
import { HomeHeroContent, DEFAULT_HERO_CONTENT } from "@/lib/services/cms-shared";
import type { HomeProject } from "@/lib/services/home-data";
import type { PackageDetails } from "@/data/pricing-matrix-data";
import { HeroShowcase } from "./hero-showcase";

const STACK = ["Next.js", "React", "TypeScript", "Node.js", "PostgreSQL", "Prisma", "Tailwind CSS", "Razorpay", "Stripe", "Vercel", "Cloudflare"];

const IDEAS = [
  { label: "Gym website", prompt: "I want a website for my gym. What pages and features do I need, and how much will it cost?" },
  { label: "Online store", prompt: "How much does a custom online store with a cart and Razorpay cost?" },
  { label: "Booking system", prompt: "I need an appointment booking website for my clinic. What would it take and what's the cost?" },
];

const PLACEHOLDERS = [
  "A bakery site with online orders…",
  "A dashboard for my sales team…",
  "A portfolio for my photography…",
  "A coaching site with admissions…",
];

const delay = (i: number) => ({ "--i": i }) as React.CSSProperties;

const isShouting = (text: string) => text === text.toUpperCase() && /[A-Z]/.test(text);

/** Headlines are stored in the CMS in capitals. They read better here in sentence case. */
function sentenceCase(text: string, capitalise = true) {
  if (!isShouting(text)) return text;
  const lower = text.toLowerCase();
  return capitalise ? lower.charAt(0).toUpperCase() + lower.slice(1) : lower;
}

export interface HeroSectionProps {
  data?: HomeHeroContent;
  projects?: HomeProject[];
  starterPackage?: PackageDetails;
}

export function HeroSection({ data, projects = [], starterPackage }: HeroSectionProps) {
  const content = data || DEFAULT_HERO_CONTENT;
  const [idea, setIdea] = useState("");
  const [placeholder, setPlaceholder] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setPlaceholder((current) => (current + 1) % PLACEHOLDERS.length), 3200);
    return () => clearInterval(timer);
  }, []);

  const submitIdea = (event: React.FormEvent) => {
    event.preventDefault();
    const text = idea.trim();
    if (!text) return;
    openChat(text);
    setIdea("");
  };

  return (
    <section id="hero" className="relative isolate overflow-hidden">

      <div className="wrap grid items-center gap-x-12 gap-y-12 pb-12 pt-8 sm:pt-12 lg:min-h-[calc(100svh-11rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)] lg:pb-16 lg:pt-6">
        <div className="min-w-0">
          <p className="eyebrow fade-up" style={delay(0)}>
            {content.eyebrow.replace(/^WEBGENT\s*\/\s*/i, "")}
          </p>

          <h1 className="display-xl mt-5">
            <span className="rise-mask">
              <span className="rise-line" style={delay(1)}>
                {sentenceCase(content.headlineLine1)}
              </span>
            </span>
            <span className="rise-mask">
              <span className="rise-line" style={delay(2)}>
                <span className="text-fg-muted">{sentenceCase(content.headlineLine2)}</span>{" "}
                <span className="font-serif font-normal italic tracking-[-0.01em] text-accent">
                  {sentenceCase(content.headlineLine3, false)}
                </span>
              </span>
            </span>
          </h1>

          <p className="lede fade-up mt-5 max-w-[30rem]" style={delay(3)}>
            {content.subheadline}
          </p>

          <div className="fade-up mt-6 flex flex-wrap items-center gap-2.5" style={delay(4)}>
            <CtaLink href={content.primaryCtaLink} label="Hero Start Project" className="btn btn-primary">
              <span className="capitalize">{content.primaryCtaText.toLowerCase()}</span>
              <ArrowRight className="h-4 w-4" />
            </CtaLink>
            {content.secondaryCtaText && (
              <CtaLink href={content.secondaryCtaLink} label="Hero Browse Work" className="btn btn-secondary">
                <span className="capitalize">{content.secondaryCtaText.toLowerCase()}</span>
                <ArrowUpRight className="h-4 w-4" />
              </CtaLink>
            )}
          </div>

          <form onSubmit={submitIdea} className="fade-up mt-8 max-w-[30rem]" style={delay(5)}>
            <label htmlFor="hero-idea" className="flex items-center gap-2 text-[0.8125rem] text-fg-muted">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Or describe your idea and get a price in seconds
            </label>
            <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-line-strong bg-surface p-1.5 transition-colors focus-within:border-accent/70">
              <input
                id="hero-idea"
                value={idea}
                onChange={(event) => setIdea(event.target.value)}
                placeholder={PLACEHOLDERS[placeholder]}
                maxLength={500}
                autoComplete="off"
                className="min-w-0 flex-1 bg-transparent px-2.5 text-sm text-fg outline-none"
              />
              <button
                type="submit"
                aria-label="Send your idea to the AI consultant"
                disabled={!idea.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-fg transition-all duration-200 hover:bg-accent-hover disabled:bg-surface-3 disabled:text-fg-muted"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {IDEAS.map((item) => (
                <button key={item.label} type="button" onClick={() => openChat(item.prompt)} className="chip transition-colors hover:border-line-strong hover:text-fg">
                  {item.label}
                </button>
              ))}
            </div>
          </form>
        </div>

        <div className="fade-up min-w-0" style={delay(3)}>
          <HeroShowcase projects={projects} starterPackage={starterPackage} />
        </div>
      </div>

      <div className="border-y border-line py-3">
        <div className="marquee-mask">
          <ul className="marquee items-center font-mono text-xs text-fg-muted">
            {[...STACK, ...STACK].map((tool, index) => (
              <li key={`${tool}-${index}`} aria-hidden={index >= STACK.length} className="flex items-center gap-8 pr-8">
                <span>{tool}</span>
                <span aria-hidden="true" className="h-1 w-1 rounded-full bg-fg-muted/50" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
