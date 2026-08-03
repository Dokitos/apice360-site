import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BlogPostForm } from "@/components/admin/BlogPostForm";
import { createBlogPost } from "../actions";

export default async function NewBlogPostPage() {
  const categories = await prisma.blogCategory.findMany({
    orderBy: { order: "asc" },
    include: { translations: true },
  });
  const categoryOptions = categories.map((c) => ({
    id: c.id,
    name: c.translations.find((t) => t.locale === "PT")?.name ?? c.id,
  }));

  return (
    <div>
      <AdminPageHeader title="Novo Artigo" />
      <BlogPostForm categories={categoryOptions} action={createBlogPost} />
    </div>
  );
}
