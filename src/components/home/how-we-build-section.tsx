"use client";

import React, { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger, isReducedMotion } from "@/components/animations/gsap-core";
import { Code, Cpu, Database, Shield, Rocket } from "lucide-react";
import { DigitalProductAssembly } from "./digital-product-assembly";

const STAGES = [
  {
    id: "01",
    phase: "IDEA & ARCHITECTURE",
    icon: <Code className="w-4 h-4 text-[#F5F5F3]" />,
    title: "System Topology & Blueprint AST",
    description:
      "We deconstruct complex business logic into strict domain schemas, modular micro-services, and deterministic database relations. Every variable is type-checked at compile time.",
    stat: "SCHEMA V1.0",
    techs: ["Next.js 14", "TypeScript 5.6", "Strict Schemas"],
  },
  {
    id: "02",
    phase: "INTERFACE & RUNTIME",
    icon: <Cpu className="w-4 h-4 text-[#F5F5F3]" />,
    title: "Frontend Synthesis & RSC Precision",
    description:
      "Engineered with React Server Components, Tailwind CSS, and zero-CLS layouts for sub-second page loads and fluid, cinematic interactions across mobile and desktop.",
    stat: "TTFB < 50ms",
    techs: ["Tailwind CSS", "RSC Engine", "Fluid Motion"],
  },
  {
    id: "03",
    phase: "CLOUD & DATA ENGINE",
    icon: <Database className="w-4 h-4 text-[#F5F5F3]" />,
    title: "PostgreSQL & Distributed Compute",
    description:
      "High-concurrency data persistence, Prisma ORM abstraction, and serverless Cloudflare R2 object storage pipelines engineered for uninterrupted high-volume scale.",
    stat: "ZERO-LATENCY IO",
    techs: ["PostgreSQL", "Prisma ORM", "Cloudflare R2"],
  },
  {
    id: "04",
    phase: "SECURITY & RESILIENCE",
    icon: <Shield className="w-4 h-4 text-[#F5F5F3]" />,
    title: "Zero-Trust Cryptographic Shields",
    description:
      "NextAuth v5 session guards, BCrypt hashing, Turnstile bot filtration, encrypted telemetry, and Upstash Redis rate-limiting shields protecting all API endpoints.",
    stat: "SOC2 ALIGNED",
    techs: ["NextAuth v5", "Upstash Redis", "Turnstile Shield"],
  },
  {
    id: "05",
    phase: "PRODUCTION RELEASE",
    icon: <Rocket className="w-4 h-4 text-[#F5F5F3]" />,
    title: "Live Global Production Deployment",
    description:
      "Continuous CI/CD workflows verify automated tests and build integrity before releasing into global Anycast edge networks with 99.999% fault tolerance.",
    stat: "99.999% UPTIME",
    techs: ["Anycast Global CDN", "CI/CD Automated", "Telemetry Live"],
  },
];

export function HowWeBuildSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [activeStage, setActiveStage] = useState(0);

  useGSAP(
    () => {
      if (!sectionRef.current) return;
      if (isReducedMotion()) return;

      const trigger = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "+=2200",
        pin: true,
        scrub: 0.5,
        onUpdate: (self) => {
          const p = self.progress;
          const index = Math.min(
            STAGES.length - 1,
            Math.floor(p * STAGES.length)
          );
          setActiveStage(index);
        },
      });

      return () => {
        trigger.kill();
      };
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-16 sm:py-24 border-y border-white/[0.06] bg-[#0A0A0A] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-14">
          <div className="space-y-2 text-left">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#8A8A8A] font-mono block">
              SIGNATURE PROCESS / 02
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-[#F5F5F3] tracking-tight uppercase">
              How We Build Digital Products
            </h2>
            <p className="text-xs sm:text-sm text-[#909090]">
              Watch our live architecture engine synthesize an enterprise platform from schema to production.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-[#8A8A8A]">
            <span>PHASE {STAGES[activeStage].id}</span>
            <span className="text-[#444444]">/</span>
            <span>05</span>
          </div>
        </div>

        {/* Interactive Construction Studio: Left Stages Narrative + Right Realistic Platform Workstation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Stages Navigator */}
          <div className="lg:col-span-5 space-y-3.5 text-left">
            {STAGES.map((stage, idx) => {
              const isActive = activeStage === idx;
              return (
                <div
                  key={stage.id}
                  onClick={() => setActiveStage(idx)}
                  className={`p-4 sm:p-5 rounded-xl border transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "bg-[#141414] border-white/[0.24] shadow-[0_10px_30px_rgba(0,0,0,0.6)] translate-x-1"
                      : "bg-[#0D0D0D]/60 border-white/[0.05] hover:border-white/[0.12] opacity-60 hover:opacity-90"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono font-bold text-[#E5E5E3]">
                        {stage.id}
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#8A8A8A]">
                        {stage.phase}
                      </span>
                    </div>

                    <span className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-[9.5px] font-mono text-[#909090]">
                      {stage.stat}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-[#F5F5F3] tracking-tight">
                    {stage.title}
                  </h3>

                  {isActive && (
                    <div className="space-y-2 pt-1 animate-in fade-in duration-200">
                      <p className="text-xs text-[#909090] leading-relaxed">
                        {stage.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {stage.techs.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[9.5px] font-mono text-[#E5E5E3]"
                          >
                            + {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column: Tangible Realistic Digital Product Assembly Visualizer */}
          <div className="lg:col-span-7 relative w-full flex items-center justify-center">
            <DigitalProductAssembly
              currentStage={activeStage}
              onSelectStage={(s) => setActiveStage(s)}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
