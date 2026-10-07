"use client";

import { ExternalLink } from "lucide-react";
import { trackDemoClick } from "@/lib/analytics/client";

interface DemoLinkProps {
  projectSlug: string;
  demoUrl: string;
}

export function DemoLink({ projectSlug, demoUrl }: DemoLinkProps) {
  const handleClick = () => {
    trackDemoClick(projectSlug, demoUrl);
  };

  return (
    <a
      href={demoUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E8E8E6] hover:bg-white text-[#080808] font-medium text-xs rounded-lg transition-colors"
    >
      <ExternalLink className="w-3.5 h-3.5" />
      <span>Launch Live Demo</span>
    </a>
  );
}
