import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CustomPageForm } from "@/components/admin/CustomPageForm";
import { createCustomPage } from "../actions";

export default function NewCustomPagePage() {
  return (
    <div>
      <AdminPageHeader title="Nova Página" />
      <CustomPageForm action={createCustomPage} />
    </div>
  );
}
