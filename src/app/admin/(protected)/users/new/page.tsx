import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { UserForm } from "@/components/admin/UserForm";
import { createUser } from "../actions";

export default function NewUserPage() {
  return (
    <div>
      <AdminPageHeader title="Novo Utilizador" />
      <UserForm action={createUser} />
    </div>
  );
}
