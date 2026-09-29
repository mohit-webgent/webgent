"use client";

import Link from "next/link";
import { trackCtaClick } from "@/lib/analytics/client";

interface CtaLinkProps {
  href: string;
  label: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function CtaLink({ href, label, children, className, onClick }: CtaLinkProps) {
  const handleClick = () => {
    trackCtaClick(label, href);
    if (onClick) {
      onClick();
    }
  };

  return (
    <Link href={href} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}
