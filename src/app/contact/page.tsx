import { ContactForm } from "@/components/contact/contact-form";
import { siteConfig } from "@/config/site";
import type { Metadata } from "next";
import { ClipReveal } from "@/components/animations/clip-reveal";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Contact Us & Project Inquiries | Webgent",
  description:
    "Get in touch with Webgent for custom web engineering, mobile app development, and cloud software solutions. Discuss your project directly with our technical team.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Us & Project Inquiries | Webgent",
    description:
      "Discuss your software architecture, web development, or custom product requirements with Webgent engineers.",
    url: `${siteConfig.url}/contact`,
    siteName: siteConfig.name,
    images: [
      {
        url: "/api/og?title=Start+Your+Project+With+Webgent&badge=Direct+Consultation",
        width: 1200,
        height: 630,
        alt: "Contact Webgent",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us & Project Inquiries | Webgent",
    description:
      "Discuss your software architecture, web development, or custom product requirements with Webgent engineers.",
    images: ["/api/og?title=Start+Your+Project+With+Webgent&badge=Direct+Consultation"],
    creator: "@webgent",
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#080808] text-[#D0D0CE] py-16 px-5 sm:px-8 lg:px-12 relative overflow-hidden font-sans">
      <div className="max-w-4xl mx-auto relative z-10 space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.02] border border-white/10 text-[#A0A0A0] text-xs font-mono uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
            <span>DIRECT ENGAGEMENT / ARCHITECT CONSULTATION</span>
          </div>
          <ClipReveal>
            <h1 className="text-4xl sm:text-6xl font-bold text-[#F5F5F3] tracking-tight uppercase">
              Work With Webgent
            </h1>
          </ClipReveal>
          <p className="text-sm sm:text-base text-[#909090] max-w-2xl mx-auto leading-relaxed">
            Ready to turn your vision into high-performance digital software? Reach out directly to
            our engineering leads.
          </p>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
