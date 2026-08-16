import type { Metadata } from "next";
import { getPageSection, getCta, getSiteSettings, getPageSeo } from "@/lib/content";
import { PageIntroSection } from "@/components/sections/PageIntroSection";
import { ContactForm } from "@/components/sections/ContactForm";
import { ContactMap } from "@/components/sections/ContactMap";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("CONTACTO");
  if (!seo) return {};
  return { title: seo.title, description: seo.description };
}

const HIGHLIGHTS = [
  { icon: "shield", label: "Segurança" },
  { icon: "bolt", label: "Velocidade" },
  { icon: "verified", label: "Qualidade" },
];

export default async function ContactoPage() {
  const [triagem, settings, whatsappCta] = await Promise.all([
    getPageSection("CONTACTO", "triagem"),
    getSiteSettings(),
    getCta("contact_whatsapp_commercial"),
  ]);

  return (
    <>
      <PageIntroSection
        eyebrow="Contacto"
        heading="Contacte a Ápice 360 e Inicie a Triagem do Seu Projeto."
        body="Para projetos de elevado valor, a comunicação eficiente e a segurança são fundamentais. Conecte-se diretamente com a nossa equipa de especialistas."
      />

      <Reveal as="section" className="bg-surface py-24">
        <div className="mx-auto max-w-[1280px] px-5 text-center md:px-20">
          <h2 className="mb-4 font-heading text-headline-md">
            {triagem?.heading ?? "Triagem Rápida (Recomendado)"}
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-on-surface-variant">
            {triagem?.subheading ??
              "Utilize o canal mais direto para iniciar a qualificação do seu projeto e falar com a equipa Comercial ou Arquiteta responsável."}
          </p>
          {whatsappCta ? (
            <Button href={whatsappCta.url} variant="cta" size="lg" icon={whatsappCta.iconName ?? "chat"}>
              {whatsappCta.label}
            </Button>
          ) : null}
        </div>
      </Reveal>

      <Reveal as="section" className="bg-surface-container-lowest py-24">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-16 px-5 md:px-20 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 font-heading text-headline-md">Se preferir, envie-nos um email</h2>
            <p className="mb-10 text-on-surface-variant">
              O seu projeto exige velocidade e garantia de qualidade na entrega? Envie-nos uma mensagem.
            </p>
            <Card variant="glass" className="p-10">
              <ContactForm type="CONTACT" sourcePage="/contacto" />
            </Card>
          </div>

          <div>
            <ContactMap className="mb-8 h-64 w-full overflow-hidden rounded-lg border border-outline-variant/20" />
            <h3 className="mb-2 font-heading text-headline-md">Conheça o Nosso Showroom</h3>
            <p className="mb-8 text-on-surface-variant">
              {settings?.t?.showroomText ?? "Agende uma visita e conheça o nosso escritório e galpão de exposição."}
            </p>
            {settings?.phone || settings?.addressLine ? (
              <p className="mb-8 text-sm text-on-surface-variant">
                {settings?.phone}
                {settings?.phone && settings?.addressLine ? " · " : ""}
                {settings?.addressLine}
                {settings?.addressCity ? `, ${settings.addressCity}` : ""}
              </p>
            ) : null}
            <div className="flex gap-6">
              {HIGHLIGHTS.map((h) => (
                <div key={h.label} className="flex flex-col items-center gap-2 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <Icon name={h.icon} className="text-primary" />
                  </div>
                  <span className="font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
                    {h.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </>
  );
}
