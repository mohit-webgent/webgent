"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, MOTION_TIMINGS, MOTION_EASING, isReducedMotion } from "./gsap-core";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  y?: number;
  duration?: number;
  delay?: number;
  start?: string;
  as?: React.ElementType;
}

export function ScrollReveal({
  children,
  className = "",
  y = 24,
  duration = MOTION_TIMINGS.normal,
  delay = 0,
  start = "top 90%",
  as: Component = "div",
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      if (isReducedMotion()) {
        gsap.set(containerRef.current, { opacity: 1, y: 0 });
        return;
      }

      // Check if element is already in or near viewport upon mount
      const rect = containerRef.current.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * 0.92;

      if (inView) {
        gsap.fromTo(
          containerRef.current,
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay,
            ease: MOTION_EASING.smooth,
          }
        );
        return;
      }

      // Element is below viewport, trigger reveal on scroll entry
      gsap.fromTo(
        containerRef.current,
        {
          opacity: 0,
          y,
        },
        {
          opacity: 1,
          y: 0,
          duration,
          delay,
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
    <Component ref={containerRef} className={className}>
      {children}
    </Component>
  );
}
