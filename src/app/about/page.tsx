import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { AboutView } from "@/components/about/about-view";
import { resolveRouteMetadata } from "@/lib/services/cms";

const defaultAboutMetadata: Metadata = {
  title: "Meet Mohit Verma — Founder & Developer at Webgent",
  description:
    "Software developer and founder of Webgent. Professional journey, technical expertise in React and full-stack development, selected projects, and development methodology.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "Meet Mohit Verma — Founder & Developer at Webgent",
    description:
      "Software developer and founder of Webgent. Professional journey, technical expertise in React and full-stack development, selected projects, and development methodology.",
    url: `${siteConfig.url}/about`,
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.url}/api/og?title=Meet+Mohit+Verma&badge=Founder+%26+Developer`,
        width: 1200,
        height: 630,
        alt: "Meet Mohit Verma — Founder & Developer at Webgent",
      },
    ],
    type: "profile",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meet Mohit Verma — Founder & Developer at Webgent",
    description:
      "Software developer and founder of Webgent. Professional journey, technical expertise, selected projects, and engineering approach.",
    images: [`${siteConfig.url}/api/og?title=Meet+Mohit+Verma&badge=Founder+%26+Developer`],
    creator: "@webgent",
    site: "@webgent",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return resolveRouteMetadata("/about", defaultAboutMetadata);
}

export default function AboutPage() {
  return <AboutView />;
}
