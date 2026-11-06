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
  const stats = [
    ...(projectCount > 0 ? [{ value: <CountUp value={projectCount} />, label: "Projects published" }] : []),
    { value: <CountUp value={startingPrice} prefix="₹" />, label: "Starting price" },
    { value: <><CountUp value={100} />%</>, label: "Source code ownership" },
    { value: <CountUp value={1} />, label: "Developer, start to finish" },
  ];

  return (
    <section aria-label="At a glance" className="border-b border-line">
      <dl className="wrap grid grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={`py-6 lg:py-7 ${index % 2 === 1 ? "border-l border-line pl-5 sm:pl-8" : ""} ${
              index >= 2 ? "max-lg:border-t max-lg:border-line" : ""
            } ${index === 2 ? "lg:border-l lg:border-line lg:pl-8" : ""}`}
          >
            <dd className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{stat.value}</dd>
            <dt className="mt-1 text-[0.8125rem] text-fg-muted">{stat.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
