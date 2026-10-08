"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "@/components/animations/gsap-core";
import { FastForward } from "lucide-react";

// ============================================================================
// 16 AUTHENTIC TECHNOLOGY SVGS (MERN + CLOUD + DEVOPS ECOSYSTEM)
// ============================================================================

function ReactLogoSvg() {
  return (
    <svg viewBox="-11.5 -10.23174 23 20.46348" className="w-full h-full">
      <circle cx="0" cy="0" r="2.05" fill="#61DAFB" />
      <g stroke="#61DAFB" strokeWidth="1" fill="none">
        <ellipse rx="11" ry="4.2" />
        <ellipse rx="11" ry="4.2" transform="rotate(60)" />
        <ellipse rx="11" ry="4.2" transform="rotate(120)" />
      </g>
    </svg>
  );
}

function NextJsLogoSvg() {
  return (
    <svg viewBox="0 0 180 180" className="w-full h-full">
      <circle cx="90" cy="90" r="86" fill="black" stroke="rgba(255,255,255,0.4)" strokeWidth="6" />
      <path
        d="M149.5 157.5L69.1 54H54v72h12V69.4l74 95.5c3.3-2.3 6.5-4.7 9.5-7.4z"
        fill="white"
      />
      <rect x="115" y="54" width="12" height="42" fill="white" />
    </svg>
  );
}

function NodeLogoSvg() {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <path d="M32 4l24 14v28l-24 14L8 46V18L32 4z" fill="#1C1C1C" stroke="#5FA04E" strokeWidth="3" />
      <path d="M32 14l16 9.5v19L32 52 16 42.5v-19L32 14z" fill="#5FA04E" />
      <text
        x="32"
        y="38"
        textAnchor="middle"
        fill="#FFFFFF"
        fontFamily="sans-serif"
        fontWeight="bold"
        fontSize="13"
      >
        node
      </text>
    </svg>
  );
}

function ExpressLogoSvg() {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <rect width="64" height="64" rx="12" fill="#181818" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
      <text
        x="32"
        y="39"
        textAnchor="middle"
        fill="#FFFFFF"
        fontFamily="system-ui, sans-serif"
        fontWeight="800"
        fontSize="17"
        letterSpacing="-0.5"
      >
        ex
      </text>
    </svg>
  );
}

function MongoDbLogoSvg() {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <path
        d="M31.8 4c-.7 1-1.3 2.1-1.8 3.3C26.3 16 23 26 23 35.3c0 10.2 4.7 18.2 8.7 24.2.3.4.6.5 1 .5.4 0 .8-.1 1-.5 4-6 8.7-14 8.7-24.2 0-9.3-3.3-19.3-7-28C34.9 6.1 34.3 5 33.6 4c-.5-.7-1.3-.7-1.8 0z"
        fill="#47A248"
      />
      <path
        d="M32.7 60V4c-.4.5-.9 1.1-1.3 1.8-3.7 8.7-7 18.7-7 28 0 10.2 4.7 18.2 8.7 24.2.1.2.4.4.6.5V60z"
        fill="#4CAF50"
      />
      <path
        d="M32 4c.1 4.5.3 12.8.2 18.2-.1 6.8-.7 13.5-1.8 20.1-1.2 7-3.1 13.6-5.8 19.7 2.4-1.8 4.7-3.9 6.6-6.3.7-.9.8-1.5.8-2.6V4z"
        fill="#FFFFFF"
        opacity="0.3"
      />
    </svg>
  );
}

