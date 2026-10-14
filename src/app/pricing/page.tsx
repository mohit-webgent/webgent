import { Suspense } from "react";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { PricingView } from "@/components/pricing/pricing-view";
import { getPricingData } from "@/lib/services/pricing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pricing & Plans | Realistic Indian Web Development Rates | Webgent",
  description:
    "Explore transparent starting rates and configure your project with our interactive budget calculator for web development, React/Next.js apps, SaaS MVPs, and integrations.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "Pricing & Plans | Webgent Engineering",
    description:
      "Transparent starting rates and interactive budget calculator for web applications, SaaS MVPs, and integrations.",
    url: `${siteConfig.url}/pricing`,
    siteName: siteConfig.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing & Plans | Webgent Engineering",
    description:
      "Transparent starting rates and interactive budget calculator for web applications, SaaS MVPs, and integrations.",
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
