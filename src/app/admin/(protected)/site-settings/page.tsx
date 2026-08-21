import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SiteSettingsForm } from "@/components/admin/SiteSettingsForm";

export default async function SiteSettingsPage() {
  await requirePermission("site_settings", "view");
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
    include: { translations: true },
  });

  return (
    <div>
      <AdminPageHeader
        title="Definições do Site"
        description="Contactos, morada, redes sociais e textos padrão usados em todo o site."
      />
      <SiteSettingsForm settings={settings} />
    </div>
  );
}
