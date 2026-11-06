"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  Check,
  Code2,
  CreditCard,
  Database,
  Gauge,
  Inbox,
  LayoutDashboard,
  Lock,
  Mail,
  PencilRuler,
  Plug,
  Search,
  Settings,
  ShoppingBag,
  Users,
  X,
} from "lucide-react";
import { isReducedMotion } from "@/components/animations/gsap-core";
import { SectionHeading } from "@/components/ui/section-heading";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import type { HomeProject } from "@/lib/services/home-data";
import { resolveShowcase, type ShowcaseImages, type ShowcaseProject } from "./showcase-images";

const AUTOPLAY_MS = 6500;
const order = (i: number) => ({ "--i": i }) as React.CSSProperties;

function Browser({ url, className = "", children }: { url: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`flex flex-col overflow-hidden rounded-xl border border-line-strong bg-surface shadow-lift ${className}`}>
      <div className="flex shrink-0 items-center gap-2.5 border-b border-line bg-surface-2 px-3 py-2">
        <span aria-hidden="true" className="flex gap-1">
          <span className="h-2 w-2 rounded-full bg-accent" />
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="h-2 w-2 rounded-full bg-white/20" />
        </span>
        <span className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md bg-canvas px-2.5 py-1 font-mono text-[0.6875rem] text-fg-muted">
          <Lock className="h-2.5 w-2.5 shrink-0" />
          <span className="truncate">{url}</span>
        </span>
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
}

function Shot({ src, alt = "", className = "" }: { src: string; alt?: string; className?: string }) {
  return <img src={src} alt={alt} decoding="async" className={`h-full w-full origin-top scale-[1.04] object-cover object-top ${className}`} />;
}

function ProjectTag({ project, note }: { project: ShowcaseProject; note: string }) {
  const content = (
    <>
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
      <span className="truncate">
        {project.title} <span className="text-fg-muted">· {note}</span>
      </span>
      {project.slug && <ArrowUpRight className="h-3 w-3 shrink-0 text-accent" />}
    </>
  );
  const className = "absolute left-4 top-4 z-20 flex max-w-[70%] items-center gap-1.5 rounded-lg border border-line-strong bg-canvas/95 px-2.5 py-1.5 text-[0.6875rem] font-medium shadow-card";
  return project.slug ? (
    <Link href={`/work/${project.slug}`} className={`${className} transition-colors hover:border-accent`}>
      {content}
    </Link>
  ) : (
    <span className={className}>{content}</span>
  );
}

function WebsitePreview({ images }: { images: ShowcaseImages }) {
  const { website } = images;
  return (
    <div className="relative h-full p-4 pt-14 sm:p-6 sm:pt-14">
      <ProjectTag project={website} note="live client website" />
      <Browser url={website.domain} className="anim-pop h-full">
        <Shot src={website.main} alt={`${website.title} website`} />
      </Browser>
      <div className="anim-pop absolute bottom-3 right-3 hidden w-[42%] sm:block" style={order(2)}>
        <Browser url={`${website.domain}/why-us`} className="aspect-[16/10]">
          <Shot src={website.detail} alt="" />
        </Browser>
      </div>
      <div className="anim-pop absolute bottom-5 left-3 z-10 flex items-center gap-2.5 rounded-xl border border-line-strong bg-surface-2 p-2.5 shadow-lift sm:left-3" style={order(4)}>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-fg">
          <Inbox className="h-4 w-4" />
        </span>
        <span className="pr-1">
          <span className="block text-[0.75rem] font-semibold">New enquiry received</span>
          <span className="block text-[0.6875rem] text-fg-muted">From your contact page</span>
        </span>
      </div>
    </div>
  );
}

