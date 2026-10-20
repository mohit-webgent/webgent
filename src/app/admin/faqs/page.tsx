import { requireAdmin } from "@/lib/auth-utils";
import { getSiteFaqs } from "@/lib/services/cms";
import { FaqContentEditor } from "@/components/admin/faq-content-editor";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "FAQs Management — Webgent Admin",
  robots: { index: false, follow: false },
};

export default async function AdminFaqsPage() {
  await requireAdmin();

  // Load all FAQs including unpublished drafts for admin editing
  const initialFaqs = await getSiteFaqs({ publishedOnly: false });

  return (
    <div className="animate-in fade-in duration-300">
      <FaqContentEditor initialConfig={initialFaqs} />
    </div>
  );
}
