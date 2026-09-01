import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LpPriceTierForm } from "@/components/admin/LpPriceTierForm";
import { createLpPriceTier } from "../actions";

export default function NewLpPriceTierPage() {
  return (
    <div>
      <AdminPageHeader
        title="Novo Escalão de Preço"
        description="Um cartão de estimativa no resultado do simulador da landing page."
      />
      <LpPriceTierForm action={createLpPriceTier} />
    </div>
  );
}
