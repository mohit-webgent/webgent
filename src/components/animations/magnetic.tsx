"use client";

import React, { useRef, useEffect } from "react";
import { gsap, isReducedMotion } from "./gsap-core";

interface MagneticProps {
  children: React.ReactElement;
  strength?: number; // Distance multiplier, default 0.2
  active?: boolean;
}

/**
 * Magnetic component: gently pulls children toward the cursor on hover.
 * Physical, restrained, silky smooth.
 */
export function Magnetic({ children, strength = 0.22, active = true }: MagneticProps) {
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el || !active || isReducedMotion()) return;

    // Check if device is touch-based
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;

      gsap.to(el, {
        x: deltaX,
        y: deltaY,
        duration: 0.35,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.4)",
        overwrite: "auto",
      });
    };

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
      gsap.set(el, { x: 0, y: 0 });
    };
  }, [strength, active]);

  return React.cloneElement(children, {
    ref: (node: HTMLElement | null) => {
      elementRef.current = node;
      // Preserve existing child ref if any
      const { ref } = children as unknown as { ref: React.Ref<HTMLElement> };
      if (typeof ref === "function") {
        ref(node);
      } else if (ref && typeof ref === "object") {
        (ref as React.MutableRefObject<HTMLElement | null>).current = node;
      }
    },
  });
}
