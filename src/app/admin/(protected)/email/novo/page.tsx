import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { EmailComposer } from "@/components/admin/email/EmailComposer";

export default async function NewEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ para?: string; assunto?: string }>;
}) {
  await requirePermission("email", "create");
  const { para, assunto } = await searchParams;

  const [contas, modelos] = await Promise.all([
    prisma.emailAccount.findMany({
      where: { isActive: true },
      orderBy: [{ isDefault: "desc" }, { address: "asc" }],
      select: { id: true, address: true, displayName: true, isDefault: true },
    }),
    prisma.emailTemplate.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, subject: true, bodyHtml: true },
    }),
  ]);

  return (
    <div>
      <h2 className="mb-6 font-heading text-headline-md">Nova mensagem</h2>
      <EmailComposer
        accounts={contas}
        templates={modelos}
        defaultTo={para ?? ""}
        defaultSubject={assunto ?? ""}
      />
    </div>
  );
}
