"use client";

import React, { useLayoutEffect, useEffect, useRef } from "react";
import { isReducedMotion } from "./gsap-core";

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const STAGGER_MS = 70;
const MAX_DELAY_MS = 280;
const RUN_MS = 1200;

interface RevealGroupProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  as?: React.ElementType;
  /** Adds a pointer-following highlight to any child with the "spotlight" class. */
  spotlight?: boolean;
}

/**
 * Fades in every child marked with data-reveal as it enters the viewport.
 *
 * Uses IntersectionObserver rather than scroll offsets, so a fast scroll, a jump to the footer or a
 * late layout shift can't leave content hidden. Items already on screen, or already scrolled past,
 * are never hidden in the first place.
 */
export function RevealGroup({ children, as: Tag = "div", spotlight = false, ...props }: RevealGroupProps) {
  const ref = useRef<HTMLElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    const root = ref.current;
    if (!root || isReducedMotion() || typeof IntersectionObserver === "undefined") return;

    const viewportHeight = window.innerHeight;
    const candidates = root.matches("[data-reveal]") ? [root] : Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    const items = candidates.filter((item) => item.getBoundingClientRect().top > viewportHeight);
    if (items.length === 0) return;

    items.forEach((item) => item.classList.add("reveal-pending"));

    const timers = new Set<ReturnType<typeof setTimeout>>();
    const observer = new IntersectionObserver(
      (entries) => {
        const arriving = entries.filter((entry) => entry.isIntersecting || entry.boundingClientRect.top < 0);
        arriving.forEach((entry, index) => {
          const item = entry.target as HTMLElement;
          observer.unobserve(item);
          item.style.setProperty("--reveal-delay", `${Math.min(index * STAGGER_MS, MAX_DELAY_MS)}ms`);
          item.classList.add("reveal-run");
          item.classList.remove("reveal-pending");

          // Hands transitions back to the element, so hover effects don't inherit the slow timing.
          const timer = setTimeout(() => {
            item.classList.remove("reveal-run");
            item.style.removeProperty("--reveal-delay");
            timers.delete(timer);
          }, RUN_MS);
          timers.add(timer);
        });
      },
      { rootMargin: "0px 0px -6% 0px" },
    );

    items.forEach((item) => observer.observe(item));

    return () => {
      observer.disconnect();
      timers.forEach(clearTimeout);
      items.forEach((item) => {
        item.classList.remove("reveal-pending", "reveal-run");
        item.style.removeProperty("--reveal-delay");
      });
    };
  }, []);

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const card = (event.target as HTMLElement).closest<HTMLElement>(".spotlight");
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    card.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  };

  return (
    <Tag ref={ref} onPointerMove={spotlight ? handlePointerMove : undefined} {...props}>
      {children}
    </Tag>
  );
}
