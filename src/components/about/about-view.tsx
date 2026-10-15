"use client";

import React, { useState, useRef } from "react";
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
  Copy,
  CheckCheck,
  Terminal,
  Building2,
  Code2,
  Sparkles,
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
    name,
    badge,
    roleTitle,
    location,
    email,
    portfolioUrl,
    githubUrl,
    linkedinUrl,
    introParagraphs,
    currentRole,
    previousExperience,
    education,
    skills,
    projects,
  } = FOUNDER_PROFILE;

  const [activeExpTab, setActiveExpTab] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const allExperiences = [
    {
      company: currentRole.company,
      role: currentRole.role,
      type: "Full-Time",
      period: currentRole.period,
      location: currentRole.location,
      isCurrent: true,
      description: currentRole.description,
      note: currentRole.note,
      highlights: [
        "Architecting responsive frontend interfaces and design systems using React.js.",
        "Engineering scalable, production-ready web interfaces with modern component patterns.",
        "Collaborating across agile sprints and production deployments.",
        "Focusing on high-performance render cycles and accessible web standards.",
      ],
      techStack: ["React.js", "TypeScript", "Next.js", "Tailwind CSS", "REST APIs", "Git"],
    },
    ...previousExperience.map((exp) => ({
      ...exp,
      isCurrent: false,
      description: `${exp.role} at ${exp.company} (${exp.location}). Focused on production web application development.`,
      note: "Production internship milestone.",
      techStack: exp.company.includes("Diamond")
        ? ["React.js", "Tailwind CSS", "Strapi CMS", "REST APIs", "JavaScript"]
        : ["React.js", "Node.js", "Express.js", "MySQL", "Jira", "REST APIs"],
    })),
  ];

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useGSAP(
    () => {
      if (!containerRef.current || isReducedMotion()) return;

      gsap.from(".about-fade-in", {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.65,
        ease: "power2.out",
      });
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#080808] text-[#EDEDED] pt-8 pb-24 sm:pt-12 sm:pb-32 px-4 sm:px-8 lg:px-12 font-sans selection:bg-white selection:text-black"
    >
      <div className="w-full max-w-6xl mx-auto space-y-20 sm:space-y-28">

        {/* =================================================================== */}
        {/* 1. HERO: SHARP ARCHITECTURAL DEVELOPER PROFILE (NON-ROUNDED)        */}
        {/* =================================================================== */}
        <section aria-label="Developer Introduction" className="pt-2 sm:pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            
            {/* Left Column: Developer Narrative & Direct Links */}
            <div className="lg:col-span-7 space-y-6 flex flex-col justify-between about-fade-in">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-[#A3A3A3] backdrop-blur-md">
                  <span className="w-1.5 h-1.5 bg-emerald-400 motion-safe:animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <span className="tracking-widest uppercase font-semibold text-emerald-400">{badge}</span>
                  <span className="text-white/20">|</span>
                  <span className="text-[#888888]">Software Developer</span>
                </div>

                <div className="space-y-2.5">
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-[1.1]">
                    {name}
                  </h1>
                  <p className="text-base sm:text-lg text-emerald-400 font-mono">
                    {roleTitle} · Founder of <span className="text-white font-medium">Webgent</span>
                  </p>
                </div>

                <div className="space-y-3 text-sm sm:text-base text-[#A3A3A3] font-light leading-relaxed">
                  {introParagraphs.map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>
              </div>

              {/* Direct Actions & Quick Links */}
              <div className="space-y-4 pt-2">
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                  {/* Single row on small screen for primary actions */}
                  <div className="flex flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <Link
                      href="/contact"
                      className="flex-1 sm:flex-initial justify-center px-3.5 sm:px-6 py-3 bg-white hover:bg-[#EAEAEA] text-black font-semibold text-xs sm:text-sm tracking-wide transition-all duration-200 flex items-center gap-1.5 sm:gap-2 shadow-[0_0_25px_rgba(255,255,255,0.18)] active:scale-[0.99] text-center whitespace-nowrap"
                    >
                      <span>Discuss Your Project</span>
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    </Link>

                    <Link
                      href="#projects"
                      className="flex-1 sm:flex-initial justify-center px-3 sm:px-5 py-3 bg-[#141418] hover:bg-[#1C1C24] text-white font-medium text-xs sm:text-sm tracking-wide transition-colors border border-white/[0.1] flex items-center gap-1.5 sm:gap-2 text-center whitespace-nowrap"
                    >
                      <span>View Projects</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#888888] shrink-0" />
                    </Link>
                  </div>

                  <button
                    onClick={handleCopyEmail}
                    className="flex items-center gap-1.5 px-3.5 py-3 bg-[#141418] hover:bg-[#1C1C24] border border-white/[0.1] hover:border-emerald-500/40 text-xs font-mono text-[#D4D4D4] hover:text-white transition-all cursor-pointer w-full sm:w-auto justify-center sm:justify-start"
                    title="Click to copy email"
                  >
                    <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{email}</span>
                    {copied ? (
                      <CheckCheck className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-[#666666]" />
                    )}
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#888888] pt-1">
                  <span className="flex items-center gap-1 text-[#B5B5B3]">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
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
                    <Github className="w-3.5 h-3.5 text-emerald-400" />
                    <span>GitHub</span>
                  </a>
                  <span>·</span>
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors flex items-center gap-1"
                  >
                    <Linkedin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>LinkedIn</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Sharp Verified Telemetry Bento Card (Non-Rounded) */}
            <div className="lg:col-span-5 p-6 sm:p-7 bg-gradient-to-b from-[#111116] via-[#0D0D11] to-[#0A0A0D] border border-white/[0.1] shadow-2xl flex flex-col justify-between gap-6 about-fade-in relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl pointer-events-none" />

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    Verified Credentials
                  </span>
                  <span className="text-[11px] font-mono text-[#666666]">India</span>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Current Employment Card */}
                  <div className="p-3.5 bg-white/[0.02] border border-white/[0.06] flex items-center gap-3">
                    <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Software Developer</p>
                      <p className="text-[11px] text-[#888888] font-mono">DBA Lounge · Gurugram (Present)</p>
                    </div>
                  </div>

                  {/* Academic Degree Card */}
                  <div className="p-3.5 bg-white/[0.02] border border-white/[0.06] flex items-center gap-3">
                    <div className="w-9 h-9 bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-4 h-4 text-sky-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Master of Computer Applications</p>
                      <p className="text-[11px] text-[#888888] font-mono">AKTU (2022 – 2024)</p>
                    </div>
                  </div>

                  {/* Engineering Stack Card */}
                  <div className="p-3.5 bg-white/[0.02] border border-white/[0.06] flex items-center gap-3">
                    <div className="w-9 h-9 bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                      <Code2 className="w-4 h-4 text-violet-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Core Development Stack</p>
                      <p className="text-[11px] text-[#888888] font-mono">React, Next.js, Node.js, Express, MySQL</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Ribbon */}
              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono relative z-10">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-400 animate-pulse" />
                  <span className="text-[#D0D0CE] text-[11px]">Building at Webgent</span>
                </div>
                <span className="text-[11px] text-[#777777]">Production Ready</span>
              </div>
            </div>

          </div>
        </section>

        {/* =================================================================== */}
        {/* 2. INTERACTIVE EXPERIENCE CONSOLE (SHARP NON-ROUNDED TABS)          */}
        {/* =================================================================== */}
        <section aria-label="Work Experience Console" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-white/[0.08] pb-3">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-semibold">
                01 / Professional Track Record
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                Work Experience &amp; Engineering Roles
              </h2>
            </div>
            <span className="text-xs font-mono text-[#777777]">
              Interactive Role Selector
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Role Tabs Switcher */}
            <div className="lg:col-span-4 space-y-2">
              {allExperiences.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveExpTab(idx)}
                  className={`w-full p-4 text-left transition-all duration-200 border flex flex-col gap-1 cursor-pointer ${
                    activeExpTab === idx
                      ? "bg-[#141816] border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30"
                      : "bg-[#0D0D12] border-white/[0.06] hover:bg-[#121218] hover:border-white/[0.14]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">
                      {item.company}
                    </span>
                    {item.isCurrent ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium flex items-center gap-1">
                        <span className="w-1 h-1 bg-emerald-400 animate-pulse" />
                        Current
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-[#777777]">
                        {item.type}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono text-emerald-400/90">{item.role}</span>
                  <span className="text-[11px] font-mono text-[#666666]">{item.period}</span>
                </button>
              ))}
            </div>

            {/* Right Role Detail Console */}
            <div className="lg:col-span-8 p-6 sm:p-7 bg-[#0D0D12] border border-white/[0.08] space-y-5 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white">
                    {allExperiences[activeExpTab].role}
                  </h3>
                  <p className="text-xs font-mono text-emerald-400">
                    {allExperiences[activeExpTab].company} · {allExperiences[activeExpTab].location}
                  </p>
                </div>

                <div className="text-xs font-mono text-[#888888] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{allExperiences[activeExpTab].period}</span>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-[#B5B5B3] leading-relaxed">
                <p>{allExperiences[activeExpTab].description}</p>

                <div className="space-y-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400/90 font-semibold block">
                    Key Technical Contributions:
                  </span>
                  <ul className="space-y-2">
                    {allExperiences[activeExpTab].highlights.map((h, hIdx) => (
                      <li key={hIdx} className="flex items-start gap-2.5">
                        <span className="w-3.5 h-3.5 bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 text-emerald-400" />
                        </span>
                        <span className="text-[#D0D0CE]">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Tech Stack Chips for this role */}
              <div className="pt-4 border-t border-white/[0.06] space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#666666] block">
                  Technologies Utilized:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {allExperiences[activeExpTab].techStack.map((tech, tIdx) => (
                    <span
                      key={tIdx}
                      className="text-xs font-mono px-2.5 py-1 bg-white/[0.04] text-[#D4D4D4] border border-white/[0.06]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* =================================================================== */}
        {/* 3. SELECTED PRODUCTION PROJECTS (SHARP ARCHITECTURAL CARDS)         */}
        {/* =================================================================== */}
        <section id="projects" aria-label="Selected Projects" className="space-y-6 scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-white/[0.08] pb-3">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-semibold">
                02 / Real Deployments
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                Selected Production Projects
              </h2>
            </div>

            <Link
              href="/work"
              className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors"
            >
              <span>Explore All Studio Work</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 bg-white/[0.04] text-[#888888] border border-white/[0.06]">
                        {proj.category}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 border flex items-center gap-1.5 ${
                          proj.isLive
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-white/[0.04] text-[#888888] border-white/[0.06]"
                        }`}
                      >
                        {proj.isLive && (
                          <span className="w-1.5 h-1.5 bg-emerald-400 animate-pulse" />
                        )}
                        <span>{proj.statusLabel}</span>
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-lg font-semibold text-white group-hover:text-emerald-300 transition-colors">
                        {proj.name}
                      </h3>
                      <p className="text-xs text-[#9E9E9C] leading-relaxed">
                        {proj.description}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
                      <span className="text-[10px] font-mono uppercase text-[#777777] block">
                        My Contributions:
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
                        <Terminal className="w-3.5 h-3.5 text-emerald-400" />
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
        {/* 4. TECHNICAL EXPERTISE & CORE CAPABILITIES                          */}
        {/* =================================================================== */}
        <section aria-label="Technical Skills Matrix" className="space-y-6">
          <div className="border-b border-white/[0.08] pb-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-semibold">
              03 / Technical Stack
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
              Skills &amp; Technical Capabilities
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {skills.map((cat: SkillCategory, idx: number) => {
              const isLearning = cat.categoryKey === "learning";
              return (
                <div
                  key={idx}
                  className={`p-6 border transition-all flex flex-col justify-between gap-4 ${
                    isLearning
                      ? "bg-gradient-to-b from-[#0E1520] to-[#0A0E15] border-sky-500/30"
                      : "bg-[#0D0D12] border-white/[0.06] hover:border-white/[0.16]"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white">
                        {cat.title}
                      </h3>
                      {isLearning && (
                        <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 bg-sky-500/20 text-sky-300 font-semibold">
                          Learning
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#8E8E8C]">{cat.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/[0.04]">
                    {cat.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className={`text-xs font-mono px-2 py-0.5 border ${
                          isLearning
                            ? "bg-sky-500/10 text-sky-200 border-sky-500/20"
                            : "bg-white/[0.03] text-[#D4D4D4] border-white/[0.06]"
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
        {/* 5. ACADEMIC QUALIFICATIONS                                          */}
        {/* =================================================================== */}
        <section aria-label="Education" className="space-y-6">
          <div className="border-b border-white/[0.08] pb-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-semibold">
              04 / Academic Qualifications
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
              Education &amp; Degrees
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {education.map((edu: EducationItem, idx: number) => (
              <div
                key={idx}
                className="p-6 bg-[#0D0D12] border border-white/[0.06] hover:border-white/[0.14] transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 bg-white/[0.04] text-[#A0A0A0] border border-white/[0.08]">
                    {edu.period}
                  </span>
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-white">
                    {edu.degree}
                  </h3>
                  <p className="text-xs text-[#B5B5B3]">{edu.institution}</p>
                  <p className="text-xs font-mono text-emerald-400/90">{edu.university}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =================================================================== */}
        {/* 6. CALL TO ACTION & DIRECT CONTACT BAR                              */}
        {/* =================================================================== */}
        <section aria-label="Direct Contact" className="pt-4 border-t border-white/[0.08]">
          <div className="p-8 bg-gradient-to-r from-[#0C1510] via-[#090D0B] to-[#070908] border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                Looking to build a website or web application?
              </h2>
              <p className="text-xs sm:text-sm text-[#A0A0A0] max-w-lg leading-relaxed">
                Work directly with Mohit Verma through Webgent Studio. Transparent milestone estimates, production code quality, and responsive delivery.
              </p>
            </div>

            <div className="flex flex-row items-center gap-2.5 sm:gap-3 shrink-0 w-full sm:w-auto">
              <Link
                href="/contact"
                className="flex-1 sm:flex-initial justify-center px-4 sm:px-6 py-3 bg-emerald-400 hover:bg-emerald-300 text-black font-semibold text-xs sm:text-sm tracking-wide transition-all shadow-[0_0_20px_rgba(52,211,153,0.3)] flex items-center gap-2 whitespace-nowrap text-center"
              >
                <span>Discuss Your Project</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>

              <Link
                href="/pricing"
                className="flex-1 sm:flex-initial justify-center px-3.5 sm:px-5 py-3 bg-white/[0.06] hover:bg-white/10 text-white font-medium text-xs sm:text-sm tracking-wide transition-colors border border-white/[0.1] whitespace-nowrap text-center"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
