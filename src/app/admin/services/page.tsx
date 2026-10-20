import { requireAdmin } from "@/lib/auth-utils";
import {
  getAdminServices,
  getAdminFeatures,
  seedDefaultServicesIfEmpty,
} from "@/lib/services/cms-services";
import { ServicesManager } from "@/components/admin/services-manager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Services & Features CMS — Webgent Admin",
  robots: { index: false, follow: false },
};

export default async function AdminServicesPage() {
  await requireAdmin();

  // Ensure default services are seeded if database is fresh
  await seedDefaultServicesIfEmpty();

  const [services, features] = await Promise.all([
    getAdminServices(),
    getAdminFeatures(),
  ]);

  return (
    <div className="animate-in fade-in duration-300">
      <ServicesManager initialServices={services} initialFeatures={features} />
    </div>
  );
}
