import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { ScrollToTopButton } from "@/components/layout/ScrollToTopButton";
import { WhatsAppFloatingButton } from "@/components/layout/WhatsAppFloatingButton";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { Analytics } from "@/components/layout/Analytics";
import { getLocale } from "@/lib/locale";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();

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
