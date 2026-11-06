"use client";

import React from "react";
import { RevealGroup } from "./reveal-group";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

/** Fades a single block in as it enters the viewport. */
export function ScrollReveal({ children, className = "", as = "div" }: ScrollRevealProps) {
  return (
    <RevealGroup as={as} className={className} data-reveal="">
      {children}
    </RevealGroup>
  );
}
