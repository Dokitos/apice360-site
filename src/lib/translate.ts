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

  try {
    const params = new URLSearchParams();
    nonEmpty.forEach((text) => params.append("text", text));
    params.set("source_lang", "PT");
    params.set("target_lang", DEEPL_TARGET_LANG[target]);
    if (options.isHtml) {
      params.set("tag_handling", "html");
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
      result[originalIndex] = data.translations[i]?.text ?? null;
    });
    return { ok: true, texts: result };
  } catch (error) {
    console.error("Falha na tradução DeepL:", error);
    return { ok: false, texts: result };
  }
}
