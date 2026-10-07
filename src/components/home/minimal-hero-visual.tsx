"use client";

export function MinimalHeroVisual() {
  return (
    <div className="relative w-full max-w-[520px] lg:max-w-[490px] xl:max-w-[540px] flex items-center justify-center select-none">
      <div
        className="absolute w-[80%] h-[70%] rounded-full bg-black/90 blur-3xl transform translate-y-12 pointer-events-none"
        aria-hidden="true"
      />

      <div
        className="relative w-full aspect-[16/11] rounded-xl bg-[#0D0D0D] border border-white/[0.08] shadow-[0_30px_90px_-20px_rgba(0,0,0,0.95),0_10px_30px_-10px_rgba(0,0,0,0.85)] overflow-hidden transition-all duration-700 ease-out lg:transform lg:rotate-[-1.5deg] lg:rotate-x-[3deg] lg:rotate-y-[-4deg] hover:rotate-0"
        style={{
          perspective: "1200px",
        }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05] bg-[#111111]/60">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white/[0.12]" />
            <span className="w-2 h-2 rounded-full bg-white/[0.06]" />
            <span className="w-2 h-2 rounded-full bg-white/[0.06]" />
          </div>
          <span className="font-mono text-[10px] tracking-widest text-[#555555] uppercase">
            SYSTEM // 01
          </span>
        </div>

        <div className="relative w-full h-[calc(100%-37px)] p-6 sm:p-8 flex flex-col justify-between bg-[#090909]">
          <div className="relative flex-1 flex items-center justify-center">
            <svg
              className="w-full h-full max-h-[220px]"
              viewBox="0 0 400 240"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient
                  id="planeTop"
                  x1="200"
                  y1="20"
                  x2="200"
                  y2="120"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="#1E1E1E" />
                  <stop offset="100%" stopColor="#121212" />
                </linearGradient>
                <linearGradient
                  id="planeLeft"
                  x1="100"
                  y1="120"
                  x2="200"
                  y2="210"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="#141414" />
                  <stop offset="100%" stopColor="#0A0A0A" />
                </linearGradient>
                <linearGradient
                  id="planeRight"
                  x1="300"
                  y1="120"
                  x2="200"
                  y2="210"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="#181818" />
                  <stop offset="100%" stopColor="#0C0C0C" />
                </linearGradient>
              </defs>

              <line
                x1="50"
                y1="120"
                x2="350"
                y2="120"
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <line
                x1="200"
                y1="20"
                x2="200"
                y2="220"
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />

              <polygon
                points="200,35 295,90 200,145 105,90"
                fill="url(#planeTop)"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="1"
              />
              <polygon
                points="105,90 200,145 200,215 105,160"
                fill="url(#planeLeft)"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
              />
              <polygon
                points="200,145 295,90 295,160 200,215"
                fill="url(#planeRight)"
                stroke="rgba(255,255,255,0.10)"
                strokeWidth="1"
              />

              <line
                x1="152"
                y1="62"
                x2="247"
                y2="117"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
              />
              <line
                x1="136"
                y1="113"
                x2="136"
                y2="178"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
              />
              <line
                x1="264"
                y1="113"
                x2="264"
                y2="178"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
              />

              <circle cx="200" cy="35" r="2" fill="#E5E5E3" />
              <circle cx="295" cy="90" r="2" fill="#B5B5B3" />
              <circle cx="105" cy="90" r="2" fill="#B5B5B3" />
              <circle cx="200" cy="145" r="2.5" fill="#FFFFFF" />
              <circle cx="200" cy="215" r="2" fill="#777777" />
            </svg>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/[0.04] text-[9.5px] font-mono text-[#555555]">
            <span>ENGINEERED ARCHITECTURE</span>
            <span>EDITION 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}
