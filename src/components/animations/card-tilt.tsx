"use client";

import React, { useRef, useState } from "react";
import { isReducedMotion } from "./gsap-core";

interface Card3DTiltProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // Maximum tilt degrees (default 2.5 degrees)
  spotlight?: boolean;
}

export function Card3DTilt({
  children,
  className = "",
  maxTilt = 2.5,
  spotlight = true,
}: Card3DTiltProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [style, setStyle] = useState<{
    transform: string;
    spotlightX: number;
    spotlightY: number;
    isHovered: boolean;
  }>({
    transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)",
    spotlightX: 0,
    spotlightY: 0,
    isHovered: false,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isReducedMotion() || !cardRef.current) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`,
      spotlightX: x,
      spotlightY: y,
      isHovered: true,
    });
  };

  const handleMouseLeave = () => {
    setStyle((prev) => ({
      ...prev,
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)",
      isHovered: false,
    }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: style.transform,
        transition: style.isHovered ? "transform 0.12s ease-out" : "transform 0.5s ease-out",
        transformStyle: "preserve-3d",
      }}
      className={`relative will-change-transform ${className}`}
    >
      {spotlight && style.isHovered && (
        <div
          className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-40 transition-opacity duration-300"
          style={{
            background: `radial-gradient(400px circle at ${style.spotlightX}px ${style.spotlightY}px, rgba(255,255,255,0.06), transparent 70%)`,
          }}
          aria-hidden="true"
        />
      )}
      {children}
    </div>
  );
}
