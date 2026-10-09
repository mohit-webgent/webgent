"use client";

import React, { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger, isReducedMotion } from "@/components/animations/gsap-core";
import {
  FileCode,
  Activity,
} from "lucide-react";

interface DisciplineStory {
  id: string;
  num: string;
  badge: string;
  title: string;
  description: string;
  filename: string;
  language: string;
  codeSnippet: string;
  runtimeTelemetry: {
    status: string;
    details: string;
    metrics: string;
  }[];
  techStack: string[];
}

const DISCIPLINES: DisciplineStory[] = [
  {
    id: "fullstack",
    num: "01",
    badge: "APP ROUTER / RSC",
    title: "Full-Stack Web Applications",
    description:
      "Engineered with Next.js 14 App Router, TypeScript, and React Server Components for maximum speed, atomic state, and SEO dominance.",
    filename: "app/(marketing)/page.tsx",
    language: "tsx",
    codeSnippet: `// React Server Component (Zero Client JS Overhead)
export default async function ProductPage() {
  const metrics = await getCachedProjectMetrics();

  return (
    <Suspense fallback={<SkeletonLoader />}>
      <ServerComponentStream data={metrics}>
        <ClientIsland interactive={true} />
      </ServerComponentStream>
    </Suspense>
  );
}`,
    runtimeTelemetry: [
      { status: "RSC STREAM", details: "Streaming from edge runtime", metrics: "TTFB < 45ms" },
      { status: "HYDRATION", details: "Selective client island hydration", metrics: "0ms Main Thread" },
      { status: "SEO INDEX", details: "Static HTML generated with OpenGraph", metrics: "100/100 Core" },
    ],
    techStack: ["Next.js 14", "TypeScript", "React 18", "Server Actions"],
  },
  {
    id: "cloud",
    num: "02",
    badge: "POSTGRES / PRISMA",
    title: "Cloud & Backend Architectures",
    description:
      "Robust database architectures, PostgreSQL with Prisma ORM, and serverless Cloudflare R2 object storage integrations.",
    filename: "prisma/schema.prisma",
    language: "prisma",
    codeSnippet: `datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model Project {
  id          String   @id @default(cuid())
  slug        String   @unique
  storageKey  String   // Cloudflare R2 S3-compatible key
  published   Boolean  @default(false)
  updatedAt   DateTime @updatedAt
}`,
    runtimeTelemetry: [
      { status: "PGBOUNCER", details: "Connection pool managing 150+ sessions", metrics: "Active Pool" },
      { status: "PRISMA ORM", details: "Zero N+1 queries with relation joins", metrics: "8.4ms P95" },
      { status: "R2 STORAGE", details: "Presigned direct upload pipeline", metrics: "Global CDN" },
    ],
    techStack: ["PostgreSQL", "Prisma ORM", "Cloudflare R2", "PgBouncer"],
  },
  {
    id: "security",
    num: "03",
    badge: "NEXTAUTH / BCRYPT",
    title: "Enterprise Security & Auth",
    description:
      "NextAuth v5 session management, BCrypt hashing, role-based route guards, and zero-compromise push protection.",
    filename: "middleware.ts",
    language: "ts",
    codeSnippet: `import { auth } from "@/lib/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthed = !!req.auth;

  if (pathname.startsWith("/admin") && !isAuthed) {
    return Response.redirect(new URL("/login", req.url));
  }
  // JWT verification + BCrypt salted session check
});`,
    runtimeTelemetry: [
      { status: "JWT HANDSHAKE", details: "Stateless edge verification", metrics: "256-bit Key" },
      { status: "BCRYPT HASH", details: "12-round salted key derivation", metrics: "Isolated Worker" },
      { status: "RBAC GUARD", details: "Strict role validation at edge router", metrics: "Zero Unauthorized" },
    ],
    techStack: ["NextAuth v5", "BCrypt", "JWT", "RBAC Middleware"],
  },
  {
    id: "realtime",
    num: "04",
    badge: "EVENT DISPATCH",
    title: "Real-Time Engines & Notifications",
    description:
      "Multi-provider dispatch engines spanning WhatsApp Business, Twilio, Slack webhooks, and Resend transactional emails.",
    filename: "lib/dispatch/engine.ts",
    language: "ts",
    codeSnippet: `export async function dispatchEvent(event: WebgentEvent) {
  await Promise.allSettled([
    resend.emails.send({ to: event.email, subject: event.title }),
    whatsapp.messages.send({ to: event.phone, body: event.summary }),
    slack.webhooks.send({ text: \`[DEPLOY] \${event.title}\` }),
  ]);
  // Automated failover to Twilio SMS on gateway error
}`,
    runtimeTelemetry: [
      { status: "RESEND EMAIL", details: "Transactional DKIM verified delivery", metrics: "<120ms Transit" },
      { status: "WHATSAPP API", details: "Instant client alert webhook sync", metrics: "200 ACK" },
      { status: "FAILOVER", details: "Secondary Twilio SMS circuit breaker", metrics: "99.98% SLA" },
    ],
    techStack: ["Resend Email", "WhatsApp Cloud", "Twilio SMS", "Slack Webhooks"],
  },
];

