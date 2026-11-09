import { prisma } from "@/lib/db";
import { cacheGet, cacheSet } from "@/lib/redis";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Star } from "lucide-react";

import { siteConfig } from "@/config/site";
import { RevealGroup } from "@/components/animations/reveal-group";
import { CtaBand } from "@/components/ui/cta-band";
import { PageHero } from "@/components/ui/page-hero";
import { resolveRouteMetadata } from "@/lib/services/cms";

export const revalidate = 60;

const defaultTestimonialsMetadata: Metadata = {
  title: "Client Testimonials & Feedback | Webgent",
  description: "Client feedback on web development projects built by Mohit Verma.",
  alternates: {
    canonical: "/testimonials",
  },
  openGraph: {
    title: "Client Testimonials & Feedback | Webgent",
    description: "Client feedback on web development projects built by Mohit Verma.",
    url: `${siteConfig.url}/testimonials`,
    siteName: siteConfig.name,
    type: "website",
    images: [
      {
        url: `${siteConfig.url}/api/og?title=Client+Testimonials&badge=Reviews`,
        width: 1200,
        height: 630,
        alt: "Client Testimonials | Webgent",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Client Testimonials & Feedback | Webgent",
    description: "Client feedback on web development projects built by Mohit Verma.",
    images: [`${siteConfig.url}/api/og?title=Client+Testimonials&badge=Reviews`],
    creator: "@webgent",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return resolveRouteMetadata("/testimonials", defaultTestimonialsMetadata);
}

export default async function TestimonialsPage() {
  let testimonials: Array<{
    id: string;
    clientName: string;
    clientTitle: string | null;
    company: string | null;
    content: string;
    rating: number;
    avatarUrl?: string | null;
    createdAt: Date;
  }> = [];

  const cacheKey = "cache:testimonials:approved_list_v1";
  const cachedTestimonials = await cacheGet<typeof testimonials>(cacheKey);

  if (cachedTestimonials) {
    testimonials = cachedTestimonials;
  } else {
    try {
      testimonials = await prisma.testimonial.findMany({
        where: { status: "APPROVED", deletedAt: null },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        select: {
          id: true,
          clientName: true,
          clientTitle: true,
          company: true,
          content: true,
          rating: true,
          avatarUrl: true,
          createdAt: true,
        },
      });

      if (testimonials.length > 0) {
        await cacheSet(cacheKey, testimonials, 60);
      }
    } catch (err) {
      console.warn("Could not fetch testimonials:", err);
    }
  }

  // Gracefully redirect to /work if no genuine testimonials exist yet
  if (!testimonials || testimonials.length === 0) {
    redirect("/work");
  }

  return (
    <>
      <PageHero eyebrow="Testimonials" title="What clients say." description="Feedback from clients on projects built by Mohit Verma." />

      <section className="wrap pb-[var(--section-space)]">
        <RevealGroup spotlight className="columns-1 gap-3 md:columns-2 lg:columns-3">
          {testimonials.map((t) => (
            <figure key={t.id} data-reveal className="card card-hover spotlight mb-3 break-inside-avoid p-5">
              <div className="flex gap-0.5" role="img" aria-label={`Rated ${t.rating} out of 5`}>
                {Array.from({ length: Math.max(0, Math.min(5, Math.round(t.rating))) }).map((_, index) => (
                  <Star key={index} className="h-3 w-3 fill-accent text-accent" />
                ))}
              </div>
              <blockquote className="mt-3 text-[0.9375rem] leading-relaxed text-fg-soft">&ldquo;{t.content}&rdquo;</blockquote>
              <figcaption className="mt-4 flex items-center gap-3 border-t border-line pt-4">
                {t.avatarUrl ? (
                  <img src={t.avatarUrl} alt="" loading="lazy" decoding="async" className="h-9 w-9 rounded-lg object-cover" />
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-3 font-display text-sm font-semibold text-fg-soft">
                    {t.clientName.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{t.clientName}</p>
                  {(t.company || t.clientTitle) && t.company !== t.clientName && (
                    <p className="truncate text-[0.8125rem] text-fg-muted">{t.company || t.clientTitle}</p>
                  )}
                </div>
              </figcaption>
            </figure>
          ))}
        </RevealGroup>
      </section>

      <CtaBand
        title="Let's build something you'd recommend."
        description="Tell me about your project and I'll come back with a clear scope, timeline and price."
        analyticsName="Testimonials"
      />
    </>
  );
}
