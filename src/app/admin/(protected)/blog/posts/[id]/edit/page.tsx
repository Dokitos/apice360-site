import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BlogPostForm } from "@/components/admin/BlogPostForm";
import { updateBlogPost } from "../../actions";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, categories] = await Promise.all([
    prisma.blogPost.findUnique({ where: { id }, include: { translations: true } }),
    prisma.blogCategory.findMany({ orderBy: { order: "asc" }, include: { translations: true } }),
  ]);
  if (!post) notFound();

  const categoryOptions = categories.map((c) => ({
    id: c.id,
    name: c.translations.find((t) => t.locale === "PT")?.name ?? c.id,
  }));

  return (
    <div>
      <AdminPageHeader title="Editar Artigo" />
      <BlogPostForm post={post} categories={categoryOptions} action={updateBlogPost.bind(null, id)} />
    </div>
  );
}
