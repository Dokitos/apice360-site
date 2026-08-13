import { getCta } from "@/lib/content";
import { Icon } from "@/components/ui/Icon";

export async function WhatsAppFloatingButton() {
  const cta = await getCta("contact_whatsapp_commercial");
  if (!cta) return null;

  return (
    <a
      href={cta.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_28px_rgba(0,0,0,0.28)] transition-transform hover:scale-110"
    >
      <Icon name="chat" className="text-2xl" filled />
    </a>
  );
}
