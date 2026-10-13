"use client";

import React, { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, isReducedMotion } from "@/components/animations/gsap-core";
import {
  Lock,
  ShoppingBag,
  Heart,
  Search,
  User,
  Menu,
  Star,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Monitor,
  Smartphone,
  Mouse,
  ChevronDown,
} from "lucide-react";

interface StepConfig {
  stepNum: number;
  id: string;
  label: string;
  detail: string;
  threshold: number;
}

const ASSEMBLY_STEPS: StepConfig[] = [
  {
    stepNum: 1,
    id: "navbar",
    label: "Navbar",
    detail: "Brand emblem, menu links, search & cart anchors",
    threshold: 0.08,
  },
  {
    stepNum: 2,
    id: "categories",
    label: "Categories",
    detail: "Curated jewelry collections & visual squircles",
    threshold: 0.24,
  },
  {
    stepNum: 3,
    id: "hero",
    label: "Hero Section",
    detail: "Luxury jewelry photography, headline & call to action",
    threshold: 0.42,
  },
  {
    stepNum: 4,
    id: "products",
    label: "Bestseller Products",
    detail: "Handcrafted silver cards with live pricing & stock",
    threshold: 0.60,
  },
  {
    stepNum: 5,
    id: "testimonial",
    label: "Testimonials",
    detail: "Verified buyer reviews, 5-star rating & social proof",
    threshold: 0.78,
  },
  {
    stepNum: 6,
    id: "footer",
    label: "Footer & Launch",
    detail: "Brand credentials, guarantees & secure payment gateways",
    threshold: 0.92,
  },
];

// Artisan Jewelry Categories for Edayaa
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
];

// Curated Products in "mast design"
const BESTSELLER_PRODUCTS = [
  {
    id: 1,
    name: "Vintage Emerald Solitaire Ring",
    price: "₹4,200",
    originalPrice: "₹5,600",
    rating: "4.9",
    badge: "Bestseller",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Artisan Filigree Silver Cuff",
    price: "₹6,800",
    originalPrice: "₹8,500",
    rating: "5.0",
    badge: "Handcrafted",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Baroque Pearl Silver Pendant",
    price: "₹5,400",
    originalPrice: "₹6,900",
    rating: "4.8",
    badge: "Limited",
    badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Celestial Silver Motif Studs",
    price: "₹3,900",
    originalPrice: "₹4,999",
    rating: "4.9",
    badge: "Trending",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=400&auto=format&fit=crop",
  },
];

