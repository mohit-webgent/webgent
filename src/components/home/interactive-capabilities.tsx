"use client";

import React from "react";
import { Layers, Cpu, ShieldCheck, Zap } from "lucide-react";
import { Card3DTilt } from "@/components/animations/card-tilt";
import { ScrollReveal } from "@/components/animations/scroll-reveal";

export function InteractiveCapabilities() {
  const capabilities = [
    {
      num: "01",
      icon: <Layers className="w-5 h-5 text-[#F5F5F3]" />,
      title: "Full-Stack Web Applications",
      badge: "APP ROUTER / RSC",
      description:
        "Engineered with Next.js 14 App Router, TypeScript, and React Server Components for maximum speed, atomic state, and SEO dominance.",
    },
    {
      num: "02",
      icon: <Cpu className="w-5 h-5 text-[#F5F5F3]" />,
      title: "Cloud & Backend Architectures",
      badge: "POSTGRES / PRISMA",
      description:
        "Robust database architectures, PostgreSQL with Prisma ORM, and serverless Cloudflare R2 object storage integrations.",
    },
    {
      num: "03",
      icon: <ShieldCheck className="w-5 h-5 text-[#F5F5F3]" />,
      title: "Enterprise Security & Auth",
      badge: "NEXTAUTH / BCRYPT",
      description:
        "NextAuth v5 session management, BCrypt hashing, role-based route guards, and zero-compromise push protection.",
    },
    {
      num: "04",
      icon: <Zap className="w-5 h-5 text-[#F5F5F3]" />,
      title: "Real-Time Engines & Notifications",
      badge: "EVENT DISPATCH",
      description:
        "Multi-provider dispatch engines spanning WhatsApp Business, Twilio, Slack webhooks, and Resend transactional emails.",
    },
  ];

  return (
    <section className="relative w-full py-16 sm:py-24 border-t border-white/[0.06] text-left">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left Column: Sticky Editorial Heading */}
        <div className="lg:col-span-5 lg:sticky lg:top-28 h-fit space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.03] border border-white/10 text-[#A0A0A0] text-xs font-mono uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
            <span>ENGINEERING DISCIPLINE / 01</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold text-[#F5F5F3] tracking-tight uppercase leading-tight">
            End-to-End <br className="hidden sm:inline" />
            Architectural <br className="hidden sm:inline" />
            Capabilities
          </h2>

          <p className="text-xs sm:text-sm text-[#909090] max-w-md leading-relaxed">
            From initial system architecture to resilient cloud production deployments. We build
            digital infrastructure designed to withstand real-world enterprise demands.
          </p>

          <div className="pt-2 hidden lg:flex items-center gap-3 text-[11px] font-mono text-[#666666]">
            <span>STABLE</span>
            <span>•</span>
            <span>SCALABLE</span>
            <span>•</span>
            <span>TYPE-SAFE</span>
          </div>
        </div>

        {/* Right Column: Interactive Capabilities Cards */}
        <div className="lg:col-span-7 space-y-4">
          {capabilities.map((item, idx) => (
            <ScrollReveal key={item.num} delay={idx * 0.08}>
              <Card3DTilt>
                <div className="group bg-[#0D0D0D] border border-white/[0.08] hover:border-white/[0.20] rounded-2xl p-6 sm:p-7 space-y-4 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-[#141414] border border-white/[0.08] text-[#F5F5F3]">
                        {item.icon}
                      </div>
                      <span className="text-xs font-mono text-[#666666]">{item.num}</span>
                    </div>

                    <span className="px-2.5 py-0.5 rounded bg-white/[0.03] border border-white/[0.07] text-[10px] font-mono text-[#8A8A8A]">
                      {item.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[#F5F5F3] tracking-tight group-hover:text-white transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#909090] mt-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Card3DTilt>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
