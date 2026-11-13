"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Quote, Star } from "lucide-react";
import { isReducedMotion } from "@/components/animations/gsap-core";
import { SectionHeading } from "@/components/ui/section-heading";

export interface DbTestimonialItem {
  id?: string;
  clientName?: string | null;
  clientTitle?: string | null;
  company?: string | null;
  avatarUrl?: string | null;
  rating?: number | null;
  content?: string | null;
}

const AUTOPLAY_MS = 7000;

function Avatar({ name, url, size = "h-10 w-10" }: { name: string; url?: string | null; size?: string }) {
  return url ? (
    <img src={url} alt="" loading="lazy" className={`${size} shrink-0 rounded-lg object-cover`} />
  ) : (
    <span className={`${size} flex shrink-0 items-center justify-center rounded-lg bg-surface-3 font-display text-sm font-semibold text-fg-soft`}>
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

export function TestimonialsSection({ initialTestimonials = [] }: { initialTestimonials?: DbTestimonialItem[] }) {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const total = initialTestimonials.length;

  useEffect(() => {
    if (total <= 1 || isPaused || isReducedMotion()) return;
    const timer = setTimeout(() => setActive((current) => (current + 1) % total), AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [active, total, isPaused]);

  // Hidden until there are genuine client testimonials to show.
  if (total === 0) return null;

  const item = initialTestimonials[active];
  const name = item.clientName || "Client";
  const role = [item.clientTitle, item.company].filter((part) => part && part !== name).join(", ");
  const rating = Math.max(0, Math.min(5, Math.round(item.rating ?? 5)));

  return (
    <section id="testimonials" className="wrap section">
      <div className="mb-8 flex flex-col justify-between gap-5 lg:mb-10 lg:flex-row lg:items-end">
        <SectionHeading eyebrow="Client words" title="What it's like to work together." />
        <Link href="/testimonials" className="btn btn-secondary shrink-0 self-start lg:self-auto">
          <span>All testimonials</span>
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div
        className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
      >
        <figure className="card relative flex min-h-[18rem] flex-col justify-between overflow-hidden p-6 sm:p-8">
          <Quote aria-hidden="true" className="absolute right-6 top-6 h-14 w-14 text-white/[0.04]" />
          <div key={active} className="anim-pop">
            <div className="flex gap-0.5" role="img" aria-label={`Rated ${rating} out of 5`}>
              {Array.from({ length: rating }).map((_, index) => (
                <Star key={index} className="h-3.5 w-3.5 fill-accent text-accent" />
              ))}
            </div>
            <blockquote className="mt-4 font-display text-lg font-medium leading-snug sm:text-2xl">&ldquo;{item.content}&rdquo;</blockquote>
          </div>
          <figcaption key={`who-${active}`} className="anim-pop mt-6 flex items-center gap-3">
            <Avatar name={name} url={item.avatarUrl} />
            <div>
              <p className="text-sm font-semibold">{name}</p>
              {role && <p className="text-[0.8125rem] text-fg-muted">{role}</p>}
            </div>
          </figcaption>
        </figure>

        {total > 1 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-none lg:flex-col lg:overflow-visible">
            {initialTestimonials.map((testimonial, index) => {
              const clientName = testimonial.clientName || "Client";
              const isActive = index === active;
              return (
                <button
                  key={testimonial.id ?? index}
                  type="button"
                  onClick={() => setActive(index)}
                  aria-current={isActive ? "true" : undefined}
                  className={`relative flex min-w-[14rem] flex-1 items-center gap-3 overflow-hidden rounded-xl border p-3 text-left transition-colors duration-300 lg:min-w-0 ${
                    isActive ? "border-line-strong bg-surface textured" : "border-line hover:bg-surface/60"
                  }`}
                >
                  <Avatar name={clientName} url={testimonial.avatarUrl} size="h-9 w-9" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{clientName}</span>
                    <span className="mt-0.5 line-clamp-1 text-[0.75rem] text-fg-muted">{testimonial.content}</span>
                  </span>
                  {isActive && !isPaused && (
                    <span key={active} aria-hidden="true" className="anim-progress absolute inset-x-0 bottom-0 h-px bg-accent" style={{ animationDuration: `${AUTOPLAY_MS}ms` }} />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
