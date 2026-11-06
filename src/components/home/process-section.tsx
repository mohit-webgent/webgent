"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, CreditCard, Database, FileText, Lock, Mail, MessageSquare, Rocket } from "lucide-react";
import { isReducedMotion } from "@/components/animations/gsap-core";
import { SectionHeading } from "@/components/ui/section-heading";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import type { HomeProject } from "@/lib/services/home-data";
import { resolveShowcase } from "./showcase-images";

const AUTOPLAY_MS = 4200;
const order = (i: number) => ({ "--i": i }) as React.CSSProperties;

const STEPS = [
  { title: "Scope", url: "project-scope.pdf", description: "We agree the pages, features, timeline and price before any work starts." },
  { title: "Design", url: "design / homepage", description: "Responsive layouts and typography, shaped around your brand and your customers." },
  { title: "Build", url: "localhost:3000", description: "Clean, reusable components built with Next.js, React and TypeScript." },
  { title: "Connect", url: "staging / integrations", description: "Databases, payments, email and WhatsApp, wired up and tested together." },
  { title: "Refine", url: "private staging link", description: "Speed, SEO and accessibility are tuned, then you review it all on a private staging link." },
  { title: "Launch", url: "yourbusiness.com", description: "We go live on your domain, you receive the source code, and bug fixes are free during the warranty period." },
];

