"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, isReducedMotion, SplitText } from "./gsap-core";

interface TextRevealProps {
  children: React.ReactNode;
  as?: React.ElementType;
  className?: string;
  /** Plays straight away instead of waiting to scroll into view. */
  immediate?: boolean;
}

/** Headings rise line by line from behind a mask as they enter the viewport. */
export function TextReveal({ children, as: Tag = "h2", className = "", immediate = false }: TextRevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const element = ref.current;
      if (!element || isReducedMotion()) return;

      let revealed = false;
      let lines: Element[] = [];
      let observer: IntersectionObserver | null = null;

      const play = () => {
        revealed = true;
        observer?.disconnect();
        gsap.to(lines, { yPercent: 0, duration: 0.9, stagger: 0.08, ease: "expo.out", delay: immediate ? 0.08 : 0 });
      };

      const split = SplitText.create(element, {
        type: "lines",
        mask: "lines",
        linesClass: "reveal-line",
        autoSplit: true,
        onSplit: (self) => {
          // A re-split after a resize must not hide a heading that has already been shown.
          lines = self.lines;
          if (revealed) return;
          gsap.set(lines, { yPercent: 105 });
          if (immediate) {
            play();
            return;
          }
          observer?.disconnect();
          observer = new IntersectionObserver(
            (entries) => {
              if (entries.some((entry) => entry.isIntersecting || entry.boundingClientRect.top < 0)) play();
            },
            { rootMargin: "0px 0px -8% 0px" },
          );
          observer.observe(element);
        },
      });

      return () => {
        observer?.disconnect();
        split.revert();
      };
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