function DockerLogoSvg() {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <rect width="64" height="64" rx="12" fill="#0D273D" stroke="#2496ED" strokeWidth="2" />
      <g fill="#2496ED">
        {/* Stacked Containers */}
        <rect x="18" y="23" width="5.5" height="4.5" rx="0.8" fill="#38BDF8" />
        <rect x="25" y="23" width="5.5" height="4.5" rx="0.8" fill="#38BDF8" />
        <rect x="32" y="23" width="5.5" height="4.5" rx="0.8" fill="#38BDF8" />
        <rect x="25" y="17" width="5.5" height="4.5" rx="0.8" fill="#38BDF8" />
        <rect x="32" y="17" width="5.5" height="4.5" rx="0.8" fill="#38BDF8" />
        <rect x="39" y="17" width="5.5" height="4.5" rx="0.8" fill="#38BDF8" />
        <rect x="39" y="23" width="5.5" height="4.5" rx="0.8" fill="#38BDF8" />
        <rect x="46" y="23" width="5.5" height="4.5" rx="0.8" fill="#38BDF8" />
        {/* Whale body */}
        <path d="M53 28c-.6 0-3.3.4-5 2.5-1.5-1-4-1.5-7.5-1.5H13c-.6 0-1 .4-1 1 0 7 4.5 13 13 14 10 .5 16-3 20-7.5 3-3.5 7-3 8-3 .5 0 .8-.5.8-1 0-1.8-1-3-1.8-3zm-37 6.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5z" />
      </g>
    </svg>
  );
}

function RedisLogoSvg() {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <rect width="64" height="64" rx="12" fill="#3A1110" stroke="#DC382D" strokeWidth="2" />
      <g fill="#DC382D">
        <path d="M32 15l15 7.5-15 7.5-15-7.5L32 15z" fill="#EF4444" />
        <path d="M17 25l15 7.5 15-7.5v5.5l-15 7.5-15-7.5v-5.5z" fill="#DC382D" />
        <path d="M17 33.5l15 7.5 15-7.5v5.5l-15 7.5-15-7.5v-5.5z" fill="#B91C1C" />
      </g>
      <circle cx="32" cy="22.5" r="2.5" fill="#FFFFFF" />
    </svg>
  );
}

function JavaScriptLogoSvg() {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <rect width="64" height="64" rx="10" fill="#F7DF1E" />
      <path
        d="M36.7 44.5c1.8 3 4.2 4.9 8.2 4.9 4 0 6.5-2 6.5-4.8 0-3.3-2.6-4.5-7.1-6.5-6.5-2.8-10.7-6.2-10.7-12.8 0-6.4 4.9-11.2 12.6-11.2 5.4 0 9.4 2.1 12.2 7l-5.6 3.6c-1.5-2.6-3.1-3.7-6.6-3.7-3.2 0-5.2 2-5.2 4.4 0 2.9 2.1 4.1 6.2 5.9 7.2 3.1 11.6 6.3 11.6 13.3 0 7.6-6 11.9-14.7 11.9-8.2 0-13.1-4-15.6-8.9l8.2-3.1zM17.4 47.9c1.6 2.7 3.5 4.3 6.6 4.3 3.5 0 5.7-1.8 5.7-6.8V15h8.2v30.4c0 8.7-5.1 12.7-13.7 12.7-6.5 0-10.9-3.2-13-8l6.2-2.2z"
        fill="#000000"
      />
    </svg>
  );
}

