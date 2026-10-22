import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { isEmailConfigured, isWebhookConfigured } from "@/lib/email/resend";
import { EmailTabs } from "@/components/admin/email/EmailTabs";
import { Icon } from "@/components/ui/Icon";

export default async function EmailLayout({ children }: { children: React.ReactNode }) {
  await requirePermission("email", "view");

  const [porLer, contas] = await Promise.all([
    prisma.emailMessage.count({ where: { folder: "INBOX", isRead: false } }),
    prisma.emailAccount.count({ where: { isActive: true } }),
  ]);

  const avisos: { texto: string; href?: string; hrefLabel?: string }[] = [];
  if (!isEmailConfigured()) {
    avisos.push({
      texto:
        "Falta a chave RESEND_API_KEY nas variáveis de ambiente do projeto. Sem ela não é possível enviar nem receber mensagens.",
    });
  } else if (contas === 0) {
    avisos.push({
      texto: "Ainda não há nenhuma conta de envio. Cria a primeira para poder escrever mensagens.",
      href: "/admin/email/contas/novo",
      hrefLabel: "Criar conta",
    });
  }
  if (isEmailConfigured() && !isWebhookConfigured()) {
    avisos.push({
      texto:
        "Falta a RESEND_WEBHOOK_SECRET. Sem ela as mensagens recebidas não entram e o estado das enviadas (entregue, aberta, devolvida) não se atualiza.",
    });
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-headline-lg">Caixa de Correio</h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Mensagens enviadas e recebidas nos endereços da empresa, com modelos para escrever mais depressa.
          </p>
        </div>
        <Link
          href="/admin/email/novo"
          className="flex shrink-0 items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold uppercase text-on-primary transition-transform hover:scale-105"
        >
          <Icon name="edit_square" />
          Escrever
        </Link>
      </div>

      {avisos.length > 0 ? (
        <div className="mb-6 space-y-3">
          {avisos.map((aviso) => (
            <div
              key={aviso.texto}
              className="flex items-start gap-3 rounded-lg border border-primary/40 bg-primary/5 p-4"
            >
              <Icon name="warning" className="shrink-0 text-primary" />
              <p className="text-sm text-on-surface">
                {aviso.texto}
                {aviso.href ? (
                  <>
                    {" "}
                    <Link href={aviso.href} className="font-bold text-primary hover:underline">
                      {aviso.hrefLabel}
                    </Link>
                  </>
                ) : null}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {/* useSearchParams precisa de uma fronteira de Suspense para a página
          não ser forçada a render dinâmico inteiro. */}
      <Suspense fallback={<div className="mb-6 h-12" />}>
        <EmailTabs unread={porLer} />
      </Suspense>

      {children}
    </div>
  );
}
