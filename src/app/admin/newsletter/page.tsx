import { requireAdmin } from "@/lib/auth-utils";
import { NewsletterManager } from "@/components/admin/newsletter-manager";

export const metadata = {
  title: "Newsletter Subscribers — Webgent Admin",
};

export default async function AdminNewsletterPage() {
  await requireAdmin();

  return (
    <div className="animate-in fade-in duration-300">
      <NewsletterManager />
    </div>
  );
}
