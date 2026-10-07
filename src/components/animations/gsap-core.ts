"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Ensure GSAP plugins are registered safely on the client
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Standard Motion Language Tokens
 * Fast: 150–250ms (0.2s)
 * Normal: 400–700ms (0.6s)
 * Slow: 700–1200ms (0.9s)
 */
export const MOTION_TIMINGS = {
  fast: 0.2,
  normal: 0.6,
  slow: 0.9,
  visualSettling: 1.0,
} as const;

/**
 * Curated Easing Curves
 * Quiet, smooth, precise, cinematic. Zero bounce.
 */
export const MOTION_EASING = {
  default: "power3.out",
  smooth: "power2.out",
  cinematic: "power3.out",
  linear: "none",
} as const;

/**
 * Utility to check if user prefers reduced motion
 */
export function isReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export { gsap, ScrollTrigger };
