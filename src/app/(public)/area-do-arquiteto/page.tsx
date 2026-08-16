import type { Metadata } from "next";
import { getPageSection, getPageSeo } from "@/lib/content";
import { PageIntroSection } from "@/components/sections/PageIntroSection";
import { ContactForm } from "@/components/sections/ContactForm";
import { Reveal } from "@/components/ui/Reveal";
import { Card } from "@/components/ui/Card";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("AREA_ARQUITETO");
  if (!seo) return {};
  return { title: seo.title, description: seo.description };
}

export default async function AreaDoArquitetoPage() {
  const intro = await getPageSection("AREA_ARQUITETO", "intro");

  return (
    <>
      <PageIntroSection
        eyebrow="Área do Arquiteto"
        heading={intro?.heading ?? "Uma Parceria Construída em Confiança e Especialização Técnica."}
        body={
          intro?.body ??
          "Trabalhamos lado a lado com gabinetes de arquitetura que partilham o nosso compromisso com a qualidade e a inovação construtiva. Se procura um parceiro de execução rigoroso para os seus projetos em LSF, fale connosco."
        }
        imageUrl={intro?.imageUrl}
      />

      <Reveal as="section" className="bg-surface py-24">
        <div className="mx-auto max-w-xl px-5 md:px-20">
          <h2 className="mb-8 text-center font-heading text-headline-md">
            Vamos Construir Juntos o Próximo Projeto
          </h2>
          <Card variant="glass" className="p-10">
            <ContactForm type="ARCHITECT_PARTNERSHIP" sourcePage="/area-do-arquiteto" />
          </Card>
        </div>
      </Reveal>
    </>
  );
}
