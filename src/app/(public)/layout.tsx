import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { ScrollToTopButton } from "@/components/layout/ScrollToTopButton";
import { WhatsAppFloatingButton } from "@/components/layout/WhatsAppFloatingButton";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SmoothScroll />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <ScrollToTopButton />
      <WhatsAppFloatingButton />
    </>
  );
}
