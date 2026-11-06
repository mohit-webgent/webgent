"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Check,
  CheckCheck,
  Code2,
  Copy,
  Database,
  ExternalLink,
  Github,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
  Server,
  Sparkles,
  Wrench,
} from "lucide-react";
import { FOUNDER_PROFILE, ProjectItem, EducationItem, SkillCategory } from "@/data/founder-profile";
import { RevealGroup } from "@/components/animations/reveal-group";
import { TextReveal } from "@/components/animations/text-reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { CtaBand } from "@/components/ui/cta-band";

const SKILL_ICONS: Record<SkillCategory["categoryKey"], React.ComponentType<{ className?: string }>> = {
  frontend: Code2,
  backend: Server,
  databases: Database,
  tools: Wrench,
  learning: Sparkles,
};

export function AboutView() {
  const {
    name,
    badge,
    headline,
    location,
    email,
    portfolioUrl,
    githubUrl,
    linkedinUrl,
    introParagraphs,
    currentRole,
    studioRole,
    previousExperience,
    education,
    skills,
    projects,
  } = FOUNDER_PROFILE;

  const [copied, setCopied] = useState(false);
  const [activeJob, setActiveJob] = useState(0);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const careerTimeline = [
    {
      company: currentRole.company,
      role: currentRole.role,
      type: "Current",
      period: currentRole.period,
      location: currentRole.location,
      isCurrent: true,
      description: currentRole.description,
      highlights: currentRole.highlights,
      techStack: currentRole.techStack,
    },
    ...previousExperience.map((experience) => ({
      company: experience.company,
      role: experience.role,
      type: experience.type,
      period: experience.period,
      location: experience.location,
      isCurrent: false,
      description: experience.description || "",
      highlights: experience.highlights,
      techStack: experience.techStack,
    })),
  ];

  return (
    <>
      <header className="relative isolate overflow-hidden pb-10 pt-10 sm:pt-14">
        <div className="wrap grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-8">
            <p className="eyebrow fade-up mb-4">{badge.replace("ABOUT / ", "")}</p>
            <TextReveal as="h1" immediate className="display-lg">
              {headline}
            </TextReveal>
            <div className="fade-up mt-4 max-w-2xl space-y-3 text-[0.9375rem] leading-relaxed text-fg-soft" style={{ "--i": 2 } as React.CSSProperties}>
              {introParagraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>

            <div className="fade-up mt-6 flex flex-wrap items-center gap-2.5" style={{ "--i": 3 } as React.CSSProperties}>
              <Link href="/contact" className="btn btn-primary">
                <span>Discuss a project</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button type="button" onClick={handleCopyEmail} className="btn btn-secondary" title="Copy email address">
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">{email}</span>
                <span className="sm:hidden">Copy email</span>
                {copied ? <CheckCheck className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4 text-fg-muted" />}
              </button>
            </div>
            <span aria-live="polite" className="sr-only">
              {copied ? "Email address copied" : ""}
            </span>

            <ul className="fade-up mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.8125rem] text-fg-muted" style={{ "--i": 4 } as React.CSSProperties}>
              <li className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-accent" />
                {location}
              </li>
              <li>
                <a href={portfolioUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 transition-colors hover:text-fg">
                  vermamohit.in
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </li>
              <li>
                <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 transition-colors hover:text-fg">
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
              </li>
              <li>
                <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 transition-colors hover:text-fg">
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>

          <div className="fade-up lg:col-span-4" style={{ "--i": 2 } as React.CSSProperties}>
            <div className="group relative mx-auto aspect-[4/5] max-w-[20rem] overflow-hidden rounded-2xl border border-line lg:max-w-none">
              <Image
                src="/images/mohit-verma.jpeg"
                alt="Mohit Verma, Software Developer at DBA Lounge and Founder of Webgent Studio"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 480px"
                className="object-cover object-center saturate-[0.8] transition-[filter,transform] duration-700 ease-expo-out group-hover:scale-[1.03] group-hover:saturate-100"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-canvas/85 to-transparent to-50%" />
              <div className="absolute inset-x-5 bottom-5">
                <p className="font-display text-lg font-semibold">{name}</p>
                <p className="mt-1 text-sm text-fg-soft">Software Developer &amp; Founder</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section aria-labelledby="tracks" className="wrap section pt-6">
        <SectionHeading eyebrow="Two tracks" title="One developer, two roles." description="A full-time career and an independent studio, both focused on building useful, reliable web experiences." />
        <RevealGroup spotlight className="mt-7 grid gap-3 md:grid-cols-2">
          <article data-reveal className="card spotlight flex flex-col p-5 sm:p-6">
            <p className="inline-flex items-center gap-2 text-sm text-accent">
              <Briefcase className="h-4 w-4" />
              {currentRole.label}
            </p>
            <h3 className="mt-2.5 text-lg font-semibold">{currentRole.title}</h3>
            <p className="mt-1 text-sm text-fg-muted">
              {currentRole.company}, {currentRole.location}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-fg-soft">{currentRole.description}</p>
            <ul className="mt-4 space-y-2 border-t border-line pt-4 text-[0.8125rem] text-fg-soft">
              {currentRole.highlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {highlight}
                </li>
              ))}
            </ul>
            <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
              {currentRole.techStack.map((tech) => (
                <span key={tech} className="chip">
                  {tech}
                </span>
              ))}
            </div>
          </article>

          <article data-reveal className="card spotlight flex flex-col p-5 sm:p-6">
            <p className="inline-flex items-center gap-2 text-sm text-accent">
              <Sparkles className="h-4 w-4" />
              {studioRole.label}
            </p>
            <h3 className="mt-2.5 text-lg font-semibold">{studioRole.title}</h3>
            <p className="mt-1 text-sm text-fg-muted">
              {studioRole.venture}, {studioRole.focus}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-fg-soft">{studioRole.description}</p>
            <ul className="mt-4 space-y-2 border-t border-line pt-4 text-[0.8125rem] text-fg-soft">
              {studioRole.highlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {highlight}
                </li>
              ))}
            </ul>
            <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
              {studioRole.services.map((service) => (
                <span key={service} className="chip">
                  {service}
                </span>
              ))}
            </div>
          </article>
        </RevealGroup>
      </section>

      <section className="border-y border-line bg-surface/40">
        <div className="wrap section">
          <SectionHeading eyebrow="Experience" title="Professional journey." />
          <div className="mt-7 grid gap-3 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
            <ol className="flex gap-2 overflow-x-auto scrollbar-none lg:flex-col lg:overflow-visible" aria-label="Career timeline">
              {careerTimeline.map((item, index) => {
                const isActive = index === activeJob;
                return (
                  <li key={`${item.company}-${item.period}`} className="shrink-0 lg:shrink">
                    <button
                      type="button"
                      aria-current={isActive ? "true" : undefined}
                      onClick={() => setActiveJob(index)}
                      className={`w-full min-w-52 rounded-xl border p-3.5 text-left transition-colors duration-300 lg:min-w-0 ${
                        isActive ? "border-line-strong bg-surface-2" : "border-line hover:bg-surface-2/60"
                      }`}
                    >
                      <span className="flex items-center gap-2 font-display text-[0.9375rem] font-semibold">
                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${item.isCurrent ? "bg-accent" : "bg-fg-muted/50"}`} />
                        {item.company}
                      </span>
                      <span className="mt-1 block pl-3.5 font-mono text-xs text-fg-muted">{item.period}</span>
                    </button>
                  </li>
                );
              })}
            </ol>

            {careerTimeline[activeJob] && (
              <div key={activeJob} className="card anim-pop p-5 sm:p-6" aria-live="polite">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                  <div>
                    <h3 className="flex flex-wrap items-center gap-2.5 text-lg font-semibold">
                      {careerTimeline[activeJob].company}
                      <span className={`chip ${careerTimeline[activeJob].isCurrent ? "border-accent/40 text-accent" : ""}`}>{careerTimeline[activeJob].type}</span>
                    </h3>
                    <p className="mt-0.5 text-sm text-fg-soft">
                      {careerTimeline[activeJob].role}, {careerTimeline[activeJob].location}
                    </p>
                  </div>
                  <p className="shrink-0 font-mono text-[0.8125rem] text-fg-muted">{careerTimeline[activeJob].period}</p>
                </div>
                {careerTimeline[activeJob].description && <p className="mt-3 text-sm leading-relaxed text-fg-muted">{careerTimeline[activeJob].description}</p>}
                <ul className="mt-3 space-y-1.5 text-[0.8125rem] text-fg-soft">
                  {careerTimeline[activeJob].highlights.map((highlight) => (
                    <li key={highlight} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                      {highlight}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {careerTimeline[activeJob].techStack.map((tech) => (
                    <span key={tech} className="chip">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="projects" className="wrap section scroll-mt-20">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <SectionHeading eyebrow="Projects" title="Selected work and experience." />
          <Link href="/work" className="btn btn-secondary shrink-0 self-start lg:self-auto">
            <span>All studio work</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <RevealGroup spotlight className="mt-7 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project: ProjectItem) => (
            <article key={project.id} data-reveal className="card card-hover spotlight flex flex-col p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[0.8125rem] text-fg-muted">
                <span>{project.projectType}</span>
                <span className={`inline-flex items-center gap-1.5 ${project.isLive ? "text-success" : ""}`}>
                  {project.isLive && <span className="h-1.5 w-1.5 rounded-full bg-success" />}
                  {project.statusLabel}
                </span>
              </div>
              <h3 className="mt-2.5 text-base font-semibold">{project.name}</h3>
              <p className="mt-1 text-sm text-fg-muted">{project.category}</p>
              <p className="mt-2 line-clamp-3 text-[0.8125rem] leading-relaxed text-fg-soft">{project.description}</p>
              <ul className="mt-3 space-y-1 text-[0.8125rem] text-fg-muted">
                {project.myContribution.slice(0, 3).map((point) => (
                  <li key={point} className="flex items-start gap-2">
                    <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                    {point}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-5">
                <div className="flex flex-wrap gap-1.5">
                  {project.techStack.map((tech) => (
                    <span key={tech} className="chip !px-2.5 !py-1 !text-xs">
                      {tech}
                    </span>
                  ))}
                </div>
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-accent"
                >
                  <ExternalLink className="h-4 w-4" />
                  Visit project
                </a>
              </div>
            </article>
          ))}
        </RevealGroup>
      </section>

      <section className="wrap pb-[var(--section-space)]">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeading eyebrow="Toolkit" title="Tools I use to build." />
            <RevealGroup className="mt-6 divide-y divide-line border-y border-line">
              {skills.map((category: SkillCategory) => {
                const Icon = SKILL_ICONS[category.categoryKey];
                return (
                  <div key={category.title} data-reveal className="grid gap-2 py-3.5 sm:grid-cols-[10rem_1fr] sm:gap-5">
                    <p className="inline-flex items-center gap-2 text-sm font-medium">
                      <Icon className="h-4 w-4 text-accent" />
                      {category.title}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {category.skills.map((skill) => (
                        <span key={skill} className="chip">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </RevealGroup>
          </div>

          <div className="lg:col-span-5">
            <SectionHeading eyebrow="Education" title="Academic background." />
            <RevealGroup className="mt-6 space-y-2.5">
              {education.map((item: EducationItem) => (
                <div key={item.degree} data-reveal className="card flex items-start gap-3.5 p-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-3 text-fg-soft">
                    <GraduationCap className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[0.9375rem] font-semibold">{item.degree}</h3>
                    <p className="mt-0.5 text-[0.8125rem] text-fg-soft">{item.institution}</p>
                    <p className="text-[0.8125rem] text-fg-muted">{item.university}</p>
                    <p className="mt-1 font-mono text-xs text-fg-muted">{item.period}</p>
                  </div>
                </div>
              ))}
            </RevealGroup>
          </div>
        </div>
      </section>

      <CtaBand
        title="Let's build something together."
        description="Have an idea for a business website or web application? Work directly with Mohit for clear estimates and milestone delivery."
        primaryLabel="Discuss a project"
        secondaryLabel="View pricing"
        secondaryHref="/pricing"
        whatsappService="a Webgent project"
        analyticsName="About"
      />
    </>
  );
}
