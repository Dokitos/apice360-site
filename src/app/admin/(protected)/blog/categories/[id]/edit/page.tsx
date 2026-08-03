import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BlogCategoryForm } from "@/components/admin/BlogCategoryForm";
import { updateBlogCategory } from "../../actions";

export default async function EditBlogCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await prisma.blogCategory.findUnique({
    where: { id },
    include: { translations: true },
  });
  if (!category) notFound();

  return (
    <div>
      <AdminPageHeader title="Editar Categoria" />
      <BlogCategoryForm category={category} action={updateBlogCategory.bind(null, id)} />
    </div>
  );
}
