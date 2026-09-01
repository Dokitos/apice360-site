import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { clientIpFromHeaders, rateLimit } from "@/lib/rate-limit";
import { contactableEmail, EMAIL_ISSUE_MESSAGES, PHONE_ISSUE_MESSAGES } from "@/lib/validations/public";
import { checkPhone } from "@/lib/validations/contactable";
import { domainAcceptsMail } from "@/lib/validations/contactable.server";

// Public, unauthenticated endpoint that lets other Ápice 360 front-ends
// (currently the static landing page at apice360-lp.vercel.app) persist a
// lead into the same database the admin panel reads from. Origin is
// allowlisted since this has no auth of its own.
const ALLOWED_ORIGINS = [
  "https://apice360-lp.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:5500",
];

const publicLeadSchema = z.object({
  type: z.enum(["CONTACT", "BUDGET", "ARCHITECT_PARTNERSHIP"]),
  name: z.string().trim().min(1, "Indica o nome.").max(200),
  email: contactableEmail,
  phone: z
    .string()
    .trim()
    .max(40)
    .optional()
    .or(z.literal(""))
    .superRefine((value, ctx) => {
      if (!value) return;
      const result = checkPhone(value);
      if (!result.ok) ctx.addIssue({ code: "custom", message: PHONE_ISSUE_MESSAGES[result.reason as never] });
    }),
  message: z.string().trim().max(4000).optional().or(z.literal("")),
  sourcePage: z.string().trim().max(200).optional(),
  // Honeypot: real visitors never fill this hidden field, bots usually do.
  company: z.string().max(0, "Falha na validação.").optional().or(z.literal("")),
});

function corsHeaders(origin: string | null) {
  const headers = new Headers({
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  });
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
  }
  return headers;
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request.headers.get("origin")) });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);

  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return NextResponse.json({ ok: false, error: "Origem não autorizada." }, { status: 403, headers });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido." }, { status: 400, headers });
  }

  const parsed = publicLeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400, headers },
    );
  }

  const ip = clientIpFromHeaders(request.headers);
  const { ok: withinLimit, retryAfterSeconds } = rateLimit(`public-leads:${ip}`, 5, 60_000);
  if (!withinLimit) {
    return NextResponse.json(
      { ok: false, error: "Demasiados pedidos. Tenta novamente dentro de instantes." },
      { status: 429, headers: { ...Object.fromEntries(headers), "Retry-After": String(retryAfterSeconds) } },
    );
  }

  // Honeypot triggered — silently pretend success so bots don't learn to adapt.
  if (parsed.data.company) {
    return NextResponse.json({ ok: true }, { headers });
  }

  if (!(await domainAcceptsMail(parsed.data.email))) {
    return NextResponse.json({ ok: false, error: EMAIL_ISSUE_MESSAGES.no_mail_server }, { status: 400, headers });
  }

  await prisma.leadSubmission.create({
    data: {
      type: parsed.data.type,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      message: parsed.data.message || null,
      sourcePage: parsed.data.sourcePage || null,
      locale: "PT",
    },
  });

  return NextResponse.json({ ok: true }, { headers });
}