/** Crops one product from a catalogue screenshot, so the cart shows the real item. */
function ProductCrop({ src, x }: { src: string; x: number }) {
  const IMAGE_WIDTH = 1893;
  const IMAGE_HEIGHT = 868;
  const SIZE = 320;
  const TOP = 215;
  return (
    <span
      aria-hidden="true"
      className="block h-11 w-11 shrink-0 rounded-md border border-line bg-white bg-no-repeat"
      style={{
        backgroundImage: `url("${src}")`,
        backgroundSize: `${(IMAGE_WIDTH / SIZE) * 100}% auto`,
        backgroundPosition: `${(x / (IMAGE_WIDTH - SIZE)) * 100}% ${(TOP / (IMAGE_HEIGHT - SIZE)) * 100}%`,
      }}
    />
  );
}

const CART_ITEMS = [
  { name: "HP LaserJet Pro MFP 4104DW", price: 31999, x: 60 },
  { name: "Epson EcoTank L8050", price: 27999, x: 415 },
  { name: "Brother DCP-T530DW", price: 14999, x: 768 },
];

function StorePreview({ images }: { images: ShowcaseImages }) {
  const { store } = images;
  const [count, setCount] = useState(1);

  useEffect(() => {
    if (isReducedMotion()) return;
    const timer = setInterval(() => setCount((current) => (current >= CART_ITEMS.length ? 1 : current + 1)), 1700);
    return () => clearInterval(timer);
  }, []);

  const inCart = CART_ITEMS.slice(0, count);
  const total = inCart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="relative h-full p-4 pt-14 sm:p-6 sm:pt-14">
      <ProjectTag project={store} note="live online store" />
      <Browser url={`${store.domain}/shop`} className="anim-pop h-full">
        <Shot src={store.detail} alt={`${store.title} product catalogue`} />
      </Browser>

      <div aria-hidden="true" className="absolute bottom-3 right-3 top-[3.75rem] flex w-[11.5rem] flex-col rounded-xl sm:w-[14.5rem] border border-line-strong bg-surface p-3 shadow-lift sm:right-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[0.8125rem] font-semibold">
            <ShoppingBag className="h-3.5 w-3.5 text-accent" />
            Your cart
            <span key={count} className="anim-pop flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[0.625rem] text-accent-fg">{count}</span>
          </span>
          <X className="h-3.5 w-3.5 text-fg-muted" />
        </div>
        <ul className="mt-2.5 flex-1 space-y-2 overflow-hidden">
          {inCart.map((item) => (
            <li key={item.name} className="anim-pop flex items-center gap-2 rounded-lg border border-line bg-surface-2 p-1.5">
              <ProductCrop src={store.detail} x={item.x} />
              <span className="min-w-0">
                <span className="block truncate text-[0.6875rem]">{item.name}</span>
                <span className="block font-mono text-[0.6875rem] font-semibold text-accent">₹{item.price.toLocaleString("en-IN")}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex items-center justify-between border-t border-line pt-2 text-[0.75rem]">
          <span className="text-fg-muted">Subtotal</span>
          <span className="font-mono font-semibold">₹{total.toLocaleString("en-IN")}</span>
        </div>
        <div className="mt-2 flex h-8 items-center justify-center gap-1.5 rounded-lg bg-accent text-[0.75rem] font-semibold text-accent-fg">
          <Lock className="h-3 w-3" />
          Pay with UPI or card
        </div>
      </div>
    </div>
  );
}

const DASHBOARD_ORDERS = [
  { name: "Priya Sharma", item: "Website redesign", amount: "₹24,500", status: "Paid" },
  { name: "Arjun Mehta", item: "Annual plan", amount: "₹18,000", status: "Paid" },
  { name: "Neha Gupta", item: "Consultation", amount: "₹3,500", status: "Pending" },
];

function DashboardPreview() {
  const line = "M0,82 C30,74 50,78 80,60 S130,66 160,44 S215,50 245,30 S290,26 320,10";
  return (
    <div className="grid h-full grid-cols-[3rem_minmax(0,1fr)] sm:grid-cols-[9.5rem_minmax(0,1fr)]" aria-label="Example dashboard with sample data" role="img">
      <div className="flex flex-col gap-1 border-r border-line bg-surface-2 p-2 sm:p-3">
        <div className="mb-2 flex items-center gap-2 px-1 font-display text-sm font-semibold">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent text-[0.6875rem] font-bold text-accent-fg">B</span>
          <span className="hidden sm:inline">BrandDesk</span>
        </div>
        {[
          { icon: LayoutDashboard, label: "Overview", active: true },
          { icon: ShoppingBag, label: "Orders" },
          { icon: Users, label: "Customers" },
          { icon: BarChart3, label: "Reports" },
          { icon: Settings, label: "Settings" },
        ].map(({ icon: Icon, label, active }) => (
          <div key={label} className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[0.75rem] ${active ? "bg-accent/15 font-medium text-accent" : "text-fg-muted"}`}>
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">{label}</span>
          </div>
        ))}
        <span className="mt-auto hidden rounded-md border border-line px-2 py-1 text-center text-[0.625rem] text-fg-muted sm:block">Sample data</span>
      </div>

      <div className="flex min-w-0 flex-col gap-3 p-3 sm:p-4">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Revenue", value: "₹4.82L", change: "+12.4%" },
            { label: "Orders", value: "1,284", change: "+8.1%" },
            { label: "Customers", value: "642", change: "+5.7%" },
          ].map((kpi, index) => (
            <div key={kpi.label} className="anim-pop rounded-lg border border-line bg-surface-2 p-2.5" style={order(index)}>
              <p className="truncate text-[0.6875rem] text-fg-muted">{kpi.label}</p>
              <p className="mt-0.5 font-display text-base font-semibold tracking-tight sm:text-lg">{kpi.value}</p>
              <p className="font-mono text-[0.625rem] text-accent">{kpi.change}</p>
            </div>
          ))}
        </div>

        <div className="relative min-h-0 flex-1 rounded-lg border border-line bg-surface-2 p-3">
          <p className="text-[0.75rem] font-medium">Revenue this year</p>
          <svg viewBox="0 0 320 92" preserveAspectRatio="none" className="absolute inset-x-3 bottom-2 h-[calc(100%-2.25rem)] w-[calc(100%-1.5rem)]" aria-hidden="true">
            <defs>
              <linearGradient id="dash-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgb(var(--color-accent))" stopOpacity="0.35" />
                <stop offset="100%" stopColor="rgb(var(--color-accent))" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={`${line} L320,92 L0,92 Z`} fill="url(#dash-fill)" className="anim-fade" />
            <path d={line} fill="none" stroke="rgb(var(--color-accent))" strokeWidth="2" vectorEffect="non-scaling-stroke" pathLength={1} className="anim-draw" />
          </svg>
        </div>

        <table className="w-full text-left text-[0.6875rem]">
          <tbody className="divide-y divide-line">
            {DASHBOARD_ORDERS.map((order_, index) => (
              <tr key={order_.name} className="anim-pop" style={order(index + 3)}>
                <td className="py-1.5 pr-2">
                  <span className="flex items-center gap-1.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-3 text-[0.5625rem] font-semibold">{order_.name.charAt(0)}</span>
                    <span className="truncate font-medium">{order_.name}</span>
                  </span>
                </td>
                <td className="hidden py-1.5 pr-2 text-fg-muted sm:table-cell">{order_.item}</td>
                <td className="py-1.5 pr-2 font-mono">{order_.amount}</td>
                <td className="py-1.5 text-right">
                  <span className={`rounded px-1.5 py-0.5 text-[0.625rem] ${order_.status === "Paid" ? "bg-accent/15 text-accent" : "bg-surface-3 text-fg-soft"}`}>{order_.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EditorPreview({ images }: { images: ShowcaseImages }) {
  const slides = useMemo(
    () => [
      { headline: "Handcrafted silver, made for every day", cta: "Shop the collection", image: images.jewellery.detail },
      { headline: "Expert phone repairs, done the same day", cta: "Book a repair", image: images.services.main },
      { headline: "Printers and supplies, delivered fast", cta: "Browse products", image: images.store.main },
    ],
    [images],
  );
  const [index, setIndex] = useState(0);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (locked || isReducedMotion()) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % slides.length), 2600);
    return () => clearInterval(timer);
  }, [locked, slides.length]);

  const slide = slides[index];

  return (
    <div className="grid h-full gap-3 p-3 sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] sm:p-4">
      <div className="flex min-h-0 flex-col gap-3 rounded-xl border border-line-strong bg-surface p-3.5 shadow-card">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-[0.8125rem] font-semibold">
            <PencilRuler className="h-3.5 w-3.5 text-accent" />
            Edit homepage
          </p>
          <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[0.625rem] text-accent">Admin panel</span>
        </div>
        <div>
          <p className="mb-1 text-[0.6875rem] text-fg-muted">Headline</p>
          <p key={index} className="anim-pop rounded-lg border border-accent bg-canvas px-2.5 py-2 text-[0.75rem] leading-snug">{slide.headline}</p>
        </div>
        <div>
          <p className="mb-1 text-[0.6875rem] text-fg-muted">Button text</p>
          <p key={index} className="anim-pop rounded-lg border border-line-strong bg-canvas px-2.5 py-2 text-[0.75rem]">{slide.cta}</p>
        </div>
        <div className="hidden min-h-0 sm:block">
          <p className="mb-1 text-[0.6875rem] text-fg-muted">Banner image: try one</p>
          <div className="grid grid-cols-3 gap-1.5">
            {slides.map((item, itemIndex) => (
              <button
                key={item.headline}
                type="button"
                aria-label={`Use banner ${itemIndex + 1}`}
                aria-pressed={itemIndex === index}
                onClick={() => {
                  setLocked(true);
                  setIndex(itemIndex);
                }}
                className={`aspect-[4/3] overflow-hidden rounded-md border-2 transition-colors ${itemIndex === index ? "border-accent" : "border-transparent hover:border-line-strong"}`}
              >
                <Shot src={item.image} />
              </button>
            ))}
          </div>
        </div>
        <div className="mt-auto flex h-8 items-center justify-center rounded-lg bg-accent text-[0.75rem] font-semibold text-accent-fg">Publish changes</div>
      </div>

      <Browser url="yourbusiness.com" className="min-h-48">
        <div key={index} className="anim-fade absolute inset-0">
          <Shot src={slide.image} />
        </div>
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/10" />
        <div key={`copy-${index}`} className="anim-pop absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <p className="font-mono text-[0.625rem] uppercase tracking-widest text-accent">Updated instantly</p>
          <p className="mt-1 max-w-xs font-display text-lg font-semibold leading-tight text-white sm:text-2xl">{slide.headline}</p>
          <span className="mt-3 inline-flex rounded-lg bg-accent px-3 py-1.5 text-[0.75rem] font-semibold text-accent-fg">{slide.cta}</span>
        </div>
      </Browser>
    </div>
  );
}

function IntegrationsPreview({ images }: { images: ShowcaseImages }) {
  const events = [
    { icon: <WhatsAppIcon className="h-4 w-4 fill-current" />, tint: "text-whatsapp", title: "WhatsApp", body: "New enquiry from your website", time: "now" },
    { icon: <CreditCard className="h-4 w-4" />, tint: "text-accent", title: "Payment received", body: "₹7,500 paid by UPI", time: "1m" },
    { icon: <Mail className="h-4 w-4" />, tint: "text-accent", title: "Email sent", body: "Order confirmation to the customer", time: "1m" },
    { icon: <Database className="h-4 w-4" />, tint: "text-accent", title: "Database updated", body: "Order saved, stock reduced by one", time: "2m" },
  ];

  return (
    <div className="grid h-full items-center gap-0 p-4 sm:grid-cols-[minmax(0,6fr)_3rem_minmax(0,6fr)] sm:p-6">
      <Browser url={images.services.domain} className="anim-pop h-full max-sm:hidden">
        <Shot src={images.services.detail} alt={`${images.services.title} website`} />
      </Browser>

      <svg aria-hidden="true" viewBox="0 0 48 272" className="hidden h-[17rem] w-12 sm:block">
        {[31, 101, 171, 241].map((y) => (
          <path key={y} d={`M0,136 C24,136 24,${y} 48,${y}`} fill="none" stroke="rgb(var(--color-accent))" strokeWidth="1.5" className="anim-dash" />
        ))}
        <circle cx="2" cy="136" r="3" fill="rgb(var(--color-accent))" />
      </svg>

      <ul className="space-y-2">
        {events.map((event, index) => (
          <li key={event.title} className="anim-pop flex items-center gap-2.5 rounded-xl border border-line-strong bg-surface-2 p-3 shadow-card" style={order(index * 3)}>
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-canvas ${event.tint}`}>{event.icon}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[0.8125rem] font-semibold">{event.title}</span>
              <span className="block truncate text-[0.6875rem] text-fg-muted">{event.body}</span>
            </span>
            <span className="shrink-0 font-mono text-[0.625rem] text-fg-muted">{event.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SpeedPreview({ images }: { images: ShowcaseImages }) {
  const links = ["Shop all", "New arrivals", "Under ₹1,500", "Contact"];
  return (
    <div className="grid h-full gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_10.5rem] sm:p-6">
      <div className="flex min-w-0 flex-col gap-3">
        <div className="anim-pop flex items-center gap-2.5 rounded-full border border-line-strong bg-surface-2 px-4 py-2.5 text-[0.8125rem]">
          <Search className="h-3.5 w-3.5 text-accent" />
          silver jewellery online
          <span className="ml-auto text-[0.625rem] text-fg-muted">Example search result</span>
        </div>

        <article className="anim-pop flex flex-1 flex-col rounded-xl border border-line-strong bg-surface-2 p-4" style={order(1)}>
          <div className="flex gap-3.5">
            <div className="min-w-0 flex-1">
              <p className="truncate font-mono text-[0.6875rem] text-fg-muted">yourbusiness.com › collections</p>
              <p className="mt-1 font-display text-base font-semibold leading-snug text-accent">Handcrafted Silver Jewellery | Your Business</p>
              <p className="mt-1.5 line-clamp-3 text-[0.75rem] leading-relaxed text-fg-soft">
                Clear titles, descriptions and structured data help search engines understand your pages and show them properly.
              </p>
            </div>
            <div className="hidden h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-line sm:block">
              <img
                src={images.jewellery.detail}
                alt=""
                decoding="async"
                className="h-full w-full object-cover"
                style={{ objectPosition: "2% 52%", transform: "scale(4.2)", transformOrigin: "9% 52%" }}
              />
            </div>
          </div>
          <ul className="mt-auto grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line pt-3">
            {links.map((link) => (
              <li key={link} className="truncate text-[0.75rem] font-medium text-fg">{link}</li>
            ))}
          </ul>
        </article>

        <ul className="grid grid-cols-2 gap-1.5">
          {["Optimised images", "Structured data", "Clean markup", "Mobile first"].map((item, index) => (
            <li key={item} className="anim-pop flex items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-2.5 py-2 text-[0.75rem] text-fg-soft" style={order(index + 2)}>
              <Check className="h-3.5 w-3.5 shrink-0 text-accent" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="anim-pop hidden min-h-0 flex-col overflow-hidden rounded-[1.5rem] border-[5px] border-surface-3 bg-canvas shadow-lift sm:flex" style={order(2)}>
        <div className="flex shrink-0 justify-center py-1.5">
          <span className="h-1 w-10 rounded-full bg-surface-3" />
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">
          <img src={images.jewellery.main} alt="" decoding="async" className="h-full w-full object-cover object-[84%_top]" />
        </div>
      </div>
    </div>
  );
}

const CAPABILITIES = [
  { icon: Code2, title: "Business websites", description: "Fast, custom-built sites that explain what you do and turn visitors into enquiries.", preview: WebsitePreview },
  { icon: CreditCard, title: "Online stores", description: "Catalogues, carts and checkout with Razorpay, UPI and Stripe.", preview: StorePreview },
  { icon: LayoutDashboard, title: "Web apps & dashboards", description: "Portals and internal tools with secure logins, roles and real data.", preview: DashboardPreview },
  { icon: PencilRuler, title: "Editable content", description: "An admin panel so you can update text, images and pricing without calling a developer.", preview: EditorPreview },
  { icon: Plug, title: "Integrations", description: "WhatsApp, email, payments and third-party APIs, connected to how you already work.", preview: IntegrationsPreview },
  { icon: Gauge, title: "Speed & SEO", description: "Optimised images, clean markup and structured data, so pages load quickly and can be found.", preview: SpeedPreview },
];

export function CapabilitiesSection({ projects = [] }: { projects?: HomeProject[] }) {
  const [active, setActive] = useState(0);
  const [engaged, setEngaged] = useState(false);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const images = useMemo(() => resolveShowcase(projects), [projects]);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(Boolean(entry?.isIntersecting));
        // Loads every demo's screenshots ahead of time, so switching tabs never shows an empty frame.
        if (entry?.isIntersecting) {
          Object.values(images).forEach((project: ShowcaseProject) => {
            [project.main, project.detail].forEach((src) => {
              new Image().src = src;
            });
          });
        }
      },
      { threshold: 0.2, rootMargin: "300px 0px 0px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [images]);

  useEffect(() => {
    if (engaged || !inView || isReducedMotion()) return;
    const timer = setTimeout(() => setActive((current) => (current + 1) % CAPABILITIES.length), AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [active, engaged, inView]);

  const Preview = CAPABILITIES[active].preview;

  return (
    <section ref={sectionRef} id="capabilities" className="wrap section">
      <div className="mb-8 flex flex-col justify-between gap-5 lg:mb-10 lg:flex-row lg:items-end">
        <SectionHeading
          eyebrow="What we build"
          title="From a first website to a full product."
          description="One developer, involved from the first conversation to launch day."
        />
        <Link href="/services" className="btn btn-secondary shrink-0 self-start lg:self-auto">
          <span>All services</span>
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]" onMouseEnter={() => setEngaged(true)} onMouseLeave={() => setEngaged(false)}>
        <div className="space-y-1" role="tablist" aria-label="Capabilities" aria-orientation="vertical">
          {CAPABILITIES.map(({ icon: Icon, title, description }, index) => {
            const isActive = index === active;
            return (
              <button
                key={title}
                type="button"
                role="tab"
                id={`capability-tab-${index}`}
                aria-selected={isActive}
                aria-controls="capability-panel"
                onClick={() => setActive(index)}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setEngaged(true)}
                className={`relative block w-full overflow-hidden rounded-xl border px-4 py-3 text-left transition-colors duration-300 ${
                  isActive ? "border-accent/60 bg-surface" : "border-transparent hover:bg-surface/60"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-300 ${isActive ? "bg-accent text-accent-fg" : "bg-surface-2 text-fg-muted"}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className={`font-display text-[0.9375rem] font-semibold transition-colors duration-300 ${isActive ? "text-fg" : "text-fg-soft"}`}>{title}</span>
                </span>
                <span className={`grid transition-[grid-template-rows,opacity,margin] duration-500 ease-expo-out ${isActive ? "mt-2 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <span className="overflow-hidden pl-11 text-sm leading-relaxed text-fg-muted">{description}</span>
                </span>
                {isActive && !engaged && inView && (
                  <span key={active} aria-hidden="true" className="anim-progress absolute inset-x-0 bottom-0 h-0.5 bg-accent" style={{ animationDuration: `${AUTOPLAY_MS}ms` }} />
                )}
              </button>
            );
          })}
        </div>

        <div
          id="capability-panel"
          role="tabpanel"
          aria-labelledby={`capability-tab-${active}`}
          className="card relative h-[32rem] overflow-hidden bg-surface sm:h-[28rem] lg:h-[29rem]"
        >
          <div key={active} className="h-full">
            <Preview images={images} />
          </div>
        </div>
      </div>
    </section>
  );
}
