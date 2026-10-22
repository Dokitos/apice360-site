import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EmailAccountForm } from "@/components/admin/email/EmailAccountForm";
import { updateEmailAccount } from "../../../actions";

export default async function EditEmailAccountPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const conta = await prisma.emailAccount.findUnique({ where: { id } });
  if (!conta) notFound();

  return (
    <div>
      <h2 className="mb-6 font-heading text-headline-md">Editar conta de email</h2>
      <EmailAccountForm account={conta} action={updateEmailAccount.bind(null, id)} />
    </div>
  );
}
