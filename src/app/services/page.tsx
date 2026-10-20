import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { getPublicServices } from "@/lib/services/cms-services";
import { resolveRouteMetadata } from "@/lib/services/cms";
import { ServicesView } from "@/components/services/services-view";

export const revalidate = 60;

const defaultServicesMetadata: Metadata = {
  title: "Engineering Services & Technical Disciplines",
  description:
    "Explore Webgent's full-stack web engineering, custom Next.js applications, headless e-commerce storefronts, SaaS MVPs, and automated digital systems.",
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "Engineering Services & Technical Disciplines | Webgent",
    description:
      "Explore Webgent's full-stack web engineering, custom Next.js applications, headless e-commerce storefronts, SaaS MVPs, and automated digital systems.",
    url: `${siteConfig.url}/services`,
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.url}/api/og?title=Services+%26+Capabilities&badge=Web+Engineering`,
        width: 1200,
        height: 630,
        alt: "Services & Capabilities | Webgent",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Engineering Services & Technical Disciplines | Webgent",
    description:
      "Explore Webgent's full-stack web engineering, custom Next.js applications, and digital platforms.",
    images: [`${siteConfig.url}/api/og?title=Services+%26+Capabilities&badge=Web+Engineering`],
    creator: "@webgent",
    site: "@webgent",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return resolveRouteMetadata("/services", defaultServicesMetadata);
}

export default async function ServicesPage() {
  const services = await getPublicServices();

  return <ServicesView services={services} />;
}
