import { requireAdmin } from "@/lib/auth-utils";
import { getPricingData } from "@/lib/services/pricing";
import { PricingContentEditor } from "@/components/admin/pricing-content-editor";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pricing & Packages Manager — Webgent Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPricingPage() {
  await requireAdmin();
  const pricingData = await getPricingData();

  return <PricingContentEditor initialData={pricingData} />;
}
