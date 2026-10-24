import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { displayNameFor } from "@/lib/email/addresses";
import { EmailStatusBadge } from "@/components/admin/email/EmailStatusBadge";
import { AdminIcon as Icon } from "@/components/admin/AdminIcon";
import { cn } from "@/lib/cn";
import type { EmailFolder, Prisma } from "@/generated/prisma/client";

const POR_PAGINA = 30;

const PASTAS: Record<string, { folder: EmailFolder; titulo: string; vazio: string }> = {
  entrada: {
    folder: "INBOX",
    titulo: "Caixa de entrada",
    vazio: "Ainda não chegou nenhuma mensagem a estes endereços.",
  },
  enviados: {
    folder: "SENT",
    titulo: "Enviados",
    vazio: "Ainda não foi enviada nenhuma mensagem a partir do painel.",
  },
  arquivo: { folder: "ARCHIVE", titulo: "Arquivo", vazio: "Não há nada arquivado." },
  lixo: { folder: "TRASH", titulo: "Lixo", vazio: "O lixo está vazio." },
};

export default async function EmailListPage({
  searchParams,
}: {
  searchParams: Promise<{ pasta?: string; q?: string; pagina?: string }>;
}) {
  await requirePermission("email", "view");
  const { pasta = "entrada", q, pagina } = await searchParams;
  const atual = PASTAS[pasta] ?? PASTAS.entrada;
  const paginaAtual = Math.max(1, Number(pagina) || 1);
  const procura = q?.trim();

  const where: Prisma.EmailMessageWhereInput = {
    folder: atual.folder,
    ...(procura
      ? {
          OR: [
            { subject: { contains: procura, mode: "insensitive" } },
            { fromAddress: { contains: procura, mode: "insensitive" } },
            { fromName: { contains: procura, mode: "insensitive" } },
            { snippet: { contains: procura, mode: "insensitive" } },
            { toAddresses: { has: procura.toLowerCase() } },
          ],
        }
      : {}),
  };

  const [mensagens, total] = await Promise.all([
    prisma.emailMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: POR_PAGINA,
      skip: (paginaAtual - 1) * POR_PAGINA,
      include: { _count: { select: { attachments: true } } },
    }),
    prisma.emailMessage.count({ where }),
  ]);

  const haMais = paginaAtual * POR_PAGINA < total;
  const enviados = atual.folder === "SENT";

  return (
    <div className="space-y-4">
      <form method="get" className="flex flex-wrap items-center gap-3">
        <input type="hidden" name="pasta" value={pasta} />
        <input
          type="search"
          name="q"
          defaultValue={procura ?? ""}
          placeholder="Procurar por assunto, endereço ou texto..."
          className="w-full max-w-sm rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
        <button
          type="submit"
          className="rounded-lg border border-outline-variant/40 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-on-surface-variant transition-colors hover:bg-surface-container-high"
        >
          Procurar
        </button>
        {procura ? (
          <Link href={`/admin/email?pasta=${pasta}`} className="text-sm text-on-surface-variant hover:text-primary">
            Limpar
          </Link>
        ) : null}
        <span className="ml-auto text-sm text-on-surface-variant">
          {total} {total === 1 ? "mensagem" : "mensagens"}
        </span>
      </form>

      {mensagens.length === 0 ? (
        <div className="rounded-lg border border-outline-variant/20 bg-surface-container-low p-12 text-center text-on-surface-variant">
          {procura ? "Nenhuma mensagem encontrada." : atual.vazio}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-outline-variant/20">
          {mensagens.map((mensagem) => {
            const contraparte = enviados
              ? mensagem.toAddresses.join(", ")
              : displayNameFor(mensagem.fromName, mensagem.fromAddress);
            const porLer = !mensagem.isRead && !enviados;

            return (
              <Link
                key={mensagem.id}
                href={`/admin/email/${mensagem.id}`}
                className={cn(
                  "flex items-start gap-4 border-b border-outline-variant/10 px-5 py-4 transition-colors last:border-b-0 hover:bg-surface-container-low",
                  porLer && "bg-primary/[0.03]",
                )}
              >
                <Icon
                  name={mensagem.isStarred ? "star" : porLer ? "mark_email_unread" : "mail"}
                  className={cn("mt-0.5 shrink-0 text-lg", porLer ? "text-primary" : "text-on-surface-variant/60")}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3">
                    <span className={cn("truncate", porLer ? "font-bold" : "font-medium")}>
                      {enviados ? `Para: ${contraparte}` : contraparte}
                    </span>
                    {mensagem._count.attachments > 0 ? (
                      <Icon name="attach_file" className="text-sm text-on-surface-variant" />
                    ) : null}
                  </div>
                  <p className={cn("truncate", porLer ? "font-bold" : "")}>{mensagem.subject}</p>
                  {mensagem.snippet ? (
                    <p className="truncate text-sm text-on-surface-variant">{mensagem.snippet}</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
                    {formatarData(mensagem.receivedAt ?? mensagem.sentAt ?? mensagem.createdAt)}
                  </span>
                  {enviados ? <EmailStatusBadge status={mensagem.status} /> : null}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {(haMais || paginaAtual > 1) ? (
        <div className="flex items-center justify-between">
          {paginaAtual > 1 ? (
            <Link
              href={`/admin/email?pasta=${pasta}&pagina=${paginaAtual - 1}${procura ? `&q=${encodeURIComponent(procura)}` : ""}`}
              className="rounded-lg border border-outline-variant/40 px-4 py-2 text-xs font-bold uppercase text-on-surface-variant hover:bg-surface-container-high"
            >
              Anteriores
            </Link>
          ) : (
            <span />
          )}
          {haMais ? (
            <Link
              href={`/admin/email?pasta=${pasta}&pagina=${paginaAtual + 1}${procura ? `&q=${encodeURIComponent(procura)}` : ""}`}
              className="rounded-lg border border-outline-variant/40 px-4 py-2 text-xs font-bold uppercase text-on-surface-variant hover:bg-surface-container-high"
            >
              Seguintes
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function formatarData(data: Date): string {
  const agora = new Date();
  const mesmoDia = data.toDateString() === agora.toDateString();
  return mesmoDia
    ? data.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })
    : data.toLocaleDateString("pt-PT", { day: "2-digit", month: "short" });
}