function ScopeStage() {
  const items = ["Home, About, Services, Contact pages", "Product catalogue and cart", "UPI and card payments", "WhatsApp enquiry alerts"];
  return (
    <div className="flex h-full justify-center bg-surface-2 p-4 sm:p-6">
      <div className="anim-pop flex w-full max-w-md flex-col rounded-lg border border-line-strong bg-surface p-4 shadow-lift sm:p-5">
        <div className="flex items-start justify-between gap-3 border-b border-line pb-3">
          <div>
            <p className="flex items-center gap-1.5 font-display text-sm font-semibold">
              <FileText className="h-4 w-4 text-accent" />
              Project scope
            </p>
            <p className="mt-0.5 text-[0.6875rem] text-fg-muted">Example: online jewellery store</p>
          </div>
          <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[0.625rem] font-medium text-accent">Agreed</span>
        </div>
        <ul className="mt-3 space-y-2">
          {items.map((item, index) => (
            <li key={item} className="anim-pop flex items-center gap-2 text-[0.75rem] text-fg-soft" style={order(index + 1)}>
              <Check className="h-3.5 w-3.5 shrink-0 text-accent" />
              {item}
            </li>
          ))}
        </ul>
        <dl className="mt-auto grid grid-cols-3 gap-2 border-t border-line pt-3 text-[0.6875rem]">
          <div>
            <dt className="text-fg-muted">Timeline</dt>
            <dd className="font-medium">Agreed upfront</dd>
          </div>
          <div>
            <dt className="text-fg-muted">Price</dt>
            <dd className="font-medium">Fixed quote</dd>
          </div>
          <div>
            <dt className="text-fg-muted">Payment</dt>
            <dd className="font-medium">50% / 50%</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

function DesignStage({ image }: { image: string }) {
  return (
    <div className="grid h-full grid-cols-[minmax(0,1fr)_7.5rem] bg-surface-2 sm:grid-cols-[minmax(0,1fr)_9rem]">
      <div className="relative m-3 overflow-hidden rounded-md border border-line-strong sm:m-4">
        <img src={image} alt="" decoding="async" className="anim-fade h-full w-full origin-top scale-[1.04] object-cover object-top grayscale" />
        <div aria-hidden="true" className="absolute inset-0 grid grid-cols-6 gap-2 px-2">
          {[0, 1, 2, 3, 4, 5].map((column) => (
            <span key={column} className="anim-grow-y bg-accent/[0.14]" style={order(column)} />
          ))}
        </div>
        <div aria-hidden="true" className="anim-pop absolute left-[8%] top-[22%] h-[38%] w-[52%] border border-accent" style={order(5)}>
          {["-left-1 -top-1", "-right-1 -top-1", "-bottom-1 -left-1", "-bottom-1 -right-1"].map((corner) => (
            <span key={corner} className={`absolute h-2 w-2 border border-accent bg-canvas ${corner}`} />
          ))}
          <span className="absolute -bottom-6 left-0 rounded bg-accent px-1.5 py-0.5 font-mono text-[0.625rem] text-accent-fg">Hero · 720 × 420</span>
        </div>
      </div>
      <div className="space-y-4 border-l border-line p-3 text-[0.6875rem]">
        <div>
          <p className="text-fg-muted">Colours</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {["#040405", "#F26A1F", "#ECEAE4", "#222225"].map((color, index) => (
              <span key={color} className="anim-pop h-6 w-6 rounded-md border border-line-strong" style={{ background: color, ...order(index) }} />
            ))}
          </div>
        </div>
        <div>
          <p className="text-fg-muted">Type</p>
          <p className="anim-pop mt-1 font-display text-3xl font-semibold leading-none" style={order(3)}>Aa</p>
          <p className="mt-1 text-fg-soft">Display, 62 / 66</p>
        </div>
        <div>
          <p className="text-fg-muted">Screens</p>
          <p className="mt-1 text-fg-soft">Phone, tablet and desktop</p>
        </div>
      </div>
    </div>
  );
}

const CODE: Array<Array<[string, string]>> = [
  [["text-accent", "export default async function "], ["text-fg", "Shop"], ["text-fg-muted", "() {"]],
  [["text-accent", "  const "], ["text-fg", "products "], ["text-fg-muted", "= "], ["text-accent", "await "], ["text-fg", "getProducts"], ["text-fg-muted", "();"]],
  [["text-accent", "  return "], ["text-fg-muted", "("]],
  [["text-fg-muted", "    <"], ["text-accent", "ProductGrid"]],
  [["text-fg-soft", "      items"], ["text-fg-muted", "={"], ["text-fg", "products"], ["text-fg-muted", "}"]],
  [["text-fg-soft", "      onAdd"], ["text-fg-muted", "={"], ["text-fg", "addToCart"], ["text-fg-muted", "}"]],
  [["text-fg-muted", "    />"]],
  [["text-fg-muted", "  );"]],
  [["text-fg-muted", "}"]],
];

function BuildStage({ image }: { image: string }) {
  return (
    <div className="grid h-full sm:grid-cols-2">
      <div className="hidden min-w-0 flex-col border-r border-line bg-canvas sm:flex">
        <div className="flex border-b border-line text-[0.6875rem]">
          <span className="border-b-2 border-accent bg-surface px-3 py-1.5 font-mono">shop/page.tsx</span>
        </div>
        <pre className="flex-1 overflow-hidden p-3 font-mono text-[0.6875rem] leading-[1.7]">
          {CODE.map((line, index) => (
            <span key={index} className="anim-pop flex" style={order(index)}>
              <span aria-hidden="true" className="w-5 shrink-0 select-none text-fg-muted/50">{index + 1}</span>
              <span className="whitespace-pre">
                {line.map(([tone, text]) => (
                  <span key={text} className={tone}>{text}</span>
                ))}
              </span>
            </span>
          ))}
        </pre>
        <p className="border-t border-line px-3 py-1.5 font-mono text-[0.625rem] text-accent">✓ Compiled successfully</p>
      </div>
      <div className="relative min-w-0 overflow-hidden bg-white">
        <img src={image} alt="" decoding="async" className="anim-wipe h-full w-full origin-top scale-[1.04] object-cover object-left-top" />
      </div>
    </div>
  );
}

function ConnectStage({ image }: { image: string }) {
  const services = [
    { icon: <Database className="h-4 w-4" />, label: "Database", note: "Products and orders" },
    { icon: <CreditCard className="h-4 w-4" />, label: "Payments", note: "UPI and cards" },
    { icon: <Mail className="h-4 w-4" />, label: "Email", note: "Order confirmations" },
    { icon: <WhatsAppIcon className="h-4 w-4 fill-current" />, label: "WhatsApp", note: "Instant enquiry alerts" },
  ];
  return (
    <div className="relative h-full overflow-hidden">
      <img src={image} alt="" decoding="async" className="h-full w-full origin-top scale-[1.04] object-cover object-top opacity-40 saturate-50" />
      <ul className="absolute inset-y-4 right-4 flex w-[15rem] flex-col justify-center gap-2">
        {services.map((service, index) => (
          <li key={service.label} className="anim-pop flex items-center gap-2.5 rounded-xl border border-line-strong bg-surface p-2.5 shadow-lift" style={order(index * 3)}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">{service.icon}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[0.8125rem] font-semibold">{service.label}</span>
              <span className="block truncate text-[0.6875rem] text-fg-muted">{service.note}</span>
            </span>
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-accent-fg">
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RefineStage({ image, phone }: { image: string; phone: string }) {
  return (
    <div className="relative h-full overflow-hidden bg-surface-2 p-4">
      <div className="h-[calc(100%-3rem)] overflow-hidden rounded-md border border-line-strong">
        <img src={image} alt="" decoding="async" className="h-full w-full origin-top scale-[1.04] object-cover object-top" />
      </div>
      <div className="anim-pop absolute bottom-14 right-5 h-[62%] w-[23%] min-w-20 overflow-hidden rounded-2xl border-[4px] border-surface-3 bg-canvas shadow-lift" style={order(2)}>
        <img src={phone} alt="" decoding="async" className="h-full w-full object-cover object-[65%_top]" />
      </div>
      <div className="anim-pop absolute left-6 top-8 flex max-w-[60%] items-start gap-2 rounded-xl rounded-tl-sm border border-line-strong bg-surface p-2.5 shadow-lift" style={order(4)}>
        <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
        <span className="text-[0.6875rem] leading-snug">
          <span className="font-semibold">Your review:</span> make the offer banner bigger
          <span className="mt-0.5 block font-medium text-accent">✓ Done</span>
        </span>
      </div>
      <ul className="absolute inset-x-4 bottom-3 flex flex-wrap gap-1.5">
        {["Speed", "SEO", "Accessibility", "Mobile"].map((item, index) => (
          <li key={item} className="anim-pop flex items-center gap-1 rounded-md bg-surface px-2 py-1 text-[0.6875rem] text-fg-soft" style={order(index + 3)}>
            <Check className="h-3 w-3 text-accent" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function LaunchStage({ image }: { image: string }) {
  return (
    <div className="relative h-full overflow-hidden">
      <img src={image} alt="Finished client website" decoding="async" className="anim-fade h-full w-full origin-top scale-[1.04] object-cover object-top" />
      <div className="anim-pop absolute bottom-4 left-4 flex items-center gap-2.5 rounded-xl bg-accent p-2.5 pr-4 text-accent-fg shadow-lift" style={order(2)}>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-fg/10">
          <Rocket className="h-4 w-4" />
        </span>
        <span>
          <span className="block text-[0.8125rem] font-bold">Your website is live</span>
          <span className="block text-[0.6875rem]">Source code handed over</span>
        </span>
      </div>
    </div>
  );
}

export function ProcessSection({ projects = [] }: { projects?: HomeProject[] }) {
  const ref = useRef<HTMLElement | null>(null);
  const [step, setStep] = useState(0);
  const [engaged, setEngaged] = useState(false);
  const [inView, setInView] = useState(false);
  const images = useMemo(() => resolveShowcase(projects), [projects]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setInView(Boolean(entry?.isIntersecting)), { threshold: 0.4 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (engaged || !inView || isReducedMotion()) return;
    const timer = setTimeout(() => setStep((current) => (current + 1) % STEPS.length), AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [step, engaged, inView]);

  const { main, detail } = images.jewellery;
  const stages = [
    <ScopeStage key="scope" />,
    <DesignStage key="design" image={main} />,
    <BuildStage key="build" image={detail} />,
    <ConnectStage key="connect" image={detail} />,
    <RefineStage key="refine" image={detail} phone={main} />,
    <LaunchStage key="launch" image={main} />,
  ];

  return (
    <section ref={ref} id="process" className="border-y border-line bg-surface/40">
      <div className="wrap section grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
        <div>
          <SectionHeading eyebrow="How it works" title="A clear path from idea to launch." />

          <ol className="mt-7 space-y-1" onMouseEnter={() => setEngaged(true)} onMouseLeave={() => setEngaged(false)}>
            {STEPS.map((item, index) => {
              const active = index === step;
              const done = index < step;
              return (
                <li key={item.title}>
                  <button
                    type="button"
                    onClick={() => setStep(index)}
                    onFocus={() => setEngaged(true)}
                    aria-current={active ? "step" : undefined}
                    className={`relative w-full overflow-hidden rounded-lg border px-3.5 py-2.5 text-left transition-colors duration-300 ${
                      active ? "border-accent/60 bg-surface-2" : "border-transparent hover:bg-surface-2/60"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded font-mono text-[0.625rem] transition-colors duration-300 ${
                        active ? "bg-accent text-accent-fg" : done ? "bg-accent/15 text-accent" : "bg-surface-3 text-fg-muted"
                      }`}>
                        {done ? <Check className="h-3 w-3" /> : index + 1}
                      </span>
                      <span className={`font-display text-[0.9375rem] font-semibold transition-colors duration-300 ${active ? "text-fg" : "text-fg-soft"}`}>{item.title}</span>
                    </span>
                    {active && <span key={step} className="anim-pop mt-1.5 block pl-[1.875rem] text-sm leading-relaxed text-fg-muted">{item.description}</span>}
                    {active && !engaged && inView && (
                      <span key={`progress-${step}`} aria-hidden="true" className="anim-progress absolute inset-x-0 bottom-0 h-0.5 bg-accent" style={{ animationDuration: `${AUTOPLAY_MS}ms` }} />
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="overflow-hidden rounded-xl border border-line-strong bg-surface shadow-lift">
          <div className="flex items-center gap-2.5 border-b border-line bg-surface-2 px-3.5 py-2.5">
            <span aria-hidden="true" className="flex gap-1.5">
              <span className="h-2 w-2 rounded-full bg-accent" />
              <span className="h-2 w-2 rounded-full bg-white/20" />
              <span className="h-2 w-2 rounded-full bg-white/20" />
            </span>
            <span className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md bg-canvas px-2.5 py-1 font-mono text-[0.6875rem] text-fg-muted">
              {step === STEPS.length - 1 && <Lock className="h-2.5 w-2.5 shrink-0 text-accent" />}
              <span className="truncate">{STEPS[step].url}</span>
            </span>
            {step === STEPS.length - 1 && (
              <span className="anim-pop flex items-center gap-1.5 text-[0.6875rem] font-medium text-accent">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Live
              </span>
            )}
          </div>
          <div key={step} className="h-[22rem] sm:h-[26rem]">
            {stages[step]}
          </div>
        </div>
      </div>
    </section>
  );
}
