import { requireAdmin } from "@/lib/auth-utils";
import { TestimonialsManager } from "@/components/admin/testimonials-manager";

export const metadata = {
  title: "Testimonials Management — Webgent Admin",
};

export default async function AdminTestimonialsPage() {
  await requireAdmin();

  return (
    <div className="animate-in fade-in duration-300">
      <TestimonialsManager />
    </div>
  );
}
