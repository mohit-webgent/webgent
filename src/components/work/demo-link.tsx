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
      className="btn btn-primary"
    >
      <ExternalLink className="h-4 w-4" />
      <span>Visit live site</span>
    </a>
  );
}
