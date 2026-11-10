import { Mail, MessageCircle } from "lucide-react";
import { siteConfig } from "@/config/site";

/** Shown on every public page while Admin → Settings → Maintenance mode is on. The admin console stays reachable. */
export function MaintenanceScreen({ email, phone }: { email?: string; phone?: string }) {
  const whatsappNumber = phone?.replace(/\D/g, "");

  return (
    <main id="main-content" className="wrap flex min-h-screen flex-col items-center justify-center py-16 text-center">
      <span
        aria-hidden="true"
        className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent font-display text-lg font-bold text-accent-fg"
      >
        W
      </span>
      <p className="eyebrow mt-8">{siteConfig.name}</p>
      <h1 className="display-lg mt-4 max-w-xl">We&apos;re making a few improvements.</h1>
      <p className="lede mt-4 max-w-md">
        The website will be back shortly. If you have a project in mind, you can still reach Mohit directly.
      </p>
      <div className="cta-row mt-8 flex flex-wrap items-center justify-center gap-3">
        {email && (
          <a href={`mailto:${email}`} className="btn btn-primary">
            <Mail className="h-4 w-4" />
            <span>{email}</span>
          </a>
        )}
        {whatsappNumber && (
          <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
            <MessageCircle className="h-4 w-4" />
            <span>WhatsApp</span>
          </a>
        )}
      </div>
    </main>
  );
}
