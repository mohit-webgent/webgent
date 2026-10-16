import { Suspense } from "react";
import { ContactForm } from "@/components/contact/contact-form";
import { siteConfig } from "@/config/site";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Contact Us — Webgent",
  description:
    "Get in touch! I'll respond within 24 hours. Have questions or need assistance? Contact us at Webgent for support or to discuss your project.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Us — Webgent",
    description: "Get in touch! I'll respond within 24 hours.",
    url: `${siteConfig.url}/contact`,
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.url}/api/og?title=Have+a+Project+in+Mind%3F+Let's+Talk!&badge=Contact+Webgent`,
        width: 1200,
        height: 630,
        alt: "Contact Webgent",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us — Webgent",
    description: "Get in touch! I'll respond within 24 hours.",
    images: [`${siteConfig.url}/api/og?title=Have+a+Project+in+Mind%3F+Let's+Talk!&badge=Contact+Webgent`],
    creator: "@webgent",
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-[85vh] w-full bg-[#000000] text-white py-12 sm:py-20 lg:py-24 px-4 sm:px-8 lg:px-12 relative overflow-hidden font-sans flex flex-col justify-center items-center">
      {/* Subtle Ambient Radial Glows at Top (like the screenshot) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[220px] bg-gradient-to-b from-blue-900/10 via-amber-500/5 to-transparent blur-3xl opacity-60"
      />

      <div className="w-full max-w-6xl mx-auto space-y-8 sm:space-y-12 relative z-10">
        {/* Main 2-Column Split: Contact Info Card (Left) & Form (Right) */}
        <Suspense
          fallback={
            <div className="min-h-[480px] w-full bg-[#0F1014] rounded-[24px] animate-pulse border border-white/[0.08]" />
          }
        >
          <ContactForm />
        </Suspense>
      </div>
    </div>
  );
}
