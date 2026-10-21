import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { AboutView } from "@/components/about/about-view";
import { resolveRouteMetadata } from "@/lib/services/cms";

const defaultAboutMetadata: Metadata = {
  title: "About Mohit Verma — Software Developer at DBA Lounge & Founder of Webgent Studio",
  description:
    "Learn about Mohit Verma, Software Developer at DBA Lounge and Founder of Webgent Studio. Explore his professional journey, dual-track career, engineering stack, and production projects.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Mohit Verma — Software Developer at DBA Lounge & Founder of Webgent Studio",
    description:
      "Learn about Mohit Verma, Software Developer at DBA Lounge and Founder of Webgent Studio. Explore his professional journey, dual-track career, engineering stack, and production projects.",
    url: `${siteConfig.url}/about`,
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.url}/api/og?title=Meet+Mohit+Verma&badge=Developer+%26+Founder`,
        width: 1200,
        height: 630,
        alt: "About Mohit Verma — Software Developer & Founder of Webgent Studio",
      },
    ],
    type: "profile",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Mohit Verma — Software Developer at DBA Lounge & Founder of Webgent Studio",
    description:
      "Software developer at DBA Lounge and founder of Webgent Studio. Professional career timeline, technical expertise, and production projects.",
    images: [`${siteConfig.url}/api/og?title=Meet+Mohit+Verma&badge=Developer+%26+Founder`],
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
