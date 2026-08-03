import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { TestimonialForm } from "@/components/admin/TestimonialForm";
import { createTestimonial } from "../actions";

export default function NewTestimonialPage() {
  return (
    <div>
      <AdminPageHeader title="Novo Testemunho" />
      <TestimonialForm action={createTestimonial} />
    </div>
  );
}
