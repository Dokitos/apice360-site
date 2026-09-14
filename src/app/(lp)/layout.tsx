import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
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

      {/* A LP não tem cabeçalho, por isso o seletor de idiomas vive solto no
          canto. A placa clara garante que se lê tanto sobre a fotografia
          escura do hero como sobre as secções claras mais abaixo. */}
      <div className="fixed right-5 top-5 z-50 rounded-full bg-white/90 p-0.5 shadow-lg backdrop-blur-md md:right-8 md:top-6">
        <LanguageSwitcher locale={locale} variant="compact" />
      </div>

      <main className="flex-1">{children}</main>
      <ScrollToTopButton />
      <WhatsAppFloatingButton />
      <CookieConsent locale={locale} />
      <Analytics />
    </>
  );
}