export function HowWeBuildSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const deviceWrapperRef = useRef<HTMLDivElement | null>(null);

  // Scroll progress from 0 to 1
  const [progress, setProgress] = useState(0);

  // Responsive device view: desktop monitor or mobile phone
  const [deviceView, setDeviceView] = useState<"desktop" | "mobile">("desktop");

  // Measured scroll boundaries to prevent ANY blank space at bottom
  const desktopViewportRef = useRef<HTMLDivElement | null>(null);
  const desktopScrollContainerRef = useRef<HTMLDivElement | null>(null);
  const mobileViewportRef = useRef<HTMLDivElement | null>(null);
  const mobileScrollContainerRef = useRef<HTMLDivElement | null>(null);

  const [desktopMaxScroll, setDesktopMaxScroll] = useState(420);
  const [mobileMaxScroll, setMobileMaxScroll] = useState(440);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const updateDevice = () => {
        setDeviceView(window.innerWidth < 768 ? "mobile" : "desktop");
      };
      updateDevice();
      window.addEventListener("resize", updateDevice);
      return () => window.removeEventListener("resize", updateDevice);
    }
  }, []);

  // Strict step thresholds
  const hasNavbar = progress >= 0.08;
  const hasCategories = progress >= 0.24;
  const hasHero = progress >= 0.42;
  const hasProducts = progress >= 0.60;
  const hasTestimonial = progress >= 0.78;
  const hasFooter = progress >= 0.92;

  const currentStep =
    [...ASSEMBLY_STEPS].reverse().find((s) => progress >= s.threshold) || ASSEMBLY_STEPS[0];

  // Dynamically update scroll bounds so the bottom of the content aligns flush with the viewport bottom
  useEffect(() => {
    const updateBounds = () => {
      if (desktopScrollContainerRef.current && desktopViewportRef.current) {
        const sH = desktopScrollContainerRef.current.scrollHeight;
        const vH = desktopViewportRef.current.clientHeight;
        setDesktopMaxScroll(Math.max(0, sH - vH));
      }
      if (mobileScrollContainerRef.current && mobileViewportRef.current) {
        const sH = mobileScrollContainerRef.current.scrollHeight;
        const vH = mobileViewportRef.current.clientHeight;
        setMobileMaxScroll(Math.max(0, sH - vH));
      }
    };

    updateBounds();
    const t1 = setTimeout(updateBounds, 150);
    const t2 = setTimeout(updateBounds, 600);
    window.addEventListener("resize", updateBounds);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", updateBounds);
    };
  }, [deviceView, progress, hasNavbar, hasCategories, hasHero, hasProducts, hasTestimonial, hasFooter]);

  useGSAP(
    () => {
      if (!triggerRef.current || isReducedMotion()) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerRef.current,
          start: "top top",
          end: "+=1200",
          pin: true,
          scrub: 0.35,
          onUpdate: (self) => {
            setProgress(self.progress);
          },
        },
      });

      // Subtle scale settling on enter
      if (deviceWrapperRef.current) {
        tl.fromTo(
          deviceWrapperRef.current,
          { scale: 0.97 },
          { scale: 1, ease: "none" },
          0
        );
      }
    },
    { scope: sectionRef }
  );

  // Exact clamp scroll translation: Content touches the bottom of the screen at the end with ZERO blank space!
  const isMobile = deviceView === "mobile";
  const activeMaxScroll = isMobile ? mobileMaxScroll : desktopMaxScroll;

  const getScrollY = (p: number, maxScroll: number) => {
    if (maxScroll <= 0 || p < 0.42) return 0;
    if (p < 0.60) {
      // Smoothly reveal Products
      const t = (p - 0.42) / (0.60 - 0.42);
      return t * (maxScroll * 0.42);
    }
    if (p < 0.78) {
      // Smoothly reveal Testimonial
      const t = (p - 0.60) / (0.78 - 0.60);
      const start = maxScroll * 0.42;
      const end = maxScroll * 0.76;
      return start + t * (end - start);
    }
    // Reveal Footer and dock exactly flush at bottom (Zero empty space below)
    const t = Math.min(1, (p - 0.78) / (0.92 - 0.78));
    const start = maxScroll * 0.76;
    const end = maxScroll;
    return Math.min(maxScroll, start + t * (end - start));
  };

  const internalScrollY = getScrollY(progress, activeMaxScroll);
  const scrollThumbTop = activeMaxScroll > 0 ? (internalScrollY / activeMaxScroll) * 75 : 0;

  return (
    <section
      ref={sectionRef}
      className="relative w-full border-y border-white/[0.06] bg-[#07080A] text-left select-none overflow-hidden"
    >
      {/* Pinned Scroll Container */}
      <div
        ref={triggerRef}
        className="relative w-full h-screen max-h-[920px] flex flex-col justify-between py-2 sm:py-3 px-2 sm:px-6 max-w-6xl mx-auto"
      >
        {/* ===================================================================== */}
        {/* TOP STATUS HEADER BAR: Clean & Professional without flying elements    */}
        {/* ===================================================================== */}
        <div className="flex items-center justify-between gap-2 sm:gap-3 pb-1.5 sm:pb-2 border-b border-white/[0.06] shrink-0">
          {/* Left Title */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] shrink-0" />
            <span className="hidden sm:inline-block text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-[#8A8A8A] font-mono shrink-0">
              SIGNATURE PROCESS / 02
            </span>
            <span className="hidden sm:inline-block text-white/20">|</span>
            <h2 className="text-[11px] sm:text-sm font-bold text-[#F5F5F3] tracking-tight uppercase truncate">
              How We Build Digital Products
            </h2>
          </div>

          {/* Right Controls: Step Tracker + Responsive Device Switcher */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0 font-mono text-[9px] sm:text-[11px]">
            {/* Device Switcher Toggle (Desktop / Mobile) */}
            <div className="flex items-center gap-0.5 bg-[#101217] p-0.5 sm:p-1 rounded-lg border border-white/[0.08]">
              <button
                type="button"
                onClick={() => setDeviceView("desktop")}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[9px] sm:text-[10px] transition-all ${
                  deviceView === "desktop"
                    ? "bg-sky-500/20 text-sky-300 font-bold border border-sky-400/30 shadow-[0_0_10px_rgba(56,189,248,0.2)]"
                    : "text-[#888888] hover:text-white"
                }`}
                title="View Desktop Site"
              >
                <Monitor className="w-3 h-3" />
                <span className="hidden md:inline">Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setDeviceView("mobile")}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[9px] sm:text-[10px] transition-all ${
                  deviceView === "mobile"
                    ? "bg-sky-500/20 text-sky-300 font-bold border border-sky-400/30 shadow-[0_0_10px_rgba(56,189,248,0.2)]"
                    : "text-[#888888] hover:text-white"
                }`}
                title="View Mobile Site"
              >
                <Smartphone className="w-3 h-3" />
                <span className="hidden md:inline">Mobile</span>
              </button>
            </div>

            {/* Current Step Pill */}
            <div className="flex items-center gap-1 sm:gap-2">
              {progress < 0.12 && (
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-300 font-mono text-[9.5px] font-bold tracking-wider uppercase animate-pulse">
                  <Mouse className="w-3 h-3 text-sky-400" />
                  <span>Scroll &darr;</span>
                </span>
              )}
              <span className="px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.1] text-white font-semibold">
                STEP {currentStep.stepNum}/6 &bull; {currentStep.label}
              </span>
              <span className="text-[#38bdf8] font-bold">
                {Math.min(100, Math.round(progress * 100))}%
              </span>
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* CENTER STAGE: THE DEVICE SCREEN (DESKTOP MONITOR OR MOBILE PHONE)     */}
        {/* All items appear inside the screen sequentially as user scrolls        */}
        {/* ===================================================================== */}
        <div
          ref={deviceWrapperRef}
          className="relative my-auto flex flex-col items-center justify-center w-full transition-all duration-500"
        >
          {deviceView === "desktop" ? (
            /* ================================================================= */
            /* 1. DESKTOP MONITOR MOCKUP                                         */
            /* ================================================================= */
            <div className="relative w-full max-w-4xl lg:max-w-[940px] rounded-xl sm:rounded-2xl border border-white/[0.14] bg-[#0A0B0E] shadow-[0_25px_80px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.12)] overflow-hidden transition-all duration-300">
              {/* Browser Chrome Header */}
              <div className="flex items-center justify-between px-3 sm:px-4 py-1.5 sm:py-2 bg-[#121317] border-b border-white/[0.08] z-30 relative">
                {/* Traffic Lights */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]/75" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]/75" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]/75" />
                </div>

                {/* URL Address Bar */}
                <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-0.5 sm:py-1 rounded-full bg-[#08090C] border border-white/[0.08] text-[9.5px] sm:text-[10.5px] font-mono text-[#8E8E8C] max-w-[220px] sm:max-w-sm w-full justify-center shadow-inner mx-2">
                  <Lock
                    className={`w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0 transition-colors duration-500 ${
                      hasFooter ? "text-emerald-400" : "text-[#555555]"
                    }`}
                  />
                  <span className="truncate">
                    https://<span className="text-[#F5F5F3]">edayaajewellery.com</span>
                    {hasFooter && (
                      <span className="text-emerald-400/90 ml-1 text-[8.5px] sm:text-[9.5px]">/live</span>
                    )}
                  </span>
                </div>

                {/* Live Status Badge */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                      hasFooter
                        ? "bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse"
                        : "bg-sky-400"
                    }`}
                  />
                  <span className="hidden sm:inline-block text-[9.5px] font-mono tracking-wider uppercase text-[#E0E0DE] font-semibold">
                    {hasFooter ? "PRODUCTION LIVE" : "SYNTHESIS ACTIVE"}
                  </span>
                  <span className="sm:hidden text-[8px] font-mono text-[#E0E0DE] font-semibold">
                    {hasFooter ? "LIVE" : "ACTIVE"}
                  </span>
                </div>
              </div>

              {/* Viewport Screen with Internal Scroll */}
              <div
                ref={desktopViewportRef}
                className="relative h-[320px] sm:h-[390px] lg:h-[430px] bg-[#0E1015] overflow-hidden font-sans"
              >
                {/* Blueprint Background Grid for empty state */}
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${
                    hasHero ? "opacity-[0.02]" : "opacity-[0.08]"
                  }`}
                  style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
                    backgroundSize: "20px 20px",
                  }}
                />

                {/* Empty State Banner before Step 1 */}
                {!hasNavbar && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center font-mono text-xs text-[#777777] gap-3 z-30 p-4 text-center">
                    <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-400/30 text-sky-400 shadow-[0_0_25px_rgba(56,189,248,0.2)]">
                      <Mouse className="w-5 h-5 animate-pulse" />
                      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500" />
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-white font-bold tracking-wider uppercase text-xs block">
                        Interactive Storefront Assembly
                      </span>
                      <span className="text-[11px] text-sky-300 font-semibold flex items-center justify-center gap-1.5 animate-bounce">
                        <span>Scroll down to construct website</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                )}

                {/* Custom Realistic Scrollbar on Right */}
                {hasNavbar && (
                  <div className="absolute right-1 top-2 bottom-2 w-1 rounded-full bg-white/[0.05] z-40 pointer-events-none">
                    <div
                      className="w-full bg-white/30 rounded-full transition-all duration-100"
                      style={{
                        height: "25%",
                        transform: `translateY(${scrollThumbTop}%)`,
                      }}
                    />
                  </div>
                )}

                {/* Smooth Scrolling Canvas Container */}
                <div
                  ref={desktopScrollContainerRef}
                  className="w-full transition-transform duration-150 ease-out flex flex-col"
                  style={{
                    transform: `translateY(-${internalScrollY}px)`,
                  }}
                >
                  {/* ----------------------------------------------------------- */}
                  {/* STEP 1: NAVBAR (Announcement bar + Luxury White Navigation) */}
                  {/* ----------------------------------------------------------- */}
                  <div
                    className={`w-full transition-all duration-700 ${
                      hasNavbar
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 -translate-y-6 pointer-events-none"
                    }`}
                  >
                    {/* Announcement Ribbon */}
                    <div className="w-full bg-[#080808] text-white text-[8px] sm:text-[9.5px] font-medium py-1 px-4 text-center flex items-center justify-between border-b border-white/[0.08]">
                      <span className="text-[#666666] text-[8px] hidden sm:inline">&lt;</span>
                      <span className="mx-auto truncate tracking-wide">
                        Edayaa Jewellery &bull; Complimentary Express Shipping On All Orders Above ₹999 &bull; Pure 92.5 Silver
                      </span>
                      <span className="text-[#666666] text-[8px] hidden sm:inline">&gt;</span>
                    </div>

                    {/* Clean Luxury White Navigation Bar */}
                    <div className="w-full bg-white text-[#111111] px-4 sm:px-6 py-2 flex items-center justify-between shadow-sm border-b border-black/[0.06]">
                      {/* Left Links */}
                      <div className="flex items-center gap-4 text-[11px] font-medium text-[#222222]">
                        <span className="font-bold text-black border-b-2 border-black pb-0.5">Home</span>
                        <span className="hover:text-black transition-colors hidden sm:inline">Shop All</span>
                        <span className="hover:text-black transition-colors hidden sm:inline">Collections</span>
                        <span className="hover:text-black transition-colors hidden md:inline">About Us</span>
                      </div>

                      {/* Center Brand Emblem */}
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black text-white flex flex-col items-center justify-center text-[6px] sm:text-[7px] font-serif font-bold tracking-tighter leading-none shadow-sm">
                          <span>EDAYAA</span>
                          <span className="text-[4px] text-[#A0A0A0]">92.5 SILVER</span>
                        </div>
                        <span className="text-xs sm:text-sm font-serif font-bold tracking-widest uppercase text-black">
                          EDAYAA
                        </span>
                      </div>

                      {/* Right Action Icons */}
                      <div className="flex items-center gap-3 sm:gap-4 text-[11px] text-[#222222] font-medium">
                        <span className="hidden sm:flex items-center gap-1 cursor-pointer">
                          <Search className="w-3.5 h-3.5" />
                          <span className="hidden lg:inline text-[9px] uppercase">Search</span>
                        </span>
                        <span className="hidden sm:flex items-center gap-1 cursor-pointer">
                          <User className="w-3.5 h-3.5" />
                        </span>
                        <span className="flex items-center gap-1 relative cursor-pointer">
                          <Heart className="w-3.5 h-3.5" />
                          <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-black text-white text-[7.5px] flex items-center justify-center font-bold">
                            1
                          </span>
                        </span>
                        <span className="flex items-center gap-1 relative cursor-pointer">
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-black text-white text-[7.5px] flex items-center justify-center font-bold">
                            1
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ----------------------------------------------------------- */}
                  {/* STEP 2: CATEGORIES (Artisan Jewelry Squircles)              */}
                  {/* ----------------------------------------------------------- */}
                  <div
                    className={`w-full bg-[#0B0C10] border-b border-white/[0.08] px-3 sm:px-6 py-2 transition-all duration-700 ${
                      hasCategories
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-95 pointer-events-none"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-5 overflow-x-auto scrollbar-none w-full">
                      {JEWELRY_CATEGORIES.map((cat, idx) => (
                        <div
                          key={cat.name}
                          className="flex flex-col items-center gap-1 shrink-0 group cursor-pointer transition-transform duration-200 hover:-translate-y-0.5"
                        >
                          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl overflow-hidden bg-black border border-white/15 shadow-md relative group-hover:border-white/40 transition-colors">
                            <div
                              className="w-full h-full bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                              style={{ backgroundImage: `url('${cat.image}')` }}
                            />
                          </div>
                          <span
                            className={`text-[8.5px] sm:text-[9.5px] font-medium text-[#D0D0CE] group-hover:text-white transition-colors tracking-tight ${
                              idx === 3 ? "underline underline-offset-2 text-white" : ""
                            }`}
                          >
                            {cat.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ----------------------------------------------------------- */}
                  {/* STEP 3: HERO SECTION (Jewelry Background + Typography + CTA) */}
                  {/* ----------------------------------------------------------- */}
                  <div
                    className={`relative w-full h-[230px] sm:h-[270px] overflow-hidden flex items-center px-4 sm:px-8 transition-all duration-700 ${
                      hasHero
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-6 pointer-events-none"
                    }`}
                  >
                    {/* Rich High-Fashion Jewelry Photography Background */}
                    <div
                      className="absolute inset-0 bg-cover bg-right sm:bg-center"
                      style={{
                        backgroundImage: `linear-gradient(to right, rgba(10, 11, 15, 0.95) 0%, rgba(10, 11, 15, 0.7) 45%, rgba(10, 11, 15, 0.2) 85%, rgba(10, 11, 15, 0.5) 100%), url('https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=1600&auto=format&fit=crop')`,
                      }}
                    />

                    {/* Ambient Glow */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(245,158,11,0.15),transparent_70%)]"
                    />

                    {/* Hero Typography & CTA */}
                    <div className="relative z-10 max-w-md space-y-1.5 sm:space-y-2">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[8px] sm:text-[9px] font-mono font-bold tracking-wider uppercase">
                        <span>✦ 92.5 STERLING SILVER COLLECTION</span>
                      </div>

                      <h3 className="text-base sm:text-2xl font-serif text-white tracking-tight leading-[1.1]">
                        From workdays to <br />
                        <span className="font-bold tracking-wider uppercase text-amber-300 drop-shadow-md">
                          WEEKENDS
                        </span>
                      </h3>

                      <p className="text-[9px] sm:text-[11px] text-[#CCCCCC] leading-relaxed max-w-xs font-light">
                        discover versatile silver jewellery designed to complement your{" "}
                        <span className="text-amber-300 font-medium">everyday style</span>.
                      </p>

                      <div className="pt-1 flex items-center gap-2">
                        <button
                          type="button"
                          className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-white text-black text-[9px] sm:text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-lg hover:bg-neutral-200 transition-all"
                        >
                          <span>SHOP NOW</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        <span className="text-[8px] sm:text-[9px] text-[#888888] font-mono">
                          BIS Hallmarked &bull; Lifetime Exchange
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ----------------------------------------------------------- */}
                  {/* STEP 4: NICHE PRODUCTS (Bestsellers in "mast design")        */}
                  {/* ----------------------------------------------------------- */}
                  <div
                    className={`w-full bg-[#0A0B0E] px-4 sm:px-6 py-4 border-t border-white/[0.08] transition-all duration-700 ${
                      hasProducts
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-8 pointer-events-none"
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.06]">
                      <div>
                        <span className="text-[8px] sm:text-[9px] font-mono text-amber-400 uppercase tracking-widest font-bold">
                          ✦ CURATED BESTSELLERS
                        </span>
                        <h4 className="text-xs sm:text-sm font-serif font-bold text-white tracking-tight">
                          Handcrafted Pure Silver Masterpieces
                        </h4>
                      </div>
                      <span className="text-[8.5px] font-mono text-sky-400 cursor-pointer hover:underline">
                        View All (24) →
                      </span>
                    </div>

                    {/* 4 Bestseller Cards Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                      {BESTSELLER_PRODUCTS.map((prod) => (
                        <div
                          key={prod.id}
                          className="group relative rounded-xl bg-[#111318] border border-white/[0.1] p-2 flex flex-col justify-between hover:border-white/30 transition-all duration-300 shadow-md"
                        >
                          <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-black mb-1.5">
                            <div
                              className="w-full h-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                              style={{ backgroundImage: `url('${prod.image}')` }}
                            />
                            <span
                              className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[7px] font-mono font-bold uppercase border ${prod.badgeColor}`}
                            >
                              {prod.badge}
                            </span>
                            <button
                              type="button"
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white"
                            >
                              <Heart className="w-2.5 h-2.5" />
                            </button>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[7.5px] text-[#888888] font-mono">
                              <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                                <Star className="w-2 h-2 fill-current" />
                                {prod.rating}
                              </span>
                              <span>92.5 Silver</span>
                            </div>
                            <h5 className="text-[9.5px] sm:text-[10.5px] font-semibold text-white truncate">
                              {prod.name}
                            </h5>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] sm:text-[11px] font-bold text-amber-300 font-mono">
                                {prod.price}
                              </span>
                              <span className="text-[8px] font-mono text-[#666666] line-through">
                                {prod.originalPrice}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            className="mt-2 w-full py-1 rounded-md bg-white/[0.08] hover:bg-white hover:text-black text-white text-[8px] sm:text-[9px] font-bold tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-1"
                          >
                            <ShoppingBag className="w-2.5 h-2.5" />
                            <span>Add to Bag</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ----------------------------------------------------------- */}
                  {/* STEP 5: TESTIMONIAL (Client Review & Social Proof)          */}
                  {/* ----------------------------------------------------------- */}
                  <div
                    className={`w-full bg-gradient-to-b from-[#0A0B0E] to-[#12141C] px-4 sm:px-6 py-4 border-t border-white/[0.08] transition-all duration-700 ${
                      hasTestimonial
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-8 pointer-events-none"
                    }`}
                  >
                    <div className="max-w-2xl mx-auto rounded-xl bg-[#090A0E] border border-amber-400/20 p-3 sm:p-4 shadow-xl">
                      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                        <div className="flex items-center gap-1 text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                          <span className="text-[9px] font-mono text-white font-bold ml-1">
                            5.0 / 5.0
                          </span>
                        </div>
                        <span className="text-[8px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle className="w-2.5 h-2.5" />
                          Verified Buyer Review
                        </span>
                      </div>

                      <p className="py-2 text-[10px] sm:text-[11.5px] text-[#E0E0DE] font-serif italic leading-relaxed">
                        &ldquo;The craftsmanship on the 92.5 silver necklace is breathtaking. Looks even more stunning in person than on screen. Delivery was within 48 hours and packaging was pure luxury!&rdquo;
                      </p>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full bg-cover bg-center border border-white/20"
                            style={{
                              backgroundImage: `url('https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop')`,
                            }}
                          />
                          <div>
                            <div className="text-[9.5px] font-bold text-white">Ananya Sharma</div>
                            <div className="text-[7.5px] font-mono text-[#888888]">Mumbai, India</div>
                          </div>
                        </div>

                        <div className="text-[8px] font-mono text-[#AAAAAA] hidden sm:block">
                          Loved By 25,000+ Patrons Across India
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ----------------------------------------------------------- */}
                  {/* STEP 6: FOOTER (Brand Info, Links, Guarantees & Gateways)   */}
                  {/* ----------------------------------------------------------- */}
                  <div
                    className={`w-full bg-[#060709] border-t border-white/[0.08] px-4 sm:px-6 py-4 pb-6 text-[#888888] transition-all duration-700 ${
                      hasFooter
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-8 pointer-events-none"
                    }`}
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pb-3 border-b border-white/[0.06] text-[8.5px] sm:text-[9.5px]">
                      {/* Col 1 */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-white font-bold">
                          <div className="w-4 h-4 rounded-full bg-white text-black flex items-center justify-center text-[5px] font-serif font-bold">
                            E
                          </div>
                          <span>EDAYAA JEWELLERY</span>
                        </div>
                        <p className="text-[8px] leading-tight text-[#666666]">
                          Pure 92.5 Sterling Silver crafted for contemporary royalty.
                        </p>
                      </div>

                      {/* Col 2 */}
                      <div className="space-y-1">
                        <div className="text-white font-semibold">Collections</div>
                        <div className="space-y-0.5 text-[8px]">
                          <div>Solitaire Rings</div>
                          <div>Artisan Necklaces</div>
                          <div>Silver Bangles</div>
                        </div>
                      </div>

                      {/* Col 3 */}
                      <div className="space-y-1">
                        <div className="text-white font-semibold">Customer Care</div>
                        <div className="space-y-0.5 text-[8px]">
                          <div>Track Order</div>
                          <div>Lifetime Exchange</div>
                          <div>Silver Care Guide</div>
                        </div>
                      </div>

                      {/* Col 4 */}
                      <div className="space-y-1">
                        <div className="text-white font-semibold">Security</div>
                        <div className="text-[8px] text-emerald-400 flex items-center gap-1">
                          <ShieldCheck className="w-2.5 h-2.5" />
                          <span>100% Insured Delivery</span>
                        </div>
                        <div className="text-[7.5px] text-[#666666]">
                          Razorpay &bull; UPI &bull; TLS 1.3
                        </div>
                      </div>
                    </div>

                    {/* Bottom Copyright Strip */}
                    <div className="pt-2 flex items-center justify-between text-[7.5px] sm:text-[8.5px] font-mono">
                      <span>&copy; 2026 Edayaa Jewellery Ltd. All Rights Reserved.</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        100% PRODUCTION LIVE
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ================================================================= */
            /* 2. MOBILE PHONE MOCKUP (iPhone 16 Pro Style)                      */
            /* ================================================================= */
            <div className="relative w-full max-w-[310px] sm:max-w-[340px] rounded-[40px] border-[3.5px] border-[#2A2D35] bg-[#0A0B0E] shadow-[0_25px_80px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.18)] p-2 transition-all duration-300">
              {/* Dynamic Island Pill at Top */}
              <div className="relative rounded-[32px] overflow-hidden bg-[#0A0B0E] border border-white/[0.08]">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 flex items-center justify-between px-3 w-28 h-5 rounded-full bg-black border border-white/10 shadow-md">
                  <div className="w-2 h-2 rounded-full bg-[#1C1D22] border border-white/20" />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
                </div>

                {/* Mobile Screen Viewport with Measured Bounds */}
                <div
                  ref={mobileViewportRef}
                  className="relative h-[450px] sm:h-[490px] overflow-hidden font-sans pt-7 bg-[#0A0B0E]"
                >
                  {/* Blueprint Background Grid for empty state */}
                  <div
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${
                      hasHero ? "opacity-[0.02]" : "opacity-[0.08]"
                    }`}
                    style={{
                      backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
                      backgroundSize: "20px 20px",
                    }}
                  />

                  {/* Empty State Banner */}
                  {!hasNavbar && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center font-mono text-[10px] text-[#777777] gap-3 px-4 text-center z-30">
                      <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-400/30 text-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.2)]">
                        <Mouse className="w-4 h-4 animate-pulse" />
                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-white font-bold tracking-wider uppercase text-[11px] block">
                          Mobile Storefront
                        </span>
                        <span className="text-[9.5px] text-sky-300 font-semibold flex items-center justify-center gap-1 animate-bounce">
                          <span>Scroll down to assemble</span>
                          <ChevronDown className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Custom Mobile Scrollbar */}
                  {hasNavbar && (
                    <div className="absolute right-1 top-8 bottom-3 w-0.5 rounded-full bg-white/[0.05] z-40 pointer-events-none">
                      <div
                        className="w-full bg-white/30 rounded-full transition-all duration-100"
                        style={{
                          height: "25%",
                          transform: `translateY(${scrollThumbTop}%)`,
                        }}
                      />
                    </div>
                  )}

                  {/* Smooth Scrolling Canvas Container with min-h-full to prevent empty gaps */}
                  <div
                    ref={mobileScrollContainerRef}
                    className="w-full transition-transform duration-150 ease-out flex flex-col min-h-full"
                    style={{
                      transform: `translateY(-${internalScrollY}px)`,
                    }}
                  >
                    {/* --------------------------------------------------------- */}
                    {/* STEP 1: MOBILE NAVBAR                                     */}
                    {/* --------------------------------------------------------- */}
                    <div
                      className={`w-full transition-all duration-700 shrink-0 ${
                        hasNavbar
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 -translate-y-6 pointer-events-none"
                      }`}
                    >
                      {/* Mobile Top Announcement */}
                      <div className="w-full bg-black text-white text-[7px] font-medium py-1 px-2 text-center truncate border-b border-white/[0.08]">
                        Edayaa &bull; Free Shipping Above ₹999 &bull; 92.5 Silver
                      </div>

                      {/* Mobile White Navbar */}
                      <div className="w-full bg-white text-[#111111] px-3 py-2 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-2">
                          <Menu className="w-3.5 h-3.5 cursor-pointer text-black" />
                          <Search className="w-3 h-3 cursor-pointer text-[#444444]" />
                        </div>

                        {/* Center Logo */}
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-black text-white flex flex-col items-center justify-center text-[5px] font-serif font-bold">
                            E
                          </div>
                          <span className="text-[11px] font-serif font-bold tracking-widest text-black">
                            EDAYAA
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Heart className="w-3.5 h-3.5 cursor-pointer text-[#444444]" />
                          <div className="relative cursor-pointer">
                            <ShoppingBag className="w-3.5 h-3.5 text-black" />
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-black text-white text-[6px] flex items-center justify-center font-bold">
                              1
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* --------------------------------------------------------- */}
                    {/* STEP 2: MOBILE CATEGORIES SCROLL ROW                      */}
                    {/* --------------------------------------------------------- */}
                    <div
                      className={`w-full bg-[#0C0D12] border-b border-white/[0.08] px-2 py-2 transition-all duration-700 shrink-0 ${
                        hasCategories
                          ? "opacity-100 scale-100"
                          : "opacity-0 scale-95 pointer-events-none"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-none px-1">
                        {JEWELRY_CATEGORIES.slice(0, 6).map((cat) => (
                          <div key={cat.name} className="flex flex-col items-center gap-1 shrink-0">
                            <div className="w-9 h-9 rounded-xl overflow-hidden bg-black border border-white/15">
                              <div
                                className="w-full h-full bg-cover bg-center"
                                style={{ backgroundImage: `url('${cat.image}')` }}
                              />
                            </div>
                            <span className="text-[7.5px] font-medium text-[#C0C0BE] tracking-tight">
                              {cat.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* --------------------------------------------------------- */}
                    {/* STEP 3: MOBILE HERO SECTION (Immersive Height)             */}
                    {/* --------------------------------------------------------- */}
                    <div
                      className={`relative w-full h-[290px] sm:h-[330px] overflow-hidden flex flex-col justify-end p-4 pb-5 transition-all duration-700 shrink-0 ${
                        hasHero
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-6 pointer-events-none"
                      }`}
                    >
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                          backgroundImage: `linear-gradient(to top, rgba(10, 11, 15, 0.98) 0%, rgba(10, 11, 15, 0.65) 50%, rgba(10, 11, 15, 0.25) 100%), url('https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=1600&auto=format&fit=crop')`,
                        }}
                      />

                      <div className="relative z-10 space-y-1.5 max-w-[220px]">
                        <span className="text-[7px] font-mono text-amber-300 font-bold uppercase tracking-wider">
                          ✦ 92.5 STERLING SILVER
                        </span>
                        <h3 className="text-sm sm:text-base font-serif text-white leading-tight">
                          From workdays to <br />
                          <span className="text-amber-300 font-bold uppercase text-base sm:text-lg">
                            WEEKENDS
                          </span>
                        </h3>
                        <p className="text-[7.5px] sm:text-[8px] text-[#D0D0CE] leading-relaxed">
                          discover versatile silver jewellery designed to complement your everyday style.
                        </p>
                        <div className="pt-1 flex items-center gap-2">
                          <button
                            type="button"
                            className="px-3 py-1 rounded-full bg-white text-black text-[7.5px] sm:text-[8px] font-bold tracking-wider uppercase flex items-center gap-1 shadow-md"
                          >
                            <span>SHOP NOW</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                          <span className="text-[7px] text-[#888888] font-mono">
                            BIS Hallmarked
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* --------------------------------------------------------- */}
                    {/* STEP 4: MOBILE PRODUCTS GRID (2-Column Cards)             */}
                    {/* --------------------------------------------------------- */}
                    <div
                      className={`w-full bg-[#0A0B0E] p-3 border-t border-white/[0.08] transition-all duration-700 shrink-0 ${
                        hasProducts
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-8 pointer-events-none"
                      }`}
                    >
                      <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-white/[0.06]">
                        <span className="text-[8px] font-mono text-amber-400 font-bold uppercase">
                          ✦ CURATED BESTSELLERS
                        </span>
                        <span className="text-[7px] font-mono text-sky-400">View All →</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {BESTSELLER_PRODUCTS.slice(0, 4).map((prod) => (
                          <div
                            key={prod.id}
                            className="rounded-lg bg-[#111318] border border-white/[0.1] p-1.5 flex flex-col justify-between"
                          >
                            <div className="relative aspect-square w-full rounded-md overflow-hidden bg-black mb-1">
                              <div
                                className="w-full h-full bg-cover bg-center"
                                style={{ backgroundImage: `url('${prod.image}')` }}
                              />
                              <span
                                className={`absolute top-0.5 left-0.5 px-1 py-0.5 rounded text-[6px] font-mono font-bold uppercase border ${prod.badgeColor}`}
                              >
                                {prod.badge}
                              </span>
                            </div>

                            <div className="space-y-0.5">
                              <h5 className="text-[8px] font-semibold text-white truncate">
                                {prod.name}
                              </h5>
                              <div className="flex items-center gap-1">
                                <span className="text-[8.5px] font-bold text-amber-300 font-mono">
                                  {prod.price}
                                </span>
                                <span className="text-[7px] font-mono text-[#666666] line-through">
                                  {prod.originalPrice}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              className="mt-1 w-full py-0.5 rounded bg-white/[0.08] text-white text-[7px] font-bold tracking-wider uppercase flex items-center justify-center gap-1"
                            >
                              <ShoppingBag className="w-2 h-2" />
                              <span>Add</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* --------------------------------------------------------- */}
                    {/* STEP 5: MOBILE TESTIMONIAL                                */}
                    {/* --------------------------------------------------------- */}
                    <div
                      className={`w-full bg-[#0C0E14] p-3 border-t border-white/[0.08] transition-all duration-700 shrink-0 ${
                        hasTestimonial
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-8 pointer-events-none"
                      }`}
                    >
                      <div className="rounded-lg bg-[#08090C] border border-amber-400/20 p-2.5 space-y-1.5">
                        <div className="flex items-center justify-between text-amber-400">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-2.5 h-2.5 fill-current" />
                            ))}
                          </div>
                          <span className="text-[7px] font-mono text-emerald-400 font-bold">
                            Verified Buyer ✓
                          </span>
                        </div>
                        <p className="text-[8px] text-[#D0D0CE] font-serif italic leading-snug">
                          &ldquo;The craftsmanship on the 92.5 silver necklace is breathtaking. Looks even more stunning in person than on screen!&rdquo;
                        </p>
                        <div className="text-[7.5px] text-white font-bold">
                          Ananya Sharma &bull; Mumbai
                        </div>
                      </div>
                    </div>

                    {/* --------------------------------------------------------- */}
                    {/* STEP 6: MOBILE FOOTER (Padded to end of screen flush)     */}
                    {/* --------------------------------------------------------- */}
                    <div
                      className={`w-full bg-[#060709] px-3 pt-3 pb-8 border-t border-white/[0.08] text-[#888888] text-[7.5px] space-y-2.5 transition-all duration-700 shrink-0 ${
                        hasFooter
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-8 pointer-events-none"
                      }`}
                    >
                      <div className="flex items-center justify-between text-white font-bold">
                        <span>EDAYAA JEWELLERY</span>
                        <span className="text-emerald-400 text-[7px] font-mono flex items-center gap-1">
                          <ShieldCheck className="w-2.5 h-2.5" />
                          100% Insured
                        </span>
                      </div>
                      <div className="text-[6.5px] text-[#666666] leading-tight">
                        &copy; 2026 Edayaa Jewellery Ltd. All Rights Reserved. Razorpay &bull; UPI &bull; TLS 1.3
                      </div>
                      <div className="pt-1 text-center font-mono text-[7px] text-emerald-400 font-bold">
                        ● 100% PRODUCTION LIVE
                      </div>
                    </div>
                  </div>
                </div>

                {/* iPhone Bottom Home Bar Indicator */}
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-24 h-1 rounded-full bg-white/30 z-40 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Desktop Stand Base (Shown only in desktop view) */}
          {deviceView === "desktop" && (
            <div className="flex flex-col items-center shrink-0">
              <div className="w-16 sm:w-24 h-2 sm:h-3 bg-gradient-to-b from-[#1C1D22] to-[#121316] border-x border-white/[0.1] shadow-sm" />
              <div className="w-28 sm:w-44 h-1 sm:h-1.5 rounded-full bg-gradient-to-r from-[#121316] via-[#22242B] to-[#121316] border border-white/[0.12] shadow-md" />
            </div>
          )}

          {/* Floating Scroll Helper Pill (Visible at start, smoothly fades out on scroll) */}
          <div
            className={`absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-500 ease-out ${
              progress < 0.12
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-3 scale-95 pointer-events-none"
            }`}
          >
            <div className="flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#080B10]/95 border border-sky-400/40 text-white shadow-[0_10px_35px_rgba(0,0,0,0.9)] ring-1 ring-sky-400/20 backdrop-blur-md">
              <div className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-sky-500/20 text-sky-400 shrink-0">
                <Mouse className="w-2.5 h-2.5 sm:w-3 sm:h-3 animate-pulse" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-mono tracking-wider uppercase text-sky-100 font-bold whitespace-nowrap">
                Scroll to Assemble Website
              </span>
              <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-400 animate-bounce" />
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* SECTION FOOTER CONTEXTUAL SUMMARY                                     */}
        {/* ===================================================================== */}
        <div className="pt-1.5 sm:pt-2 border-t border-white/[0.05] flex items-center justify-between text-left shrink-0">
          <p className="text-[9px] sm:text-[11px] text-[#8A8A8A] truncate max-w-sm sm:max-w-xl">
            Watch an artisan e-commerce platform assemble in real-time: Navigation, Categories, Editorial Hero, Products Catalog, Testimonials, and Production Footer.
          </p>

          <div className="hidden sm:flex items-center gap-1.5 text-[9px] font-mono text-[#CCCCCC]">
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