function TypeScriptLogoSvg() {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <rect width="64" height="64" rx="10" fill="#3178C6" />
      <path
        d="M15 26h18v5h-6.2v17h-5.6V31H15v-5zm18.8 14.5c1.6 2.2 3.8 3.5 6.6 3.5 2.7 0 4.4-1.3 4.4-3.3 0-2-1.4-3-4.8-4.4-4.7-1.9-7.5-4.2-7.5-8.5 0-4.6 3.6-7.8 9.3-7.8 4 0 7 1.4 8.9 4.7l-4.4 2.8c-1.1-1.7-2.4-2.6-4.6-2.6-2.3 0-3.7 1.2-3.7 2.8 0 1.8 1.4 2.6 4.7 3.9 5.3 2.1 7.8 4.6 7.8 8.9 0 5.1-4 8.4-10.2 8.4-5.2 0-8.8-2.2-10.9-5.8l4.4-2.6z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

function HtmlLogoSvg() {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <path d="M8 4l5 48 19 6 19-6 5-48H8z" fill="#E34F26" />
      <path d="M32 55.6l16.2-5.1 4.3-40.5H32v45.6z" fill="#EF652A" />
      <path
        d="M32 20.3h17.9l-.6 6.6H32v-6.6zm0 13.3h10.9l-.8 8.8-10.1 2.8v-11.6zm0-13.3H14.1l1.8 20h16.1v-6.7H22.3l-.6-6.6H32v-6.7zm0 20v6.7h-.1l-10.1-2.8-.7-7.2h-6.7l1.3 14.5 16.3 4.5v-15.7z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

function TailwindLogoSvg() {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <rect width="64" height="64" rx="12" fill="#0B132B" stroke="#38BDF8" strokeWidth="1.5" />
      <path
        d="M20 28c1.5-3 4-4.5 7.5-4.5 5.5 0 7.5 4 11 4 3 0 5-1.5 6.5-4.5-1.5 3-4 4.5-7.5 4.5-5.5 0-7.5-4-11-4-3 0-5 1.5-6.5 4.5zm-6 10c1.5-3 4-4.5 7.5-4.5 5.5 0 7.5 4 11 4 3 0 5-1.5 6.5-4.5-1.5 3-4 4.5-7.5 4.5-5.5 0-7.5-4-11-4-3 0-5 1.5-6.5 4.5z"
        fill="#38BDF8"
      />
    </svg>
  );
}

function GitLogoSvg() {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <rect width="64" height="64" rx="12" fill="#2D110D" stroke="#F05032" strokeWidth="2" />
      <g stroke="#F05032" strokeWidth="3.5" fill="none" strokeLinecap="round">
        <line x1="22" y1="20" x2="22" y2="44" />
        <path d="M22 28c8 0 12 5 12 10v6" />
      </g>
      <circle cx="22" cy="20" r="4.5" fill="#FFFFFF" />
      <circle cx="22" cy="44" r="4.5" fill="#FFFFFF" />
      <circle cx="34" cy="44" r="4.5" fill="#FFFFFF" />
    </svg>
  );
}

function MySqlLogoSvg() {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <rect width="64" height="64" rx="12" fill="#00354E" stroke="#00758F" strokeWidth="2" />
      <path
        d="M22 42c5-3 10-2 15-7s6-12 5-18c-2 2-5 4-8 4-5 0-9-3-11-7 2 7 6 12 11 15-4 0-8-1-12-3 0 4 2 8 5 11l-5 5z"
        fill="#E48E00"
      />
      <path d="M38 18c6 1 11 5 13 11-3-2-7-3-11-3-4 0-8 2-10 5 1-4 4-8 8-13z" fill="#FFFFFF" />
      <text
        x="32"
        y="55"
        textAnchor="middle"
        fill="#FFFFFF"
        fontFamily="sans-serif"
        fontWeight="bold"
        fontSize="10"
      >
        MySQL
      </text>
    </svg>
  );
}

function PostgresLogoSvg() {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <rect width="64" height="64" rx="12" fill="#142B3E" stroke="#336791" strokeWidth="2" />
      <path
        d="M32 16c-6.6 0-12 5-12 11.5 0 4 2.2 7.5 5.5 9.5.5.3.8.9.8 1.5v5.5h11.4v-5.5c0-.6.3-1.2.8-1.5 3.3-2 5.5-5.5 5.5-9.5 0-6.5-5.4-11.5-12-11.5z"
        fill="#38BDF8"
        opacity="0.9"
      />
      <circle cx="28" cy="24" r="2" fill="#142B3E" />
      <circle cx="36" cy="24" r="2" fill="#142B3E" />
      <text
        x="32"
        y="55"
        textAnchor="middle"
        fill="#FFFFFF"
        fontFamily="sans-serif"
        fontWeight="bold"
        fontSize="9"
      >
        PGSQL
      </text>
    </svg>
  );
}

