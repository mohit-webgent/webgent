"use client";

import React, { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, isReducedMotion } from "@/components/animations/gsap-core";
import {
  Activity,
  Database,
  Layers,
  Shield,
  Zap,
} from "lucide-react";

interface CodeLineToken {
  type: "keyword" | "function" | "string" | "comment" | "type" | "plain" | "property";
  text: string;
}

interface DisciplineStory {
  id: string;
  num: string;
  badge: string;
  title: string;
  description: string;
  filename: string;
  language: string;
  icon: React.ReactNode;
  accentColor: string;
  codeLines: CodeLineToken[][];
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
    icon: <Layers className="w-3.5 h-3.5" />,
    accentColor: "#38bdf8",
    codeLines: [
      [{ type: "comment", text: "// React Server Component (Zero Client Bundle)" }],
      [
        { type: "keyword", text: "export default async function " },
        { type: "function", text: "ProductPage" },
        { type: "plain", text: "() {" },
      ],
      [
        { type: "plain", text: "  " },
        { type: "keyword", text: "const " },
        { type: "plain", text: "metrics = " },
        { type: "keyword", text: "await " },
        { type: "function", text: "getCachedProjectMetrics" },
        { type: "plain", text: "();" },
      ],
      [{ type: "plain", text: "" }],
      [
        { type: "plain", text: "  " },
        { type: "keyword", text: "return " },
        { type: "plain", text: "(" },
      ],
      [
        { type: "plain", text: "    <" },
        { type: "type", text: "Suspense " },
        { type: "property", text: "fallback" },
        { type: "plain", text: "={<" },
        { type: "type", text: "SkeletonLoader " },
        { type: "plain", text: "/>}>" },
      ],
      [
        { type: "plain", text: "      <" },
        { type: "type", text: "ServerComponentStream " },
        { type: "property", text: "data" },
        { type: "plain", text: "={metrics}>" },
      ],
      [
        { type: "plain", text: "        <" },
        { type: "type", text: "ClientIsland " },
        { type: "property", text: "interactive" },
        { type: "plain", text: "={true} />" },
      ],
      [
        { type: "plain", text: "      </" },
        { type: "type", text: "ServerComponentStream" },
        { type: "plain", text: ">" },
      ],
      [
        { type: "plain", text: "    </" },
        { type: "type", text: "Suspense" },
        { type: "plain", text: ">" },
      ],
      [
        { type: "plain", text: "  );" },
      ],
      [
        { type: "plain", text: "}" },
      ],
    ],
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
    icon: <Database className="w-3.5 h-3.5" />,
    accentColor: "#34d399",
    codeLines: [
      [
        { type: "keyword", text: "datasource " },
        { type: "type", text: "db " },
        { type: "plain", text: "{" },
      ],
      [
        { type: "plain", text: "  " },
        { type: "property", text: "provider  " },
        { type: "plain", text: "= " },
        { type: "string", text: '"postgresql"' },
      ],
      [
        { type: "plain", text: "  " },
        { type: "property", text: "url       " },
        { type: "plain", text: "= " },
        { type: "function", text: "env" },
        { type: "plain", text: "(" },
        { type: "string", text: '"DATABASE_URL"' },
        { type: "plain", text: ")" },
      ],
      [
        { type: "plain", text: "  " },
        { type: "property", text: "directUrl " },
        { type: "plain", text: "= " },
        { type: "function", text: "env" },
        { type: "plain", text: "(" },
        { type: "string", text: '"DIRECT_URL"' },
        { type: "plain", text: ")" },
      ],
      [{ type: "plain", text: "}" }],
      [{ type: "plain", text: "" }],
      [
        { type: "keyword", text: "model " },
        { type: "type", text: "Project " },
        { type: "plain", text: "{" },
      ],
      [
        { type: "plain", text: "  " },
        { type: "property", text: "id          " },
        { type: "type", text: "String   " },
        { type: "function", text: "@id @default" },
        { type: "plain", text: "(" },
        { type: "function", text: "cuid" },
        { type: "plain", text: "())" },
      ],
      [
        { type: "plain", text: "  " },
        { type: "property", text: "slug        " },
        { type: "type", text: "String   " },
        { type: "function", text: "@unique" },
      ],
      [
        { type: "plain", text: "  " },
        { type: "property", text: "storageKey  " },
        { type: "type", text: "String   " },
        { type: "comment", text: "// Cloudflare R2 S3 Key" },
      ],
      [
        { type: "plain", text: "  " },
        { type: "property", text: "published   " },
        { type: "type", text: "Boolean  " },
        { type: "function", text: "@default" },
        { type: "plain", text: "(false)" },
      ],
      [{ type: "plain", text: "}" }],
    ],
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
    icon: <Shield className="w-3.5 h-3.5" />,
    accentColor: "#a855f7",
    codeLines: [
      [
        { type: "keyword", text: "import " },
        { type: "plain", text: "{ auth } " },
        { type: "keyword", text: "from " },
        { type: "string", text: '"@/lib/auth"' },
        { type: "plain", text: ";" },
      ],
      [{ type: "plain", text: "" }],
      [
        { type: "keyword", text: "export default " },
        { type: "function", text: "auth" },
        { type: "plain", text: "((req) => {" },
      ],
      [
        { type: "plain", text: "  " },
        { type: "keyword", text: "const " },
        { type: "plain", text: "{ pathname } = req.nextUrl;" },
      ],
      [
        { type: "plain", text: "  " },
        { type: "keyword", text: "const " },
        { type: "plain", text: "isAuthed = !!" },
        { type: "property", text: "req.auth" },
        { type: "plain", text: ";" },
      ],
      [{ type: "plain", text: "" }],
      [
        { type: "plain", text: "  " },
        { type: "keyword", text: "if " },
        { type: "plain", text: '(pathname.startsWith("/admin") && !isAuthed) {' },
      ],
      [
        { type: "plain", text: "    " },
        { type: "keyword", text: "return " },
        { type: "type", text: "Response" },
        { type: "plain", text: "." },
        { type: "function", text: "redirect" },
        { type: "plain", text: "(new URL(" },
        { type: "string", text: '"/login"' },
        { type: "plain", text: ", req.url));" },
      ],
      [
        { type: "plain", text: "  }" },
      ],
      [
        { type: "plain", text: "  " },
        { type: "comment", text: "// BCrypt salted token check" },
      ],
      [{ type: "plain", text: "});" }],
    ],
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
    icon: <Zap className="w-3.5 h-3.5" />,
    accentColor: "#fb923c",
    codeLines: [
      [
        { type: "keyword", text: "export async function " },
        { type: "function", text: "dispatchEvent" },
        { type: "plain", text: "(event: " },
        { type: "type", text: "WebgentEvent" },
        { type: "plain", text: ") {" },
      ],
      [
        { type: "plain", text: "  " },
        { type: "keyword", text: "await " },
        { type: "type", text: "Promise" },
        { type: "plain", text: "." },
        { type: "function", text: "allSettled" },
        { type: "plain", text: "([" },
      ],
      [
        { type: "plain", text: "    resend.emails." },
        { type: "function", text: "send" },
        { type: "plain", text: "({ to: event.email, subject: event.title })," },
      ],
      [
        { type: "plain", text: "    whatsapp.messages." },
        { type: "function", text: "send" },
        { type: "plain", text: "({ to: event.phone, body: event.summary })," },
      ],
      [
        { type: "plain", text: "    slack.webhooks." },
        { type: "function", text: "send" },
        { type: "plain", text: "({ text: `[DEPLOY] ${event.title}` })," },
      ],
      [
        { type: "plain", text: "  ]);" },
      ],
      [
        { type: "plain", text: "  " },
        { type: "comment", text: "// Automated failover to Twilio SMS" },
      ],
      [{ type: "plain", text: "}" }],
    ],
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
  const codeContainerRef = useRef<HTMLDivElement | null>(null);
  const telemetryRef = useRef<HTMLDivElement | null>(null);
  const tabRef = useRef<HTMLDivElement | null>(null);
  const scanlineRef = useRef<HTMLDivElement | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);

  // GSAP ScrollTrigger Setup
  useGSAP(
    () => {
      if (!sectionRef.current || isReducedMotion()) return;

      const trigger = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "+=1600",
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        scrub: 0.35,
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

  // Premium GSAP Transitions on Active Index Change
  useEffect(() => {
    if (isReducedMotion()) return;

    // 1. Scanline sweep effect across the editor
    if (scanlineRef.current) {
      gsap.fromTo(
        scanlineRef.current,
        { top: "0%", opacity: 0.7 },
        { top: "100%", opacity: 0, duration: 0.5, ease: "power2.inOut" }
      );
    }

    // 2. Tab indicator slide & title morph
    if (tabRef.current) {
      gsap.fromTo(
        tabRef.current,
        { opacity: 0.4, x: -6 },
        { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" }
      );
    }

    // 3. Staggered code lines reveal
    if (codeContainerRef.current) {
      const lines = codeContainerRef.current.querySelectorAll(".code-line");
      gsap.fromTo(
        lines,
        { opacity: 0, y: 6 },
        {
          opacity: 1,
          y: 0,
          duration: 0.35,
          stagger: 0.02,
          ease: "power2.out",
          overwrite: "auto",
        }
      );
    }

    // 4. Telemetry cards pop
    if (telemetryRef.current) {
      const cards = telemetryRef.current.querySelectorAll(".telemetry-card");
      gsap.fromTo(
        cards,
        { opacity: 0, scale: 0.96 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.35,
          stagger: 0.04,
          ease: "back.out(1.5)",
          overwrite: "auto",
        }
      );
    }
  }, [activeIndex]);

  const current = DISCIPLINES[activeIndex];

  const renderToken = (token: CodeLineToken, i: number) => {
    switch (token.type) {
      case "keyword":
        return (
          <span key={i} className="text-[#c678dd] font-semibold">
            {token.text}
          </span>
        );
      case "function":
        return (
          <span key={i} className="text-[#61afef]">
            {token.text}
          </span>
        );
      case "string":
        return (
          <span key={i} className="text-[#98c379]">
            {token.text}
          </span>
        );
      case "comment":
        return (
          <span key={i} className="text-[#5c6370] italic">
            {token.text}
          </span>
        );
      case "type":
        return (
          <span key={i} className="text-[#e5c07b]">
            {token.text}
          </span>
        );
      case "property":
        return (
          <span key={i} className="text-[#e06c75]">
            {token.text}
          </span>
        );
      default:
        return (
          <span key={i} className="text-[#abb2bf]">
            {token.text}
          </span>
        );
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen bg-[#07080A] border-t border-white/[0.06] flex flex-col justify-center text-left select-none overflow-hidden z-20"
    >
      {/* Scroll Trigger Container */}
      <div className="w-full max-w-6xl mx-auto flex flex-col justify-center px-3 sm:px-6 pt-10 sm:pt-16 lg:pt-20 pb-2 sm:pb-4">
        {/* Section Editorial Header - Compact Scale */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1.5 sm:gap-2 mb-2 sm:mb-4">
          <div className="space-y-0.5 sm:space-y-1">
            <div className="inline-flex items-center gap-1.5 sm:gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              <span className="text-[9.5px] sm:text-[11px] font-semibold uppercase tracking-widest text-[#8A8A8A] font-mono block">
                ENGINEERING DISCIPLINE / 01
              </span>
            </div>
            <h2 className="text-base sm:text-2xl lg:text-[26px] font-bold text-[#F5F5F3] tracking-tight uppercase">
              End-to-End Architectural Capabilities
            </h2>
            <p className="text-[10px] sm:text-xs text-[#8A8A8A] max-w-lg leading-relaxed line-clamp-2 sm:line-clamp-none">
              From initial system architecture to resilient cloud production deployments. We build
              digital infrastructure designed to withstand real-world enterprise demands.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-[9.5px] sm:text-[11px] text-[#8A8A8A] shrink-0">
            <span className="text-white font-semibold">CAPABILITY {current.num}</span>
            <span className="text-[#444444]">/</span>
            <span>04</span>
          </div>
        </div>

        {/* 2-Column Balanced Architecture Canvas - Responsive Scale */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-5 lg:gap-8 items-start">
          {/* Mobile Segmented Tab Selector (< lg) */}
          <div className="block lg:hidden w-full space-y-1.5">
            <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-[#111215] border border-white/[0.08]">
              {DISCIPLINES.map((item, idx) => {
                const isActive = activeIndex === idx;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveIndex(idx)}
                    type="button"
                    className={`py-1 sm:py-1.5 px-1 rounded-lg text-center transition-all duration-200 flex flex-col items-center gap-0.5 ${
                      isActive
                        ? "bg-white/[0.12] text-white shadow-sm"
                        : "text-[#8A8A8A] hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    <span
                      className="text-[10px] font-mono font-bold"
                      style={isActive ? { color: item.accentColor } : {}}
                    >
                      {item.num}
                    </span>
                    <span className="text-[7.5px] font-mono uppercase truncate max-w-[62px]">
                      {item.id}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Mobile Active Discipline Header */}
            <div className="flex items-center justify-between px-1">
              <div className="space-y-0.5 min-w-0">
                <span className="text-[8px] font-mono text-[#8A8A8A] uppercase tracking-wider block">
                  {current.badge}
                </span>
                <h3 className="text-xs sm:text-sm font-semibold text-white tracking-tight truncate">
                  {current.title}
                </h3>
              </div>
              <span className="flex items-center gap-1 text-[8px] font-mono text-emerald-400 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ACTIVE
              </span>
            </div>
          </div>

          {/* Desktop Left Column: 4 Disciplines Story List (Visible on lg+) */}
          <div className="hidden lg:block lg:col-span-5 space-y-2">
            {DISCIPLINES.map((item, idx) => {
              const isActive = activeIndex === idx;

              return (
                <div
                  key={item.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`group relative p-3 sm:p-3.5 rounded-xl transition-all duration-300 cursor-pointer overflow-hidden ${
                    isActive
                      ? "bg-[#111215] border border-white/[0.18] shadow-[0_4px_24px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)] translate-x-1"
                      : "bg-[#090A0C]/50 border border-white/[0.03] opacity-45 hover:opacity-80 hover:bg-[#0c0d10]"
                  }`}
                >
                  {/* Left Active Glow Indicator Strip */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-r transition-all duration-300 ${
                      isActive ? "bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" : "bg-transparent"
                    }`}
                    style={isActive ? { backgroundColor: item.accentColor } : {}}
                  />

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
                    className={`text-xs sm:text-[13px] font-semibold tracking-tight transition-colors ${
                      isActive ? "text-white" : "text-[#A0A0A0] group-hover:text-[#D0D0CE]"
                    }`}
                  >
                    {item.title}
                  </h3>

                  {isActive && (
                    <div className="mt-2 space-y-2 animate-in fade-in duration-300">
                      <p className="text-[11px] text-[#888888] leading-relaxed">
                        {item.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-1 pt-0.5">
                        {item.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[#A0A0A0]"
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
            <div className="group relative rounded-xl bg-[#0B0C0E] border border-white/[0.10] shadow-[0_16px_50px_rgba(0,0,0,0.7)] overflow-hidden text-left font-mono">
              {/* Luminous Scanline Sweep */}
              <div
                ref={scanlineRef}
                aria-hidden="true"
                className="pointer-events-none absolute left-0 right-0 h-10 bg-gradient-to-b from-transparent via-white/[0.04] to-transparent z-10"
              />

              {/* IDE Top Bar */}
              <div className="flex items-center justify-between px-3 py-1.5 sm:px-3.5 sm:py-2 bg-[#111215] border-b border-white/[0.06]">
                <div ref={tabRef} className="flex items-center gap-1.5 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-[#ef4444]/60 shrink-0" />
                  <div className="w-2 h-2 rounded-full bg-[#eab308]/60 shrink-0" />
                  <div className="w-2 h-2 rounded-full bg-[#22c55e]/60 shrink-0" />
                  <span className="ml-1.5 sm:ml-2 text-[10px] sm:text-[11px] text-[#D0D0CE] flex items-center gap-1 sm:gap-1.5 font-medium truncate">
                    <span style={{ color: current.accentColor }}>{current.icon}</span>
                    <span className="truncate">{current.filename}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[8.5px] sm:text-[9px] text-[#666666] tracking-wider uppercase hidden sm:inline-block">
                    STRICT TS
                  </span>
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: current.accentColor }}
                  />
                </div>
              </div>

              {/* Code Editor Body with Line Numbers & Syntax Highlighting */}
              <div
                ref={codeContainerRef}
                className="p-2 sm:p-3 overflow-x-auto bg-[#07080A] min-h-[155px] sm:min-h-[200px] flex"
              >
                {/* Line Numbers Column */}
                <div
                  aria-hidden="true"
                  className="pr-2 select-none text-right text-[9.5px] sm:text-[10.5px] font-mono text-[#444444] border-r border-white/[0.06] space-y-[1px]"
                >
                  {current.codeLines.map((_, i) => (
                    <div key={i} className="leading-snug">
                      {i + 1}
                    </div>
                  ))}
                </div>

                {/* Code Lines Column */}
                <div className="pl-2 w-full space-y-[1px]">
                  {current.codeLines.map((lineTokens, lineIdx) => (
                    <div
                      key={lineIdx}
                      className="code-line text-[9.5px] sm:text-[11px] leading-snug font-mono whitespace-pre transition-colors duration-150 hover:bg-white/[0.02] rounded px-1 -mx-1"
                    >
                      {lineTokens.length === 0 ? (
                        <span>&nbsp;</span>
                      ) : (
                        lineTokens.map((token, tIdx) => renderToken(token, tIdx))
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Runtime Telemetry Section */}
              <div className="p-2 sm:p-3 bg-[#0D0E11] border-t border-white/[0.06] space-y-1 sm:space-y-1.5">
                <div className="flex items-center justify-between text-[9px] sm:text-[9.5px] text-[#777777] border-b border-white/[0.04] pb-1">
                  <span className="flex items-center gap-1 sm:gap-1.5 text-white/90 font-medium">
                    <Activity className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400" />
                    LIVE ARCHITECTURE RUNTIME
                  </span>
                  <span className="flex items-center gap-1 text-[8px] sm:text-[8.5px] text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    STATUS: HEALTHY
                  </span>
                </div>

                <div ref={telemetryRef} className="grid grid-cols-3 gap-1 sm:gap-1.5 pt-0.5">
                  {current.runtimeTelemetry.map((item, tIdx) => (
                    <div
                      key={tIdx}
                      className="telemetry-card p-1 sm:p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.03]"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5 mb-0.5">
                        <span className="text-[7.5px] sm:text-[8.5px] font-mono text-[#A0A0A0] font-bold truncate">
                          {item.status}
                        </span>
                        <span
                          className="text-[7.5px] sm:text-[8.5px] font-mono font-medium truncate"
                          style={{ color: current.accentColor }}
                        >
                          {item.metrics}
                        </span>
                      </div>
                      <p className="text-[7.5px] sm:text-[9px] text-[#666666] leading-tight truncate">
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
