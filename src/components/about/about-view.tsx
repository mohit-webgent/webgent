"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  GraduationCap,
  Award,
  Sparkles,
  ExternalLink,
  Github,
  Linkedin,
  Mail,
  Compass,
  Check,
  Building2,
  MapPin,
  Calendar,
  ShieldCheck,
} from "lucide-react";
import {
  FOUNDER_PROFILE,
  ProjectItem,
  ExperienceItem,
  EducationItem,
  SkillCategory,
  ApproachStep,
  WorkingPrinciple,
} from "@/data/founder-profile";

export function AboutView() {
  const {
    name,
    badge,
    headline,
    roleTitle,
    introParagraphs,
    currentRole,
    previousExperience,
    education,
    skills,
    projects,
    developmentApproach,
    servicesOffered,
    workingPrinciples,
    portfolioUrl,
    githubUrl,
    linkedinUrl,
    email,
  } = FOUNDER_PROFILE;

  return (
    <div className="min-h-screen bg-[#080808] text-[#DCDCDA] pt-8 pb-28 sm:pb-24 px-4 sm:px-6 lg:px-12 2xl:px-16 3xl:px-24 font-sans selection:bg-white selection:text-black">
      <div className="w-full max-w-[1760px] 2xl:max-w-[1920px] 3xl:max-w-[2240px] mx-auto space-y-16 sm:space-y-24 relative z-10">

        {/* =================================================================== */}
        {/* SECTION 1: HERO (TWO-COLUMN EDITORIAL LAYOUT)                       */}
        {/* =================================================================== */}
        <section aria-label="Founder Introduction" className="pt-4 sm:pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Column: Introduction & Primary CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-[#A3A3A3]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 motion-safe:animate-pulse" />
                <span className="tracking-widest uppercase font-semibold text-emerald-400">{badge}</span>
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-light text-[#F5F5F3] tracking-tight leading-[1.12]">
                  {headline}
                </h1>
                <p className="text-base sm:text-lg text-emerald-400/90 font-mono">
                  {name} — {roleTitle}
                </p>
              </div>

              <div className="space-y-4 text-sm sm:text-base text-[#A3A3A3] font-light leading-relaxed max-w-2xl">
                {introParagraphs.map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>

              {/* Verified Key Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono text-[#D4D4D4]">
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#0D0D10] border border-white/[0.06]">
                  <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Currently at DBA Lounge</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#0D0D10] border border-white/[0.06]">
                  <GraduationCap className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>1st Rank in MCA (AKTU)</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <Link
                  href="/contact"
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-[#EAEAEA] text-black font-semibold text-xs sm:text-sm tracking-wide transition-all duration-200 flex items-center gap-2 shadow-[0_0_25px_rgba(255,255,255,0.15)] hover:shadow-[0_0_35px_rgba(255,255,255,0.25)] active:scale-[0.99]"
                >
                  <span>Discuss Your Project</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="#projects"
                  className="px-5 py-3.5 rounded-xl bg-[#141418] hover:bg-[#1C1C24] text-white font-medium text-xs sm:text-sm tracking-wide transition-colors border border-white/[0.1] flex items-center gap-2"
                >
                  <span>Explore My Work</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#888888]" />
                </Link>

                <a
                  href={portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3.5 rounded-xl bg-transparent hover:bg-white/[0.04] text-[#A3A3A3] hover:text-white text-xs font-mono tracking-wide transition-colors flex items-center gap-1.5"
                >
                  <span>vermamohit.in</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Right Column: Architectural Portrait / Identity Area */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md">
                
                {/* Decorative border frame with architectural accents */}
                <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#141418] to-[#0A0A0C] border border-white/[0.1] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden">
                  
                  {/* Subtle corner grid lines */}
                  <div className="absolute top-0 right-0 w-28 h-28 border-l border-b border-white/[0.04] pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-28 h-28 border-r border-t border-white/[0.04] pointer-events-none" />

                  {/* Portrait Placeholder Container */}
                  <div className="relative aspect-[4/5] rounded-2xl bg-[#09090C] border border-white/[0.08] flex flex-col items-center justify-between p-6 overflow-hidden group">
                    
                    {/* Background subtle radial glow */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_70%)] pointer-events-none" />

                    {/* Top Identity Tag */}
                    <div className="w-full flex items-center justify-between text-[11px] font-mono text-[#888888] z-10">
                      <span className="uppercase tracking-widest text-emerald-400/90 font-semibold">Founder Profile</span>
                      <span>India</span>
                    </div>

                    {/* Monogram / Portrait Visual Area */}
                    <div className="flex flex-col items-center justify-center space-y-4 my-auto z-10 text-center">
                      <div className="w-28 h-28 rounded-2xl bg-gradient-to-tr from-[#16161C] to-[#22222C] border border-white/[0.12] flex items-center justify-center text-4xl font-light text-white tracking-wider shadow-inner group-hover:border-emerald-400/40 transition-colors">
                        MV
                      </div>
                      <div className="space-y-1">
                        <p className="text-lg font-medium text-white">{name}</p>
                        <p className="text-xs font-mono text-[#A0A0A0]">React &amp; MERN Stack Developer</p>
                      </div>
                    </div>

                    {/* Bottom Status Ribbon */}
                    <div className="w-full pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono z-10">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-[#B5B5B3] text-[11px]">Building Webgent</span>
                      </div>
                      <span className="text-[11px] text-[#777777]">Production Ready</span>
                    </div>
                  </div>

                  {/* Professional Identity Panel below portrait */}
                  <div className="mt-5 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{name}</span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Verified Identity
                      </span>
                    </div>
                    <p className="text-[11px] text-[#888888] leading-relaxed">
                      Software Developer at DBA Lounge &amp; Founder of Webgent Studio. Focused on clean React architecture and scalable web products.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* =================================================================== */}
        {/* SECTION 2: CURRENT PROFESSIONAL EXPERIENCE — DBA LOUNGE              */}
        {/* =================================================================== */}
        <section aria-label="Current Professional Role" className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888]">
              01 / Current Role
            </span>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0C1410] via-[#090D0B] to-[#070908] border border-emerald-500/30 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-6 relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 uppercase tracking-wider">
                      {currentRole.period}
                    </span>
                    <span className="text-xs font-mono text-[#888888]">Full-Time Employment</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-light text-white tracking-tight pt-1">
                    Currently Building at <span className="font-semibold text-emerald-300">{currentRole.company}</span>
                  </h2>
                </div>

                <div className="text-left md:text-right font-mono text-xs text-[#A0A0A0] space-y-1">
                  <p className="flex items-center md:justify-end gap-1.5 text-white">
                    <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Role: {currentRole.role}</span>
                  </p>
                  <p className="flex items-center md:justify-end gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#666666]" />
                    <span>Location: {currentRole.location}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-4 max-w-4xl text-sm sm:text-base text-[#B5B5B3] leading-relaxed font-light">
                <p>{currentRole.description}</p>
                
                <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] text-xs font-mono text-[#8E8E8C] space-y-1.5">
                  <p className="text-[#AAAAAA] font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Professional Disclosure Note</span>
                  </p>
                  <p>{currentRole.note}</p>
                  <p className="text-[11px] text-[#666666] italic pt-1">{currentRole.editablePlaceholder}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================== */}
        {/* SECTION 3: PREVIOUS PROFESSIONAL EXPERIENCE (INTERNSHIPS TIMELINE)  */}
        {/* =================================================================== */}
        <section aria-label="Previous Professional Experience" className="space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888]">
              02 / Work History
            </span>
            <h2 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
              Previous Professional Experience
            </h2>
            <p className="text-xs sm:text-sm text-[#888888] font-light max-w-2xl">
              Hands-on engineering contributions across frontend development, headless CMS integrations, and database design.
            </p>
          </div>

          <div className="relative border-l border-white/[0.1] pl-6 sm:pl-8 ml-3 sm:ml-4 space-y-10">
            {previousExperience.map((exp: ExperienceItem, idx: number) => (
              <div key={idx} className="relative group">
                {/* Timeline Dot */}
                <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-3.5 h-3.5 rounded-full bg-[#161616] border-2 border-emerald-400 group-hover:scale-125 transition-transform" />

                <div className="p-6 sm:p-7 rounded-2xl bg-[#0D0D10] border border-white/[0.08] hover:border-white/[0.18] transition-all space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight">
                          {exp.company}
                        </h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-[#A0A0A0] border border-white/[0.08]">
                          {exp.type}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-emerald-400">{exp.role}</p>
                    </div>

                    <div className="text-xs font-mono text-[#888888] flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#666666]" />
                        {exp.period}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#666666]" />
                        {exp.location}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-2 text-xs sm:text-sm text-[#B5B5B3]">
                    {exp.highlights.map((item, hIdx) => (
                      <li key={hIdx} className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-1" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =================================================================== */}
        {/* SECTION 4: EDUCATION AND ACADEMIC ACHIEVEMENTS                      */}
        {/* =================================================================== */}
        <section aria-label="Education and Academic Background" className="space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888]">
              03 / Academic Background
            </span>
            <h2 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
              Education &amp; Academic Achievements
            </h2>
            <p className="text-xs sm:text-sm text-[#888888] font-light max-w-2xl">
              Solid theoretical and practical foundations in computer science and application engineering.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {education.map((edu: EducationItem, idx: number) => {
              const isFirstRank = Boolean(edu.achievement);
              return (
                <div
                  key={idx}
                  className={`p-6 sm:p-7 rounded-2xl text-left transition-all border flex flex-col justify-between gap-5 ${
                    isFirstRank
                      ? "bg-gradient-to-b from-[#13130E] to-[#0D0D0A] border-amber-500/40 ring-1 ring-amber-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
                      : "bg-[#0D0D10] border-white/[0.08]"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/[0.04] text-[#A0A0A0] border border-white/[0.08]">
                        {edu.period}
                      </span>

                      {isFirstRank && (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          <Award className="w-3 h-3 text-amber-400" />
                          Academic First Rank
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-lg sm:text-xl font-semibold text-white tracking-tight">
                        {edu.degree}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#B5B5B3]">{edu.institution}</p>
                      <p className="text-xs font-mono text-[#888888]">{edu.university}</p>
                    </div>
                  </div>

                  {isFirstRank && (
                    <div className="pt-3 border-t border-amber-500/20 flex items-center gap-2 text-xs font-mono text-amber-300/90">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{edu.achievement}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* =================================================================== */}
        {/* SECTION 5: TECHNICAL EXPERTISE                                      */}
        {/* =================================================================== */}
        <section aria-label="Technical Expertise" className="space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888]">
              04 / Core Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
              Technical Expertise
            </h2>
            <p className="text-xs sm:text-sm text-[#888888] font-light max-w-2xl">
              Organized into practical engineering domains focused on delivering reliable, responsive web products.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {skills.map((cat: SkillCategory, idx: number) => {
              const isLearning = cat.categoryKey === "learning";
              return (
                <div
                  key={idx}
                  className={`p-6 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                    isLearning
                      ? "bg-gradient-to-b from-[#0E1520] to-[#0A0E15] border-sky-500/30"
                      : "bg-[#0D0D10] border-white/[0.08] hover:border-white/[0.18]"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold text-white tracking-tight">
                        {cat.title}
                      </h3>
                      {isLearning && (
                        <span className="text-[9.5px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold">
                          Active Focus
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#8E8E8C] leading-relaxed">{cat.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/[0.06]">
                    {cat.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className={`text-xs font-mono px-2.5 py-1 rounded-lg border transition-colors ${
                          isLearning
                            ? "bg-sky-500/10 text-sky-200 border-sky-500/20"
                            : "bg-white/[0.03] text-[#D4D4D4] border-white/[0.06] hover:bg-white/[0.07] hover:text-white"
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
        {/* SECTION 6: SELECTED PROJECTS                                        */}
        {/* =================================================================== */}
        <section id="projects" aria-label="Selected Projects" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888]">
                05 / Production Work
              </span>
              <h2 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
                Selected Projects
              </h2>
              <p className="text-xs sm:text-sm text-[#888888] font-light max-w-2xl">
                Real-world web platforms, digital storefronts, and business interfaces built with modern web technologies.
              </p>
            </div>

            <Link
              href="/work"
              className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors self-start sm:self-auto"
            >
              <span>View All Studio Work</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {projects.map((proj: ProjectItem) => (
              <div
                key={proj.id}
                className="p-6 sm:p-7 rounded-2xl bg-[#0D0D10] border border-white/[0.08] hover:border-white/[0.2] transition-all flex flex-col justify-between gap-6 group"
              >
                <div className="space-y-4">
                  {/* Category & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white/[0.04] text-[#A0A0A0] border border-white/[0.08]">
                      {proj.category}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        proj.isLive
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-white/[0.04] text-[#888888] border-white/[0.08]"
                      }`}
                    >
                      {proj.statusLabel}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-semibold text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                      {proj.name}
                    </h3>
                    <p className="text-xs text-[#9E9E9C] leading-relaxed">{proj.description}</p>
                  </div>

                  {/* My Contribution */}
                  <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                    <span className="text-[10px] font-mono uppercase text-[#777777] tracking-wider block">
                      My Contributions:
                    </span>
                    <ul className="space-y-1.5 text-xs text-[#B5B5B3]">
                      {proj.myContribution.map((point, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-2">
                          <Check className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Tech Stack & External Link */}
                <div className="space-y-3 pt-3 border-t border-white/[0.06]">
                  <div className="flex flex-wrap gap-1">
                    {proj.techStack.map((tech, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.03] text-[#A3A3A3] border border-white/[0.06]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <a
                    href={proj.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-white hover:text-emerald-300 transition-colors pt-1"
                  >
                    <span>Visit Project URL</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =================================================================== */}
        {/* SECTION 7: DEVELOPMENT APPROACH                                     */}
        {/* =================================================================== */}
        <section aria-label="Development Approach" className="space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888]">
              06 / Methodology
            </span>
            <h2 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
              How I Approach Every Project
            </h2>
            <p className="text-xs sm:text-sm text-[#888888] font-light max-w-2xl">
              A disciplined, step-by-step workflow designed to transform ambiguous business goals into solid digital products.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {developmentApproach.map((step: ApproachStep, idx: number) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#0D0D10] border border-white/[0.08] space-y-3 relative overflow-hidden"
              >
                <div className="text-2xl font-light font-mono text-emerald-400">
                  {step.step}
                </div>
                <h3 className="text-base font-semibold text-white tracking-tight">
                  {step.title}
                </h3>
                <p className="text-xs text-[#9E9E9C] leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <p className="text-[11px] font-mono text-[#777777] text-center pt-1">
            Delivery timelines and milestone commitments are established transparently once project scope is defined.
          </p>
        </section>

        {/* =================================================================== */}
        {/* SECTION 8: WHAT I CAN HELP CLIENTS BUILD                            */}
        {/* =================================================================== */}
        <section aria-label="Services Offered" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888]">
                07 / Solutions &amp; Scope
              </span>
              <h2 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
                What I Can Help Clients Build
              </h2>
              <p className="text-xs sm:text-sm text-[#888888] font-light max-w-2xl">
                Direct developer collaboration through Webgent, backed by production engineering experience.
              </p>
            </div>

            <Link
              href="/pricing"
              className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors self-start sm:self-auto"
            >
              <span>Explore Services &amp; Pricing</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {servicesOffered.map((srv, idx) => (
              <Link
                key={idx}
                href={srv.href}
                className="p-4 rounded-xl bg-[#0D0D10] border border-white/[0.06] hover:border-emerald-500/40 hover:bg-[#121217] transition-all flex items-center justify-between text-xs font-medium text-[#DCDCDA] hover:text-white group"
              >
                <span>{srv.title}</span>
                <ArrowRight className="w-3 h-3 text-[#555555] group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            ))}
          </div>
        </section>

        {/* =================================================================== */}
        {/* SECTION 9: PERSONAL WORKING PRINCIPLES                              */}
        {/* =================================================================== */}
        <section aria-label="Working Principles" className="space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888]">
              08 / Values &amp; Discipline
            </span>
            <h2 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
              Personal Working Principles
            </h2>
            <p className="text-xs sm:text-sm text-[#888888] font-light max-w-2xl">
              Professional standards that guide communication, codebase hygiene, and client relationships.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workingPrinciples.map((principle: WorkingPrinciple, idx: number) => (
              <div
                key={idx}
                className="p-5 sm:p-6 rounded-2xl bg-[#0D0D10] border border-white/[0.08] space-y-2 text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <h3 className="text-sm font-semibold text-white tracking-tight">
                    {principle.title}
                  </h3>
                </div>
                <p className="text-xs text-[#9E9E9C] leading-relaxed">
                  {principle.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* =================================================================== */}
        {/* SECTION 10: CONTACT, CALL TO ACTION & SOCIAL LINKS                  */}
        {/* =================================================================== */}
        <section aria-label="Contact Call to Action" className="space-y-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#111613] via-[#0B0F0C] to-[#070908] border border-emerald-500/30 text-center space-y-6 relative overflow-hidden">
            {/* Subtle glow background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.1),_transparent_70%)] pointer-events-none" />

            <div className="space-y-3 max-w-2xl mx-auto relative z-10">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
                Direct Developer Contact
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white tracking-tight">
                Have a project in mind?
              </h2>
              <p className="text-xs sm:text-sm text-[#A0A0A0] leading-relaxed font-light">
                Tell me what you want to build. I&apos;ll help you understand the possible approach, scope, and next steps.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 relative z-10">
              <Link
                href="/contact"
                className="px-6 py-3.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-semibold text-xs sm:text-sm tracking-wide transition-all duration-200 flex items-center gap-2 shadow-[0_0_25px_rgba(52,211,153,0.35)] hover:shadow-[0_0_35px_rgba(52,211,153,0.5)] active:scale-[0.99]"
              >
                <span>Discuss Your Project</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/pricing"
                className="px-5 py-3.5 rounded-xl bg-white/[0.06] hover:bg-white/10 text-white font-medium text-xs sm:text-sm tracking-wide transition-colors border border-white/[0.1] flex items-center gap-2"
              >
                <span>View Pricing</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#888888]" />
              </Link>

              <Link
                href="/work"
                className="px-5 py-3.5 rounded-xl bg-transparent hover:bg-white/[0.04] text-[#A0A0A0] hover:text-white font-mono text-xs tracking-wide transition-colors"
              >
                Explore Projects
              </Link>
            </div>

            {/* Verified External Profile Links */}
            <div className="pt-8 border-t border-white/[0.08] flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-[#888888] relative z-10">
              <a
                href={portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors flex items-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span>vermamohit.in</span>
              </a>

              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors flex items-center gap-1.5"
              >
                <Github className="w-3.5 h-3.5 text-emerald-400" />
                <span>GitHub</span>
              </a>

              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors flex items-center gap-1.5"
              >
                <Linkedin className="w-3.5 h-3.5 text-emerald-400" />
                <span>LinkedIn</span>
              </a>

              <a
                href={`mailto:${email}`}
                className="hover:text-white transition-colors flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>{email}</span>
              </a>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
