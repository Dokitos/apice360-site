import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ServiceForm } from "@/components/admin/ServiceForm";
import { createService } from "../actions";

export default function NewServicePage() {
  return (
    <div>
      <AdminPageHeader title="Novo Serviço" />
      <ServiceForm action={createService} />
    </div>
  );
}
