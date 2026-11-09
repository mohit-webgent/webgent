"use client";

import { useEffect, useRef, useState } from "react";
import { isReducedMotion } from "@/components/animations/gsap-core";

function CountUp({ value, prefix = "" }: { value: number; prefix?: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const element = ref.current;
    if (!element || isReducedMotion()) return;

    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        const startedAt = performance.now();
        const tick = (now: number) => {
          const progress = Math.min(1, (now - startedAt) / 1100);
          setShown(Math.round(value * (1 - Math.pow(1 - progress, 3))));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {shown.toLocaleString("en-IN")}
    </span>
  );
}

export function StatsBand({ projectCount, startingPrice }: { projectCount: number; startingPrice: number }) {
  // Every figure comes from the database or the pricing terms, never from a marketing estimate.
  const accent = (text: string) => <span className="text-accent">{text}</span>;
  const stats = [
    ...(projectCount > 0 ? [{ value: <CountUp value={projectCount} />, label: "Projects published" }] : []),
    { value: <>{accent("₹")}<CountUp value={startingPrice} /></>, label: "Starting price" },
    { value: <><CountUp value={100} />{accent("%")}</>, label: "Source code ownership" },
    { value: <CountUp value={1} />, label: "Developer, start to finish" },
  ];

  return (
    <section aria-label="At a glance" className="wrap py-10 sm:py-12">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-8 sm:flex sm:flex-wrap sm:justify-between">
        {stats.map(({ value, label }) => (
          <div key={label} className="flex flex-col">
            <dt className="order-2 mt-1.5 text-[0.8125rem] text-fg-muted">{label}</dt>
            <dd className="order-1 font-display text-[1.75rem] font-semibold leading-none tracking-[-0.03em] sm:text-[2rem]">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
