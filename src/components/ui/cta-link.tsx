"use client";

import Link from "next/link";
import { trackCtaClick } from "@/lib/analytics/client";

interface CtaLinkProps {
  href: string;
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function CtaLink({ href, label, children, className }: CtaLinkProps) {
  const handleClick = () => {
    trackCtaClick(label, href);
  };

  return (
    <Link href={href} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}
