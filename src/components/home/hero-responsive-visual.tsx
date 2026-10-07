"use client";

import Image from "next/image";

export function HeroResponsiveVisual() {
  return (
    <div className="relative w-full max-w-[620px] lg:max-w-[560px] xl:max-w-[660px] flex items-center justify-center select-none group">
      {/* Soft atmospheric ambient glow that naturally blends into the site's dark canvas */}
      <div
        className="absolute w-[80%] h-[75%] rounded-full bg-gradient-to-tr from-white/[0.04] to-transparent blur-3xl pointer-events-none transform -translate-y-4"
        aria-hidden="true"
      />

      {/* Cutout Mockup Container - Completely seamless device image only */}
      <div className="relative w-full aspect-[878/603] flex items-center justify-center transition-transform duration-700 ease-out group-hover:scale-[1.02]">
        {/* Contact shadow underneath the floating devices */}
        <div
          className="absolute bottom-2 inset-x-8 h-8 rounded-full bg-black/80 blur-xl pointer-events-none transform translate-y-3"
          aria-hidden="true"
        />

        {/* High-Resolution Transparent WebP/PNG Mockup */}
        <Image
          src="/images/hero-devices-transparent.webp"
          alt="Webgent responsive website open on laptop and mobile screens"
          width={878}
          height={603}
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 660px"
          className="w-full h-auto object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.85)] filter"
        />
      </div>
    </div>
  );
}
