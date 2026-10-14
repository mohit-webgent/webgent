import { Suspense } from "react";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { PricingView } from "@/components/pricing/pricing-view";
import { getPricingData } from "@/lib/services/pricing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Website Pricing & Cost Estimator",
  description:
    "Explore transparent starting rates and configure your project with our interactive budget calculator for web development, React/Next.js apps, SaaS MVPs, and integrations.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "Website Pricing & Cost Estimator | Webgent",
    description:
      "Transparent starting rates and interactive budget calculator for web applications, SaaS MVPs, and integrations.",
    url: `${siteConfig.url}/pricing`,
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.url}/api/og?title=Website+Pricing+%26+Cost+Estimator&badge=Pricing`,
        width: 1200,
        height: 630,
        alt: "Website Pricing & Cost Estimator | Webgent",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Website Pricing & Cost Estimator | Webgent",
    description:
      "Transparent starting rates and interactive budget calculator for web applications, SaaS MVPs, and integrations.",
    images: [`${siteConfig.url}/api/og?title=Website+Pricing+%26+Cost+Estimator&badge=Pricing`],
    creator: "@webgent",
    site: "@webgent",
  },
};

export default async function PricingPage() {
  const pricingData = await getPricingData();

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080808]" />}>
      <PricingView initialData={pricingData} />
    </Suspense>
  );
}
