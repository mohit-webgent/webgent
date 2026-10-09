"use client";

import React, { useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { gsap, isReducedMotion } from "@/components/animations/gsap-core";
import { trackCtaClick } from "@/lib/analytics/client";

interface HeroStartProjectButtonProps {
  className?: string;
}

export function HeroStartProjectButton({ className = "" }: HeroStartProjectButtonProps) {
  const buttonRef = useRef<HTMLAnchorElement | null>(null);
  const specularRef = useRef<HTMLDivElement | null>(null);
  const arrowRef = useRef<HTMLSpanElement | null>(null);
  const shadowRef = useRef<HTMLDivElement | null>(null);

  const textLabel = "START YOUR PROJECT";

  // Magnetic & 3D Tilt interaction
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!buttonRef.current || isReducedMotion()) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const normX = (x - centerX) / centerX;
    const normY = (y - centerY) / centerY;

    // Subtle magnetic pull & micro-tilt (refined, zero wobble)
    gsap.to(buttonRef.current, {
      x: normX * 8,
      y: normY * 6,
      rotateX: -normY * 4,
      rotateY: normX * 4,
      transformPerspective: 900,
      duration: 0.25,
      ease: "power2.out",
      overwrite: "auto",
    });

    // Satin specular light follows cursor
    if (specularRef.current) {
      gsap.to(specularRef.current, {
        x,
        y,
        opacity: 0.85,
        duration: 0.15,
        ease: "none",
        overwrite: "auto",
      });
    }

    // Shadow moves opposite for physical depth
    if (shadowRef.current) {
      gsap.to(shadowRef.current, {
        x: -normX * 4,
        y: -normY * 4 + 4,
        duration: 0.3,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (!buttonRef.current || isReducedMotion()) return;

    // GSAP kinetic typography roll (smooth studio character slide)
    const primaryChars = buttonRef.current.querySelectorAll(".char-primary");
    const secondaryChars = buttonRef.current.querySelectorAll(".char-secondary");

    gsap.to(primaryChars, {
      yPercent: -100,
      stagger: 0.012,
      duration: 0.32,
      ease: "power2.inOut",
      overwrite: "auto",
    });

    gsap.to(secondaryChars, {
      yPercent: -100,
      stagger: 0.012,
      duration: 0.32,
      ease: "power2.inOut",
      overwrite: "auto",
    });

    // Arrow glide
    if (arrowRef.current) {
      gsap.to(arrowRef.current, {
        x: 3,
        duration: 0.25,
        ease: "power2.out",
      });
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!buttonRef.current) return;

    // Elastic reset
    gsap.to(buttonRef.current, {
      x: 0,
      y: 0,
      rotateX: 0,
      rotateY: 0,
      duration: 0.55,
      ease: "elastic.out(1, 0.45)",
      overwrite: "auto",
    });

    // Reset characters
    const primaryChars = buttonRef.current.querySelectorAll(".char-primary");
    const secondaryChars = buttonRef.current.querySelectorAll(".char-secondary");

    gsap.to(primaryChars, {
      yPercent: 0,
      stagger: 0.008,
      duration: 0.28,
      ease: "power2.inOut",
      overwrite: "auto",
    });

    gsap.to(secondaryChars, {
      yPercent: 0,
      stagger: 0.008,
      duration: 0.28,
      ease: "power2.inOut",
      overwrite: "auto",
    });

    // Reset specular
    if (specularRef.current) {
      gsap.to(specularRef.current, {
        opacity: 0,
        duration: 0.35,
        ease: "power2.out",
      });
    }

    // Reset shadow
    if (shadowRef.current) {
      gsap.to(shadowRef.current, {
        x: 0,
        y: 2,
        duration: 0.4,
        ease: "power2.out",
      });
    }

    if (arrowRef.current) {
      gsap.to(arrowRef.current, {
        x: 0,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  }, []);

  const handleClick = () => {
    trackCtaClick("Hero Start Project", "/contact");

    // Subtle tactile depression
    if (buttonRef.current) {
      gsap.fromTo(
        buttonRef.current,
        { scale: 0.97 },
        { scale: 1, duration: 0.2, ease: "power2.out" }
      );
    }
  };

  return (
    <div className={`relative inline-block select-none ${className}`} style={{ perspective: 1000 }}>
      {/* 1. Subtle, refined ambient drop-shadow */}
      <div
        ref={shadowRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-2 -bottom-2 h-7 bg-white/[0.08] blur-lg rounded-full opacity-60 transition-opacity duration-300"
      />

      {/* 2. Main Premium Satin CTA */}
      <Link
        ref={buttonRef}
        href="/contact"
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="group relative z-10 inline-flex items-center justify-between gap-3 px-7 py-3.5 sm:py-4 rounded-xl overflow-hidden cursor-pointer will-change-transform bg-[#EDEDEA] hover:bg-[#FFFFFF] text-[#09090B] font-medium transition-colors duration-300 shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_20px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(0,0,0,0.12)] border border-white/60"
      >
        {/* Subtle Specular Sheen (follows cursor) */}
        <div
          ref={specularRef}
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -left-16 w-32 h-32 rounded-full bg-radial from-white/70 via-white/20 to-transparent blur-sm opacity-0 will-change-transform z-[1]"
        />

        {/* Satin Micro-Gradient Top Rim */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-white/90 z-[2]"
        />

        {/* Kinetic Staggered Characters */}
        <span className="relative z-[3] font-mono text-xs sm:text-[13px] font-semibold tracking-[0.14em] uppercase text-[#09090B] inline-flex items-center overflow-hidden">
          {textLabel.split("").map((char, index) => (
            <span
              key={index}
              className="char-cell relative inline-block h-[1.3em] leading-[1.3em] overflow-hidden"
            >
              <span className="char-primary inline-block text-[#09090B]">
                {char === " " ? "\u00A0" : char}
              </span>
              <span
                aria-hidden="true"
                className="char-secondary absolute top-full left-0 inline-block font-semibold text-[#09090B]"
              >
                {char === " " ? "\u00A0" : char}
              </span>
            </span>
          ))}
        </span>

        {/* Arrow Capsule */}
        <span
          ref={arrowRef}
          className="relative z-[3] inline-flex items-center justify-center w-5 h-5 text-[#09090B] will-change-transform"
        >
          <ArrowRight className="w-4 h-4 stroke-[2.2]" />
        </span>
      </Link>
    </div>
  );
}
