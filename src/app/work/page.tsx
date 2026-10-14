import { prisma } from "@/lib/db";
import Link from "next/link";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Work | Webgent",
  description:
    "Explore Webgent's portfolio of web engineering, SaaS products, cloud architectures, and digital experiences.",
  alternates: {
    canonical: "/work",
  },
  openGraph: {
    title: "Work | Webgent",
    description:
      "A curated showcase of custom software platforms, cloud applications, and high-conversion web experiences.",
    url: `${siteConfig.url}/work`,
    siteName: siteConfig.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Work | Webgent",
    description:
      "Explore Webgent's portfolio of web engineering, SaaS products, cloud architectures, and digital experiences.",
  },
};

// Fallback projects if database is empty
const fallbackProjects = [
  {
    id: "fallback-1",
    title: "NextGen Enterprise SaaS Platform",
    slug: "nextgen-enterprise-saas-platform",
    category: "AI & Cloud Infrastructure",
    imageUrl:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=85",
  },
  {
    id: "fallback-2",
    title: "Fintech Global Payments Infrastructure",
    slug: "fintech-global-payments",
    category: "Web & Mobile Application",
    imageUrl:
      "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1600&q=85",
  },
  {
    id: "fallback-3",
    title: "Aura Design System & Studio",
    slug: "aura-design-system",
    category: "Brand & Design Architecture",
    imageUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=85",
  },
  {
    id: "fallback-4",
    title: "Quantum Intelligence Engine",
    slug: "quantum-intelligence-engine",
    category: "AI Product Engineering",
    imageUrl:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=85",
  },
];

export default async function WorkPage() {
  let projects: Array<{
    id: string;
    title: string;
    slug: string;
    category: string | null;
    imageUrl: string | null;
  }> = [];

  try {
    projects = await prisma.project.findMany({
      where: { published: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
  } catch (error) {
    console.error("Failed to load projects from DB:", error);
  }

  const displayProjects = projects.length > 0 ? projects : fallbackProjects;

  return (
    <div className="min-h-screen bg-[#080808] text-[#EDEDED] pt-8 pb-20 sm:pt-12 sm:pb-28 px-6 sm:px-10 lg:px-16">
      <div className="max-w-7xl mx-auto">
        {/* 2x2 Grid with large images, project name & type below */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12 sm:gap-x-12 sm:gap-y-16 lg:gap-x-14 lg:gap-y-20">
          {displayProjects.map((project) => (
            <Link
              key={project.id}
              href={`/work/${project.slug}`}
              className="group block focus:outline-none"
            >
              {/* Large Image (Sharp, Non-Rounded) */}
              <div className="w-full aspect-[16/10] bg-[#121212] overflow-hidden border border-white/[0.08] relative">
                {project.imageUrl ? (
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#161616] to-[#0D0D0D]">
                    <span className="text-4xl sm:text-6xl font-light text-white/20 select-none">
                      {project.title.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Project Name and Type */}
              <div className="mt-5 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-4">
                <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-[#F5F5F3] group-hover:text-white transition-colors">
                  {project.title}
                </h2>
                <span className="text-sm text-[#888888] font-normal shrink-0">
                  {project.category || "Case Study"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
