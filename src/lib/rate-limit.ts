type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_TRACKED_KEYS = 5000;

/**
 * In-memory sliding-window rate limiter, scoped to a single serverless
 * instance and reset on cold start. This is a best-effort abuse deterrent
 * appropriate for a low-traffic B2B site — not a substitute for a
 * distributed limiter (Upstash/Redis) if traffic or attack sophistication
 * grows enough to warrant one.
 */
export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfterSeconds: number } {
  const now = Date.now();

  if (buckets.size > MAX_TRACKED_KEYS) {
    for (const [trackedKey, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(trackedKey);
    }
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSeconds: 0 };
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { ok: true, retryAfterSeconds: 0 };
}

/**
 * IP do cliente para efeitos de contagem.
 *
 * A ordem importa: `x-forwarded-for` pode ser escrito por quem faz o pedido,
 * e a primeira entrada é precisamente a que o atacante controla — bastava
 * mudá-la a cada tentativa para anular o limite. O Vercel escreve
 * `x-vercel-forwarded-for` e `x-real-ip` com o IP real e não permite que o
 * cliente os falsifique, por isso são consultados primeiro. Do
 * `x-forwarded-for` fica a **última** entrada, a acrescentada pelo proxy mais
 * próximo, e não a primeira.
 */
export function clientIpFromHeaders(headersList: Headers): string {
  const trusted = headersList.get("x-vercel-forwarded-for") ?? headersList.get("x-real-ip");
  if (trusted) return trusted.split(",")[0]!.trim();

  const forwardedFor = headersList.get("x-forwarded-for");
  if (forwardedFor) {
    const hops = forwardedFor.split(",");
    return hops[hops.length - 1]!.trim();
  }
  return "unknown";
}
