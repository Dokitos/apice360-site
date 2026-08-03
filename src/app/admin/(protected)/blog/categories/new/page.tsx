import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BlogCategoryForm } from "@/components/admin/BlogCategoryForm";
import { createBlogCategory } from "../actions";

export default function NewBlogCategoryPage() {
  return (
    <div>
      <AdminPageHeader title="Nova Categoria" />
      <BlogCategoryForm action={createBlogCategory} />
    </div>
  );
}
