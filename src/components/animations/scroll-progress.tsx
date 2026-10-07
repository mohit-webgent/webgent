"use client";

import React, { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, isReducedMotion } from "./gsap-core";

export function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || isReducedMotion()) return;
    const bar = barRef.current;
    if (!bar) return;

    gsap.to(bar, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        trigger: document.documentElement,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.15,
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === document.documentElement) st.kill();
      });
    };
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-white/[0.04] pointer-events-none"
      aria-hidden="true"
    >
      <div
        ref={barRef}
        className="h-full w-full bg-gradient-to-r from-white/30 via-white/70 to-white/90 origin-left scale-x-0 will-change-transform"
      />
    </div>
  );
}
