/**
 * Verificações de "isto é mesmo contactável?" para email e telefone.
 *
 * O objetivo não é validar sintaxe RFC — `1@1.com` é sintaticamente válido e
 * mesmo assim é lixo. É filtrar os endereços e números que nunca vão dar uma
 * lead real: domínios inventados, domínios descartáveis, números com dígitos
 * repetidos, etc. Tudo o que está neste ficheiro é puro/síncrono e corre nos
 * dois lados (cliente e servidor); a verificação de DNS, que só corre no
 * servidor, está em ./contactable.server.ts.
 */

/** Domínios de email temporário/descartável mais usados por bots e por quem só quer o PDF. */
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "0-mail.com", "10minutemail.com", "20minutemail.com", "33mail.com", "airmail.cc",
  "armyspy.com", "burnermail.io", "cuvox.de", "dayrep.com", "discard.email",
  "dispostable.com", "einrot.com", "emailondeck.com", "fakeinbox.com", "fakemail.net",
  "fleckens.hu", "getairmail.com", "getnada.com", "grr.la", "guerrillamail.com",
  "guerrillamail.info", "guerrillamail.net", "guerrillamail.org", "gustr.com",
  "harakirimail.com", "inboxbear.com", "jetable.org", "mail-temporaire.fr",
  "mail7.io", "mailcatch.com", "maildrop.cc", "mailinator.com", "mailnesia.com",
  "mailsac.com", "mintemail.com", "mohmal.com", "moakt.com", "mytemp.email",
  "nada.email", "noopmail.org", "opayq.com", "rhyta.com", "sharklasers.com",
  "spam4.me", "spamgourmet.com", "superrito.com", "teleworm.us", "temp-mail.io",
  "temp-mail.org", "tempail.com", "tempinbox.com", "tempmail.net", "tempmailo.com",
  "tempr.email", "throwawaymail.com", "trashmail.com", "trashmail.de", "trbvm.com",
  "vomoto.com", "wegwerfmail.de", "yopmail.com", "yopmail.fr", "yopmail.net",
]);

/** Domínios de exemplo/reservados (RFC 2606 + placeholders típicos de formulários falsos). */
const PLACEHOLDER_EMAIL_DOMAINS = new Set([
  "example.com", "example.net", "example.org", "example.pt", "exemplo.com", "exemplo.pt",
  "test.com", "teste.com", "teste.pt", "email.com", "mail.mail", "domain.com",
  "localhost", "invalid", "none.com", "nao.com", "asd.com", "asdf.com", "aaa.com",
]);

/** Gralhas frequentes nos grandes fornecedores — corrigidas com uma sugestão, não bloqueadas. */
const EMAIL_DOMAIN_TYPOS: Record<string, string> = {
  "gmai.com": "gmail.com", "gmial.com": "gmail.com", "gmail.co": "gmail.com",
  "gmail.con": "gmail.com", "gmail.cm": "gmail.com", "gmaill.com": "gmail.com",
  "gmail.pt": "gmail.com", "hotmai.com": "hotmail.com", "hotmial.com": "hotmail.com",
  "hotmail.co": "hotmail.com", "hotmail.con": "hotmail.com", "hotmial.pt": "hotmail.pt",
  "outlok.com": "outlook.com", "outlook.con": "outlook.com", "outloo.com": "outlook.com",
  "yaho.com": "yahoo.com", "yahoo.con": "yahoo.com", "iclod.com": "icloud.com",
  "icloud.co": "icloud.com", "sapo.p": "sapo.pt", "sap.pt": "sapo.pt",
};

export type CheckResult =
  /** `suggestion` só vem preenchida quando é uma gralha reconhecida (ex: gmail.co → gmail.com). */
  { ok: true; suggestion?: string } | { ok: false; reason: EmailIssue | PhoneIssue };

export type EmailIssue =
  | "empty"
  | "syntax"
  | "domain"
  | "disposable"
  | "placeholder"
  | "no_mail_server";

export type PhoneIssue = "empty" | "syntax" | "length" | "fake" | "not_portuguese";

