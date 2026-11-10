import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { FOUNDER_PROFILE } from "@/data/founder-profile";
import { MainLayout } from "@/components/layout/main-layout";
import {
  getContactInfo,
  getFooterConfig,
  getNavigationMenu,
  getSiteSeoSettings,
  getSiteSwitches,
} from "@/lib/services/cms";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleTag } from "@/components/analytics/google-tag";

const sans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-serif",
  display: "swap",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#040405",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSiteSeoSettings();
  const baseUrl = (seo.global.canonicalBaseUrl || siteConfig.url).replace(/\/+$/, "");

  return {
    title: {
      default: seo.global.defaultTitle,
      template: seo.global.titleTemplate,
    },
    description: seo.global.defaultDescription,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `${baseUrl}/`,
    },
    keywords: [
      "Web Engineering",
      "Full-Stack Development",
      "Next.js 14",
      "React Server Components",
      "TypeScript",
      "Cloud Architecture",
      "PostgreSQL",
      "Prisma ORM",
      "SaaS Development",
      "Webgent",
    ],
    authors: [{ name: "Mohit Verma", url: baseUrl }],
    creator: seo.global.siteName,
    publisher: seo.global.siteName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: `${baseUrl}/`,
      siteName: seo.global.siteName,
      title: seo.global.defaultTitle,
      description: seo.global.defaultDescription,
      images: [
        {
          url: seo.global.defaultOgImage,
          width: 1200,
          height: 630,
          alt: seo.global.siteName,
        },
      ],
    },
    twitter: {
      card: seo.global.twitterCard,
      title: seo.global.defaultTitle,
      description: seo.global.defaultDescription,
      images: [seo.global.defaultOgImage],
      creator: seo.global.twitterHandle,
      site: seo.global.twitterHandle,
    },
    robots: {
      index: seo.global.defaultRobotsIndex,
      follow: seo.global.defaultRobotsFollow,
      googleBot: {
        index: seo.global.defaultRobotsIndex,
        follow: seo.global.defaultRobotsFollow,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [navConfig, footerConfig, seoConfig, switches, contactInfo] = await Promise.all([
    getNavigationMenu(),
    getFooterConfig(),
    getSiteSeoSettings(),
    getSiteSwitches(),
    getContactInfo(),
  ]);

  const originUrl = (seoConfig.global.canonicalBaseUrl || siteConfig.url).replace(/\/+$/, "");

  // Tells search engines who Webgent is: an Indian web development business founded by Mohit Verma.
  // This is what separates it from unrelated businesses that share the name.
  const founderId = `${originUrl}/#mohit-verma`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": `${originUrl}/#organization`,
        name: seoConfig.global.siteName,
        alternateName: `${seoConfig.global.siteName} by Mohit Verma`,
        url: originUrl,
        logo: `${originUrl}/api/og?title=${encodeURIComponent(seoConfig.global.siteName)}`,
        image: seoConfig.global.defaultOgImage,
        description: seoConfig.global.defaultDescription,
        email: contactInfo.email,
        telephone: contactInfo.phone,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Gurugram",
          addressRegion: "Haryana",
          addressCountry: "IN",
        },
        areaServed: { "@type": "Country", name: "India" },
        founder: { "@id": founderId },
        sameAs: [siteConfig.links.github, siteConfig.links.linkedin],
        knowsAbout: [
          "Corporate websites",
          "E-commerce websites",
          "SaaS platforms",
          "ERP and internal business tools",
          "Custom web applications",
          "Next.js",
          "React",
        ],
      },
      {
        "@type": "Person",
        "@id": founderId,
        name: FOUNDER_PROFILE.name,
        jobTitle: "Founder & Web Developer",
        url: `${originUrl}/about`,
        image: `${originUrl}${FOUNDER_PROFILE.avatarUrl}`,
        worksFor: { "@id": `${originUrl}/#organization` },
        address: { "@type": "PostalAddress", addressLocality: "Gurugram", addressCountry: "IN" },
        sameAs: [FOUNDER_PROFILE.linkedinUrl, FOUNDER_PROFILE.githubUrl, FOUNDER_PROFILE.portfolioUrl],
      },
      {
        "@type": "WebSite",
        "@id": `${originUrl}/#website`,
        url: originUrl,
        name: seoConfig.global.siteName,
        publisher: {
          "@id": `${originUrl}/#organization`,
        },
      },
    ],
  };

  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      {/* Browser extensions such as ColorZilla add attributes to <body> before React loads.
          This applies to <body>'s own attributes only, so real mismatches in the page still report. */}
      <body
        suppressHydrationWarning
        className={`${sans.variable} ${display.variable} ${serif.variable} ${mono.variable} font-sans bg-canvas text-fg antialiased`}
      >
        <MainLayout
          navItems={navConfig.items}
          footerData={footerConfig}
          chatEnabled={switches.aiChatEnabled}
          maintenanceMode={switches.maintenanceMode}
          contact={{ email: contactInfo.email, phone: contactInfo.phone }}
        >
          {children}
        </MainLayout>
        <GoogleTag />
        {process.env.VERCEL && <SpeedInsights />}
      </body>
    </html>
  );
}
