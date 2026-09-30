import { ContactForm } from "@/components/contact/contact-form";
import { siteConfig } from "@/config/site";
import type { Metadata } from "next";

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
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            Start Your Project
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Work With Webgent
          </h1>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
            Ready to turn your vision into high-performance digital software? Reach out to our team today.
          </p>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
