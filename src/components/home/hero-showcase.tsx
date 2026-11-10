"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
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
        <div className="hero-frame relative overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-lift">
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

          {/* Matches the screenshots' wide browser-window shape (about 2.17:1), so they show in full.
              object-contain keeps any differently shaped screenshot whole instead of cropping it. */}
          <div className={`relative overflow-hidden bg-surface-2 ${total === 0 ? "aspect-[16/10]" : "aspect-[2.17/1]"}`}>
            {total === 0 && <PlaceholderScreen />}
            {shots.map((project, index) => (
              // Only the visible and next screenshots load, so the rest don't delay the page.
              (index === active || index === (active + 1) % total) && (
                <img
                  key={project.id}
                  src={project.imageUrl as string}
                  alt={index === active ? `${project.title} website` : ""}
                  decoding="async"
                  className={`absolute inset-0 h-full w-full object-contain transition-[opacity,transform] duration-700 ease-expo-out ${
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

        {starterPackage && (
          <Link
            href="/pricing"
            className="group absolute -bottom-10 -left-4 hidden items-center gap-3 rounded-xl border border-line-strong bg-surface-2/95 py-2 pl-3 pr-2.5 shadow-lift backdrop-blur-md transition-colors hover:border-accent/40 sm:flex"
            style={{ transform: "translateZ(70px)" }}
          >
            <span className="leading-tight">
              <span className="block text-[0.8125rem] font-medium text-fg">
                <span className="text-fg-muted">from</span> ₹{starterPackage.startingPrice.toLocaleString("en-IN")}
              </span>
              <span className="block text-[0.6875rem] text-fg-muted">
                {starterPackage.name} · {starterPackage.deliveryTime.toLowerCase()}
              </span>
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 text-fg-muted transition-[color,transform] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
          </Link>
        )}

      </div>
    </div>
  );
}
