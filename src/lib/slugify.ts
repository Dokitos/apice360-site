const COMBINING_MARK_RANGE_START = 0x0300;
const COMBINING_MARK_RANGE_END = 0x036f;

/** Transliterates accented/special characters into a clean, URL-safe slug. */
export function slugify(input: string): string {
  const withoutDiacritics = Array.from(input.normalize("NFD"))
    .filter((char) => {
      const code = char.codePointAt(0) ?? 0;
      return code < COMBINING_MARK_RANGE_START || code > COMBINING_MARK_RANGE_END;
    })
    .join("");

  return withoutDiacritics
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