function BootstrapLogoSvg() {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <rect width="64" height="64" rx="14" fill="#3D1C68" stroke="#7952B3" strokeWidth="2" />
      <path
        d="M24 16h10.5c4.7 0 7.8 2.2 7.8 6.1 0 2.9-1.8 5-4.4 5.7 3.3.7 5.4 3.1 5.4 6.6 0 4.6-3.7 7.6-9.1 7.6H24V16zm6.8 12.2h3.5c2.3 0 3.8-1.1 3.8-3.1 0-2-1.5-3.1-3.8-3.1h-3.5v6.2zm0 8.1h4c2.6 0 4.3-1.2 4.3-3.4 0-2.2-1.7-3.4-4.3-3.4h-4v6.8z"
        fill="#A855F7"
      />
    </svg>
  );
}

function AwsLogoSvg() {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <rect width="64" height="64" rx="12" fill="#1A232E" stroke="#FF9900" strokeWidth="2" />
      <text
        x="32"
        y="32"
        textAnchor="middle"
        fill="#FFFFFF"
        fontFamily="sans-serif"
        fontWeight="900"
        fontSize="15"
        letterSpacing="1"
      >
        aws
      </text>
      <path d="M19 40c8 5 18 5 26 0" stroke="#FF9900" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M42 39l4 2-1-4" fill="#FF9900" />
    </svg>
  );
}

// ============================================================================
// 16 TECHNOLOGIES CONFIGURATION (FULL-STACK MERN + CLOUD ECOSYSTEM)
// ============================================================================

interface TechConfig {
  id: string;
  name: string;
  color: string;
  Logo: React.FC;
  angle: number; // 0 to 360 degrees
}

const TECH_LIST: TechConfig[] = [
  { id: "react", name: "React", color: "#61DAFB", Logo: ReactLogoSvg, angle: 0 },
  { id: "next", name: "Next.js", color: "#FFFFFF", Logo: NextJsLogoSvg, angle: 22.5 },
  { id: "node", name: "Node.js", color: "#5FA04E", Logo: NodeLogoSvg, angle: 45 },
  { id: "express", name: "Express", color: "#E0E0E0", Logo: ExpressLogoSvg, angle: 67.5 },
  { id: "mongo", name: "MongoDB", color: "#47A248", Logo: MongoDbLogoSvg, angle: 90 },
  { id: "docker", name: "Docker", color: "#2496ED", Logo: DockerLogoSvg, angle: 112.5 },
  { id: "redis", name: "Redis", color: "#DC382D", Logo: RedisLogoSvg, angle: 135 },
  { id: "js", name: "JavaScript", color: "#F7DF1E", Logo: JavaScriptLogoSvg, angle: 157.5 },
  { id: "ts", name: "TypeScript", color: "#3178C6", Logo: TypeScriptLogoSvg, angle: 180 },
  { id: "html", name: "HTML5", color: "#E34F26", Logo: HtmlLogoSvg, angle: 202.5 },
  { id: "tailwind", name: "Tailwind", color: "#38BDF8", Logo: TailwindLogoSvg, angle: 225 },
  { id: "git", name: "Git", color: "#F05032", Logo: GitLogoSvg, angle: 247.5 },
  { id: "mysql", name: "MySQL", color: "#00758F", Logo: MySqlLogoSvg, angle: 270 },
  { id: "postgres", name: "PostgreSQL", color: "#38BDF8", Logo: PostgresLogoSvg, angle: 292.5 },
  { id: "bootstrap", name: "Bootstrap", color: "#A855F7", Logo: BootstrapLogoSvg, angle: 315 },
  { id: "aws", name: "AWS Cloud", color: "#FF9900", Logo: AwsLogoSvg, angle: 337.5 },
];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
}

const SESSION_STORAGE_KEY = "webgent_intro_seen_v1";

