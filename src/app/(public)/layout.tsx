import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { ScrollToTopButton } from "@/components/layout/ScrollToTopButton";
import { WhatsAppFloatingButton } from "@/components/layout/WhatsAppFloatingButton";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { Analytics } from "@/components/layout/Analytics";
import { MaintenancePage } from "@/components/layout/MaintenancePage";
import { getLocale } from "@/lib/locale";
import { getSiteSettings } from "@/lib/content";
import { auth } from "@/auth";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
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
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <ScrollToTopButton />
      <WhatsAppFloatingButton />
      <CookieConsent locale={locale} />
      <Analytics />
    </>
  );
}
