"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, MOTION_TIMINGS, MOTION_EASING, isReducedMotion } from "./gsap-core";

interface StaggerRevealProps {
  children: React.ReactNode;
  className?: string;
  itemSelector?: string;
  stagger?: number;
  y?: number;
  duration?: number;
  start?: string;
}

export function StaggerReveal({
  children,
  className = "",
  itemSelector = "> *",
  stagger = 0.08,
  y = 20,
  duration = MOTION_TIMINGS.normal,
  start = "top 85%",
}: StaggerRevealProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      const items = containerRef.current.querySelectorAll(itemSelector);
      if (!items || items.length === 0) return;

      if (isReducedMotion()) {
        gsap.set(items, { opacity: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        items,
        {
          opacity: 0,
          y,
        },
        {
          opacity: 1,
          y: 0,
          duration,
          stagger: Math.min(stagger, 0.1), // Clamped to max 0.1s stagger per guidelines
          ease: MOTION_EASING.smooth,
          scrollTrigger: {
            trigger: containerRef.current,
            start,
            once: true,
          },
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
