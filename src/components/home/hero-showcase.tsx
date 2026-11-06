"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { isReducedMotion } from "@/components/animations/gsap-core";
import type { HomeProject } from "@/lib/services/home-data";
import type { PackageDetails } from "@/data/pricing-matrix-data";

const CYCLE_MS = 5200;
const MAX_TILT_DEG = 7;

/** Follows the pointer with a little lag, so the stack feels weighty rather than twitchy. */
function usePointerTilt(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const element = ref.current;
    if (!element || isReducedMotion() || window.matchMedia("(pointer: coarse)").matches) return;

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let frame = 0;

    const render = () => {
      current.x += (target.x - current.x) * 0.08;
      current.y += (target.y - current.y) * 0.08;
      element.style.setProperty("--tilt-x", current.x.toFixed(4));
      element.style.setProperty("--tilt-y", current.y.toFixed(4));
      const settled = Math.abs(target.x - current.x) < 0.001 && Math.abs(target.y - current.y) < 0.001;
      frame = settled ? 0 : requestAnimationFrame(render);
    };

    const onMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      target.x = Math.max(-1, Math.min(1, (event.clientX - rect.left - rect.width / 2) / (rect.width / 1.4)));
      target.y = Math.max(-1, Math.min(1, (event.clientY - rect.top - rect.height / 2) / (rect.height / 1.4)));
      if (!frame) frame = requestAnimationFrame(render);
    };

    const onLeave = () => {
      target.x = 0;
      target.y = 0;
      if (!frame) frame = requestAnimationFrame(render);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(frame);
    };
  }, [ref]);
}

/** Shown when no project screenshots exist yet: a mock page assembled from the design system. */
function PlaceholderScreen() {
  return (
    <div aria-hidden="true" className="absolute inset-0 space-y-4 bg-surface-2 p-6">
      <div className="anim-grow-x h-3 w-1/3 rounded bg-white/20" />
      <div className="anim-grow-x h-6 w-3/4 rounded bg-white/25" style={{ "--i": 1 } as React.CSSProperties} />
      <div className="anim-grow-x h-2 w-2/3 rounded bg-white/10" style={{ "--i": 2 } as React.CSSProperties} />
      <div className="anim-pop h-8 w-24 rounded-lg bg-accent" style={{ "--i": 3 } as React.CSSProperties} />
      <div className="grid grid-cols-3 gap-3 pt-3">
        {[4, 5, 6].map((i) => (
          <div key={i} className="anim-pop aspect-[4/3] rounded-lg bg-white/[0.07]" style={{ "--i": i } as React.CSSProperties} />
        ))}
      </div>
    </div>
  );
}

export interface HeroShowcaseProps {
  projects: HomeProject[];
  starterPackage?: PackageDetails;
}

