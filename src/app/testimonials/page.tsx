import { prisma } from "@/lib/db";
import { cacheGet, cacheSet } from "@/lib/redis";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { siteConfig } from "@/config/site";
import { resolveRouteMetadata } from "@/lib/services/cms";

export const revalidate = 60;

const defaultTestimonialsMetadata: Metadata = {
  title: "Client Testimonials & Feedback | Webgent",
  description: "Verified reviews and client feedback on Webgent web engineering projects.",
  alternates: {
    canonical: "/testimonials",
  },
  openGraph: {
    title: "Client Testimonials & Feedback | Webgent",
    description: "Verified reviews and client feedback on Webgent web engineering projects.",
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
    description: "Verified reviews and client feedback on Webgent web engineering projects.",
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
    <div className="min-h-screen bg-[#080808] text-[#DCDCDA] pt-12 pb-24 px-5 sm:px-8 2xl:px-20 w-full max-w-[1760px] 2xl:max-w-[1920px] 3xl:max-w-[2240px] mx-auto space-y-8">
      <div className="space-y-2 text-left">
        <h1 className="text-3xl sm:text-4xl 2xl:text-5xl font-bold text-white tracking-tight">Client Testimonials</h1>
        <p className="text-sm 2xl:text-base text-[#888888]">Verified feedback from our partners and clients.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 text-left">
        {testimonials.map((t) => (
          <div
            key={t.id}
            className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] space-y-4 shadow-xl"
          >
            <p className="text-sm text-[#B0B0AE] leading-relaxed">&ldquo;{t.content}&rdquo;</p>
            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#808080]">
              <div className="flex items-center gap-2">
                {t.avatarUrl && (
                  <img
                    src={t.avatarUrl}
                    alt={t.clientName}
                    loading="lazy"
                    decoding="async"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                )}
                <span className="font-semibold text-white">{t.clientName}</span>
              </div>
              <span>{t.company || t.clientTitle || ""}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
