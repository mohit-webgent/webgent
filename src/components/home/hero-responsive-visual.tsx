"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import { gsap, isReducedMotion } from "@/components/animations/gsap-core";

export function HeroResponsiveVisual() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const laptopWrapRef = useRef<HTMLDivElement | null>(null);
  const laptopShadowRef = useRef<HTMLDivElement | null>(null);
  const mobileWrapRef = useRef<HTMLDivElement | null>(null);
  const mobileShadowRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || isReducedMotion()) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const container = containerRef.current;
    const laptop = laptopWrapRef.current;
    const laptopShadow = laptopShadowRef.current;
    const mobile = mobileWrapRef.current;
    const mobileShadow = mobileShadowRef.current;
    const glow = glowRef.current;

    if (!container || !laptop || !mobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

      // Clamp between -1 and 1
      const clampedX = Math.max(-1, Math.min(1, x));
      const clampedY = Math.max(-1, Math.min(1, y));

      // Same translation & rotation movement for both laptop and mobile
      const moveX = clampedX * 10;
      const moveY = clampedY * 8;
      const rotY = clampedX * 2.2;
      const rotX = -clampedY * 2.2;

      // LAPTOP FRAME: moves with specified values
      gsap.to(laptop, {
        x: moveX,
        y: moveY,
        rotationY: rotY,
        rotationX: rotX,
        duration: 0.65,
        ease: "power2.out",
        overwrite: "auto",
      });

      if (laptopShadow) {
        gsap.to(laptopShadow, {
          x: moveX * 1.1,
          y: moveY * 0.5,
          opacity: 0.85 - Math.abs(clampedY) * 0.1,
          duration: 0.65,
          ease: "power2.out",
          overwrite: "auto",
        });
      }

      // MOBILE FRAME: exactly the same movement amount as the laptop
      gsap.to(mobile, {
        x: moveX,
        y: moveY,
        rotationY: rotY,
        rotationX: rotX,
        duration: 0.65,
        ease: "power2.out",
        overwrite: "auto",
      });

      if (mobileShadow) {
        gsap.to(mobileShadow, {
          x: moveX * 1.1,
          y: moveY * 0.5,
          opacity: 0.75 - Math.abs(clampedY) * 0.1,
          duration: 0.65,
          ease: "power2.out",
          overwrite: "auto",
        });
      }

      // Atmospheric ambient glow
      if (glow) {
        gsap.to(glow, {
          x: moveX * 1.4,
          y: moveY * 1.4,
          duration: 0.8,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    };

    const handleMouseLeave = () => {
      // Both return smoothly to rest with identical timing & easing
      gsap.to([laptop, mobile], {
        x: 0,
        y: 0,
        rotationY: 0,
        rotationX: 0,
        duration: 0.8,
        ease: "power2.out",
        overwrite: "auto",
      });

      if (laptopShadow) {
        gsap.to(laptopShadow, {
          x: 0,
          y: 0,
          opacity: 0.85,
          duration: 0.8,
          ease: "power2.out",
          overwrite: "auto",
        });
      }

      if (mobileShadow) {
        gsap.to(mobileShadow, {
          x: 0,
          y: 0,
          opacity: 0.75,
          duration: 0.8,
          ease: "power2.out",
          overwrite: "auto",
        });
      }

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
      className="relative w-full max-w-[620px] lg:max-w-[560px] xl:max-w-[660px] flex items-center justify-center select-none group perspective-[1400px]"
    >
      {/* Soft atmospheric ambient glow that naturally blends into the site's dark canvas */}
      <div
        ref={glowRef}
        className="absolute w-[80%] h-[75%] rounded-full bg-gradient-to-tr from-white/[0.05] to-transparent blur-3xl pointer-events-none transform -translate-y-4 will-change-transform"
        aria-hidden="true"
      />

      {/* Main 3D Stage Container */}
      <div
        className="relative w-full aspect-[878/603] transition-transform duration-500 ease-out will-change-transform"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* ======================================================== */}
        {/* OBJECT 1: INDIVIDUAL LAPTOP FRAME                        */}
        {/* ======================================================== */}
        <div
          ref={laptopWrapRef}
          className="absolute left-0 top-0 w-[95.78%] h-full will-change-transform"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Laptop Base Contact Shadow */}
          <div
            ref={laptopShadowRef}
            className="absolute bottom-2 inset-x-8 h-8 rounded-full bg-black/90 blur-xl pointer-events-none transform translate-y-3 will-change-transform"
            aria-hidden="true"
          />

          {/* High-Resolution Isolated Laptop Mockup */}
          <Image
            src="/images/hero-laptop.png"
            alt="Webgent responsive website open on laptop screen"
            width={841}
            height={603}
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 640px"
            className="w-full h-auto object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.85)] filter"
          />
        </div>

        {/* ======================================================== */}
        {/* OBJECT 2: INDIVIDUAL MOBILE PHONE FRAME                  */}
        {/* ======================================================== */}
        <div
          ref={mobileWrapRef}
          className="absolute left-[73.58%] top-[9.12%] w-[26.42%] will-change-transform z-20"
          style={{
            transformStyle: "preserve-3d",
            transform: "translateZ(25px)",
          }}
        >
          {/* Phone Dedicated Shadow onto Laptop / Scene */}
          <div
            ref={mobileShadowRef}
            className="absolute -bottom-2 -left-2 right-2 h-7 rounded-full bg-black/80 blur-md pointer-events-none transform translate-y-3 will-change-transform"
            aria-hidden="true"
          />

          {/* High-Resolution Isolated Mobile Device Mockup */}
          <div className="relative w-full">
            <Image
              src="/images/hero-phone.png"
              alt="Webgent mobile experience on smartphone screen"
              width={232}
              height={409}
              priority
              sizes="(max-width: 768px) 35vw, 220px"
              className="w-full h-auto object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.9)] filter"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
