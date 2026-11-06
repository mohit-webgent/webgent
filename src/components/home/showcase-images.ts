import type { HomeProject } from "@/lib/services/home-data";

const LOCAL_FALLBACK = "/images/hero-devices.jpg";
const EXAMPLE_DOMAIN = "yourbusiness.com";

function domainOf(url: string | null | undefined) {
  try {
    return url ? new URL(url).hostname.replace(/^www\./, "") : EXAMPLE_DOMAIN;
  } catch {
    return EXAMPLE_DOMAIN;
  }
}

export interface ShowcaseProject {
  title: string;
  slug: string | null;
  /** The site's real address, shown in the browser frame. */
  domain: string;
  main: string;
  detail: string;
}

export interface ShowcaseImages {
  website: ShowcaseProject;
  store: ShowcaseProject;
  jewellery: ShowcaseProject;
  services: ShowcaseProject;
}

/**
 * Picks real project screenshots for the home page demos. Each slot prefers the project it suits
 * best, then falls back to other published work, so removing a project never leaves a blank frame.
 */
export function resolveShowcase(projects: HomeProject[]): ShowcaseImages {
  const images = projects.flatMap((project) => [project.imageUrl, ...(project.screenshots ?? [])]).filter((url): url is string => Boolean(url));
  const fallback = images[0] ?? LOCAL_FALLBACK;

  const slot = (slug: string): ShowcaseProject => {
    const project = projects.find((item) => item.slug === slug);
    if (!project) return { title: "Client project", slug: null, domain: EXAMPLE_DOMAIN, main: fallback, detail: images[1] ?? fallback };
    const main = project.imageUrl ?? project.screenshots?.[0] ?? fallback;
    return { title: project.title, slug: project.slug, domain: domainOf(project.demoUrl), main, detail: project.screenshots?.[0] ?? main };
  };

  return {
    website: slot("birdoutsourcing"),
    store: slot("spectrumkart"),
    jewellery: slot("edayaa-jewellery"),
    services: slot("l4-services"),
  };
}