export function HeroShowcase({ projects, starterPackage }: HeroShowcaseProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  usePointerTilt(stageRef);

  const shots = projects.filter((project) => project.imageUrl);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = shots.length;
  const current = shots[active];

  useEffect(() => {
    if (total <= 1 || paused || isReducedMotion()) return;
    const timer = setTimeout(() => setActive((index) => (index + 1) % total), CYCLE_MS);
    return () => clearTimeout(timer);
  }, [active, paused, total]);

  return (
    <div
      ref={stageRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative mx-auto w-full max-w-[42rem] [perspective:1500px] lg:py-8 lg:pl-4 lg:pr-2"
    >
      <div
        className="relative [transform-style:preserve-3d] lg:[transform:rotateY(calc(-5deg+var(--tilt-x,0)*var(--tilt-range)))_rotateX(calc(3deg-var(--tilt-y,0)*var(--tilt-range)))]"
        style={{ "--tilt-range": `${MAX_TILT_DEG}deg` } as React.CSSProperties}
      >
        {/* Real work, in a browser window */}
        <div className="overflow-hidden rounded-xl border border-line-strong bg-surface shadow-lift">
          <div className="flex items-center gap-3 border-b border-line bg-surface-2 px-3.5 py-2.5">
            <div aria-hidden="true" className="flex gap-1.5">
              <span className="h-2 w-2 rounded-full bg-white/25" />
              <span className="h-2 w-2 rounded-full bg-white/15" />
              <span className="h-2 w-2 rounded-full bg-white/15" />
            </div>
            <div className="min-w-0 flex-1 truncate rounded-md bg-canvas/70 px-2.5 py-1 font-mono text-[0.6875rem] text-fg-muted">
              {current ? current.title : "your-next-website"}
            </div>
            {current?.demoUrl && (
              <span className="hidden items-center gap-1.5 text-[0.6875rem] text-success sm:inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Live
              </span>
            )}
          </div>

          <div className="relative aspect-[16/10] overflow-hidden bg-surface-2">
            {total === 0 && <PlaceholderScreen />}
            {shots.map((project, index) => (
              // Only the visible and next screenshots load, so the rest don't delay the page.
              (index === active || index === (active + 1) % total) && (
                <img
                  key={project.id}
                  src={project.imageUrl as string}
                  alt={index === active ? `${project.title} website` : ""}
                  decoding="async"
                  className={`absolute inset-0 h-full w-full object-cover object-top transition-[opacity,transform] duration-700 ease-expo-out ${
                    index === active ? "scale-100 opacity-100" : "scale-[1.03] opacity-0"
                  }`}
                />
              )
            ))}
          </div>

          {total > 1 && (
            <div className="flex gap-1 border-t border-line bg-surface-2 p-1.5" role="tablist" aria-label="Recent projects">
              {shots.map((project, index) => (
                <button
                  key={project.id}
                  type="button"
                  role="tab"
                  aria-selected={index === active}
                  onClick={() => setActive(index)}
                  className={`relative min-w-0 flex-1 overflow-hidden rounded-md px-2 py-1.5 text-left text-[0.6875rem] transition-colors ${
                    index === active ? "bg-surface-3 text-fg" : "text-fg-muted hover:text-fg"
                  }`}
                >
                  <span className="block truncate">{project.title}</span>
                  {index === active && !paused && (
                    <span
                      key={active}
                      aria-hidden="true"
                      className="anim-progress absolute inset-x-0 bottom-0 h-px bg-accent"
                      style={{ animationDuration: `${CYCLE_MS}ms` }}
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Floating cards sit in front of the window and move further with the pointer. */}
        {current && (
          <Link
            href={`/work/${current.slug}`}
            className="group absolute -left-4 top-14 hidden w-52 rounded-xl border border-line-strong bg-surface-2 p-3 shadow-lift transition-colors hover:border-white/30 lg:block"
            style={{ transform: "translateZ(50px)" }}
          >
            <span key={current.id} className="anim-pop block">
              <span className="block truncate text-[0.6875rem] text-fg-muted">{current.category || "Case study"}</span>
              <span className="mt-0.5 flex items-center justify-between gap-2 text-[0.8125rem] font-medium">
                <span className="truncate">View case study</span>
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-accent transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </span>
          </Link>
        )}

        {starterPackage && (
          <div
            className="absolute -left-4 bottom-14 hidden rounded-xl border border-line-strong bg-surface-2 px-3.5 py-3 shadow-lift sm:block"
            style={{ transform: "translateZ(70px)" }}
          >
            <p className="text-[0.6875rem] text-fg-muted">{starterPackage.name} website</p>
            <p className="mt-0.5 font-display text-xl font-semibold tracking-tight">
              from ₹{starterPackage.startingPrice.toLocaleString("en-IN")}
            </p>
            <p className="mt-0.5 font-mono text-[0.6875rem] text-fg-muted">{starterPackage.deliveryTime}</p>
          </div>
        )}

        <div
          className="absolute -right-3 bottom-14 hidden w-48 space-y-1.5 rounded-xl border border-line-strong bg-surface-2 p-3 text-[0.75rem] text-fg-soft shadow-lift md:block"
          style={{ transform: "translateZ(40px)" }}
        >
          {["Fixed quote upfront", "You own the source code", "Free bug fixes after launch"].map((item) => (
            <p key={item} className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 shrink-0 text-success" />
              {item}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
