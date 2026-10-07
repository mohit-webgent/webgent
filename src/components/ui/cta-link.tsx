"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { trackCtaClick } from "@/lib/analytics/client";
import { gsap, isReducedMotion } from "@/components/animations/gsap-core";

interface CtaLinkProps {
  href: string;
  label: string;
  children: React.ReactNode;
  className?: string;
  magnetic?: boolean;
  onClick?: () => void;
  target?: string;
  rel?: string;
}

export function CtaLink({
  href,
  label,
  children,
  className = "",
  magnetic = true,
  onClick,
  target,
  rel,
}: CtaLinkProps) {
  const linkRef = useRef<HTMLAnchorElement | null>(null);

  const handleClick = () => {
    trackCtaClick(label, href);
    if (onClick) {
      onClick();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!magnetic || isReducedMotion() || !linkRef.current) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const rect = linkRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) * 0.15;
    const deltaY = (e.clientY - centerY) * 0.15;

    gsap.to(linkRef.current, {
      x: deltaX,
      y: deltaY,
      duration: 0.3,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const handleMouseLeave = () => {
    if (!magnetic || isReducedMotion() || !linkRef.current) return;
    gsap.to(linkRef.current, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: "elastic.out(1, 0.4)",
      overwrite: "auto",
    });
  };

  return (
    <Link
      ref={linkRef}
      href={href}
      target={target}
      rel={rel}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`group relative inline-flex items-center justify-center transition-all duration-200 active:scale-[0.98] [&_svg]:transition-transform [&_svg]:duration-200 group-hover:[&_svg]:translate-x-1 ${className}`}
    >
      {children}
    </Link>
  );
}
