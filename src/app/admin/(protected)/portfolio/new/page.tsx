import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PortfolioProjectForm } from "@/components/admin/PortfolioProjectForm";
import { createProject } from "../actions";

export default function NewProjectPage() {
  return (
    <div>
      <AdminPageHeader title="Novo Projeto" />
      <PortfolioProjectForm action={createProject} />
    </div>
  );
}
