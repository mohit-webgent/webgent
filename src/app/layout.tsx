import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { MainLayout } from "@/components/layout/main-layout";
import { getNavigationMenu, getFooterConfig } from "@/lib/services/cms";

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

export const metadata: Metadata = {
  title: {
    default: "Webgent — Modern Web Development & Engineering Solutions",
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: `${siteConfig.url}/`,
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
  authors: [{ name: "Webgent Engineering Team", url: siteConfig.url }],
  creator: "Webgent",
  publisher: "Webgent",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: `${siteConfig.url}/`,
    siteName: siteConfig.name,
    title: "Webgent — Modern Web Development & Engineering Solutions",
    description: siteConfig.description,
    images: [
      {
        url: `${siteConfig.url}/api/og?title=Webgent&badge=Web+Engineering`,
        width: 1200,
        height: 630,
        alt: "Webgent — Modern Web Development & Engineering Solutions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Webgent — Modern Web Development & Engineering Solutions",
    description: siteConfig.description,
    images: [`${siteConfig.url}/api/og?title=Webgent&badge=Web+Engineering`],
    creator: "@webgent",
    site: "@webgent",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [navConfig, footerConfig] = await Promise.all([
    getNavigationMenu(),
    getFooterConfig(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteConfig.url}/#organization`,
        name: siteConfig.name,
        url: siteConfig.url,
        logo: `${siteConfig.url}/api/og?title=Webgent`,
        sameAs: [siteConfig.links.github, siteConfig.links.twitter, siteConfig.links.linkedin],
        description: siteConfig.description,
      },
      {
        "@type": "WebSite",
        "@id": `${siteConfig.url}/#website`,
        url: siteConfig.url,
        name: siteConfig.name,
        publisher: {
          "@id": `${siteConfig.url}/#organization`,
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
      </body>
    </html>
  );
}
