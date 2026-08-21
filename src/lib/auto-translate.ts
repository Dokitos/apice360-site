import { translateTexts } from "@/lib/translate";
import type { SiteLocale } from "@/lib/locale";

export type SecondaryLocale = Exclude<SiteLocale, "PT">;
export const SECONDARY_LOCALES: SecondaryLocale[] = ["EN", "ES", "FR"];

export type TranslatableField = {
  key: string;
  isHtml?: boolean;
};

export type ExistingTranslationRow = {
  locale: SiteLocale;
  isAutoTranslated: boolean;
} & Record<string, unknown>;

export type ResolvedTranslation = {
  locale: SecondaryLocale;
  isAutoTranslated: boolean;
  fields: Record<string, string | null>;
};

function normalize(value: string | null | undefined): string | null {
  return value ? value : null;
}

/**
 * Decides, per secondary locale (EN/ES/FR), whether to (re)translate PT via
 * DeepL or to keep exactly what the editor submitted because they touched
 * that language's fields by hand.
 *
 * Granularity is per translation *row*, not per field: the moment any field
 * in a language differs from what's stored, that whole row is treated as
 * now manually-owned (isAutoTranslated: false) and is never auto-touched
 * again — simpler to reason about than tracking which individual fields
 * were hand-edited, and it never silently overwrites a manual edit.
 *
 * Relies on LocaleTabs keeping every locale's fields mounted (just visually
 * hidden) on every submit, so "submitted value === value already in the DB"
 * reliably means "the editor didn't touch this field this time," not "this
 * tab wasn't open."
 */
export async function resolveTranslations({
  fields,
  ptValues,
  submittedValues,
  existingTranslations,
}: {
  fields: TranslatableField[];
  ptValues: Record<string, string | null>;
  submittedValues: Record<SecondaryLocale, Record<string, string | null>>;
  existingTranslations: ExistingTranslationRow[];
}): Promise<ResolvedTranslation[]> {
  const results: ResolvedTranslation[] = [];

  for (const locale of SECONDARY_LOCALES) {
    const existing = existingTranslations.find((t) => t.locale === locale);
    const submitted = submittedValues[locale] ?? {};
    const wasManuallyEdited = existing ? existing.isAutoTranslated === false : false;

    const touchedByEditor = fields.some((field) => {
      const submittedValue = normalize(submitted[field.key]);
      const existingValue = normalize(existing ? (existing[field.key] as string | null | undefined) : null);
      return submittedValue !== existingValue;
    });

    if (wasManuallyEdited || touchedByEditor) {
      const manualFields: Record<string, string | null> = {};
      for (const field of fields) manualFields[field.key] = normalize(submitted[field.key]);
      results.push({ locale, isAutoTranslated: false, fields: manualFields });
      continue;
    }

    // Nothing changed for this locale and it's still auto-managed — (re)translate from PT.
    const plainFields = fields.filter((f) => !f.isHtml);
    const htmlFields = fields.filter((f) => f.isHtml);
    const translatedFields: Record<string, string | null> = {};
    let ok = true;

    if (plainFields.length > 0) {
      const result = await translateTexts(
        plainFields.map((f) => ptValues[f.key] ?? null),
        locale,
        { isHtml: false },
      );
      ok = ok && result.ok;
      plainFields.forEach((f, i) => {
        translatedFields[f.key] = result.texts[i];
      });
    }
    if (htmlFields.length > 0) {
      const result = await translateTexts(
        htmlFields.map((f) => ptValues[f.key] ?? null),
        locale,
        { isHtml: true },
      );
      ok = ok && result.ok;
      htmlFields.forEach((f, i) => {
        translatedFields[f.key] = result.texts[i];
      });
    }

    // DeepL unreachable/misconfigured this time: leave this locale
    // completely alone rather than writing blank text over it — an
    // existing row (from a prior successful translation) stays as-is, and a
    // locale that never had a row yet still correctly falls back to PT when
    // read, instead of resolving to an empty translation.
    if (!ok) continue;

    results.push({ locale, isAutoTranslated: true, fields: translatedFields });
  }

  return results;
}