// Sintaxe deliberadamente mais apertada do que a RFC: sem aspas, sem
// endereços IP literais, sem caracteres unicode — nada disso aparece numa
// lead legítima e tudo isso aparece em submissões automáticas.
const EMAIL_SYNTAX = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/;

/**
 * Verifica a "forma" de um email, sem tocar na rede.
 *
 * Rejeita `1@1.com` e companhia através de duas regras que a sintaxe RFC não
 * cobre: a parte local tem de ter pelo menos uma letra, e o domínio de
 * segundo nível também (além de ter 2+ caracteres). Um domínio real de
 * empresa ou de fornecedor cumpre sempre as duas.
 */
export function checkEmail(rawEmail: string): CheckResult {
  const email = rawEmail.trim().toLowerCase();
  if (!email) return { ok: false, reason: "empty" };
  if (email.length > 254) return { ok: false, reason: "syntax" };
  if (!EMAIL_SYNTAX.test(email)) return { ok: false, reason: "syntax" };

  const atIndex = email.lastIndexOf("@");
  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);

  if (local.length > 64) return { ok: false, reason: "syntax" };
  // "1@..." / "123@..." — uma caixa de correio real tem sempre letras.
  if (!/[a-z]/.test(local)) return { ok: false, reason: "syntax" };

  const labels = domain.split(".");
  const tld = labels[labels.length - 1];
  const sld = labels[labels.length - 2];

  // TLD: só letras, 2 a 24 (cobre .pt, .com, .construction, ...).
  if (!/^[a-z]{2,24}$/.test(tld)) return { ok: false, reason: "domain" };
  // "1.com", "x.com" — o domínio de segundo nível tem de ter letras e 2+ caracteres.
  if (!sld || sld.length < 2 || !/[a-z]/.test(sld)) return { ok: false, reason: "domain" };

  if (PLACEHOLDER_EMAIL_DOMAINS.has(domain)) return { ok: false, reason: "placeholder" };
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) return { ok: false, reason: "disposable" };

  const typoFix = EMAIL_DOMAIN_TYPOS[domain];
  if (typoFix) return { ok: true, suggestion: `${local}@${typoFix}` };

  return { ok: true };
}

/** Só os dígitos, com o "+" inicial preservado (00 internacional normalizado para +). */
export function normalizePhone(rawPhone: string): string {
  const cleaned = rawPhone.trim().replace(/[\s.()/-]/g, "");
  if (cleaned.startsWith("00")) return `+${cleaned.slice(2)}`;
  return cleaned;
}

/**
 * Valida um número de telefone/WhatsApp. Aceita números internacionais
 * (a Ápice 360 recebe leads de emigrantes a construir em Portugal), mas
 * aplica as regras da numeração portuguesa quando o número é claramente PT
 * — sem indicativo, ou com +351.
 */
export function checkPhone(rawPhone: string): CheckResult {
  const phone = normalizePhone(rawPhone);
  if (!phone) return { ok: false, reason: "empty" };
  if (!/^\+?[0-9]+$/.test(phone)) return { ok: false, reason: "syntax" };

  const digits = phone.replace(/^\+/, "");
  if (digits.length < 9 || digits.length > 15) return { ok: false, reason: "length" };

  // 111111111, 000000000, 123456789, 987654321 — preenchimento de fachada.
  if (/^(\d)\1+$/.test(digits)) return { ok: false, reason: "fake" };
  if ("0123456789012345".includes(digits) || "9876543210987654".includes(digits)) {
    return { ok: false, reason: "fake" };
  }

  const isPortuguese = digits.startsWith("351") ? true : !phone.startsWith("+") && digits.length === 9;
  if (isPortuguese) {
    const national = digits.startsWith("351") ? digits.slice(3) : digits;
    // Numeração nacional: 9 dígitos, fixo começa por 2, móvel por 91/92/93/96.
    if (national.length !== 9) return { ok: false, reason: "not_portuguese" };
    if (!/^(2\d{8}|9[1236]\d{7})$/.test(national)) return { ok: false, reason: "not_portuguese" };
  }

  return { ok: true };
}
