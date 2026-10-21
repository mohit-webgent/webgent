"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { buildWhatsAppUrl } from "@/config/whatsapp";

export function WhatsAppFloatingButton() {
  const pathname = usePathname();
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const handleChatToggle = (event: Event) => {
      const customEvent = event as CustomEvent<{ isOpen?: boolean }>;
      if (customEvent.detail && typeof customEvent.detail.isOpen === "boolean") {
        setIsChatOpen(customEvent.detail.isOpen);
      }
    };

    window.addEventListener("webgent:chat-widget-toggle", handleChatToggle);
    return () => {
      window.removeEventListener("webgent:chat-widget-toggle", handleChatToggle);
    };
  }, []);

  // Compute contextual message based on current route
  const getContextualWhatsAppUrl = () => {
    if (pathname && pathname.startsWith("/services/")) {
      const slug = pathname.replace("/services/", "").split("/")[0]?.trim();
      if (slug) {
        const formattedService = slug
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
        return buildWhatsAppUrl({ serviceName: formattedService });
      }
    }
    return buildWhatsAppUrl();
  };

  const whatsappUrl = getContextualWhatsAppUrl();

  return (
    <aside
      aria-label="WhatsApp quick chat option"
      className={`fixed transition-all duration-300 z-50 ${
        isChatOpen
          ? "hidden sm:flex sm:bottom-6 sm:right-[88px]"
          : "bottom-4 sm:bottom-6 right-[68px] sm:right-[88px] flex"
      } items-center gap-2 group`}
    >
      {/* Desktop Tooltip Pill */}
      <span
        id="whatsapp-floating-tooltip"
        role="tooltip"
        className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0D0E14]/95 text-xs text-[#E5E5E3] font-medium border border-white/[0.14] shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none select-none whitespace-nowrap"
      >
        <span>Chat on WhatsApp</span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
      </span>

      {/* Floating Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        id="webgent-whatsapp-floating-button"
        aria-label="Chat with Webgent on WhatsApp (opens in a new tab)"
        aria-describedby="whatsapp-floating-tooltip"
        className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-[#25D366] to-[#128C7E] hover:from-[#2bf075] hover:to-[#17a392] text-white flex items-center justify-center border border-white/20 shadow-[0_10px_35px_rgba(37,211,102,0.4)] hover:shadow-[0_12px_40px_rgba(37,211,102,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 focus:ring-offset-[#080808] cursor-pointer"
      >
        <WhatsAppIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white drop-shadow-sm transition-transform duration-200 group-hover:scale-110" />

        {/* Online status indicator dot */}
        <span
          className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#25D366] border-2 border-[#090A0D] shadow-[0_0_8px_rgba(37,211,102,0.9)]"
          aria-hidden="true"
        >
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-75" />
        </span>
      </a>
    </aside>
  );
}
