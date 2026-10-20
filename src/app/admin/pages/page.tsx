import { requireAdmin } from "@/lib/auth-utils";
import {
  getHomepageHeroContent,
  getHomepageSectionsConfig,
} from "@/lib/services/cms";
import { HomepageContentEditor } from "@/components/admin/homepage-content-editor";

export const metadata = {
  title: "Pages & Content Editor — Webgent Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPagesPage() {
  await requireAdmin();

  const [initialHero, initialSections] = await Promise.all([
    getHomepageHeroContent(),
    getHomepageSectionsConfig(),
  ]);

  return (
    <div className="animate-in fade-in duration-300">
      <HomepageContentEditor
        initialHero={initialHero}
        initialSections={initialSections.sections}
      />
    </div>
  );
}
