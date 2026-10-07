"use client";

import React, { useState } from "react";
import {
  Code2,
  Database,
  ShieldCheck,
  CheckCircle2,
  Server,
  Layers,
  Sparkles,
} from "lucide-react";

interface DigitalProductAssemblyProps {
  currentStage: number; // 0 to 4
  onSelectStage?: (stage: number) => void;
}

export function DigitalProductAssembly({
  currentStage,
  onSelectStage,
}: DigitalProductAssemblyProps) {
  const [trafficSpike, setTrafficSpike] = useState(false);

  // Active technologies that merge into the platform at each stage
  const techStack = [
    { name: "Next.js 14", stage: 0, category: "Framework" },
    { name: "TypeScript", stage: 0, category: "Language" },
    { name: "Tailwind CSS", stage: 1, category: "Design System" },
    { name: "RSC Engine", stage: 1, category: "Interface" },
    { name: "PostgreSQL", stage: 2, category: "Database" },
    { name: "Prisma ORM", stage: 2, category: "Data Layer" },
    { name: "Cloudflare R2", stage: 2, category: "Storage" },
    { name: "NextAuth v5", stage: 3, category: "Security" },
    { name: "Upstash Redis", stage: 3, category: "Rate Limiter" },
    { name: "Vercel Edge", stage: 4, category: "Global CDN" },
  ];

  return (
    <div className="relative w-full rounded-2xl bg-[#0B0B0B] border border-white/[0.12] shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden text-left font-sans select-none transition-all duration-300">
      {/* 1. Realistic Workstation OS Window Titlebar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#131313] border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <span className="ml-2 text-[10px] font-mono text-[#888888] hidden sm:inline-block">
            webgent.architecture://production-pipeline
          </span>
        </div>

        {/* Live Compilation / Assembly Telemetry Indicator */}
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              currentStage === 4 ? "bg-white animate-pulse" : "bg-white/50"
            }`}
          />
          <span className="text-[10px] font-mono font-medium text-[#E5E5E3] tracking-wide">
            {currentStage === 0 && "PHASE 01: BLUEPRINT AST"}
            {currentStage === 1 && "PHASE 02: UI SYNTHESIS"}
            {currentStage === 2 && "PHASE 03: CLOUD DATA ENGINE"}
            {currentStage === 3 && "PHASE 04: SECURITY LOCKDOWN"}
            {currentStage === 4 && "PHASE 05: 100% LIVE IN PRODUCTION"}
          </span>
        </div>
      </div>

      {/* 2. Merging Technology Stack Dock */}
      <div className="px-4 py-2.5 bg-[#0F0F0F] border-b border-white/[0.06] flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#666666] shrink-0 mr-1 flex items-center gap-1">
          <Layers className="w-3 h-3 text-[#888888]" /> Technologies:
        </span>
        {techStack.map((tech) => {
          const isMerged = currentStage >= tech.stage;
          return (
            <div
              key={tech.name}
              className={`px-2.5 py-1 rounded-md text-[10px] font-mono flex items-center gap-1.5 shrink-0 transition-all duration-300 ${
                isMerged
                  ? "bg-white/[0.08] text-[#F5F5F3] border border-white/[0.18] shadow-sm"
                  : "bg-transparent text-[#555555] border border-white/[0.04] opacity-40"
              }`}
            >
              {isMerged && <CheckCircle2 className="w-2.5 h-2.5 text-[#E5E5E3]" />}
              <span>{tech.name}</span>
            </div>
          );
        })}
      </div>

      {/* 3. Live High-Fidelity Platform Viewport */}
      <div className="p-4 sm:p-6 min-h-[380px] sm:min-h-[440px] flex flex-col justify-between space-y-4 bg-[#080808] relative overflow-hidden">
        {/* Subtle engineering coordinate grid background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: "28px 28px",
          }}
          aria-hidden="true"
        />

        {/* Security Scan Radar Sweep (Activates during Stage 3 and 4) */}
        {currentStage === 3 && (
          <div
            className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none animate-pulse"
            style={{
              top: "40%",
              boxShadow: "0 0 20px rgba(255,255,255,0.4)",
            }}
            aria-hidden="true"
          />
        )}

        {/* Stage 01: Wireframe Topology Blueprint */}
        {currentStage === 0 && (
          <div className="space-y-4 relative z-10 animate-in fade-in duration-300">
            {/* Top Bar Skeleton */}
            <div className="border border-dashed border-white/20 rounded-lg p-3 flex items-center justify-between text-[10px] font-mono text-[#888888]">
              <span>[NAV_BAR: 1280px / FIXED / APP_ROUTER]</span>
              <span className="text-[#F5F5F3]">AST: OK</span>
            </div>

            {/* Hero Framework Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-8 border border-dashed border-white/20 rounded-xl p-4 sm:p-5 space-y-3">
                <div className="h-3.5 w-1/3 bg-white/10 rounded animate-pulse" />
                <div className="h-7 w-4/5 bg-white/15 rounded" />
                <div className="h-3 w-full bg-white/10 rounded" />
                <div className="flex gap-2 pt-2">
                  <div className="h-7 w-24 bg-white/15 rounded" />
                  <div className="h-7 w-24 bg-white/10 rounded" />
                </div>
              </div>
              <div className="sm:col-span-4 border border-dashed border-white/20 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-2">
                <Code2 className="w-8 h-8 text-[#666666]" />
                <span className="text-[10px] font-mono text-[#888888]">
                  [HERO_PRODUCT_NODE: 878x603]
                </span>
              </div>
            </div>

            {/* Terminal Compiler Output */}
            <div className="bg-[#101010] border border-white/[0.08] rounded-lg p-3 font-mono text-[10px] text-[#A0A0A0] space-y-1">
              <div className="text-[#E5E5E3] font-semibold">&gt; TypeScript 5.6 Compiler Engine</div>
              <div className="text-[#777777]">&gt; Parsed 14 domain modules with strict null checks</div>
              <div className="text-[#888888]">&gt; Ready for Component &amp; Interface Synthesis...</div>
            </div>
          </div>
        )}

        {/* Stage 02: Interface & Component Synthesis */}
        {currentStage === 1 && (
          <div className="space-y-4 relative z-10 animate-in fade-in duration-300">
            {/* Real Navigation Bar */}
            <div className="bg-[#141414] border border-white/[0.12] rounded-lg p-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-[#202020] border border-white/20 flex items-center justify-center font-mono font-bold text-[9px] text-white">
                  K
                </span>
                <span className="font-bold text-[#F5F5F3] text-[11px]">Kinesis Platform</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-[#888888]">
                <span className="text-white font-medium">Dashboard</span>
                <span>Workloads</span>
                <span>Telemetry</span>
              </div>
            </div>

            {/* Synthesized UI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-7 bg-[#111111] border border-white/[0.10] rounded-xl p-4 space-y-2.5">
                <span className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-[9px] font-mono text-[#A0A0A0]">
                  RSC SERVER RENDERED
                </span>
                <h4 className="text-sm font-bold text-[#F5F5F3] leading-snug">
                  High-Concurrency Autonomous Cloud
                </h4>
                <p className="text-[11px] text-[#888888]">
                  Distributed edge compute with sub-millisecond replication across 34 global regions.
                </p>
                <div className="flex gap-2 pt-1">
                  <div className="px-3 py-1 rounded bg-[#E8E8E6] text-[#080808] font-semibold text-[10px]">
                    Deploy Cluster
                  </div>
                  <div className="px-3 py-1 rounded border border-white/10 text-white text-[10px]">
                    View Specs
                  </div>
                </div>
              </div>

              {/* Real Telemetry Graph Preview */}
              <div className="sm:col-span-5 bg-[#111111] border border-white/[0.10] rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#777777]">
                  <span>P99 LATENCY</span>
                  <span className="text-[#F5F5F3]">12.4ms</span>
                </div>
                <div className="h-14 w-full pt-1">
                  <svg className="w-full h-full" viewBox="0 0 100 30" fill="none">
                    <path
                      d="M0 22 L20 18 L40 21 L60 9 L80 14 L100 5"
                      stroke="#F5F5F3"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M0 22 L20 18 L40 21 L60 9 L80 14 L100 5 L100 30 L0 30 Z"
                      fill="rgba(255,255,255,0.06)"
                    />
                  </svg>
                </div>
                <div className="text-[9px] font-mono text-[#888888] text-center border-t border-white/[0.05] pt-1">
                  Zero-CLS Layout Verified
                </div>
              </div>
            </div>

            {/* Performance Metric Bar */}
            <div className="bg-[#121212] border border-white/[0.08] rounded-lg p-2.5 flex items-center justify-around text-[10px] font-mono">
              <div>
                <span className="text-[#666666]">LCP: </span>
                <span className="text-[#E5E5E3] font-bold">0.58s</span>
              </div>
              <div className="text-white/20">•</div>
              <div>
                <span className="text-[#666666]">FID: </span>
                <span className="text-[#E5E5E3] font-bold">2ms</span>
              </div>
              <div className="text-white/20">•</div>
              <div>
                <span className="text-[#666666]">CLS: </span>
                <span className="text-[#E5E5E3] font-bold">0.000</span>
              </div>
            </div>
          </div>
        )}

        {/* Stage 03: Cloud & Data Engine Merging */}
        {currentStage === 2 && (
          <div className="space-y-4 relative z-10 animate-in fade-in duration-300">
            {/* Live Database Query Stream */}
            <div className="bg-[#101010] border border-white/[0.12] rounded-xl p-3.5 space-y-2 font-mono text-[10px]">
              <div className="flex items-center justify-between text-[#888888] border-b border-white/[0.06] pb-1.5">
                <span className="flex items-center gap-1.5 text-[#F5F5F3]">
                  <Database className="w-3.5 h-3.5" />
                  <span>PostgreSQL Pool + Prisma ORM</span>
                </span>
                <span className="text-[#E5E5E3] font-semibold">14ms Execution</span>
              </div>
              <p className="text-[#A0A0A0] leading-relaxed">
                &gt; prisma.cluster.findMany&#40;&#123; where: &#123; active: true &#125;, cache:
                &quot;edge&quot; &#125;&#41;
              </p>
              <div className="text-[9px] text-[#777777]">
                &gt; Cloudflare R2 Blob Storage Synced • Redis Cache HIT: 99.8%
              </div>
            </div>

            {/* Real-time Dynamic Metrics Tickers */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-[#121212] border border-white/[0.08] rounded-xl p-3 text-center">
                <div className="text-lg font-bold font-mono text-[#F5F5F3]">1.42M</div>
                <div className="text-[9px] font-mono text-[#888888]">req / second</div>
              </div>
              <div className="bg-[#121212] border border-white/[0.08] rounded-xl p-3 text-center">
                <div className="text-lg font-bold font-mono text-[#F5F5F3]">34</div>
                <div className="text-[9px] font-mono text-[#888888]">Edge Regions</div>
              </div>
              <div className="bg-[#121212] border border-white/[0.08] rounded-xl p-3 text-center">
                <div className="text-lg font-bold font-mono text-[#F5F5F3]">&lt; 14ms</div>
                <div className="text-[9px] font-mono text-[#888888]">Data Replication</div>
              </div>
            </div>

            <div className="bg-[#141414] border border-white/[0.07] rounded-lg p-2.5 flex items-center justify-between text-[10px] font-mono text-[#A0A0A0]">
              <span className="flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-white" />
                <span>Distributed Edge Sync</span>
              </span>
              <span className="text-white font-semibold">ZERO-LATENCY BUFFER</span>
            </div>
          </div>
        )}

        {/* Stage 04: Zero-Trust Security & Shields */}
        {currentStage === 3 && (
          <div className="space-y-4 relative z-10 animate-in fade-in duration-300">
            {/* Security Perimeter Status */}
            <div className="bg-[#121212] border border-white/[0.18] rounded-xl p-4 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/10 text-white">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#F5F5F3] uppercase tracking-wide">
                    Zero-Trust Cryptographic Shield
                  </h4>
                  <p className="text-[10px] text-[#888888] font-mono">
                    NextAuth v5 • Role-Based Guards • BCrypt 12-Rounds
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-white/[0.08] border border-white/[0.14] text-[9.5px] font-mono font-bold text-white">
                ARMED &amp; SECURE
              </span>
            </div>

            {/* Verified Endpoints Checklist */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="bg-[#101010] border border-white/[0.08] rounded-lg p-2.5 flex items-center gap-2 text-[#D0D0CE]">
                <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />
                <span>TLS 1.3 / HTTP/3 SSL</span>
              </div>
              <div className="bg-[#101010] border border-white/[0.08] rounded-lg p-2.5 flex items-center gap-2 text-[#D0D0CE]">
                <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />
                <span>Redis Rate Limiter</span>
              </div>
              <div className="bg-[#101010] border border-white/[0.08] rounded-lg p-2.5 flex items-center gap-2 text-[#D0D0CE]">
                <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />
                <span>Turnstile Bot Filter</span>
              </div>
              <div className="bg-[#101010] border border-white/[0.08] rounded-lg p-2.5 flex items-center gap-2 text-[#D0D0CE]">
                <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />
                <span>Role Session Guards</span>
              </div>
            </div>

            <div className="bg-[#101010] border border-white/[0.06] rounded-lg p-2.5 text-[9.5px] font-mono text-[#888888] text-center">
              Push Protection &amp; Automated Vulnerability Telemetry: 100% Cleared
            </div>
          </div>
        )}

        {/* Stage 05: Live Global Production Deployment */}
        {currentStage === 4 && (
          <div className="space-y-4 relative z-10 animate-in fade-in duration-300">
            {/* Live Status Header */}
            <div className="bg-[#141414] border border-white/[0.22] rounded-xl p-3.5 flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                <span className="text-xs font-bold text-[#F5F5F3] font-mono uppercase tracking-wide">
                  SYSTEM DEPLOYED • LIVE PRODUCTION
                </span>
              </div>
              <button
                type="button"
                onClick={() => setTrafficSpike(!trafficSpike)}
                className="px-2.5 py-1 rounded bg-[#E8E8E6] text-[#080808] font-bold text-[9.5px] font-mono hover:bg-white transition-colors"
              >
                {trafficSpike ? "Normal Traffic" : "Simulate 100k Spike"}
              </button>
            </div>

            {/* Real Production Metrics Visualizer */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-8 bg-[#111111] border border-white/[0.12] rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#888888]">
                  <span>REALTIME TRAFFIC LOAD</span>
                  <span className="text-white font-bold">
                    {trafficSpike ? "2.84M REQ/S (SPIKE ABSORPTION)" : "1.42M REQ/S (OPTIMAL)"}
                  </span>
                </div>
                <div className="h-16 w-full pt-1">
                  <svg className="w-full h-full" viewBox="0 0 100 30" fill="none">
                    <path
                      d={
                        trafficSpike
                          ? "M0 24 L15 10 L30 6 L45 2 L60 8 L75 4 L90 7 L100 2"
                          : "M0 24 L15 20 L30 22 L45 12 L60 16 L75 8 L90 10 L100 4"
                      }
                      stroke="#FFFFFF"
                      strokeWidth="1.8"
                    />
                    <path
                      d="M0 24 L15 20 L30 22 L45 12 L60 16 L75 8 L90 10 L100 4 L100 30 L0 30 Z"
                      fill="rgba(255,255,255,0.08)"
                    />
                  </svg>
                </div>
                <div className="flex items-center justify-between text-[9px] font-mono text-[#888888] pt-1 border-t border-white/[0.06]">
                  <span>UPTIME: 99.999%</span>
                  <span>EDGE NODES: 34 / 34 ONLINE</span>
                </div>
              </div>

              <div className="sm:col-span-4 bg-[#111111] border border-white/[0.12] rounded-xl p-3.5 flex flex-col justify-between space-y-2 text-center">
                <Sparkles className="w-5 h-5 text-white mx-auto" />
                <div>
                  <div className="text-base font-bold font-mono text-white">READY</div>
                  <div className="text-[9px] font-mono text-[#888888]">Enterprise Verified</div>
                </div>
                <div className="p-1.5 rounded bg-white/[0.06] text-[9px] font-mono text-[#E5E5E3]">
                  Build #492 Verified
                </div>
              </div>
            </div>

            <div className="bg-[#101010] border border-white/[0.08] rounded-lg p-2.5 flex items-center justify-between text-[10px] font-mono text-[#888888]">
              <span>Next.js 14 App Router + PostgreSQL + Prisma + Anycast</span>
              <span className="text-white font-medium">COMPLETE</span>
            </div>
          </div>
        )}

        {/* 4. Bottom Interactive Step Navigator */}
        <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {["01 Blueprint", "02 Interface", "03 Cloud Data", "04 Security", "05 Production"].map(
              (label, idx) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => onSelectStage && onSelectStage(idx)}
                  className={`px-2.5 py-1 rounded text-[10px] transition-all shrink-0 ${
                    currentStage === idx
                      ? "bg-white text-black font-bold shadow-sm"
                      : "bg-[#141414] text-[#888888] hover:text-white border border-white/[0.06]"
                  }`}
                >
                  {label}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
