import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LpSimulatorFieldForm } from "@/components/admin/LpSimulatorFieldForm";
import { createLpSimulatorField } from "../../actions";

export default function NewLpSimulatorFieldPage() {
  return (
    <div>
      <AdminPageHeader
        title="Novo Campo do Simulador"
        description="Uma pergunta nova no formulário da landing page. A resposta passa a aparecer na lead."
      />
      <LpSimulatorFieldForm action={createLpSimulatorField} />
    </div>
  );
}
