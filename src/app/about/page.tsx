import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { AboutView } from "@/components/about/about-view";
import { getSiteSeoSettings, resolveRouteMetadata } from "@/lib/services/cms";

const defaultAboutMetadata: Metadata = {
  title: "About Mohit Verma — Software Developer at DBA Lounge & Founder of Webgent",
  description:
    "Learn about Mohit Verma, Software Developer at DBA Lounge and Founder of Webgent. Explore his professional journey, dual-track career, engineering stack, and production projects.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Mohit Verma — Software Developer at DBA Lounge & Founder of Webgent",
    description:
      "Learn about Mohit Verma, Software Developer at DBA Lounge and Founder of Webgent. Explore his professional journey, dual-track career, engineering stack, and production projects.",
    url: `${siteConfig.url}/about`,
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.url}/api/og?title=Meet+Mohit+Verma&badge=Developer+%26+Founder`,
        width: 1200,
        height: 630,
        alt: "About Mohit Verma — Software Developer & Founder of Webgent",
      },
    ],
    type: "profile",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Mohit Verma — Software Developer at DBA Lounge & Founder of Webgent",
    description:
      "Software developer at DBA Lounge and founder of Webgent. Professional career timeline, technical expertise, and production projects.",
    images: [`${siteConfig.url}/api/og?title=Meet+Mohit+Verma&badge=Developer+%26+Founder`],
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return resolveRouteMetadata("/about", defaultAboutMetadata);
}

export default async function AboutPage() {
  const seo = await getSiteSeoSettings();
  const origin = (seo.global.canonicalBaseUrl || siteConfig.url).replace(/\/+$/, "");

  // Marks this page as the profile of Webgent's founder. The Person and Organization themselves are
  // defined once, in the root layout, and referenced here by @id so there is a single source of truth.
  const profileJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${origin}/about#profile`,
    url: `${origin}/about`,
    name: "Mohit Verma, founder of Webgent",
    isPartOf: { "@id": `${origin}/#website` },
    mainEntity: { "@id": `${origin}/#mohit-verma` },
    about: { "@id": `${origin}/#organization` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(profileJsonLd) }} />
      <AboutView />
    </>
  );
}
