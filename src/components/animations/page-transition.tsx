"use client";

import React, { useRef } from "react";
import { usePathname } from "next/navigation";
import { useGSAP } from "@gsap/react";
import { gsap, isReducedMotion } from "./gsap-core";

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;
      if (isReducedMotion()) {
        gsap.set(containerRef.current, { opacity: 1, y: 0 });
        return;
      }

      // Smooth, cinematic entrance for the new page
      gsap.fromTo(
        containerRef.current,
        {
          opacity: 0.25,
          y: 12,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: "power2.out",
          clearProps: "all",
        }
      );
    },
    { dependencies: [pathname], scope: containerRef }
  );

  return (
    <div ref={containerRef} className="w-full min-h-full">
      {children}
    </div>
  );
}
