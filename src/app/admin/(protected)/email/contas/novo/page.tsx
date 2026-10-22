import { EmailAccountForm } from "@/components/admin/email/EmailAccountForm";
import { createEmailAccount } from "../../actions";

export default function NewEmailAccountPage() {
  return (
    <div>
      <h2 className="mb-6 font-heading text-headline-md">Nova conta de email</h2>
      <EmailAccountForm action={createEmailAccount} />
    </div>
  );
}
