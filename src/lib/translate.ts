type DeepLTargetLang = "EN" | "ES" | "FR";

// DeepL requires a region-qualified variant for English as a *target*
// language (plain "EN" is rejected); Portugal/EU audience, so British
// English fits better than American here.
const DEEPL_TARGET_LANG: Record<DeepLTargetLang, string> = {
  EN: "EN-GB",
  ES: "ES",
  FR: "FR",
};

function getApiBase(apiKey: string): string {
  // Free-tier keys always end in ":fx" and live on a separate host.
  return apiKey.endsWith(":fx") ? "https://api-free.deepl.com" : "https://api.deepl.com";
}

/**
 * Termos que nunca devem ser traduzidos, na grafia que deve sair.
 *
 * Sem isto o DeepL trata-os como palavras comuns, e o resultado vai de
 * desleixado a errado: "Light Steel Frame" descia para minúsculas em inglês,
 * e em francês "LSF" saía como "filtres solaires" — leu a sigla como o
 * factor de protecção solar. Numa empresa de construção, isso é um erro que
 * chega ao cliente final.
 *
 * O glossário do DeepL resolveria isto, mas o plano gratuito só permite um
 * glossário em toda a conta, e precisamos de três pares de idiomas.
 *
 * Só entram aqui os termos que saíam *errados*. "Light Steel Frame" não
 * entra: blindá-lo fazia o DeepL perder a gramática em volta e produzir
 * "We build at Light Steel Frame" ou "à l'adresse Light Steel Frame" — é
 * traduzido com sentido, só perdia as maiúsculas, e isso corrige-se no fim
 * sem mexer na frase (ver CASING_FIXES).
 *
 * Ordem importa: o mais comprido primeiro, para "Ápice 360" ganhar a "Ápice".
 */
const PROTECTED_TERMS = ["Ápice 360", "Ápice", "LSF"];

/** Termos bem traduzidos mas com maiúsculas perdidas — repostas à chegada. */
const CASING_FIXES = ["Light Steel Frame"];

const CASING_PATTERN = new RegExp(
  `(?<![\\p{L}\\d])(${CASING_FIXES.join("|")})(?![\\p{L}\\d])`,
  "giu",
);

function fixCasing(text: string): string {
  return text.replace(CASING_PATTERN, (match) => CASING_FIXES.find((t) => t.toLowerCase() === match.toLowerCase()) ?? match);
}

const PROTECTED_PATTERN = new RegExp(
  `(?<![\\p{L}\\d])(${PROTECTED_TERMS.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})(?![\\p{L}\\d])`,
  "giu",
);

/** Grafia correcta de um termo, a partir de como apareceu no texto. */
function canonical(match: string): string {
  return PROTECTED_TERMS.find((t) => t.toLowerCase() === match.toLowerCase()) ?? match;
}

/**
 * Envolve os termos protegidos em <keep>, que o DeepL deixa intacto quando
 * lhe passamos `ignore_tags=keep`. As etiquetas são removidas à chegada.
 */
function protectTerms(text: string, isHtml: boolean): { text: string; protectedAny: boolean } {
  let protectedAny = false;
  // Em texto simples passamos a usar tag_handling=xml para o ignore_tags
  // valer, por isso o que lá estiver tem de ser XML válido.
  const escaped = isHtml ? text : text.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const out = escaped.replace(PROTECTED_PATTERN, (match) => {
    protectedAny = true;
    return `<keep>${canonical(match)}</keep>`;
  });
  return { text: protectedAny ? out : text, protectedAny };
}

function unprotectTerms(text: string, isHtml: boolean): string {
  const stripped = text.replace(/<\/?keep>/g, "");
  const unescaped = isHtml ? stripped : stripped.replace(/&lt;/g, "<").replace(/&amp;/g, "&");
  return fixCasing(unescaped);
}

export type TranslateResult = {
  /** false = DeepL was unreachable/misconfigured this call, not "nothing to translate." */
  ok: boolean;
  texts: (string | null)[];
};

/**
 * Translates a batch of PT strings to one target language in a single DeepL
 * request. Null/empty entries are skipped (no API call spent on them) but
 * preserved positionally in the result. Pass isHtml for rich-text fields so
 * DeepL translates the text nodes only and leaves markup intact.
 *
 * Never throws: a missing key, a DeepL outage, or a rate limit must not
 * block an editor from saving PT content. `ok: false` tells the caller the
 * call itself failed (as opposed to legitimately having nothing to
 * translate) — resolveTranslations uses this to leave that locale
 * completely untouched rather than writing empty text over it.
 */
export async function translateTexts(
  texts: (string | null)[],
  target: DeepLTargetLang,
  options: { isHtml?: boolean } = {},
): Promise<TranslateResult> {
  const result: (string | null)[] = texts.map(() => null);

  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) {
    console.error("DEEPL_API_KEY não está configurada — a gravar sem tradução automática.");
    return { ok: false, texts: result };
  }

  const indices: number[] = [];
  const nonEmpty: string[] = [];
  texts.forEach((text, i) => {
    if (text && text.trim()) {
      indices.push(i);
      nonEmpty.push(text);
    }
  });

  if (nonEmpty.length === 0) return { ok: true, texts: result };

  const isHtml = options.isHtml ?? false;
  const prepared = nonEmpty.map((text) => protectTerms(text, isHtml));
  const anyProtected = prepared.some((p) => p.protectedAny);

  try {
    const params = new URLSearchParams();
    prepared.forEach((p) => params.append("text", p.text));
    params.set("source_lang", "PT");
    params.set("target_lang", DEEPL_TARGET_LANG[target]);
    if (isHtml) {
      params.set("tag_handling", "html");
    } else if (anyProtected) {
      // Só se houver termos a proteger: em texto sem <keep>, activar o modo
      // XML seria acrescentar uma forma de falhar sem nada a ganhar.
      params.set("tag_handling", "xml");
    }
    if (anyProtected) {
      params.set("ignore_tags", "keep");
    }

    const response = await fetch(`${getApiBase(apiKey)}/v2/translate`, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${apiKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error(`Falha na tradução DeepL (${response.status}): ${body}`);
      return { ok: false, texts: result };
    }

    const data: { translations: { text: string }[] } = await response.json();
    indices.forEach((originalIndex, i) => {
      const translated = data.translations[i]?.text;
      result[originalIndex] = translated == null ? null : unprotectTerms(translated, isHtml);
    });
    return { ok: true, texts: result };
  } catch (error) {
    console.error("Falha na tradução DeepL:", error);
    return { ok: false, texts: result };
  }
}
