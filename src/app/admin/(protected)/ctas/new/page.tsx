import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CtaForm } from "@/components/admin/CtaForm";
import { createCta } from "../actions";

export default async function NewCtaPage() {
  const existing = await prisma.cta.findMany({ select: { key: true } });

  return (
    <div>
      <AdminPageHeader title="Novo CTA" />
      <CtaForm action={createCta} existingKeys={existing.map((c) => c.key)} />
    </div>
  );
}
