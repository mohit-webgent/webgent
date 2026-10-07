"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, MOTION_EASING, isReducedMotion } from "./gsap-core";

interface ClipRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  start?: string;
  as?: React.ElementType;
}

export function ClipReveal({
  children,
  className = "",
  delay = 0,
  duration = 0.85,
  start = "top 90%",
  as: Component = "div",
}: ClipRevealProps) {
  const containerRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      if (isReducedMotion()) {
        gsap.set(containerRef.current, {
          clipPath: "polygon(0 0%, 100% 0%, 100% 100%, 0 100%)",
          opacity: 1,
          y: 0,
        });
        return;
      }

      gsap.fromTo(
        containerRef.current,
        {
          clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)",
          y: 28,
          opacity: 0,
        },
        {
          clipPath: "polygon(0 0%, 100% 0%, 100% 100%, 0 100%)",
          y: 0,
          opacity: 1,
          duration,
          delay,
          ease: MOTION_EASING.cinematic,
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
    <Component
      ref={containerRef}
      className={`will-change-[clip-path,transform,opacity] ${className}`}
    >
      {children}
    </Component>
  );
}
