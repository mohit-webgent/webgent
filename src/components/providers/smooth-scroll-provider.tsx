"use client";

import React, { createContext, useContext, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis, { ScrollToOptions } from "lenis";
import { gsap, ScrollTrigger, isReducedMotion } from "@/components/animations/gsap-core";

export interface ScrollMetrics {
  scroll: number;
  velocity: number;
  progress: number;
  direction: number;
}

export interface SmoothScrollContextValue {
  lenis: Lenis | null;
  scrollTo: (
    target: string | number | HTMLElement,
    options?: ScrollToOptions
  ) => void;
  getMetrics: () => ScrollMetrics;
}

const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  lenis: null,
  scrollTo: () => {},
  getMetrics: () => ({ scroll: 0, velocity: 0, progress: 0, direction: 0 }),
});

export function useSmoothScroll(): SmoothScrollContextValue {
  return useContext(SmoothScrollContext);
}

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);
  const tickerCallbackRef = useRef<((time: number) => void) | null>(null);
  const metricsRef = useRef<ScrollMetrics>({
    scroll: 0,
    velocity: 0,
    progress: 0,
    direction: 0,
  });
  const isFirstRender = useRef(true);

  // Initialize single Lenis instance and synchronize with GSAP
  useEffect(() => {
    // If reduced motion is preferred by user, bypass smooth scrolling to respect accessibility
    if (isReducedMotion()) {
      return;
    }

    // 1. Single Lenis instance with conservative, weighted, natural scroll curve
    const lenis = new Lenis({
      duration: 1.05, // Weighted, natural, non-floaty duration
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Natural exponential decay
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      syncTouch: false, // Preserve 100% native momentum touch scrolling on mobile
      touchMultiplier: 1.5,
      wheelMultiplier: 1.0,
      autoRaf: false, // Critical: GSAP ticker drives the RAF loop
      anchors: true, // Handle hash / anchor link transitions smoothly
      respectReducedMotion: true,
      stopInertiaOnNavigate: true,
    });

    lenisRef.current = lenis;

    // 2. Synchronize Lenis scroll position with GSAP ScrollTrigger
    const handleScroll = (e: {
      scroll: number;
      velocity: number;
      progress: number;
      direction: number;
    }) => {
      metricsRef.current = {
        scroll: e.scroll,
        velocity: e.velocity,
        progress: e.progress,
        direction: e.direction,
      };
      ScrollTrigger.update();
    };

    lenis.on("scroll", handleScroll);

    // 3. Drive Lenis through ONE GSAP ticker (Zero duplicate RAF loops)
    const onTick = (time: number) => {
      lenis.raf(time * 1000);
    };
    tickerCallbackRef.current = onTick;

    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0); // Prevents lag compensation jumps when switching tabs

    // Synchronize initial ScrollTrigger positions
    ScrollTrigger.refresh();

    // Cleanup on unmount (e.g. route transitions to admin or unmounting layout)
    return () => {
      if (tickerCallbackRef.current) {
        gsap.ticker.remove(tickerCallbackRef.current);
        tickerCallbackRef.current = null;
      }
      lenis.off("scroll", handleScroll);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Handle route navigation cleanly
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Reset scroll to top on public page transition
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    }

    // Allow DOM to settle, then recompute ScrollTrigger start/end triggers
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  const scrollTo = (
    target: string | number | HTMLElement,
    options?: ScrollToOptions
  ) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, options);
    } else if (typeof window !== "undefined") {
      if (typeof target === "number") {
        window.scrollTo({ top: target, behavior: "smooth" });
      } else if (typeof target === "string") {
        const el = document.querySelector(target);
        el?.scrollIntoView({ behavior: "smooth" });
      } else if (target instanceof HTMLElement) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const getMetrics = () => metricsRef.current;

  return (
    <SmoothScrollContext.Provider
      value={{
        lenis: lenisRef.current,
        scrollTo,
        getMetrics,
      }}
    >
      {children}
    </SmoothScrollContext.Provider>
  );
}
