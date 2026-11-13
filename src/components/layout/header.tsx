"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { useGSAP } from "@gsap/react";
import { ArrowRight, ArrowUpRight, Menu, X } from "lucide-react";
import { gsap, isReducedMotion } from "@/components/animations/gsap-core";
import { CtaLink } from "@/components/ui/cta-link";
import { siteConfig } from "@/config/site";
import type { NavItem } from "@/lib/services/cms-shared";

export interface HeaderProps {
  navItems?: NavItem[];
}

function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label={`${siteConfig.name} home`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent font-display text-base font-bold text-accent-fg transition-transform duration-500 ease-expo-out group-hover:rotate-[-8deg]">
        W
      </span>
      <span className="font-display text-base font-semibold tracking-tight">{siteConfig.name}</span>
    </Link>
  );
}

function MobileMenu({ items, isActive }: { items: { title: string; href: string }[]; isActive: (href: string) => boolean }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (!open || !panelRef.current || isReducedMotion()) return;
      gsap.from(panelRef.current.querySelectorAll("[data-menu-item]"), {
        yPercent: 60,
        opacity: 0,
        duration: 0.7,
        stagger: 0.05,
        ease: "expo.out",
      });
    },
    { dependencies: [open] },
  );

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        aria-label="Open navigation menu"
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-line text-fg md:hidden"
      >
        <Menu className="h-5 w-5" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Content
          ref={panelRef}
          data-lenis-prevent
          aria-describedby={undefined}
          className="fixed inset-0 z-[70] flex flex-col overflow-y-auto bg-canvas textured p-5 focus:outline-none"
        >
          <Dialog.Title className="sr-only">Navigation menu</Dialog.Title>
          <div className="flex items-center justify-between">
            <Logo />
            <Dialog.Close
              aria-label="Close navigation menu"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-line"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>
          <nav aria-label="Mobile Navigation" className="mt-10 flex flex-1 flex-col">
            {items.map((item) => (
              <div key={item.href} data-menu-item className="border-b border-line">
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`flex items-center justify-between py-3.5 font-display text-2xl font-medium ${
                    isActive(item.href) ? "text-accent" : "text-fg"
                  }`}
                >
                  {item.title}
                  <ArrowUpRight className="h-5 w-5 text-fg-muted" />
                </Link>
              </div>
            ))}
          </nav>
          <div data-menu-item className="pt-8">
            <CtaLink
              href="/contact"
              label="Mobile Menu Start Project"
              magnetic={false}
              onClick={() => setOpen(false)}
              className="btn btn-primary w-full"
            >
              <span>Start your project</span>
              <ArrowRight className="h-4 w-4" />
            </CtaLink>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function Header({ navItems }: HeaderProps = {}) {
  const items = navItems && navItems.length > 0 ? navItems : siteConfig.mainNav;
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const [marker, setMarker] = useState<{ left: number; width: number; visible: boolean }>({ left: 0, width: 0, visible: false });

  const isActive = useCallback(
    (href: string) => (href === "/" ? pathname === "/" : Boolean(pathname?.startsWith(href))),
    [pathname],
  );

  const moveMarkerTo = useCallback((link: HTMLElement | null | undefined) => {
    setMarker((current) => (link ? { left: link.offsetLeft, width: link.offsetWidth, visible: true } : { ...current, visible: false }));
  }, []);

  /** The marker rests on the current page and slides to whichever link is hovered. */
  const restMarker = useCallback(() => {
    moveMarkerTo(navRef.current?.querySelector<HTMLElement>('[aria-current="page"]'));
  }, [moveMarkerTo]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    restMarker();
    // Link widths change once the web font arrives.
    void document.fonts?.ready.then(restMarker);
    window.addEventListener("resize", restMarker);
    return () => window.removeEventListener("resize", restMarker);
  }, [restMarker, pathname]);

  return (
    <header className={`sticky top-0 z-40 w-full border-b transition-colors duration-300 ${isScrolled ? "border-line bg-canvas/85 backdrop-blur-md" : "border-transparent"}`}>
      <div className="wrap flex h-14 items-center justify-between gap-4">
        <Logo />

        <nav ref={navRef} aria-label="Main Navigation" onMouseLeave={restMarker} className="relative hidden items-center md:flex">
          <span
            aria-hidden="true"
            className={`absolute top-0 h-full rounded-lg bg-white/[0.07] transition-[left,width,opacity] duration-500 ease-expo-out ${marker.visible ? "opacity-100" : "opacity-0"}`}
            style={{ left: marker.left, width: marker.width }}
          />
          {items.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                onMouseEnter={(event) => moveMarkerTo(event.currentTarget)}
                onFocus={(event) => moveMarkerTo(event.currentTarget)}
                className={`relative rounded-lg px-3 py-1.5 text-[0.8125rem] transition-colors duration-200 ${active ? "text-fg" : "text-fg-muted hover:text-fg"}`}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <CtaLink href="/contact" label="Header Start Project" magnetic={false} className="btn btn-light btn-sm hidden sm:inline-flex">
            <span>Start a project</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </CtaLink>
          <MobileMenu items={items} isActive={isActive} />
        </div>
      </div>
    </header>
  );
}
