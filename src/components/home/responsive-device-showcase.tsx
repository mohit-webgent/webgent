"use client";

import {
  Lock,
  ArrowUpRight,
  Menu,
  Smartphone,
  Monitor,
} from "lucide-react";

export function ResponsiveDeviceShowcase() {
  return (
    <div className="relative w-full max-w-full lg:max-w-none lg:w-[112%] xl:w-[120%] lg:-mr-6 xl:-mr-12 py-3 sm:py-6 lg:py-0 select-none min-w-0">
      <div
        className="absolute inset-0 pointer-events-none opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
        aria-hidden="true"
      >
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
            `,
            backgroundSize: "36px 36px",
          }}
        />
      </div>

      <div
        className="absolute w-[85%] h-[75%] rounded-full bg-black/85 blur-3xl transform translate-y-16 translate-x-6 pointer-events-none"
        aria-hidden="true"
      />

      <div
        className="relative w-full max-w-full min-w-0 transition-transform duration-700 ease-out"
        style={{
          perspective: "1400px",
        }}
      >
        <div className="relative w-full max-w-full min-w-0 rounded-2xl bg-[#0D0D0D] border border-white/[0.14] shadow-[0_30px_90px_-15px_rgba(0,0,0,0.95),0_12px_30px_-8px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-500 lg:transform lg:rotate-[-1.5deg] lg:rotate-x-[3deg] lg:rotate-y-[-5deg] hover:rotate-0">
          <div className="flex items-center justify-between px-2.5 sm:px-4 py-2 sm:py-2.5 bg-[#141414] border-b border-white/[0.08] min-w-0">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-white/20" />
              <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-white/10" />
              <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-white/10" />
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-md bg-[#080808] border border-white/[0.08] text-[9px] sm:text-[11px] font-mono text-[#8E8E8C] max-w-[200px] sm:max-w-[340px] w-full mx-1.5 sm:mx-2 justify-center min-w-0">
              <Lock className="w-2.5 h-2.5 text-[#A0A0A0] shrink-0" />
              <span className="truncate">https://kinesis-cloud.io</span>
              <span className="hidden sm:inline-block ml-1 px-1.5 py-0.2 rounded bg-white/[0.05] text-[#909090] text-[9px]">
                SSL 256-BIT
              </span>
            </div>

            <div className="flex items-center gap-1.5 font-mono text-[8.5px] sm:text-[10px] text-[#777777] shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />
              <span className="hidden md:inline text-[#A0A0A0]">LIVE PROD</span>
            </div>
          </div>

          <div className="bg-[#090909] text-[#E5E5E3] p-3 sm:p-5 lg:p-6 space-y-3.5 sm:space-y-5 font-sans min-h-[260px] sm:min-h-[350px] min-w-0">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 sm:pb-3 min-w-0">
              <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-[#1C1C1C] border border-white/[0.14] flex items-center justify-center font-mono font-bold text-[10px] sm:text-xs text-[#F5F5F3]">
                    K
                  </div>
                  <span className="font-bold text-[11px] sm:text-sm tracking-tight text-[#F5F5F3]">
                    KINESIS<span className="text-[#888888]">.IO</span>
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-3 lg:gap-4 text-[11px] text-[#8A8A8A] font-medium">
                  <span className="text-[#F5F5F3]">Platform</span>
                  <span>Solutions</span>
                  <span>Infrastructure</span>
                  <span>Docs</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono text-[#999999] bg-white/[0.03] border border-white/[0.06]">
                  v3.8.4
                </span>
                <div className="px-2 sm:px-2.5 py-1 rounded-md bg-[#E8E8E6] text-[#080808] font-medium text-[9px] sm:text-[11px] flex items-center gap-1 shrink-0">
                  <span>Launch Console</span>
                  <ArrowUpRight className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center pt-1 min-w-0">
              <div className="md:col-span-8 space-y-2 sm:space-y-3 min-w-0">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[8px] sm:text-[10px] font-mono text-[#AFAFAD]">
                  <span className="w-1 h-1 rounded-full bg-white/70" />
                  <span>AUTONOMOUS CLOUD</span>
                </div>

                <h2 className="text-xs sm:text-xl lg:text-2xl font-bold tracking-tight text-[#F5F5F3] leading-snug">
                  Scale High-Concurrency Workloads <br />
                  <span className="text-[#A0A0A0]">With 99.999% Fault Tolerance.</span>
                </h2>

                <p className="text-[9.5px] sm:text-xs text-[#8A8A8A] max-w-md leading-relaxed line-clamp-2 sm:line-clamp-none">
                  Distributed edge compute nodes with sub-millisecond data replication across 34
                  global regions.
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <div className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-white/[0.08] border border-white/[0.12] text-[9px] sm:text-xs text-[#F5F5F3] font-medium">
                    Deploy Cluster
                  </div>
                  <div className="px-2.5 py-1 rounded-md text-[10px] sm:text-xs text-[#909090] font-medium hidden sm:inline-block">
                    Explore Architecture →
                  </div>
                </div>
              </div>

              <div className="hidden md:block md:col-span-4 p-3 rounded-xl bg-[#121212] border border-white/[0.08] space-y-2.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#777777]">
                  <span>GLOBAL CLUSTER</span>
                  <span className="text-[#E5E5E3]">OPTIMAL</span>
                </div>
                <div>
                  <div className="text-lg font-bold text-[#F5F5F3] font-mono">1.42M</div>
                  <div className="text-[9px] text-[#888888] font-mono">req / second throughput</div>
                </div>

                <div className="h-9 w-full pt-1">
                  <svg className="w-full h-full" viewBox="0 0 100 30" fill="none">
                    <path
                      d="M0 24 L15 20 L30 22 L45 12 L60 16 L75 8 L90 10 L100 4"
                      stroke="rgba(255,255,255,0.7)"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M0 24 L15 20 L30 22 L45 12 L60 16 L75 8 L90 10 L100 4 L100 30 L0 30 Z"
                      fill="rgba(255,255,255,0.04)"
                    />
                  </svg>
                </div>
                <div className="flex items-center justify-between text-[9px] font-mono text-[#888888] pt-1 border-t border-white/[0.05]">
                  <span>LATENCY: 12ms</span>
                  <span>EDGE: 34 NODES</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-white/[0.06] min-w-0">
              <div className="p-1.5 sm:p-2 rounded-lg bg-[#111111] border border-white/[0.05] min-w-0">
                <div className="text-[8px] sm:text-[9px] font-mono text-[#666666] truncate">
                  ANYCAST PROXY
                </div>
                <div className="text-[9.5px] sm:text-xs font-bold text-[#F5F5F3] font-mono mt-0.5 truncate">
                  TLS 1.3 / HTTP/3
                </div>
              </div>
              <div className="p-1.5 sm:p-2 rounded-lg bg-[#111111] border border-white/[0.05] min-w-0">
                <div className="text-[8px] sm:text-[9px] font-mono text-[#666666] truncate">
                  FAILOVER TIME
                </div>
                <div className="text-[9.5px] sm:text-xs font-bold text-[#F5F5F3] font-mono mt-0.5 truncate">
                  &lt; 140ms
                </div>
              </div>
              <div className="hidden sm:block p-1.5 sm:p-2 rounded-lg bg-[#111111] border border-white/[0.05] min-w-0">
                <div className="text-[8px] sm:text-[9px] font-mono text-[#666666] truncate">
                  COMPLIANCE
                </div>
                <div className="text-[10px] sm:text-xs font-bold text-[#F5F5F3] font-mono mt-0.5 truncate">
                  SOC2 TYPE II
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-4 right-1 sm:-bottom-8 sm:-right-3 md:-right-5 z-20 w-[115px] sm:w-[165px] md:w-[195px] rounded-[22px] sm:rounded-[34px] bg-[#0A0A0A] p-1.5 sm:p-2.5 border-2 border-white/[0.20] shadow-[0_30px_70px_rgba(0,0,0,0.98),0_15px_30px_rgba(0,0,0,0.85)] overflow-hidden transition-all duration-500 lg:transform lg:rotate-[2deg] hover:rotate-0">
          <div className="relative w-full flex items-center justify-between px-2 pt-1 pb-1.5 text-[8px] font-mono text-[#888888]">
            <span>09:41</span>
            <div className="w-10 sm:w-16 h-2.5 sm:h-3 rounded-full bg-[#000000] border border-white/[0.12] mx-auto" />
            <div className="flex items-center gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
            </div>
          </div>

          <div className="rounded-[18px] sm:rounded-[24px] bg-[#080808] border border-white/[0.08] p-2 sm:p-3 space-y-2 min-h-[240px] sm:min-h-[310px] text-left flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-white/[0.07] pb-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-[#1C1C1C] border border-white/[0.14] flex items-center justify-center font-mono font-bold text-[9px] text-[#F5F5F3]">
                    K
                  </div>
                  <span className="font-bold text-[10px] tracking-tight text-[#F5F5F3]">
                    KINESIS
                  </span>
                </div>
                <div className="p-1 rounded bg-white/[0.05] border border-white/[0.08] text-[#D0D0CE]">
                  <Menu className="w-3 h-3" />
                </div>
              </div>

              <div className="pt-2 space-y-1 sm:space-y-1.5">
                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-[7.5px] sm:text-[8px] font-mono text-[#AFAFAD]">
                  <span className="w-1 h-1 rounded-full bg-white/70" />
                  <span>AUTONOMOUS CLOUD</span>
                </div>

                <h3 className="text-[11px] sm:text-sm font-bold tracking-tight text-[#F5F5F3] leading-snug">
                  Scale High-Concurrency Workloads
                </h3>

                <p className="text-[8.5px] sm:text-[9px] text-[#8A8A8A] leading-relaxed line-clamp-2">
                  Distributed edge compute with sub-millisecond replication.
                </p>

                <div className="pt-1">
                  <div className="w-full py-1.5 rounded-md bg-[#E8E8E6] text-[#080808] font-medium text-[9px] sm:text-[10px] text-center flex items-center justify-center gap-1 shadow-sm">
                    <span>Deploy Cluster</span>
                    <ArrowUpRight className="w-2.5 h-2.5" />
                  </div>
                </div>
              </div>

              <div className="mt-2 p-1.5 sm:p-2 rounded-lg bg-[#121212] border border-white/[0.07] space-y-1">
                <div className="flex items-center justify-between text-[7.5px] sm:text-[8px] font-mono text-[#777777]">
                  <span>LATENCY</span>
                  <span className="text-[#F5F5F3] font-semibold">12ms</span>
                </div>
                <div className="flex items-center justify-between text-[7.5px] sm:text-[8px] font-mono text-[#777777]">
                  <span>UPTIME</span>
                  <span className="text-[#E5E5E3]">99.999%</span>
                </div>
              </div>
            </div>

            <div className="w-12 h-1 bg-white/30 rounded-full mx-auto" />
          </div>
        </div>

        <div className="absolute -top-3 left-0 sm:-top-5 sm:-left-3 z-20 px-2.5 py-1 sm:px-3.5 sm:py-2 rounded-xl bg-[#141414]/95 border border-white/[0.14] shadow-[0_15px_40px_rgba(0,0,0,0.9)] backdrop-blur-md flex items-center gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1.5 text-[#B5B5B3]">
            <Monitor className="w-3.5 h-3.5 text-[#F5F5F3]" />
            <span className="text-[10px] text-[#666666]">+</span>
            <Smartphone className="w-3 h-3 text-[#F5F5F3]" />
          </div>
          <span className="w-px h-3 bg-white/10" />
          <span className="text-[9.5px] sm:text-[11px] font-mono text-[#E5E5E3] tracking-wide">
            100% RESPONSIVE ARCHITECTURE
          </span>
        </div>
      </div>
    </div>
  );
}
