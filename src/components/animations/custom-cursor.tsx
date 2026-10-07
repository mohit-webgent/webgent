"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap, isReducedMotion } from "./gsap-core";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);

  const [cursorLabel, setCursorLabel] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    // Only enable on desktop pointer devices
    if (typeof window === "undefined") return;
    if (isReducedMotion()) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const mouse = { x: pos.x, y: pos.y };

    // GSAP quickSetters for 60fps performance without React state on move
    const setDotX = gsap.quickSetter(dot, "x", "px");
    const setDotY = gsap.quickSetter(dot, "y", "px");
    const setRingX = gsap.quickSetter(ring, "x", "px");
    const setRingY = gsap.quickSetter(ring, "y", "px");

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      if (!isVisible) {
        setIsVisible(true);
      }

      setDotX(mouse.x);
      setDotY(mouse.y);

      // Check target for custom cursor attributes or links
      const target = e.target as HTMLElement | null;
      if (target) {
        const cursorEl = target.closest("[data-cursor]") as HTMLElement | null;
        if (cursorEl) {
          const type = cursorEl.getAttribute("data-cursor");
          setCursorLabel(type === "view" ? "VIEW" : type === "open" ? "OPEN" : null);
          setIsPointer(true);
        } else {
          setCursorLabel(null);
          const interactiveEl = target.closest("a, button, input, select, textarea, [role='button']");
          setIsPointer(Boolean(interactiveEl));
        }
      }
    };

    const onMouseLeave = () => {
      setIsVisible(false);
    };

    const onMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    // Smooth physics ring follow loop
    const ticker = gsap.ticker.add(() => {
      const dt = 1.0 - Math.pow(1.0 - 0.22, gsap.ticker.deltaRatio());
      pos.x += (mouse.x - pos.x) * dt;
      pos.y += (mouse.y - pos.y) * dt;
      setRingX(pos.x);
      setRingY(pos.y);
    });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      gsap.ticker.remove(ticker);
    };
  }, [isVisible]);

  // Handle ring scale / style changes smoothly with GSAP
  useEffect(() => {
    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;

    if (cursorLabel) {
      // Big label mode
      gsap.to(ring, {
        width: 68,
        height: 68,
        backgroundColor: "rgba(232, 232, 230, 0.95)",
        borderColor: "transparent",
        duration: 0.25,
        ease: "power2.out",
      });
      gsap.to(dot, { opacity: 0, scale: 0, duration: 0.15 });
    } else if (isPointer) {
      // Interactive link/button mode
      gsap.to(ring, {
        width: 44,
        height: 44,
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        borderColor: "rgba(255, 255, 255, 0.35)",
        duration: 0.25,
        ease: "power2.out",
      });
      gsap.to(dot, { opacity: 1, scale: 1.5, duration: 0.2 });
    } else {
      // Base mode
      gsap.to(ring, {
        width: 28,
        height: 28,
        backgroundColor: "transparent",
        borderColor: "rgba(255, 255, 255, 0.2)",
        duration: 0.3,
        ease: "power2.out",
      });
      gsap.to(dot, { opacity: 1, scale: 1, duration: 0.2 });
    }
  }, [cursorLabel, isPointer]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-[9999] select-none transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Center dot (5px) */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 -ml-[2.5px] -mt-[2.5px] w-[5px] h-[5px] rounded-full bg-[#F5F5F3] pointer-events-none"
      />

      {/* Lagging outer physical ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 -ml-3.5 -mt-3.5 w-7 h-7 rounded-full border border-white/20 pointer-events-none flex items-center justify-center transform-gpu"
        style={{ transformOrigin: "center center" }}
      >
        {cursorLabel && (
          <span
            ref={labelRef}
            className="text-[10px] font-mono font-bold tracking-wider text-[#080808] select-none"
          >
            {cursorLabel}
          </span>
        )}
      </div>
    </div>
  );
}
