"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, isReducedMotion } from "./gsap-core";

interface ParallaxImageProps {
  children: React.ReactNode;
  className?: string;
  speed?: number; // default subtle 0.12
  scaleStart?: number; // default 1.08
}

export function ParallaxImage({
  children,
  className = "",
  speed = 0.15,
  scaleStart = 1.08,
}: ParallaxImageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (!containerRef.current || !innerRef.current) return;
      if (isReducedMotion()) return;

      const yMovement = 40 * speed;

      gsap.fromTo(
        innerRef.current,
        {
          y: -yMovement,
          scale: scaleStart,
        },
        {
          y: yMovement,
          scale: 1.0,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className={`overflow-hidden relative ${className}`}>
      <div ref={innerRef} className="w-full h-full will-change-transform">
        {children}
      </div>
    </div>
  );
}
