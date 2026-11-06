import { prisma } from "@/lib/db";
import { TextReveal } from "@/components/animations/text-reveal";
import { CtaBand } from "@/components/ui/cta-band";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { Project } from "@prisma/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Github, Building } from "lucide-react";
import type { Metadata } from "next";
import { DemoLink } from "@/components/work/demo-link";
import { ProjectGallery } from "@/components/work/project-gallery";
import { siteConfig } from "@/config/site";
import { ParallaxImage } from "@/components/animations/parallax-image";

export const revalidate = 60;

export async function generateMetadata({
  params: routeParams,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await routeParams;
  try {
    const project = await prisma.project.findUnique({
      where: { slug: params.slug },
    });

    if (!project || !project.published) {
      return {
        title: "Project Not Found",
        robots: { index: false, follow: false },
      };
    }

    const baseTitle = project.seoTitle || `${project.title} — Case Study`;
    const fullTitle = `${baseTitle} | Webgent`;
    const description = project.seoDescription || project.description;
    const ogImage =
      project.imageUrl ||
      `${siteConfig.url}/api/og?title=${encodeURIComponent(project.title)}&badge=${encodeURIComponent(project.category || "Case Study")}&desc=${encodeURIComponent(project.description.slice(0, 140))}`;

    return {
      title: baseTitle,
      description,
      alternates: {
        canonical: `/work/${project.slug}`,
      },
      openGraph: {
        title: fullTitle,
        description,
        url: `${siteConfig.url}/work/${project.slug}`,
        siteName: siteConfig.name,
        type: "article",
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: project.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: fullTitle,
        description,
        images: [ogImage],
        creator: "@webgent",
      },
    };
  } catch {
    return { title: "Case Study" };
  }
}

export default async function PublicProjectDetailPage({ params: routeParams }: { params: Promise<{ slug: string }> }) {
  const params = await routeParams;
  let project: Project | null = null;
  try {
    project = await prisma.project.findUnique({
      where: { slug: params.slug },
    });
  } catch { }

  if (!project || !project.published) {
    notFound();
  }

  let screenshotList: string[] = [];
  if (project.screenshots) {
    try {
      const parsed = JSON.parse(project.screenshots);
      if (Array.isArray(parsed)) {
        screenshotList = parsed;
      } else {
        screenshotList = [project.screenshots];
      }
    } catch {
      screenshotList = project.screenshots.split("\n").filter(Boolean);
    }
  }

  const technologies = project.technologies
    ? project.technologies.split(",").map((tech) => tech.trim()).filter(Boolean)
    : [];
  const demoUrl = project.demoUrl?.trim();
  const showDemo = Boolean(demoUrl) && !demoUrl?.includes("demo.webgent.com");
  const githubUrl = project.githubUrl?.trim();
  const showGithub = Boolean(githubUrl) && !githubUrl?.includes("github.com/webgent/");

  return (
    <>
      <header className="relative isolate overflow-hidden pb-12 pt-10 sm:pt-14">
        <div className="wrap">
          <Link href="/work" className="inline-flex items-center gap-2 text-sm text-fg-muted transition-colors hover:text-fg">
            <ArrowLeft className="h-4 w-4" />
            All work
          </Link>

          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-fg-muted">
            {project.category && <span>{project.category}</span>}
            {project.clientName && (
              <span className="inline-flex items-center gap-1.5">
                <Building className="h-4 w-4" />
                {project.clientName}
              </span>
            )}
            {showDemo && (
              <span className="inline-flex items-center gap-1.5 text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Live
              </span>
            )}
          </div>

          <TextReveal as="h1" immediate className="display-xl mt-5 max-w-5xl">
            {project.title}
          </TextReveal>
          <p className="lede fade-up mt-6 max-w-3xl">{project.description}</p>

          <div className="fade-up mt-8 flex flex-wrap items-center gap-3">
            {showDemo && demoUrl && <DemoLink projectSlug={project.slug} demoUrl={demoUrl} />}
            {showGithub && (
              <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                <Github className="h-4 w-4" />
                <span>View repository</span>
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="wrap space-y-16 pb-20">
        {project.imageUrl && (
          <ParallaxImage className="overflow-hidden rounded-[1.25rem] border border-line">
            <img src={project.imageUrl} alt={project.title} className="max-h-[720px] w-full object-cover object-top" />
          </ParallaxImage>
        )}

        <div className="grid gap-12 lg:grid-cols-12">
          {project.content && (
            <section className="lg:col-span-8">
              <h2 className="display-md mb-6">About the project</h2>
              <MarkdownContent content={project.content} />
            </section>
          )}
          {technologies.length > 0 && (
            <aside className="lg:col-span-4">
              <h2 className="font-mono text-xs font-normal uppercase tracking-[0.14em] text-fg-muted">Built with</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {technologies.map((tech) => (
                  <li key={tech} className="chip">
                    {tech}
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>

        {screenshotList.length > 0 && <ProjectGallery screenshots={screenshotList} projectTitle={project.title} />}
      </div>

      <CtaBand
        title="Want something like this?"
        description="Tell me about your project and I'll come back with a clear scope, timeline and price."
        secondaryLabel="See all work"
        secondaryHref="/work"
        analyticsName="Project Detail"
      />
    </>
  );
}
