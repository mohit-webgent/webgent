"use client";

import React, { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, isReducedMotion } from "@/components/animations/gsap-core";
import {
  Lock,
  ShoppingBag,
  Heart,
  Search,
  User,
  ShieldCheck,
  ArrowRight,
  Globe,
  Layers,
  Compass,
  Camera,
  Type,
  Grid,
  Package,
  Database,
  Zap,
  Star,
} from "lucide-react";

interface FlyingStep {
  threshold: number;
  stepNum: number;
  label: string;
  category: string;
  incomingTitle: string;
  incomingDetail: string;
  startPos: { x: number; y: number };
  icon: React.ComponentType<{ className?: string }>;
}

const CREATION_STEPS: FlyingStep[] = [
  {
    threshold: 0.08,
    stepNum: 1,
    label: "Step 1: Domain & Core Network",
    category: "ARCHITECTURE",
    incomingTitle: "Edge DNS & Network Ingress",
    incomingDetail: "Binding Anycast CDN, SSL Offload, and Edge Routing AST",
    startPos: { x: -300, y: -160 },
    icon: Globe,
  },
  {
    threshold: 0.18,
    stepNum: 2,
    label: "Step 2: Announcement Ribbon",
    category: "LAYOUT",
    incomingTitle: "Complimentary Shipping Banner",
    incomingDetail: "Top announcement ribbon & structural layout frame",
    startPos: { x: 0, y: -240 },
    icon: Layers,
  },
  {
    threshold: 0.28,
    stepNum: 3,
    label: "Step 3: Brand Identity & Navbar",
    category: "NAVIGATION",
    incomingTitle: "Edayaa Brand Emblem & Nav Bar",
    incomingDetail: "Circular 92.5 Silver crest, search, wishlist & cart anchors",
    startPos: { x: 300, y: -160 },
    icon: Compass,
  },
  {
    threshold: 0.38,
    stepNum: 4,
    label: "Step 4: Editorial Photography",
    category: "VISUAL ASSET",
    incomingTitle: "High-Fashion Jewelry Photography",
    incomingDetail: "Luxury lifestyle background photoshoot visual",
    startPos: { x: -320, y: -20 },
    icon: Camera,
  },
  {
    threshold: 0.48,
    stepNum: 5,
    label: "Step 5: Hero Headline & CTA",
    category: "CONTENT",
    incomingTitle: "Editorial Headline & 'SHOP NOW'",
    incomingDetail: "'From workdays to WEEKENDS' luxury serif typography",
    startPos: { x: -280, y: 160 },
    icon: Type,
  },
  {
    threshold: 0.58,
    stepNum: 6,
    label: "Step 6: Artisan Categories Matrix",
    category: "CATEGORIES",
    incomingTitle: "Jewelry Category Squircles (9)",
    incomingDetail: "Bangles, Bracelets, Ear Rings, Necklace, Pendants, Anklets, Rings...",
    startPos: { x: 320, y: -40 },
    icon: Grid,
  },
  {
    threshold: 0.68,
    stepNum: 7,
    label: "Step 7: Bestsellers Product Catalog",
    category: "COMMERCE",
    incomingTitle: "Artisan Product Cards Matrix",
    incomingDetail: "Vintage Emerald Solitaire, Filigree Cuff, Baroque Pendant",
    startPos: { x: 280, y: 160 },
    icon: Package,
  },
  {
    threshold: 0.78,
    stepNum: 8,
    label: "Step 8: Database & Cart Hydration",
    category: "DATA ENGINE",
    incomingTitle: "PostgreSQL Live Inventory Sync",
    incomingDetail: "Hydrating live stock, Wishlist (1) & Cart (1) counts",
    startPos: { x: 0, y: 220 },
    icon: Database,
  },
  {
    threshold: 0.88,
    stepNum: 9,
    label: "Step 9: Security & Payment Gateways",
    category: "SECURITY",
    incomingTitle: "Zero-Trust Payment Perimeter",
    incomingDetail: "TLS 1.3 Padlock verified with Razorpay & Stripe checkouts",
    startPos: { x: -300, y: 60 },
    icon: ShieldCheck,
  },
  {
    threshold: 0.96,
    stepNum: 10,
    label: "Step 10: 100% Production Live Launch",
    category: "DEPLOYMENT",
    incomingTitle: "Global Edge Production Release",
    incomingDetail: "Anycast edge CDN verified — 100% production live",
    startPos: { x: 0, y: -240 },
    icon: Zap,
  },
];

