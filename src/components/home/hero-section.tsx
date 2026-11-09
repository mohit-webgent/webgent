import { ArrowRight, ArrowUpRight } from "lucide-react";
import { CtaLink } from "@/components/ui/cta-link";
import { HomeHeroContent, DEFAULT_HERO_CONTENT } from "@/lib/services/cms-shared";
import type { HomeProject } from "@/lib/services/home-data";
import type { PackageDetails } from "@/data/pricing-matrix-data";
import { HeroShowcase } from "./hero-showcase";

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

  return (
    <section id="hero" className="relative isolate overflow-hidden border-b border-line">
      <div className="wrap grid items-center gap-x-16 gap-y-14 pb-16 pt-10 sm:pt-14 lg:min-h-[calc(100svh-8rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:pb-20 lg:pt-8">
        <div className="min-w-0">
          <p className="eyebrow fade-up" style={delay(0)}>
            {content.eyebrow.replace(/^WEBGENT\s*\/\s*/i, "")}
          </p>

          <h1 className="hero-display mt-6">
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

          <p className="lede fade-up mt-6 max-w-[28rem]" style={delay(3)}>
            {content.subheadline}
          </p>

          <div className="cta-row fade-up mt-9 flex flex-wrap items-center gap-3" style={delay(4)}>
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
        </div>

        <div className="fade-up min-w-0" style={delay(3)}>
          <HeroShowcase projects={projects} starterPackage={starterPackage} />
        </div>
      </div>
    </section>
  );
}
