import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { ScrollToTopButton } from "@/components/layout/ScrollToTopButton";
import { WhatsAppFloatingButton } from "@/components/layout/WhatsAppFloatingButton";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { Analytics } from "@/components/layout/Analytics";
import { MaintenancePage } from "@/components/layout/MaintenancePage";
import { getLocale } from "@/lib/locale";
import { getSiteSettings } from "@/lib/content";
import { auth } from "@/auth";

/**
 * Chrome da landing page (/lp). Deliberadamente sem o <Header>/<Footer> do
 * site: uma landing page de campanha não oferece saídas — só o formulário,
 * o simulador e o WhatsApp. O rodapé próprio vive em <LpFooter>, dentro da
 * página, para que o admin o veja como parte da LP e não do site.
 *
 * Tudo o resto (scroll suave, consentimento de cookies, analítica, modo de
 * manutenção) é partilhado com o site para não haver dois comportamentos.
 */
export default async function LpLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const settings = await getSiteSettings(locale);

  if (settings?.maintenanceMode) {
    const session = await auth();
    if (!session?.user) {
      return (
        <MaintenancePage
          locale={locale}
          whatsappUrl={settings.whatsappGeneral ?? settings.whatsappCommercial}
          phone={settings.phone}
        />
      );
    }
  }

  return (
    <>
      <SmoothScroll />
      <main className="flex-1">{children}</main>
      <ScrollToTopButton />
      <WhatsAppFloatingButton />
      <CookieConsent locale={locale} />
      <Analytics />
    </>
  );
}
