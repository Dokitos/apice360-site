import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PartnerForm } from "@/components/admin/PartnerForm";
import { createPartner } from "../actions";

export default function NewPartnerPage() {
  return (
    <div>
      <AdminPageHeader title="Novo Parceiro" />
      <PartnerForm action={createPartner} />
    </div>
  );
}