export function InteractiveCapabilities() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // GSAP ScrollTrigger Scroll-Driven Storytelling
  useGSAP(
    () => {
      if (!triggerRef.current || isReducedMotion()) return;

      const trigger = ScrollTrigger.create({
        trigger: triggerRef.current,
        start: "top 15%",
        end: "+=1600",
        pin: true,
        scrub: 0.4,
        onUpdate: (self) => {
          const p = self.progress;
          const index = Math.min(
            DISCIPLINES.length - 1,
            Math.floor(p * DISCIPLINES.length)
          );
          setActiveIndex(index);
        },
      });

      return () => {
        trigger.kill();
      };
    },
    { scope: sectionRef }
  );

  const current = DISCIPLINES[activeIndex];

  return (
    <section
      ref={sectionRef}
      className="relative w-full border-t border-white/[0.06] text-left select-none pb-10"
    >
      {/* Scroll Trigger Container */}
      <div ref={triggerRef} className="w-full flex flex-col justify-center py-2 sm:py-4">
        {/* Section Editorial Header - Compact Scale */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-8">
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#8A8A8A] font-mono block">
              ENGINEERING DISCIPLINE / 01
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#F5F5F3] tracking-tight uppercase">
              End-to-End Architectural Capabilities
            </h2>
            <p className="text-xs text-[#8A8A8A] max-w-lg leading-relaxed">
              From initial system architecture to resilient cloud production deployments. We build
              digital infrastructure designed to withstand real-world enterprise demands.
            </p>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#8A8A8A]">
            <span>CAPABILITY {current.num}</span>
            <span className="text-[#444444]">/</span>
            <span>04</span>
          </div>
        </div>

        {/* 2-Column Balanced Architecture Canvas - Compact Scale */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
          {/* Left Column: 4 Disciplines Story List */}
          <div className="lg:col-span-5 space-y-2">
            {DISCIPLINES.map((item, idx) => {
              const isActive = activeIndex === idx;

              return (
                <div
                  key={item.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`p-3 sm:p-3.5 rounded-xl transition-all duration-200 cursor-pointer ${isActive
                      ? "bg-[#111215] border border-white/[0.14] shadow-[0_4px_20px_rgba(0,0,0,0.5)] translate-x-1"
                      : "bg-[#090A0C]/50 border border-white/[0.03] opacity-45 hover:opacity-75"
                    }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-mono font-bold text-[#E5E5E3]">
                        {item.num}
                      </span>
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/[0.04] text-[#A0A0A0]">
                        {item.badge}
                      </span>
                    </div>

                    {isActive && (
                      <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <h3
                    className={`text-xs sm:text-[13px] font-semibold tracking-tight transition-colors ${isActive ? "text-white" : "text-[#A0A0A0]"
                      }`}
                  >
                    {item.title}
                  </h3>

                  {isActive && (
                    <div className="mt-2 space-y-2">
                      <p className="text-[11px] text-[#888888] leading-relaxed">
                        {item.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-1 pt-0.5">
                        {item.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.03] text-[#999999]"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column: Authentic Developer Workstation (IDE & Live Runtime Telemetry) */}
          <div className="lg:col-span-7">
            <div className="rounded-xl bg-[#0B0C0E] border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden text-left font-mono">
              {/* IDE Top Bar */}
              <div className="flex items-center justify-between px-3.5 py-2 bg-[#111215] border-b border-white/[0.05]">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#333333]" />
                  <div className="w-2 h-2 rounded-full bg-[#333333]" />
                  <div className="w-2 h-2 rounded-full bg-[#333333]" />
                  <span className="ml-2 text-[11px] text-[#888888] flex items-center gap-1">
                    <FileCode className="w-3 h-3 text-[#38bdf8]" />
                    {current.filename}
                  </span>
                </div>

                <div className="text-[9px] text-[#666666] tracking-wider uppercase">
                  TYPE: STRICT TS
                </div>
              </div>

              {/* Code Editor Body */}
              <div className="p-3.5 sm:p-4 overflow-x-auto bg-[#07080A]">
                <pre className="text-[11px] sm:text-xs leading-relaxed text-[#D4D4D4] font-mono">
                  <code>{current.codeSnippet}</code>
                </pre>
              </div>

              {/* Live Runtime Telemetry Section */}
              <div className="p-3 sm:p-3.5 bg-[#0D0E11] border-t border-white/[0.05] space-y-2">
                <div className="flex items-center justify-between text-[10px] text-[#777777] border-b border-white/[0.04] pb-1.5">
                  <span className="flex items-center gap-1 text-white/90 font-medium">
                    <Activity className="w-3 h-3 text-emerald-400" />
                    LIVE ARCHITECTURE RUNTIME
                  </span>
                  <span className="text-[9px] text-emerald-400">STATUS: HEALTHY</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-0.5">
                  {current.runtimeTelemetry.map((item, tIdx) => (
                    <div
                      key={tIdx}
                      className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.03]"
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[9px] text-[#A0A0A0] font-bold">
                          {item.status}
                        </span>
                        <span className="text-[9px] text-emerald-400 font-medium">
                          {item.metrics}
                        </span>
                      </div>
                      <p className="text-[9.5px] text-[#666666] leading-snug">
                        {item.details}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
