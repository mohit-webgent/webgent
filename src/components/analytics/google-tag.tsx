"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

const CONTAINER_ID = "GTM-KJCSZKHX";

/** Loads the Google tag on public pages only, keeping admin visits and data out of analytics. */
export function GoogleTag() {
  const pathname = usePathname();

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return null;
  }

  return (
    <>
      <Script
        id="google-tag-loader"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtm.js?id=${CONTAINER_ID}`}
      />
      <Script id="google-tag-init" strategy="afterInteractive">
        {"window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date());"}
      </Script>
    </>
  );
}
