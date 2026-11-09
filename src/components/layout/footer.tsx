"use client";

import Link from "next/link";
import { ArrowUp, ArrowUpRight } from "lucide-react";
import { useSmoothScroll } from "@/components/providers/smooth-scroll-provider";
import { siteConfig } from "@/config/site";
import { DEFAULT_FOOTER_CONFIG, type FooterConfig, type FooterLinkItem } from "@/lib/services/cms-shared";

export interface FooterProps {
  data?: FooterConfig;
}

function FooterLink({ link }: { link: Pick<FooterLinkItem, "href" | "title" | "isExternal"> }) {
  const className = "link-underline inline-flex items-center gap-1 text-fg-soft transition-colors hover:text-fg";
  return link.isExternal ? (
    <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
      {link.title}
      <ArrowUpRight className="h-3 w-3 text-fg-muted" />
    </a>
  ) : (
    <Link href={link.href} className={className}>
      {link.title}
    </Link>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-mono text-[0.6875rem] font-normal uppercase tracking-[0.14em] text-fg-muted">{title}</h2>
      <ul className="mt-3.5 space-y-2 text-sm">{children}</ul>
    </div>
  );
}

export function Footer({ data }: FooterProps = {}) {
  const config = data || DEFAULT_FOOTER_CONFIG;
  const { scrollTo } = useSmoothScroll();

  return (
    <footer className="border-t border-line bg-surface/50">
      <div className="wrap pb-6 pt-10 sm:pt-12">
        <div className="grid grid-cols-2 gap-x-6 gap-y-9 lg:grid-cols-12">
          <div className="col-span-2 lg:col-span-5">
            <Link href="/" className="inline-flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight">
              <span aria-hidden="true" className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-sm font-bold text-accent-fg">
                W
              </span>
              {siteConfig.name}
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-fg-muted">{config.brandTagline}</p>
            <Link href="/contact" className="btn btn-light btn-sm mt-5">
              <span>Start a project</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="lg:col-span-3">
            <FooterColumn title="Explore">
              {config.systemsLinks.map((link) => (
                <li key={link.href + link.title}>
                  <FooterLink link={link} />
                </li>
              ))}
            </FooterColumn>
          </div>

          <div className="lg:col-span-2">
            <FooterColumn title="Stack">
              {config.coreStack.map((tech) => (
                <li key={tech} className="text-fg-soft">
                  {tech}
                </li>
              ))}
            </FooterColumn>
          </div>

          <div className="lg:col-span-2">
            <FooterColumn title="Connect">
              {config.connectLinks.map((link) => (
                <li key={link.href + link.title}>
                  <FooterLink link={link} />
                </li>
              ))}
            </FooterColumn>
          </div>
        </div>

        <div className="mt-9 flex flex-col-reverse items-start justify-between gap-3 border-t border-line pt-5 text-[0.8125rem] text-fg-muted sm:flex-row sm:items-center">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.name}. {config.copyrightText || "All rights reserved."}
          </p>
          <button type="button" onClick={() => scrollTo(0)} className="inline-flex items-center gap-2 py-1 pr-44 transition-colors hover:text-fg sm:pr-48">
            Back to top
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
