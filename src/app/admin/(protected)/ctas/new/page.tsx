import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CtaForm } from "@/components/admin/CtaForm";
import { FIXED_CTA_KEY_BY_SECTION, NO_CTA_SECTIONS } from "@/lib/known-page-sections";
import { createCta } from "../actions";

export default async function NewCtaPage() {
  const [existing, sectionsRaw] = await Promise.all([
    prisma.cta.findMany({ select: { key: true } }),
    prisma.pageSection.findMany({
      select: { id: true, page: true, key: true, ctaKey: true, translations: { where: { locale: "PT" }, select: { heading: true } } },
    }),
  ]);

  const existingKeys = existing.map((c) => c.key);
  const existingKeySet = new Set(existingKeys);

  // Every existing section, so an editor can always find and pick the one
  // they want. Hand-built sections whose CTA slot is a specific hardcoded
  // getCta() key resolve straight to that key (see FIXED_CTA_KEY_BY_SECTION);
  // everything else links via section.ctaKey. Either way, already-linked
  // sections are hidden so the same slot isn't assigned twice.
  const sections = sectionsRaw
    .filter((s) => !NO_CTA_SECTIONS.has(`${s.page}:${s.key}`))
    .map((s) => {
      const fixedKey = FIXED_CTA_KEY_BY_SECTION[`${s.page}:${s.key}`] ?? null;
      return {
        id: s.id,
        page: s.page,
        key: s.key,
        heading: s.translations[0]?.heading ?? null,
        fixedKey,
        alreadyLinked: fixedKey ? existingKeySet.has(fixedKey) : s.ctaKey !== null,
      };
    })
    .filter((s) => !s.alreadyLinked);

  return (
    <div>
      <AdminPageHeader title="Novo CTA" />
      <CtaForm action={createCta} existingKeys={existingKeys} sections={sections} />
    </div>
  );
}
