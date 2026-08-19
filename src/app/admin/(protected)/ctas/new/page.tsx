import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CtaForm } from "@/components/admin/CtaForm";
import { KNOWN_PAGE_SECTION_KEYS } from "@/lib/known-page-sections";
import { createCta } from "../actions";

export default async function NewCtaPage() {
  const [existing, sections] = await Promise.all([
    prisma.cta.findMany({ select: { key: true } }),
    prisma.pageSection.findMany({
      where: { ctaKey: null },
      select: { id: true, page: true, key: true, translations: { where: { locale: "PT" }, select: { heading: true } } },
    }),
  ]);

  // Only offer sections rendered generically (admin-created) — hand-built
  // sections already have their own hardcoded CTA slot in the page code,
  // so section.ctaKey would never actually be read for them.
  const linkableSections = sections
    .filter((s) => !KNOWN_PAGE_SECTION_KEYS[s.page].includes(s.key))
    .map((s) => ({ id: s.id, page: s.page, key: s.key, heading: s.translations[0]?.heading ?? null }));

  return (
    <div>
      <AdminPageHeader title="Novo CTA" />
      <CtaForm action={createCta} existingKeys={existing.map((c) => c.key)} sections={linkableSections} />
    </div>
  );
}