// Artisan Jewelry Categories exactly as shown in reference photo
const JEWELRY_CATEGORIES = [
  {
    name: "Bangles",
    image: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=300&auto=format&fit=crop",
  },
  {
    name: "Bracelets",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=300&auto=format&fit=crop",
  },
  {
    name: "Ear Rings",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=300&auto=format&fit=crop",
  },
  {
    name: "Necklace",
    image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=300&auto=format&fit=crop",
  },
  {
    name: "Pendants",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=300&auto=format&fit=crop",
  },
  {
    name: "Anklets",
    image: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=300&auto=format&fit=crop",
  },
  {
    name: "Rings",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=300&auto=format&fit=crop",
  },
  {
    name: "Sets",
    image: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?q=80&w=300&auto=format&fit=crop",
  },
  {
    name: "Toe Rings",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=300&auto=format&fit=crop",
  },
];

export function HowWeBuildSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const monitorRef = useRef<HTMLDivElement | null>(null);

  // Scroll progress from 0 to 1
  const [progress, setProgress] = useState(0);

  useGSAP(
    () => {
      if (!triggerRef.current || isReducedMotion()) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerRef.current,
          start: "top top",
          end: "+=3800",
          pin: true,
          scrub: 0.5,
          onUpdate: (self) => {
            setProgress(self.progress);
          },
        },
      });

      // Monitor subtle 3D settling
      if (monitorRef.current) {
        tl.fromTo(
          monitorRef.current,
          { scale: 0.96 },
          { scale: 1, ease: "none" },
          0
        );
      }
    },
    { scope: sectionRef }
  );

  // Progressive thresholds (Strictly 1-by-1 assembly)
  const hasStep1 = progress >= 0.08; // Domain / Wireframe
  const hasStep2 = progress >= 0.18; // Top Announcement Bar
  const hasStep3 = progress >= 0.28; // Navigation & Edayaa Logo
  const hasStep4 = progress >= 0.38; // Hero Jewelry Lifestyle Photo
  const hasStep5 = progress >= 0.48; // "From workdays to WEEKENDS" Typography & CTA
  const hasStep6 = progress >= 0.58; // Jewelry Categories Matrix (from photo)
  const hasStep7 = progress >= 0.68; // Featured Products Cards on right
  const hasStep8 = progress >= 0.78; // Database & Cart (1) / Stock Sync
  const hasStep9 = progress >= 0.88; // SSL Padlock & Payment Gateways
  const hasStep10 = progress >= 0.96; // 100% Live Production Deployment

  // Current active step object for the header status
  const currentStep =
    [...CREATION_STEPS].reverse().find((s) => progress >= s.threshold) || CREATION_STEPS[0];

  // STRICT 1-BY-1 FLIGHT CALCULATION:
  // Exactly ONE item flies in at any time.
  // Reaches center -> immediately fades to 0 opacity without pausing -> item is locked onto the website.
  const activeFlyData = (() => {
    // Responsive flight scale: start closer to monitor bezel on mobile viewports
    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
    const coordScale = isMobile ? 0.45 : 1;

    for (const step of CREATION_STEPS) {
      const flightStart = step.threshold - 0.06;
      const centerHit = step.threshold;
      const fadeEnd = step.threshold + 0.018;

      if (progress >= flightStart && progress <= fadeEnd) {
        if (progress <= centerHit) {
          // Swooping from outside straight into the exact center (0, 0)
          const t = Math.max(0, Math.min(1, (progress - flightStart) / (centerHit - flightStart)));
          const easeT = Math.pow(t, 1.25);
          const x = step.startPos.x * (1 - easeT) * coordScale;
          const y = step.startPos.y * (1 - easeT) * coordScale;
          const opacity = Math.min(1, t / 0.25);
          const scale = (isMobile ? 0.8 : 0.75) + (isMobile ? 0.2 : 0.3) * easeT;
          return { step, x, y, opacity, scale, isAbsorbing: false };
        } else {
          // Reached center: IMMEDIATELY FADE OUT AND DISSOLVE INTO SCREEN (NO PAUSE)
          const t = Math.max(0, Math.min(1, (progress - centerHit) / (fadeEnd - centerHit)));
          const opacity = Math.max(0, 1 - t * 1.3);
          const scale = 1.05 - 0.25 * t;
          return { step, x: 0, y: 0, opacity, scale, isAbsorbing: true };
        }
      }
    }
    return null;
  })();

  const ActiveFlyIcon = activeFlyData?.step.icon;

  return (
    <section
      ref={sectionRef}
      className="relative w-full border-y border-white/[0.06] bg-[#07080A] text-left select-none overflow-hidden"
    >
      {/* Pinned Scroll Container - Perfectly fitted within viewport without bottom cut-off */}
      <div
        ref={triggerRef}
        className="relative w-full h-screen max-h-[880px] flex flex-col justify-between py-2 sm:py-3 px-2 sm:px-6 max-w-6xl mx-auto"
      >
        {/* Compact Editorial Header Bar */}
        <div className="flex items-center justify-between gap-2 sm:gap-3 pb-1 sm:pb-1.5 border-b border-white/[0.05] shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] shrink-0" />
            <span className="hidden sm:inline-block text-[10px] sm:text-[10.5px] font-semibold uppercase tracking-widest text-[#8A8A8A] font-mono shrink-0">
              SIGNATURE PROCESS / 02
            </span>
            <span className="hidden sm:inline-block text-white/20">|</span>
            <h2 className="text-[11px] sm:text-sm font-bold text-[#F5F5F3] tracking-tight uppercase truncate">
              How We Build Digital Products
            </h2>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 font-mono text-[9px] sm:text-[11px] text-[#8A8A8A] shrink-0">
            <span className="text-white font-semibold hidden md:inline-block">{currentStep.label}</span>
            <span className="text-white font-semibold md:hidden">STEP {currentStep.stepNum}/10</span>
            <span className="text-[#444444]">/</span>
            <span className="text-[#38bdf8] font-bold">
              {Math.min(100, Math.round(progress * 100))}% SYNTHESIS
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CENTER STAGE: STUDIO MONITOR WITH EXACTLY 1-BY-1 MERGE ASSEMBLY           */}
        {/* ========================================================================= */}
        <div className="relative my-auto flex flex-col items-center justify-center w-full">
          {/* --------------------------------------------------------------------- */}
          {/* EXACTLY ONE INCOMING ITEM IN FLIGHT (Dissolves immediately at center) */}
          {/* --------------------------------------------------------------------- */}
          {activeFlyData && ActiveFlyIcon && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute z-50 top-1/2 left-1/2 will-change-transform"
              style={{
                transform: `translate(calc(-50% + ${activeFlyData.x}px), calc(-50% + ${activeFlyData.y}px)) scale(${activeFlyData.scale})`,
                opacity: activeFlyData.opacity,
              }}
            >
              <div className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-xl sm:rounded-2xl bg-[#090B10]/95 backdrop-blur-2xl border border-sky-400/50 shadow-[0_20px_60px_rgba(56,189,248,0.35)] min-w-[210px] sm:min-w-[330px] max-w-[88vw] sm:max-w-sm select-none">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shrink-0 shadow-[0_0_15px_rgba(56,189,248,0.3)]">
                  <ActiveFlyIcon className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <span className="text-[7.5px] sm:text-[8.5px] font-mono px-1 sm:px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold uppercase tracking-wider">
                      {activeFlyData.isAbsorbing ? "ABSORBED" : `INJECTING ${activeFlyData.step.stepNum}/10`} &bull; {activeFlyData.step.category}
                    </span>
                  </div>
                  <div className="text-[11px] sm:text-[13px] font-bold text-white tracking-tight truncate">
                    {activeFlyData.step.incomingTitle}
                  </div>
                  <div className="text-[8px] sm:text-[9.5px] font-mono text-[#8E8E8C] truncate">
                    {activeFlyData.step.incomingDetail}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Central Absorption Ripple when item reaches center and dissolves */}
          {activeFlyData?.isAbsorbing && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute z-40 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border border-sky-400/40 bg-sky-400/10 animate-ping opacity-60"
            />
          )}

          {/* --------------------------------------------------------------------- */}
          {/* THE STUDIO DESKTOP MONITOR (Optimized Height, Zero Bottom Cut-off)    */}
          {/* --------------------------------------------------------------------- */}
          <div
            ref={monitorRef}
            className="relative w-full max-w-4xl lg:max-w-[940px] rounded-xl sm:rounded-2xl border border-white/[0.14] bg-[#0A0B0E] shadow-[0_20px_70px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.12)] overflow-hidden transition-all duration-300"
          >
            {/* Browser Top Chrome Header */}
            <div className="flex items-center justify-between px-2.5 sm:px-4 py-1.5 sm:py-2 bg-[#121317] border-b border-white/[0.08] z-30 relative">
              {/* Traffic Lights */}
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#ef4444]/75" />
                <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#eab308]/75" />
                <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#22c55e]/75" />
              </div>

              {/* URL Address Bar */}
              <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-0.5 sm:py-1 rounded-full bg-[#08090C] border border-white/[0.08] text-[9px] sm:text-[10.5px] font-mono text-[#8E8E8C] max-w-[170px] sm:max-w-sm w-full justify-center shadow-inner mx-2">
                <Lock
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0 transition-colors duration-500 ${
                    hasStep9 ? "text-emerald-400" : "text-[#555555]"
                  }`}
                />
                <span className="truncate">
                  https://<span className="text-[#F5F5F3]">edayaajewellery.com</span>
                  {hasStep10 && (
                    <span className="text-emerald-400/90 ml-1 text-[8px] sm:text-[9px]">/live</span>
                  )}
                </span>
              </div>

              {/* Live Status Badge */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                    hasStep10
                      ? "bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse"
                      : "bg-sky-400"
                  }`}
                />
                <span className="hidden sm:inline-block text-[9.5px] font-mono tracking-wider uppercase text-[#E0E0DE] font-semibold">
                  {hasStep10 ? "PRODUCTION LIVE" : "SYNTHESIS ACTIVE"}
                </span>
                <span className="sm:hidden text-[8px] font-mono text-[#E0E0DE] font-semibold">
                  {hasStep10 ? "LIVE" : "ACTIVE"}
                </span>
              </div>
            </div>

            {/* =================================================================== */}
            {/* SCREEN VIEWPORT: EDAYAA JEWELLERY E-COMMERCE STOREFRONT             */}
            {/* Perfectly composed without scroll jumps or bottom empty space       */}
            {/* =================================================================== */}
            <div className="relative h-[295px] sm:h-[380px] lg:h-[420px] bg-[#0E1015] overflow-hidden flex flex-col justify-between font-sans">
              {/* Layer 0: Wireframe Blueprint Grid (Active during 0-5%, fades later) */}
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${
                  hasStep4 ? "opacity-[0.02]" : "opacity-[0.08]"
                }`}
                style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
                  backgroundSize: "20px 20px",
                }}
              />

              {/* Step 1 Wireframe Watermark when completely empty */}
              {!hasStep1 && (
                <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-[#555555]">
                  &lt; INITIALIZING DNS & INFRASTRUCTURE DOMAIN &gt;
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* PINNED TOP: STEP 2 (ANNOUNCEMENT) & STEP 3 (NAVBAR)            */}
              {/* ------------------------------------------------------------- */}
              <div className="relative z-20 shrink-0">
                {/* STEP 2: Top Announcement Bar */}
                <div
                  className={`w-full bg-[#080808] text-white text-[8px] sm:text-[9.5px] font-medium py-0.5 sm:py-1 px-2 sm:px-3 text-center flex items-center justify-between border-b border-white/[0.08] transition-all duration-500 ${
                    hasStep2 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
                  }`}
                >
                  <span className="text-[#666666] text-[8px] hidden sm:inline-block">&lt;</span>
                  <span className="mx-auto truncate tracking-wide">
                    Edayaa Jewellery &bull; Complimentary Express Shipping On All Orders Above ₹999
                  </span>
                  <span className="text-[#666666] text-[8px] hidden sm:inline-block">&gt;</span>
                </div>

                {/* STEP 3: Clean Luxury White Navigation Bar */}
                <div
                  className={`w-full bg-white text-[#111111] px-2.5 sm:px-6 py-1 sm:py-2 flex items-center justify-between shadow-sm transition-all duration-500 ${
                    hasStep3 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
                  }`}
                >
                  {/* Left Navigation Links */}
                  <div className="hidden md:flex items-center gap-4 text-[10.5px] font-medium text-[#222222]">
                    <span className="font-bold text-black border-b border-black pb-0.5">Home</span>
                    <span className="hover:text-black transition-colors">Shop All</span>
                    <span className="hover:text-black transition-colors">Categories</span>
                    <span className="hover:text-black transition-colors">About Us</span>
                  </div>

                  {/* Center Circular Brand Emblem */}
                  <div className="flex items-center gap-1.5 sm:gap-2 mx-auto md:mx-0">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black text-white flex flex-col items-center justify-center text-[5.5px] sm:text-[6.5px] font-serif font-bold tracking-tighter leading-none shadow-sm">
                      <span>EDAYAA</span>
                      <span className="text-[4px] sm:text-[4.5px] text-[#A0A0A0]">92.5 SILVER</span>
                    </div>
                    <span className="text-[11px] sm:text-xs font-serif font-bold tracking-widest uppercase text-black md:hidden">
                      EDAYAA
                    </span>
                  </div>

                  {/* Right Action Icons */}
                  <div className="flex items-center gap-2.5 sm:gap-4 text-[10px] text-[#222222] font-medium">
                    <span className="hidden sm:flex items-center gap-1 hover:text-black cursor-pointer">
                      <Search className="w-3.5 h-3.5" />
                      <span className="hidden lg:inline text-[9px] uppercase">Search</span>
                    </span>
                    <span className="hidden sm:flex items-center gap-1 hover:text-black cursor-pointer">
                      <User className="w-3.5 h-3.5" />
                      <span className="hidden lg:inline text-[9px] uppercase">Account</span>
                    </span>
                    <span className="flex items-center gap-1 relative cursor-pointer">
                      <Heart className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                      {hasStep8 && (
                        <span className="absolute -top-1.5 -right-1.5 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-black text-white text-[7px] sm:text-[7.5px] flex items-center justify-center font-bold">
                          1
                        </span>
                      )}
                      <span className="hidden lg:inline text-[9px] uppercase">Wishlist</span>
                    </span>
                    <span className="flex items-center gap-1 relative cursor-pointer">
                      <ShoppingBag className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                      {hasStep8 && (
                        <span className="absolute -top-1.5 -right-1.5 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-black text-white text-[7px] sm:text-[7.5px] flex items-center justify-center font-bold">
                          1
                        </span>
                      )}
                      <span className="hidden lg:inline text-[9px] uppercase">Cart</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* MIDDLE HERO CANVAS: PHOTOGRAPHY + TYPOGRAPHY + PRODUCTS       */}
              {/* ------------------------------------------------------------- */}
              <div className="relative flex-1 w-full overflow-hidden flex items-center justify-between px-3 sm:px-6 py-1.5 sm:py-2">
                {/* Step 4: Real Lifestyle High-Fashion Jewelry Photography Background */}
                <div
                  className={`absolute inset-0 transition-opacity duration-700 bg-cover ${
                    hasStep4 ? "opacity-100" : "opacity-35"
                  }`}
                  style={{
                    backgroundImage: `linear-gradient(to right, rgba(10, 11, 15, 0.94) 0%, rgba(10, 11, 15, 0.65) 45%, rgba(10, 11, 15, 0.15) 85%, rgba(10, 11, 15, 0.4) 100%), url('https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=1600&auto=format&fit=crop')`,
                    backgroundPosition: "center right",
                  }}
                />

                {/* Subtle Luxury Golden Ambient Glow behind typography */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(245,158,11,0.12),transparent_70%)]"
                />

                {/* Step 5: Hero Editorial Content Layer (Left) */}
                <div className="relative z-10 max-w-[180px] sm:max-w-md space-y-1 sm:space-y-2">
                  <div
                    className={`space-y-0.5 sm:space-y-1 transition-all duration-700 ${
                      hasStep5
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4"
                    }`}
                  >
                    <h3 className="text-sm sm:text-2xl font-serif text-white tracking-tight leading-[1.1]">
                      From workdays to <br />
                      <span className="font-bold tracking-wider uppercase text-white drop-shadow-md">
                        WEEKENDS
                      </span>
                    </h3>
                    <p className="text-[8.5px] sm:text-[11px] text-[#CCCCCC] leading-tight sm:leading-relaxed max-w-xs font-light line-clamp-2 sm:line-clamp-none">
                      discover versatile silver jewellery designed to complement your{" "}
                      <span className="text-[#f59e0b] font-medium">everyday style</span>.
                    </p>
                  </div>

                  <div
                    className={`pt-0.5 transition-all duration-700 ${
                      hasStep5
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4"
                    }`}
                  >
                    <button
                      type="button"
                      className="px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full border border-white/80 hover:bg-white hover:text-black text-white text-[8.5px] sm:text-xs font-semibold tracking-wider uppercase flex items-center gap-1 sm:gap-1.5 transition-all duration-200 shadow-lg active:scale-95"
                    >
                      <span>SHOP NOW</span>
                      <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </button>
                  </div>
                </div>

                {/* Step 7 & 8: Mobile Compact Product Card (< sm) */}
                <div
                  className={`relative z-10 sm:hidden flex flex-col max-w-[115px] transition-all duration-700 ${
                    hasStep7
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 translate-x-4 pointer-events-none"
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-[#0F1116]/95 backdrop-blur-md border border-white/[0.12] shadow-lg flex items-center gap-1.5">
                    <div
                      className="w-7 h-7 rounded-md bg-cover bg-center shrink-0 border border-white/10"
                      style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=300&auto=format&fit=crop')`,
                      }}
                    />
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-[8px] font-bold text-white truncate">
                        Emerald Ring
                      </div>
                      <div className="text-[7.5px] font-mono text-[#f59e0b] font-bold">
                        ₹4,200
                      </div>
                      {hasStep8 && (
                        <div className="text-[6.5px] font-mono text-emerald-400">
                          In Stock ✓
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Step 7 & 8: Featured Bestseller Products Floating Cards (Tablet & Desktop, sm+) */}
                <div
                  className={`relative z-10 hidden sm:flex flex-col gap-2 max-w-[200px] w-full transition-all duration-700 ${
                    hasStep7
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 translate-x-8"
                  }`}
                >
                  {/* Product Card 1 */}
                  <div className="p-2 rounded-xl bg-[#0F1116]/90 backdrop-blur-md border border-white/[0.12] shadow-lg flex items-center gap-2">
                    <div
                      className="w-9 h-9 rounded-lg bg-cover bg-center shrink-0 border border-white/10"
                      style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=300&auto=format&fit=crop')`,
                      }}
                    />
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-[9.5px] font-bold text-white truncate">
                        Vintage Emerald Ring
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] font-mono text-[#f59e0b] font-bold">
                          ₹4,200
                        </span>
                        <span className="text-[7.5px] font-mono text-[#777777] line-through">
                          ₹5,600
                        </span>
                      </div>
                      {hasStep8 && (
                        <div className="text-[8px] font-mono text-emerald-400">
                          In Stock ✓
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Card 2 */}
                  <div className="p-2 rounded-xl bg-[#0F1116]/90 backdrop-blur-md border border-white/[0.12] shadow-lg flex items-center gap-2">
                    <div
                      className="w-9 h-9 rounded-lg bg-cover bg-center shrink-0 border border-white/10"
                      style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=300&auto=format&fit=crop')`,
                      }}
                    />
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-[9.5px] font-bold text-white truncate">
                        Artisan Silver Cuff
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] font-mono text-[#f59e0b] font-bold">
                          ₹6,800
                        </span>
                        <span className="text-[7.5px] flex items-center gap-0.5 text-[#f59e0b]">
                          <Star className="w-2 h-2 fill-current" />
                          5.0
                        </span>
                      </div>
                      {hasStep8 && (
                        <div className="text-[8px] font-mono text-emerald-400">
                          Added to Cart ✓
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* STEP 6: CATEGORIES DOCK PINNED RIGHT AT BOTTOM & CENTERED      */}
              {/* Zero gap below! Exactly matching the reference photo!          */}
              {/* ------------------------------------------------------------- */}
              <div
                className={`relative z-20 w-full bg-gradient-to-t from-black/95 via-black/85 to-black/60 backdrop-blur-md border-t border-white/[0.1] px-1.5 sm:px-4 py-1 sm:py-1.5 transition-all duration-700 shrink-0 ${
                  hasStep6
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4 pointer-events-none"
                }`}
              >
                {/* Responsive Categories: Horizontally Touch-Scrollable on Mobile, Centered on Desktop */}
                <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3.5 md:gap-4.5 overflow-x-auto scrollbar-none mx-auto w-full px-1 touch-pan-x">
                  {JEWELRY_CATEGORIES.map((cat, idx) => (
                    <div
                      key={cat.name}
                      className="flex flex-col items-center gap-0.5 sm:gap-1 shrink-0 group cursor-pointer transition-transform duration-200 hover:-translate-y-0.5"
                    >
                      {/* Squircle Dark Container */}
                      <div className="w-7 h-7 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-lg sm:rounded-xl overflow-hidden bg-black border border-white/15 shadow-md relative group-hover:border-white/40 transition-colors">
                        <div
                          className="w-full h-full bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                          style={{ backgroundImage: `url('${cat.image}')` }}
                        />
                      </div>
                      {/* Centered Label */}
                      <span
                        className={`text-[7px] sm:text-[8.5px] md:text-[9px] font-medium text-[#E0E0DE] group-hover:text-white transition-colors tracking-tight ${
                          idx === 5 ? "underline underline-offset-2" : ""
                        }`}
                      >
                        {cat.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* STEP 9 & 10: BOTTOM SECURITY & PRODUCTION FOOTER STRIP        */}
              {/* ------------------------------------------------------------- */}
              <div
                className={`w-full bg-[#08090C] border-t border-white/[0.08] px-2.5 sm:px-3.5 py-0.5 sm:py-1 flex items-center justify-between text-[7.5px] sm:text-[9px] font-mono z-20 shrink-0 transition-all duration-500 ${
                  hasStep9 ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400 shrink-0" />
                  <span className="text-[#A0A0A0] truncate">
                    100% Insured Delivery &bull; TLS 1.3 Secured
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {hasStep10 ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="hidden sm:inline">100% PRODUCTION LIVE</span>
                      <span className="sm:hidden">LIVE</span>
                    </span>
                  ) : (
                    <span className="text-[#666666] hidden sm:inline">STAGING ENVIRONMENT</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Precision Studio Monitor Aluminum Stand Neck & Pedestal (Compact & Responsive) */}
          <div className="flex flex-col items-center shrink-0">
            {/* Stand Neck */}
            <div className="w-12 sm:w-24 h-2 sm:h-3.5 bg-gradient-to-b from-[#1C1D22] to-[#121316] border-x border-white/[0.1] shadow-sm" />
            {/* Stand Base */}
            <div className="w-24 sm:w-44 h-1 sm:h-1.5 rounded-full bg-gradient-to-r from-[#121316] via-[#22242B] to-[#121316] border border-white/[0.12] shadow-md" />
          </div>
        </div>

        {/* Compact Section Bottom Contextual Summary */}
        <div className="pt-1 sm:pt-1.5 border-t border-white/[0.05] flex items-center justify-between text-left shrink-0">
          <p className="text-[9.5px] sm:text-[11px] text-[#8A8A8A] truncate max-w-sm sm:max-w-xl">
            Watch an artisan e-commerce platform materialize: from domain architecture to luxury photography, jewelry categories, product catalog, and production release.
          </p>

          <div className="hidden sm:flex items-center gap-1.5 text-[9.5px] font-mono text-[#CCCCCC]">
            <span className="px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.06]">
              Next.js 14
            </span>
            <span className="px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.06]">
              PostgreSQL
            </span>
            <span className="px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.06]">
              Edge CDN
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
