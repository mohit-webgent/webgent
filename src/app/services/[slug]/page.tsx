import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { getPublicServiceBySlug } from "@/lib/services/cms-services";
import { ServiceDetailView } from "@/components/services/service-detail-view";

export const revalidate = 60;

interface ServicePageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  try {
    const service = await getPublicServiceBySlug(params.slug);
    if (!service) {
      return {
        title: "Service Not Found",
      };
    }

  const title = service.seoTitle || `${service.name} — Engineering Services | Webgent`;
  const description = service.seoDescription || service.shortDescription;
  const canonicalUrl = `${siteConfig.url}/services/${service.slug}`;
  const ogImage =
    service.ogImage ||
    service.coverImage ||
    `${siteConfig.url}/api/og?title=${encodeURIComponent(service.name)}&badge=Service+Scope`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: service.name,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
      creator: "@webgent",
      site: "@webgent",
    },
    };
  } catch {
    return {
      title: "Services — Webgent",
    };
  }
}

export default async function SingleServicePage({ params }: ServicePageProps) {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams?.slug;
  if (!slug) {
    notFound();
  }

  const service = await getPublicServiceBySlug(slug);
  if (!service) {
    notFound();
  }

  return <ServiceDetailView service={service} />;
}
