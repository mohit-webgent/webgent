"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  GraduationCap,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Calendar,
  Check,
  CheckCheck,
  Copy,
  Briefcase,
  Sparkles,
  ExternalLink,
  Code2,
  Database,
  Server,
  Wrench,
} from "lucide-react";
import {
  FOUNDER_PROFILE,
  ProjectItem,
  EducationItem,
  SkillCategory,
} from "@/data/founder-profile";
import { useGSAP } from "@gsap/react";
import { gsap, isReducedMotion } from "@/components/animations/gsap-core";

export function AboutView() {
  const {
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

  const [copied, setCopied] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Career Timeline Data (Strict Chronological Order, separating Webgent as independent studio)
  const careerTimeline = [
    {
      company: currentRole.company,
      role: currentRole.role,
      status: "Current",
      type: "Full-Time Role",
      period: currentRole.period,
      location: currentRole.location,
      isCurrent: true,
      description: currentRole.description,
      highlights: currentRole.highlights,
      techStack: currentRole.techStack,
    },
    ...previousExperience.map((exp) => ({
      company: exp.company,
      role: exp.role,
      status: "Completed",
      type: exp.type,
      period: exp.period,
      location: exp.location,
      isCurrent: false,
      description: exp.description || "",
      highlights: exp.highlights,
      techStack: exp.techStack,
    })),
  ];

  useGSAP(
    () => {
      if (!containerRef.current || isReducedMotion()) return;

      gsap.from(".about-reveal", {
        opacity: 0,
        y: 24,
        stagger: 0.08,
        duration: 0.65,
        ease: "power2.out",
      });
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#080808] text-[#EDEDED] pt-6 pb-16 sm:pt-8 sm:pb-24 px-4 sm:px-8 lg:px-12 font-sans selection:bg-emerald-500 selection:text-black"
    >
      <div className="w-full max-w-6xl mx-auto space-y-12 sm:space-y-16">

        {/* =================================================================== */}
        {/* SECTION A — HERO: MEET THE PERSON BEHIND WEBGENT                     */}
        {/* =================================================================== */}
        <section aria-label="Meet Mohit Verma" className="pt-1 sm:pt-2">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">

            {/* Left Column: Narrative, Positioning & Quick CTAs */}
            <div className="lg:col-span-7 space-y-7 about-reveal">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-[#A3A3A3] backdrop-blur-md">
                  <span className="w-1.5 h-1.5 bg-emerald-400 motion-safe:animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <span className="tracking-widest uppercase font-semibold text-emerald-400">{badge}</span>
                </div>

                <div className="space-y-3">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white leading-[1.15]">
                    {headline}
                  </h1>
                  <p className="text-sm sm:text-base font-mono text-[#A3A3A3]">
                    Mohit Verma · Software Developer &amp; Founder
                  </p>
                </div>

                <div className="space-y-3 text-sm sm:text-base text-[#B3B3B3] font-light leading-relaxed max-w-2xl">
                  {introParagraphs.map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-5 pt-1">
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href="#projects"
                    className="px-6 py-3 bg-white hover:bg-[#EAEAEA] text-black font-semibold text-xs sm:text-sm tracking-wide transition-all duration-200 flex items-center gap-2 shadow-[0_0_25px_rgba(255,255,255,0.14)] active:scale-[0.99]"
                  >
                    <span>Explore My Work</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </a>

                  <Link
                    href="/contact"
                    className="px-6 py-3 bg-[#121217] hover:bg-[#181820] text-white font-medium text-xs sm:text-sm tracking-wide transition-colors border border-white/[0.1] hover:border-white/[0.2] flex items-center gap-2"
                  >
                    <span>Discuss a Project</span>
                    <ArrowUpRight className="w-4 h-4 text-[#888888] shrink-0" />
                  </Link>

                  <button
                    onClick={handleCopyEmail}
                    className="flex items-center gap-2 px-4 py-3 bg-[#121217] hover:bg-[#181820] border border-white/[0.1] hover:border-emerald-500/40 text-xs font-mono text-[#D4D4D4] hover:text-white transition-all cursor-pointer"
                    title="Click to copy email address"
                  >
                    <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{email}</span>
                    {copied ? (
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-[#666666] shrink-0" />
                    )}
                  </button>
                </div>

                {/* Social & Verification Links */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#888888] pt-2 border-t border-white/[0.06]">
                  <span className="flex items-center gap-1.5 text-[#B5B5B3]">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{location}</span>
                  </span>
                  <span>·</span>
                  <a
                    href={portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors flex items-center gap-1"
                  >
                    <span>vermamohit.in</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                  <span>·</span>
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors flex items-center gap-1"
                  >
                    <Github className="w-3.5 h-3.5 text-[#A3A3A3] shrink-0" />
                    <span>GitHub</span>
                  </a>
                  <span>·</span>
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors flex items-center gap-1"
                  >
                    <Linkedin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>LinkedIn</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Authentic Profile Portrait & Dual-Identity Panel */}
            <div className="lg:col-span-5 space-y-4 about-reveal">
              {/* Profile Card Frame */}
              <div className="p-4 sm:p-5 bg-gradient-to-b from-[#121217] via-[#0E0E13] to-[#0A0A0D] border border-white/[0.1] shadow-2xl space-y-4">
                
                {/* Authentic Profile Image */}
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-black/40 border border-white/[0.08] group">
                  <Image
                    src="/images/mohit-verma.jpeg"
                    alt="Mohit Verma — Software Developer at DBA Lounge and Founder of Webgent Studio"
                    fill
                    sizes="(max-width: 768px) 100vw, 420px"
                    priority
                    className="object-cover object-center grayscale-[20%] group-hover:grayscale-0 transition-all duration-500 scale-[1.01] group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                  
                  {/* Overlay Meta */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-white/90">
                    <span className="px-2 py-1 bg-black/70 border border-white/10 backdrop-blur-md">
                      Mohit Verma
                    </span>
                    <span className="px-2 py-1 bg-black/70 border border-white/10 backdrop-blur-md text-emerald-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-400 animate-pulse rounded-full" />
                      Active &amp; Building
                    </span>
                  </div>
                </div>

                {/* Compact Professional Identity Panel: Distinct Roles */}
                <div className="space-y-3 pt-1">
                  
                  {/* Current Role Card */}
                  <div className="p-3.5 bg-white/[0.03] border border-emerald-500/30 transition-colors">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-semibold flex items-center gap-1.5">
                        <Briefcase className="w-3 h-3 text-emerald-400 shrink-0" />
                        CURRENT ROLE
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        Full-Time
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-white">Software Developer</p>
                      <p className="text-xs text-[#A3A3A3] font-mono">DBA Lounge · Gurugram, India</p>
                    </div>
                  </div>

                  {/* Independent Venture Card */}
                  <div className="p-3.5 bg-white/[0.03] border border-white/[0.1] hover:border-white/[0.2] transition-colors">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#B5B5B3] font-semibold flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-white/70 shrink-0" />
                        INDEPENDENT VENTURE
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-white/[0.06] text-[#D4D4D4] border border-white/[0.1]">
                        Studio
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-white">Founder &amp; Developer</p>
                      <p className="text-xs text-[#A3A3A3] font-mono">Webgent Studio · Web Development &amp; Digital Solutions</p>
                    </div>
                  </div>

                </div>

                <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-[#888888]">
                  <span>Independent Studio · Gurugram &amp; Noida</span>
                  <span className="text-emerald-400">Available for Select Projects</span>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* =================================================================== */}
        {/* SECTION B — TWO PROFESSIONAL TRACKS                                  */}
        {/* =================================================================== */}
        <section aria-label="Two Professional Tracks" className="space-y-5 about-reveal">
          <div className="border-b border-white/[0.08] pb-3 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-semibold">
              01 / DUAL-TRACK POSITIONING
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
              One Developer. Two Professional Tracks.
            </h2>
            <p className="text-sm text-[#A3A3A3] max-w-2xl font-light">
              My professional career and independent studio serve different purposes, but both reflect my focus on building useful, reliable web experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
            
            {/* Panel 1 — Professional Career */}
            <div className="p-6 sm:p-8 bg-[#0D0D12] border border-emerald-500/25 flex flex-col justify-between gap-6 relative overflow-hidden group">
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                    {currentRole.label}
                  </span>
                  <span className="text-xs font-mono text-emerald-400/90 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    Current Employment
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-white">
                    {currentRole.title}
                  </h3>
                  <p className="text-xs font-mono text-[#888888]">
                    {currentRole.company} · {currentRole.location}
                  </p>
                  <p className="text-xs sm:text-sm text-[#B3B3B3] leading-relaxed pt-1">
                    {currentRole.description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#777777] block">
                    Core Focus &amp; Engineering Disciplines:
                  </span>
                  <ul className="space-y-2 text-xs text-[#D4D4D4]">
                    {currentRole.highlights.map((h, hIdx) => (
                      <li key={hIdx} className="flex items-start gap-2.5">
                        <span className="w-4 h-4 bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 text-emerald-400" />
                        </span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.06] space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#666666] block">
                  Verified Technologies:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentRole.techStack.map((tech, tIdx) => (
                    <span
                      key={tIdx}
                      className="text-xs font-mono px-2.5 py-1 bg-white/[0.03] text-[#D0D0CE] border border-white/[0.06]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Panel 2 — Independent Studio */}
            <div className="p-6 sm:p-8 bg-[#0D0D12] border border-white/[0.1] hover:border-white/[0.2] flex flex-col justify-between gap-6 relative overflow-hidden group transition-colors">
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#C0C0C0] font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-white/80" />
                    {studioRole.label}
                  </span>
                  <span className="text-xs font-mono text-[#A3A3A3]">
                    Independent Venture
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-white">
                    {studioRole.title}
                  </h3>
                  <p className="text-xs font-mono text-[#888888]">
                    {studioRole.venture} · {studioRole.focus}
                  </p>
                  <p className="text-xs sm:text-sm text-[#B3B3B3] leading-relaxed pt-1">
                    {studioRole.description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#777777] block">
                    Studio Capabilities &amp; Solutions:
                  </span>
                  <ul className="space-y-2 text-xs text-[#D4D4D4]">
                    {studioRole.highlights.map((h, hIdx) => (
                      <li key={hIdx} className="flex items-start gap-2.5">
                        <span className="w-4 h-4 bg-white/[0.05] border border-white/[0.15] flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 text-white/80" />
                        </span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.06] space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {studioRole.services.map((svc, sIdx) => (
                    <span
                      key={sIdx}
                      className="text-xs font-mono px-2.5 py-1 bg-white/[0.03] text-[#A0A0A0] border border-white/[0.06]"
                    >
                      {svc}
                    </span>
                  ))}
                </div>

                <a
                  href="#projects"
                  className="w-full py-2.5 px-4 bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-white border border-white/[0.1] hover:border-white/[0.25] transition-all flex items-center justify-between"
                >
                  <span>Explore Webgent Projects</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                </a>
              </div>
            </div>

          </div>
        </section>

        {/* =================================================================== */}
        {/* SECTION C — CAREER TIMELINE                                         */}
        {/* =================================================================== */}
        <section aria-label="Professional Journey" className="space-y-5 about-reveal">
          <div className="border-b border-white/[0.08] pb-3 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-semibold">
              02 / CHRONOLOGICAL TRACK RECORD
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
              My Professional Journey
            </h2>
            <p className="text-sm text-[#A3A3A3] max-w-2xl font-light">
              A transparent chronological look at my full-time engineering employment and verified software development internships.
            </p>
          </div>

          <div className="relative pl-6 sm:pl-8 border-l border-white/[0.1] space-y-4 ml-2 sm:ml-4">
            {careerTimeline.map((item, idx) => {
              return (
                <div key={idx} className="relative group">
                  {/* Timeline Node Marker */}
                  <div
                    className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-3.5 h-3.5 border-2 ${
                      item.isCurrent
                        ? "bg-emerald-400 border-[#080808] ring-4 ring-emerald-500/20"
                        : "bg-[#181820] border-white/40"
                    }`}
                  />

                  <div className="p-6 sm:p-7 bg-[#0D0D12] border border-white/[0.08] hover:border-white/[0.16] transition-all space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-lg sm:text-xl font-semibold text-white">
                            {item.company}
                          </h3>
                          {item.isCurrent ? (
                            <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                              <span className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" />
                              Current
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono px-2 py-0.5 bg-white/[0.04] text-[#888888] border border-white/[0.06]">
                              {item.type}
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm font-mono text-emerald-400 pt-0.5">
                          {item.role} · {item.location}
                        </p>
                      </div>

                      <div className="text-xs font-mono text-[#888888] flex items-center gap-1.5 shrink-0">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{item.period}</span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-[#B3B3B3] leading-relaxed">
                      {item.description}
                    </p>

                    {/* Highlights */}
                    <div className="space-y-2 pt-2 border-t border-white/[0.04]">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#666666] block">
                        Verified Technical Contributions:
                      </span>
                      <ul className="space-y-1.5 text-xs text-[#D0D0CE]">
                        {item.highlights.map((h, hIdx) => (
                          <li key={hIdx} className="flex items-start gap-2">
                            <span className="text-emerald-400 mt-0.5">›</span>
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Tech Stack */}
                    <div className="pt-3 border-t border-white/[0.06] flex flex-wrap gap-1.5">
                      {item.techStack.map((tech, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[11px] font-mono px-2.5 py-0.5 bg-white/[0.03] text-[#A3A3A3] border border-white/[0.06]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =================================================================== */}
        {/* SECTION D — SELECTED PROJECTS                                       */}
        {/* =================================================================== */}
        <section id="projects" aria-label="Selected Projects" className="space-y-5 scroll-mt-20 about-reveal">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-white/[0.08] pb-3">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-semibold">
                03 / REAL-WORLD DEPLOYMENTS
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                Selected Work &amp; Production Experience
              </h2>
              <p className="text-sm text-[#A3A3A3] max-w-xl font-light">
                A selection of web interfaces and applications I&apos;ve contributed to across professional work and independent development.
              </p>
            </div>

            <Link
              href="/work"
              className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors shrink-0"
            >
              <span>Explore All Studio Work</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj: ProjectItem) => {
              const borderTheme = proj.isLive
                ? "border-emerald-500/30 hover:border-emerald-500/60"
                : "border-white/[0.08] hover:border-white/[0.2]";

              return (
                <div
                  key={proj.id}
                  className={`p-6 sm:p-7 bg-gradient-to-b from-[#111116] to-[#0A0A0D] border ${borderTheme} transition-all duration-300 flex flex-col justify-between gap-5 group shadow-xl hover:-translate-y-1`}
                >
                  <div className="space-y-4">
                    {/* Category & Status */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 bg-white/[0.04] text-[#A0A0A0] border border-white/[0.06]">
                        {proj.projectType}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 border flex items-center gap-1.5 ${
                          proj.isLive
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-white/[0.04] text-[#888888] border-white/[0.06]"
                        }`}
                      >
                        {proj.isLive && (
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        )}
                        <span>{proj.statusLabel}</span>
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-1.5">
                      <h3 className="text-lg font-semibold text-white group-hover:text-emerald-300 transition-colors">
                        {proj.name}
                      </h3>
                      <p className="text-[11px] font-mono text-[#888888]">
                        {proj.category}
                      </p>
                      <p className="text-xs text-[#9E9E9C] leading-relaxed pt-1">
                        {proj.description}
                      </p>
                    </div>

                    {/* Contributions */}
                    <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
                      <span className="text-[10px] font-mono uppercase text-[#777777] block">
                        Actual Contributions:
                      </span>
                      <ul className="space-y-1 text-xs text-[#B5B5B3]">
                        {proj.myContribution.slice(0, 3).map((point, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-2">
                            <span className="text-emerald-400 mt-0.5">›</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Tech stack & Project link */}
                  <div className="pt-3 border-t border-white/[0.06] space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {proj.techStack.map((tech, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[10px] font-mono px-2 py-0.5 bg-white/[0.02] text-[#A0A0A0] border border-white/[0.04]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <a
                      href={proj.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 bg-white/[0.03] hover:bg-emerald-500/10 text-xs font-mono text-white hover:text-emerald-300 border border-white/[0.06] hover:border-emerald-500/30 transition-all flex items-center justify-between"
                    >
                      <span className="flex items-center gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Visit Project</span>
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#666666]" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =================================================================== */}
        {/* SECTION E — TECH STACK (COMPACT MODERN DEVELOPER MATRIX)            */}
        {/* =================================================================== */}
        <section aria-label="Technical Stack" className="space-y-4 about-reveal">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-white/[0.08] pb-3">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-semibold">
                04 / TECH STACK
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                Tools I Use to Build
              </h2>
            </div>
            <span className="text-xs font-mono text-[#777777]">
              Production Technologies
            </span>
          </div>

          <div className="space-y-2">
            {skills.map((cat: SkillCategory, idx: number) => {
              const isExploring = cat.categoryKey === "learning";
              return (
                <div
                  key={idx}
                  className={`p-3.5 sm:p-4 border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group ${
                    isExploring
                      ? "bg-gradient-to-r from-sky-950/20 via-[#0D0D12] to-[#0A0A0D] border-sky-500/30 hover:border-sky-500/60"
                      : "bg-[#0D0D12] border-white/[0.06] hover:border-white/[0.16] hover:bg-[#111116]"
                  }`}
                >
                  {/* Category Header with Icon */}
                  <div className="flex items-center gap-3 sm:w-56 shrink-0">
                    <div
                      className={`w-7 h-7 flex items-center justify-center border shrink-0 ${
                        isExploring
                          ? "bg-sky-500/10 border-sky-500/30 text-sky-400"
                          : "bg-white/[0.03] border-white/[0.08] text-emerald-400"
                      }`}
                    >
                      {cat.categoryKey === "frontend" && <Code2 className="w-3.5 h-3.5" />}
                      {cat.categoryKey === "backend" && <Server className="w-3.5 h-3.5" />}
                      {cat.categoryKey === "databases" && <Database className="w-3.5 h-3.5" />}
                      {cat.categoryKey === "tools" && <Wrench className="w-3.5 h-3.5" />}
                      {cat.categoryKey === "learning" && <Sparkles className="w-3.5 h-3.5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                          {cat.title}
                        </span>
                        {isExploring && (
                          <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse" />
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-[#777777]">
                        {isExploring ? "Active Exploration" : "Core Competency"}
                      </span>
                    </div>
                  </div>

                  {/* Clean, Interactive Tag Cluster */}
                  <div className="flex flex-wrap items-center gap-1.5 flex-1 sm:justify-end">
                    {cat.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className={`text-xs font-mono px-2.5 py-1 transition-all cursor-default ${
                          isExploring
                            ? "bg-sky-500/10 text-sky-200 border border-sky-500/20 hover:border-sky-400 hover:bg-sky-500/20"
                            : "bg-white/[0.03] text-[#D0D0CE] border border-white/[0.06] hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-white"
                        }`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =================================================================== */}
        {/* SECTION F — ACADEMIC FOUNDATION (SLEEK CREDENTIAL LEDGER)            */}
        {/* =================================================================== */}
        <section aria-label="Academic Foundation" className="space-y-4 about-reveal">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-white/[0.08] pb-3">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-semibold">
                05 / EDUCATION
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                Academic Foundation
              </h2>
            </div>
            <span className="text-xs font-mono text-[#777777]">
              Verified Degrees
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {education.map((edu: EducationItem, idx: number) => {
              const isMCA = edu.degree.includes("Master");
              return (
                <div
                  key={idx}
                  className="p-4 sm:p-5 bg-[#0D0D12] border border-white/[0.08] hover:border-emerald-500/40 transition-all flex items-start gap-3.5 group"
                >
                  <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    <GraduationCap className="w-4 h-4 text-emerald-400" />
                  </div>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                        {isMCA ? "Postgraduate" : "Undergraduate"}
                      </span>
                      <span className="text-xs font-mono px-2 py-0.5 bg-white/[0.04] text-[#A0A0A0] border border-white/[0.08]">
                        {edu.period}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-white group-hover:text-emerald-300 transition-colors truncate">
                      {edu.degree}
                    </h3>

                    <p className="text-xs font-mono text-[#CCCCCC]">
                      {edu.institution}
                    </p>
                    <p className="text-xs font-mono text-[#777777]">
                      {edu.university}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =================================================================== */}
        {/* SECTION G — STUDIO COLLABORATION & ACTION BANNER                    */}
        {/* =================================================================== */}
        <section aria-label="Direct Collaboration & Contact" className="pt-2 about-reveal">
          <div className="relative overflow-hidden p-6 sm:p-8 lg:p-10 bg-gradient-to-br from-[#13131A] via-[#0E0E14] to-[#08080A] border border-white/[0.12] shadow-2xl">
            {/* Ambient Lighting */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/15 blur-[90px]"
            />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              
              {/* Left Copy: Direct, Punchy, High Impact */}
              <div className="space-y-3 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-emerald-400">
                  <span className="w-1.5 h-1.5 bg-emerald-400 animate-pulse rounded-full" />
                  <span>Available for Webgent Studio Projects</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight leading-[1.2]">
                  Let&apos;s build something exceptional together.
                </h2>

                <p className="text-xs sm:text-sm text-[#A3A3A3] font-light leading-relaxed">
                  Have an idea for a business website or web application? Work directly with Mohit Verma for transparent estimates, fast milestone delivery, and production code.
                </p>
              </div>

              {/* Right Action Hub: Modern High-Contrast Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                <Link
                  href="/contact"
                  className="px-6 py-3.5 bg-white hover:bg-[#EAEAEA] text-black font-semibold text-xs sm:text-sm tracking-wide transition-all shadow-[0_0_25px_rgba(255,255,255,0.18)] active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <span>Discuss a Project</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </Link>

                <div className="flex items-center gap-2.5">
                  <Link
                    href="/pricing"
                    className="flex-1 px-4 py-3 bg-white/[0.04] hover:bg-white/[0.08] text-white font-medium text-xs font-mono transition-all border border-white/15 hover:border-white/30 text-center"
                  >
                    View Pricing
                  </Link>

                  <a
                    href="https://wa.me/918800241462"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-medium text-xs font-mono transition-all border border-emerald-500/30 hover:border-emerald-500/50 text-center flex items-center justify-center gap-1.5"
                  >
                    <span>WhatsApp</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={handleCopyEmail}
                    className="px-3.5 py-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 hover:border-emerald-500/40 text-xs font-mono text-[#D4D4D4] hover:text-white transition-all cursor-pointer"
                    title="Copy Email"
                  >
                    {copied ? (
                      <CheckCheck className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-[#888888]" />
                    )}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