export function WebgentOpeningAnimation() {
  const [shouldRender, setShouldRender] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [mergedCount, setMergedCount] = useState(0);

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const webgentWordRef = useRef<HTMLDivElement | null>(null);
  const webgentOutlineRef = useRef<HTMLDivElement | null>(null);
  const webgentFilledRef = useRef<HTMLDivElement | null>(null);
  const nodesContainerRef = useRef<HTMLDivElement | null>(null);
  const shockwaveRef = useRef<HTMLDivElement | null>(null);

  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // Check session storage on initial mount: plays ONLY on first visit in the session
  useEffect(() => {
    try {
      const hasSeen = sessionStorage.getItem(SESSION_STORAGE_KEY);
      const urlParams = new URLSearchParams(window.location.search);
      const forceReplay = urlParams.get("intro") === "1" || urlParams.get("replay") === "1";

      if (hasSeen === "true" && !forceReplay) {
        setIsDone(true);
        return;
      }

      // Mark as seen for this session immediately
      sessionStorage.setItem(SESSION_STORAGE_KEY, "true");
      setShouldRender(true);
    } catch {
      setShouldRender(true);
    }
  }, []);

  // Trigger completion
  const finishAnimation = useCallback(() => {
    if (isDone) return;
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, "true");
    } catch {}
    timelineRef.current?.kill();
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (overlayRef.current) {
      gsap.to(overlayRef.current, {
        opacity: 0,
        scale: 1.05,
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: () => {
          document.body.style.overflow = "";
          setIsDone(true);
          setShouldRender(false);
        },
      });
    } else {
      document.body.style.overflow = "";
      setIsDone(true);
      setShouldRender(false);
    }
  }, [isDone]);

  // Handle ESC / Space key to skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.code === "Space") {
        finishAnimation();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [finishAnimation]);

  // Canvas Particle System: renders live energy filaments & impact bursts
  useEffect(() => {
    if (!shouldRender) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const centerX = () => width / 2;
    const centerY = () => height / 2;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const cx = centerX();
      const cy = centerY();

      // 1. Draw glowing laser filaments from visible technology nodes to center of WEBGENT
      const container = nodesContainerRef.current;
      if (container && container.children.length > 0) {
        const children = container.children;

        for (let idx = 0; idx < children.length; idx++) {
          const nodeEl = children[idx] as HTMLElement;
          if (!nodeEl) continue;

          // Only draw if node is visible and not fully collapsed
          const opacity = parseFloat(window.getComputedStyle(nodeEl).opacity);
          if (opacity < 0.08) continue;

          const rect = nodeEl.getBoundingClientRect();
          const nodeX = rect.left + rect.width / 2;
          const nodeY = rect.top + rect.height / 2;
          const tech = TECH_LIST[idx];
          if (!tech) continue;

          // Glowing laser filament line from icon to WEBGENT
          ctx.beginPath();
          ctx.moveTo(nodeX, nodeY);
          ctx.lineTo(cx, cy);
          ctx.strokeStyle = `${tech.color}${Math.round(opacity * 60).toString(16).padStart(2, "0")}`;
          ctx.lineWidth = 1.3;
          ctx.stroke();

          // Spark dot at icon
          ctx.beginPath();
          ctx.arc(nodeX, nodeY, 2, 0, Math.PI * 2);
          ctx.fillStyle = tech.color;
          ctx.fill();
        }
      }

      // 2. Render particle bursts from merge impacts
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.alpha -= p.decay;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace("ALPHA", Math.max(0, p.alpha).toFixed(3));
        ctx.shadowColor = p.color.replace("ALPHA", "0.9");
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [shouldRender]);

  // Spawn impact burst at center when an icon collides with WEBGENT
  const spawnImpactBurst = (color: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      particlesRef.current.push({
        x: cx + (Math.random() - 0.5) * 60,
        y: cy + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 1.5,
        color: `${color.replace(")", ", ALPHA)").replace("rgb", "rgba").startsWith("rgba") ? color.replace(")", ", ALPHA)") : `${color}ALPHA`}`,
        alpha: 1,
        decay: Math.random() * 0.03 + 0.02,
      });
    }
  };

  // Main Orchestrated GSAP Timeline: All 16 icons visibly fly in & merge into the word WEBGENT!
  useEffect(() => {
    if (!shouldRender) return;

    const container = nodesContainerRef.current;
    const webgentWord = webgentWordRef.current;
    const webgentOutline = webgentOutlineRef.current;
    const webgentFilled = webgentFilledRef.current;
    const overlay = overlayRef.current;
    const shockwave = shockwaveRef.current;

    if (!container || !webgentWord || !webgentOutline || !webgentFilled || !overlay) {
      return;
    }

    const validNodes = Array.from(container.children) as HTMLElement[];
    if (validNodes.length === 0) return;

    // Lock body scroll during intro
    document.body.style.overflow = "hidden";

    const tl = gsap.timeline({
      onComplete: () => {
        finishAnimation();
      },
    });
    timelineRef.current = tl;

    // Calculate dynamic responsive radius for technology positions around WEBGENT
    const isMobile = window.innerWidth < 768;
    const radiusX = isMobile ? window.innerWidth * 0.4 : Math.min(window.innerWidth * 0.44, 490);
    const radiusY = isMobile ? window.innerHeight * 0.38 : Math.min(window.innerHeight * 0.38, 290);

    // Initial state:
    // 1. WEBGENT word is visible in center from the very start, in faint glowing outline/wireframe!
    gsap.set(webgentOutline, {
      opacity: 0.35,
      scale: 0.96,
      filter: "blur(2px)",
    });

    gsap.set(webgentFilled, {
      opacity: 0,
      scale: 0.96,
    });

    // 2. Tech nodes positioned in a 16-point orbit around the central word
    validNodes.forEach((node, i) => {
      const tech = TECH_LIST[i];
      const rad = (tech.angle * Math.PI) / 180;
      const startX = Math.cos(rad) * radiusX;
      const startY = Math.sin(rad) * radiusY;

      gsap.set(node, {
        x: startX,
        y: startY,
        scale: 0,
        opacity: 0,
      });
    });

    // ========================================================================
    // ACT 1: AT MOST START (0.0s) — Technologies bloom around WEBGENT
    // ========================================================================
    tl.to(
      webgentOutline,
      {
        opacity: 0.6,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.5,
        ease: "power2.out",
      },
      0.05
    );

    tl.to(
      validNodes,
      {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        stagger: 0.025,
        ease: "back.out(1.5)",
      },
      0.1
    );

    // ========================================================================
    // ACT 2: SMOOTH & CLEAR MERGE SEQUENCE (0.6s - 2.1s)
    // All 16 technologies visibly glide inward and fuse into the word WEBGENT!
    // ========================================================================
    validNodes.forEach((node, i) => {
      const tech = TECH_LIST[i];
      const startTime = 0.6 + i * 0.075;

      // Arc travel path into the center of the word WEBGENT
      tl.to(
        node,
        {
          x: 0,
          y: 0,
          scale: 0.25,
          opacity: 0.85,
          duration: 0.65,
          ease: "power3.in",
          onComplete: () => {
            // Impact spark burst
            spawnImpactBurst(tech.color);
            setMergedCount((prev) => Math.min(16, prev + 1));

            // Letter absorption reaction: WEBGENT glows brighter with each merge
            gsap.to(webgentFilled, {
              opacity: (i + 1) / validNodes.length,
              duration: 0.2,
              ease: "power2.out",
              overwrite: "auto",
            });

            // Subtle punch on WEBGENT as each tech hits it
            gsap.fromTo(
              webgentWord,
              { scale: 1.018 },
              { scale: 1, duration: 0.2, ease: "power2.out" }
            );
          },
        },
        startTime
      );

      // Node dissolves into the word at impact
      tl.to(
        node,
        {
          scale: 0,
          opacity: 0,
          duration: 0.1,
          ease: "power2.out",
        },
        startTime + 0.62
      );
    });

    // ========================================================================
    // ACT 3: FULL SYNTHESIS & GRAND WEBGENT EMERGENCE (2.1s - 3.1s)
    // All 16 technologies are merged! Massive metallic radiance erupts!
    // ========================================================================
    const finalMergeTime = 0.6 + validNodes.length * 0.075 + 0.3;

    // Shockwave pulse
    if (shockwave) {
      tl.fromTo(
        shockwave,
        { scale: 0.2, opacity: 1 },
        { scale: 3.8, opacity: 0, duration: 0.75, ease: "power2.out" },
        finalMergeTime
      );
    }

    // WEBGENT transitions into solid, majestic chrome logotype
    tl.to(
      webgentFilled,
      {
        opacity: 1,
        scale: 1.05,
        duration: 0.45,
        ease: "back.out(1.8)",
      },
      finalMergeTime
    );

    tl.to(
      webgentFilled,
      {
        scale: 1,
        duration: 0.4,
        ease: "power2.out",
      },
      finalMergeTime + 0.45
    );

    // Shimmer beam sweep across WEBGENT letters
    tl.fromTo(
      ".intro-shimmer-sweep",
      { xPercent: -150 },
      { xPercent: 150, duration: 0.8, ease: "power2.inOut" },
      finalMergeTime + 0.2
    );

    // Reveal sub-descriptor
    tl.fromTo(
      ".intro-footer-info",
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
      finalMergeTime + 0.3
    );

    // Hold for cinematic appreciation
    tl.to({}, { duration: 0.7 });

    // ========================================================================
    // ACT 4: CINEMATIC CURTAIN REVEAL TO WEBSITE (3.1s - 3.7s)
    // ========================================================================
    tl.to(
      webgentWord,
      {
        scale: 1.15,
        opacity: 0,
        filter: "blur(14px)",
        duration: 0.65,
        ease: "power3.in",
      },
      ">"
    );

    tl.to(
      overlay,
      {
        yPercent: -100,
        duration: 0.85,
        ease: "power4.inOut",
      },
      "-=0.4"
    );

    return () => {
      document.body.style.overflow = "";
      tl.kill();
    };
  }, [shouldRender, finishAnimation]);

  if (!shouldRender || isDone) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[99999] bg-[#050505] text-white flex items-center justify-center overflow-hidden select-none"
      style={{ willChange: "transform, opacity" }}
    >
      {/* 1. Technical Coordinate Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at center, rgba(255,255,255,0.12) 1px, transparent 1px),
            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "36px 36px, 72px 72px, 72px 72px",
        }}
      />

      {/* 2. Central Energy Flare */}
      <div
        className="absolute w-[500px] h-[500px] sm:w-[750px] sm:h-[750px] rounded-full bg-gradient-to-tr from-cyan-500/[0.07] via-red-500/[0.05] to-transparent blur-[120px] pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        aria-hidden="true"
      />

      {/* 3. 60FPS High-Precision Canvas Layer (filaments & colored impact bursts) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* 4. Shockwave Expansion Ring */}
      <div
        ref={shockwaveRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-2 border-white/60 pointer-events-none z-20 opacity-0 will-change-transform"
        style={{
          boxShadow: "0 0 50px rgba(255, 255, 255, 0.8), inset 0 0 30px rgba(255, 255, 255, 0.4)",
        }}
      />

      {/* 5. Minimal Top HUD & Skip Button */}
      <div className="absolute top-6 inset-x-6 sm:inset-x-10 flex items-center justify-between pointer-events-none z-40 font-mono text-[10px] text-white/50 uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-white/80 font-medium">FULL_STACK_FUSION</span>
          <span className="hidden sm:inline text-white/40">{"//"} MERGING 16 CORE TECHNOLOGIES INTO WEBGENT</span>
        </div>

        {/* Skip Button */}
        <button
          onClick={finishAnimation}
          type="button"
          className="pointer-events-auto px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.18] border border-white/20 hover:border-white/50 text-white/90 hover:text-white transition-all flex items-center gap-2 cursor-pointer backdrop-blur-md active:scale-95"
          title="Skip Intro (Press ESC)"
        >
          <span className="font-semibold">SKIP</span>
          <FastForward className="w-3 h-3 text-cyan-400" />
          <span className="text-[9px] text-white/40 border border-white/20 rounded px-1 hidden sm:inline">
            ESC
          </span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* 6. CENTERPIECE: THE WORD "WEBGENT" WHERE TECHNOLOGIES MERGE INTO     */}
      {/* ==================================================================== */}
      <div
        ref={webgentWordRef}
        className="relative z-30 flex flex-col items-center justify-center text-center px-4 will-change-transform max-w-full"
      >
        {/* Layer A: Outline / Wireframe WEBGENT (Visible immediately at the start) */}
        <div
          ref={webgentOutlineRef}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <h1
            className="text-6xl sm:text-8xl md:text-9xl lg:text-[135px] font-black font-display tracking-[0.16em] sm:tracking-[0.22em] uppercase leading-none select-none text-transparent"
            style={{
              WebkitTextStroke: "1.5px rgba(255, 255, 255, 0.45)",
              textShadow: "0 0 35px rgba(255, 255, 255, 0.2)",
            }}
          >
            WEBGENT
          </h1>
        </div>

        {/* Layer B: Solid Chrome WEBGENT (Fills & illuminates as technologies merge in!) */}
        <div
          ref={webgentFilledRef}
          className="relative flex items-center justify-center overflow-hidden"
        >
          <h1 className="text-6xl sm:text-8xl md:text-9xl lg:text-[135px] font-black font-display tracking-[0.16em] sm:tracking-[0.22em] uppercase leading-none select-none text-transparent bg-clip-text bg-gradient-to-b from-white via-[#F5F5F3] to-[#707070] drop-shadow-[0_20px_50px_rgba(255,255,255,0.35)] relative">
            WEBGENT
          </h1>

          {/* Shimmer light sweep that runs across WEBGENT letters */}
          <div
            className="intro-shimmer-sweep absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none transform -skew-x-12"
            style={{
              boxShadow: "0 0 30px rgba(255,255,255,0.8)",
            }}
          />
        </div>

        {/* Bottom Subtitle & Merged Counter */}
        <div className="intro-footer-info mt-6 flex flex-col items-center gap-2">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/20 shadow-lg backdrop-blur-md">
            <span
              className="w-2 h-2 rounded-full transition-colors duration-300"
              style={{
                backgroundColor: mergedCount >= 16 ? "#00E599" : "#61DAFB",
                boxShadow: `0 0 10px ${mergedCount >= 16 ? "#00E599" : "#61DAFB"}`,
              }}
            />
            <span className="font-mono text-[10px] sm:text-[11px] tracking-widest text-[#E5E5E3] uppercase">
              {mergedCount}/16 TECHNOLOGIES MERGED {"//"} {mergedCount >= 16 ? "WEBGENT ONLINE" : "SYNTHESIZING..."}
            </span>
          </div>

          <p className="font-mono text-[9.5px] sm:text-xs tracking-[0.25em] sm:tracking-[0.3em] uppercase text-white/70 font-medium">
            [ ARCHITECTED WITH MODERN MERN &amp; CLOUD TECHNOLOGIES ]
          </p>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 7. THE 16 TECHNOLOGY ICONS THAT FLY IN & MERGE INTO WEBGENT         */}
      {/* ==================================================================== */}
      <div
        ref={nodesContainerRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 z-30 pointer-events-none"
      >
        {TECH_LIST.map((tech) => {
          const LogoComponent = tech.Logo;
          return (
            <div
              key={tech.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 will-change-transform"
            >
              {/* Authentic Technology Icon Badge */}
              <div
                className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-[#111111]/95 border border-white/25 p-2 sm:p-2.5 shadow-[0_12px_30px_rgba(0,0,0,0.85)] backdrop-blur-xl flex items-center justify-center transition-transform"
                style={{
                  boxShadow: `0 0 25px ${tech.color}35, 0 10px 25px rgba(0,0,0,0.9)`,
                  borderColor: `${tech.color}60`,
                }}
              >
                <LogoComponent />
              </div>

              {/* Clean Readable Tech Name Pill */}
              <span
                className="px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-mono font-semibold tracking-wide border shadow-md backdrop-blur-md"
                style={{
                  backgroundColor: "rgba(10, 10, 10, 0.85)",
                  color: tech.color,
                  borderColor: `${tech.color}40`,
                }}
              >
                {tech.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
