// Sem "server-only" (não está instalado): o import de node:dns já faz
// falhar o build se este módulo for parar a um componente de cliente.
import { promises as dns } from "node:dns";

/**
 * Segunda camada da verificação de email, só no servidor: o domínio aceita
 * mesmo correio? Apanha domínios com forma perfeitamente válida que
 * simplesmente não existem (ex: `joao@construcoes-xpto.pt` escrito à pressa).
 *
 * Regra de ouro: falha aberta. Se o DNS estiver lento, em baixo ou a
 * responder mal, deixamos passar — perder uma lead real custa muito mais à
 * Ápice 360 do que guardar uma lead falsa. Só bloqueamos quando o DNS
 * responde com autoridade que o domínio não existe (NXDOMAIN) ou que não
 * tem servidores de correio (ENODATA/NOTFOUND, sem fallback A/AAAA).
 */

const CACHE_TTL_MS = 10 * 60_000;
const LOOKUP_TIMEOUT_MS = 3_000;

const cache = new Map<string, { acceptsMail: boolean; expiresAt: number }>();

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("dns-timeout")), ms)),
  ]);
}

/** Erros em que o DNS respondeu com autoridade "este domínio não recebe correio". */
function isAuthoritativeMiss(error: unknown): boolean {
  const code = (error as { code?: string })?.code;
  return code === "ENOTFOUND" || code === "ENODATA";
}

export async function domainAcceptsMail(email: string): Promise<boolean> {
  const domain = email.trim().toLowerCase().split("@")[1];
  if (!domain) return false;

  const cached = cache.get(domain);
  if (cached && cached.expiresAt > Date.now()) return cached.acceptsMail;

  let acceptsMail = true;
  try {
    const records = await withTimeout(dns.resolveMx(domain), LOOKUP_TIMEOUT_MS);
    acceptsMail = records.some((r) => r.exchange);
  } catch (error) {
    if (isAuthoritativeMiss(error)) {
      // Sem MX, o correio ainda pode ser entregue no registo A/AAAA do
      // domínio (RFC 5321 §5.1) — só damos o domínio como inválido se nem
      // isso existir.
      try {
        await withTimeout(dns.lookup(domain), LOOKUP_TIMEOUT_MS);
        acceptsMail = true;
      } catch (fallbackError) {
        acceptsMail = !isAuthoritativeMiss(fallbackError);
      }
    } else {
      acceptsMail = true; // timeout, SERVFAIL, sem rede: falha aberta.
    }
  }

  cache.set(domain, { acceptsMail, expiresAt: Date.now() + CACHE_TTL_MS });
  return acceptsMail;
}
