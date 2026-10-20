import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { MainLayout } from "@/components/layout/main-layout";
import { getNavigationMenu, getFooterConfig, getSiteSeoSettings } from "@/lib/services/cms";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#080808",
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
    authors: [{ name: "Webgent Engineering Team", url: baseUrl }],
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
  const [navConfig, footerConfig, seoConfig] = await Promise.all([
    getNavigationMenu(),
    getFooterConfig(),
    getSiteSeoSettings(),
  ]);

  const originUrl = (seoConfig.global.canonicalBaseUrl || siteConfig.url).replace(/\/+$/, "");

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${originUrl}/#organization`,
        name: seoConfig.global.siteName,
        url: originUrl,
        logo: `${originUrl}/api/og?title=${encodeURIComponent(seoConfig.global.siteName)}`,
        sameAs: [siteConfig.links.github, siteConfig.links.twitter, siteConfig.links.linkedin],
        description: seoConfig.global.defaultDescription,
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
      <body
        className={`${inter.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable} ${inter.className} font-sans bg-background text-foreground antialiased`}
      >
        <MainLayout navItems={navConfig.items} footerData={footerConfig}>{children}</MainLayout>
        <SpeedInsights />
      </body>
    </html>
  );
}
