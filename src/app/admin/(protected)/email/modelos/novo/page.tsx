import { EmailTemplateForm } from "@/components/admin/email/EmailTemplateForm";
import { createEmailTemplate } from "../../actions";

export default function NewEmailTemplatePage() {
  return (
    <div>
      <h2 className="mb-6 font-heading text-headline-md">Novo modelo de mensagem</h2>
      <EmailTemplateForm action={createEmailTemplate} />
    </div>
  );
}
