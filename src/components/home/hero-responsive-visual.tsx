"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import { gsap, isReducedMotion } from "@/components/animations/gsap-core";

export function HeroResponsiveVisual() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageWrapRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || isReducedMotion()) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const container = containerRef.current;
    const imageWrap = imageWrapRef.current;
    const glow = glowRef.current;
    if (!container || !imageWrap) return;

    // Restrained mouse parallax (max 10px translate, 1.5 deg tilt)
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

      // Clamp between -1 and 1
      const clampedX = Math.max(-1, Math.min(1, x));
      const clampedY = Math.max(-1, Math.min(1, y));

      gsap.to(imageWrap, {
        x: clampedX * 12,
        y: clampedY * 10,
        rotationY: clampedX * 2.5,
        rotationX: -clampedY * 2.5,
        duration: 0.6,
        ease: "power2.out",
        overwrite: "auto",
      });

      if (glow) {
        gsap.to(glow, {
          x: clampedX * 20,
          y: clampedY * 16,
          duration: 0.8,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    };

    const handleMouseLeave = () => {
      gsap.to(imageWrap, {
        x: 0,
        y: 0,
        rotationY: 0,
        rotationX: 0,
        duration: 0.8,
        ease: "elastic.out(1, 0.5)",
        overwrite: "auto",
      });

      if (glow) {
        gsap.to(glow, {
          x: 0,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[620px] lg:max-w-[560px] xl:max-w-[660px] flex items-center justify-center select-none group perspective-[1200px]"
    >
      {/* Soft atmospheric ambient glow that naturally blends into the site's dark canvas */}
      <div
        ref={glowRef}
        className="absolute w-[80%] h-[75%] rounded-full bg-gradient-to-tr from-white/[0.05] to-transparent blur-3xl pointer-events-none transform -translate-y-4 will-change-transform"
        aria-hidden="true"
      />

      {/* Cutout Mockup Container with approved laptop/phone visual & restrained physical depth */}
      <div
        ref={imageWrapRef}
        className="relative w-full aspect-[878/603] flex items-center justify-center transition-transform duration-500 ease-out will-change-transform"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Contact shadow underneath the floating devices */}
        <div
          className="absolute bottom-2 inset-x-8 h-8 rounded-full bg-black/90 blur-xl pointer-events-none transform translate-y-3"
          aria-hidden="true"
        />

        {/* High-Resolution Transparent WebP/PNG Mockup - THE APPROVED HERO VISUAL */}
        <Image
          src="/images/hero-devices-transparent.webp"
          alt="Webgent responsive website open on laptop and mobile screens"
          width={878}
          height={603}
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 660px"
          className="w-full h-auto object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.85)] filter"
        />
      </div>
    </div>
  );
}
