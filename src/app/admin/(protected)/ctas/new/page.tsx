import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CtaForm } from "@/components/admin/CtaForm";
import { createCta } from "../actions";

export default function NewCtaPage() {
  return (
    <div>
      <AdminPageHeader title="Novo CTA" />
      <CtaForm action={createCta} />
    </div>
  );
}
