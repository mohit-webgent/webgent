import { ArrowRight, ArrowUpRight } from "lucide-react";
import { CtaLink } from "@/components/ui/cta-link";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { buildWhatsAppUrl } from "@/config/whatsapp";

interface CtaBandProps {
  title: string;
  description: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  whatsappService?: string;
  /** Sent with analytics to tell the page's calls to action apart. */
  analyticsName?: string;
}

/** The closing call to action used across the site. */
export function CtaBand({
  title,
  description,
  primaryLabel = "Start your project",
  primaryHref = "/contact",
  secondaryLabel,
  secondaryHref,
  whatsappService,
  analyticsName = "Page",
}: CtaBandProps) {
  return (
    <section className="wrap pb-[var(--section-space)]">
      <ScrollReveal className="relative isolate flex flex-col justify-between gap-6 overflow-hidden rounded-2xl bg-accent px-6 py-8 text-accent-fg sm:px-10 sm:py-10 lg:flex-row lg:items-center">
        <div
          aria-hidden="true"
          className="absolute -bottom-32 -right-16 -z-10 h-72 w-72 rounded-full border-[44px] border-accent-fg/[0.06]"
        />
        <div className="max-w-xl">
          <h2 className="display-md">{title}</h2>
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-accent-fg/80">{description}</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <CtaLink href={primaryHref} label={`${analyticsName} CTA Primary`} className="btn btn-dark">
            <span>{primaryLabel}</span>
            <ArrowRight className="h-4 w-4" />
          </CtaLink>
          {secondaryLabel && secondaryHref && (
            <CtaLink
              href={secondaryHref}
              label={`${analyticsName} CTA Secondary`}
              className="btn border-accent-fg/30 text-accent-fg hover:border-accent-fg/70 hover:bg-accent-fg/5"
            >
              <span>{secondaryLabel}</span>
              <ArrowUpRight className="h-4 w-4" />
            </CtaLink>
          )}
          {whatsappService && (
            <a
              href={buildWhatsAppUrl({ serviceName: whatsappService })}
              target="_blank"
              rel="noopener noreferrer"
              className="btn border-accent-fg/30 text-accent-fg hover:border-accent-fg/70 hover:bg-accent-fg/5"
            >
              <WhatsAppIcon className="h-4 w-4 fill-current" />
              <span>WhatsApp</span>
            </a>
          )}
        </div>
      </ScrollReveal>
    </section>
  );
}
