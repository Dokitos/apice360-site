import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatForm } from "@/components/admin/StatForm";
import { createStat } from "../actions";

export default function NewStatPage() {
  return (
    <div>
      <AdminPageHeader title="Nova Estatística" />
      <StatForm action={createStat} />
    </div>
  );
}
