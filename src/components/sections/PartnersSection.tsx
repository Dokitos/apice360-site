import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Carousel } from "@/components/ui/Carousel";

type Partner = { id: string; name: string; logoUrl: string; websiteUrl: string | null };

type PartnersSectionProps = {
  heading?: string | null;
  subheading?: string | null;
  partners: Partner[];
};

export function PartnersSection({ heading, subheading, partners }: PartnersSectionProps) {
  if (partners.length === 0) return null;

  return (
    <Reveal as="section" className="bg-surface py-24">
      <div className="mx-auto max-w-[1280px] px-5 md:px-20">
        <SectionHeading
          title={heading ?? "A confiança constrói-se com parcerias e resultados."}
          subtitle={subheading ?? undefined}
        />
        <Carousel
          slideClassName="flex-[0_0_50%] sm:flex-[0_0_33.333%] lg:flex-[0_0_20%]"
          showDots={false}
        >
          {partners.map((partner) =>
            partner.websiteUrl ? (
              <a
                key={partner.id}
                href={partner.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="flex h-24 items-center justify-center grayscale transition-all hover:grayscale-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={partner.logoUrl} alt={partner.name} className="max-h-16 w-auto object-contain" />
              </a>
            ) : (
              <div
                key={partner.id}
                className="flex h-24 items-center justify-center grayscale transition-all hover:grayscale-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={partner.logoUrl} alt={partner.name} className="max-h-16 w-auto object-contain" />
              </div>
            ),
          )}
        </Carousel>
      </div>
    </Reveal>
  );
}
