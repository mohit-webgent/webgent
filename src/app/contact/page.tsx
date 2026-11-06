import { Suspense } from "react";
import { ContactForm } from "@/components/contact/contact-form";
import { siteConfig } from "@/config/site";
import type { Metadata } from "next";
import { getContactInfo, resolveRouteMetadata } from "@/lib/services/cms";
import { PageSkeleton } from "@/components/ui/page-skeleton";

export const revalidate = 3600;

const defaultContactMetadata: Metadata = {
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

export async function generateMetadata(): Promise<Metadata> {
  return resolveRouteMetadata("/contact", defaultContactMetadata);
}

export default async function ContactPage() {
  const contactInfo = await getContactInfo();
  return (
    <div className="relative isolate overflow-hidden pb-[var(--section-space)] pt-10 sm:pt-16">
      <div className="wrap">
        {/* Main 2-Column Split: Contact Info Card (Left) & Form (Right) */}
        <Suspense fallback={<PageSkeleton cards={2} />}>
          <ContactForm contactInfo={contactInfo} />
        </Suspense>
      </div>
    </div>
  );
}
