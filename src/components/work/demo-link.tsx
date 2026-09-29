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
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
    >
      <ExternalLink className="w-4 h-4" />
      <span>Launch Live Demo</span>
    </a>
  );
}
