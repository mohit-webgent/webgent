import { requireAdmin } from "@/lib/auth-utils";
import { BlogList } from "@/components/admin/blog-list";

export default async function AdminBlogPage() {
  await requireAdmin();

  return (
    <div className="animate-in fade-in duration-300">
      <BlogList />
    </div>
  );
}
