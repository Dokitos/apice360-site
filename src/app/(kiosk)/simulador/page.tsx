import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLpPriceTiers, getLpSimulatorFields, getPageSection, getSiteSettings } from "@/lib/content";
import { getLocale } from "@/lib/locale";
import { LpSimulator } from "@/components/lp/LpSimulator";
import { KioskShell } from "@/components/lp/KioskShell";

export const metadata: Metadata = {
  title: "Simulador | Ápice 360",
  // Fora do índice: é um ecrã de loja, não uma página para quem procura no
  // Google — e indexá-la partiria o funil da landing page em dois.
  robots: { index: false, follow: false },
};

/** O mesmo número do WhatsApp da landing page. */
function whatsappNumberFrom(...candidates: (string | null | undefined)[]): string {
  for (const candidate of candidates) {
    const digits = (candidate ?? "").replace(/\D/g, "");
    if (digits.length >= 9) return digits;
  }
  return "";
}

export default async function SimuladorQuiosquePage() {
  const locale = await getLocale();
  const [tiers, fields, simulator, settings] = await Promise.all([
    getLpPriceTiers(locale),
    getLpSimulatorFields(locale),
    getPageSection("LP", "simulator", locale),
    getSiteSettings(locale),
  ]);

  if (settings?.maintenanceMode) notFound();
  if (tiers.length === 0) notFound();

  return (
    <KioskShell locale={locale}>
      <LpSimulator
        kiosk
        locale={locale}
        heading={simulator?.heading ?? "Simule a sua estimativa em 1 minuto"}
        subheading={simulator?.subheading}
        tiers={tiers}
        fields={fields}
        whatsappNumber={whatsappNumberFrom(
          settings?.whatsappCommercial,
          settings?.whatsappGeneral,
          settings?.phone,
        )}
      />
    </KioskShell>
  );
}
