import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { TestimonialForm } from "@/components/admin/TestimonialForm";
import { updateTestimonial } from "../../actions";

export default async function EditTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const testimonial = await prisma.testimonial.findUnique({
    where: { id },
    include: { translations: true },
  });
  if (!testimonial) notFound();

  return (
    <div>
      <AdminPageHeader title="Editar Testemunho" />
      <TestimonialForm testimonial={testimonial} action={updateTestimonial.bind(null, id)} />
    </div>
  );
}
