import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SiteSettingsForm } from "@/components/admin/SiteSettingsForm";

export default async function SiteSettingsPage() {
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
