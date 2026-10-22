import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EmailTemplateForm } from "@/components/admin/email/EmailTemplateForm";
import { updateEmailTemplate } from "../../../actions";

export default async function EditEmailTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const modelo = await prisma.emailTemplate.findUnique({ where: { id } });
  if (!modelo) notFound();

  return (
    <div>
      <h2 className="mb-6 font-heading text-headline-md">Editar modelo</h2>
      <EmailTemplateForm template={modelo} action={updateEmailTemplate.bind(null, id)} />
    </div>
  );
}
