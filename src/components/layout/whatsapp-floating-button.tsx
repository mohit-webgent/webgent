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
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      id="webgent-whatsapp-floating-button"
      aria-label="Chat with Webgent on WhatsApp (opens in a new tab)"
      className={`fixed bottom-4 right-[7.5rem] z-50 h-11 w-11 items-center justify-center rounded-xl border border-line-strong bg-surface-2 text-whatsapp shadow-card transition-all duration-300 ease-expo-out hover:-translate-y-0.5 hover:bg-surface-3 sm:bottom-6 sm:right-[8.5rem] ${
        isChatOpen ? "hidden" : "flex"
      }`}
    >
      <WhatsAppIcon className="h-5 w-5 fill-current" />
    </a>
  );
}
