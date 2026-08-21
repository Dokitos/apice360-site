import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { GroupForm } from "@/components/admin/GroupForm";
import { createGroup } from "../actions";

export default function NewGroupPage() {
  return (
    <div>
      <AdminPageHeader title="Novo Grupo" />
      <GroupForm action={createGroup} />
    </div>
  );
}
