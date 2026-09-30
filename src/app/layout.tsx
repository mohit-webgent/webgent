import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { MainLayout } from "@/components/layout/main-layout";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const viewport: Viewport = {
  themeColor: "#020617",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Webgent — Elite Web Solutions & Engineering Architecture",
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: "/",
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
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: "Webgent — Elite Web Solutions & Engineering Architecture",
    description: siteConfig.description,
    images: [
      {
        url: "/api/og?title=Webgent&badge=Elite+Web+Engineering",
        width: 1200,
        height: 630,
        alt: "Webgent — Elite Web Solutions & Engineering Architecture",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Webgent — Elite Web Solutions & Engineering Architecture",
    description: siteConfig.description,
    images: ["/api/og?title=Webgent&badge=Elite+Web+Engineering"],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteConfig.url}/#organization`,
        name: siteConfig.name,
        url: siteConfig.url,
        logo: `${siteConfig.url}/api/og?title=Webgent`,
        sameAs: [
          siteConfig.links.github,
          siteConfig.links.twitter,
          siteConfig.links.linkedin,
        ],
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
    <html lang="en" className="dark scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} bg-slate-950 text-slate-100 antialiased`}>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
