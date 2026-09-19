import { cn } from "@/lib/cn";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Lightbox } from "@/components/ui/Lightbox";
import { Icon } from "@/components/ui/Icon";

type Partner = { id: string; name: string; logoUrl: string; websiteUrl: string | null; cardSize: string };

type PartnersSectionProps = {
  heading?: string | null;
  subheading?: string | null;
  partners: Partner[];
  displayMode?: string;
};

/**
 * Todos os parceiros ocupam a mesma caixa e o logótipo é normalizado pela
 * altura.
 *
 * Havia três tamanhos por parceiro, e mesmo com o tamanho igual os logótipos
 * saíam díspares: com `max-h-full max-w-full`, um logótipo largo enchia a
 * largura e um quadrado enchia a altura, dando áreas muito diferentes. Fixar
 * a altura e deixar a largura seguir é o que os alinha opticamente, sejam
 * quais forem as proporções do ficheiro.
 */
const LOGO_BOX = "flex h-32 w-full items-center justify-center p-6";

/** Grelha: a célula tem largura fixa, por isso o logótipo tem de caber nela. */
const LOGO_IMAGE_GRID = "h-20 w-auto max-w-full object-contain";

/**
 * Carrossel: aqui o cartão pode crescer, e cresce. Com uma largura fixa, um
 * logótipo muito deitado era limitado pela largura e acabava pintado a 29px
 * de altura ao lado de um quadrado a 80px — exactamente a disparidade que se
 * queria eliminar. Sem tecto de largura, todos ficam com os mesmos 80px e é
 * o cartão que se adapta.
 */
const LOGO_IMAGE_MARQUEE = "h-20 w-auto object-contain";
const MARQUEE_CARD = "h-32 min-w-56 px-8";

export function PartnersSection({ heading, subheading, partners, displayMode = "GRID" }: PartnersSectionProps) {
  if (partners.length === 0) return null;

  return (
    <Reveal as="section" className="bg-surface py-32">
      <div className="mx-auto max-w-site px-5 md:px-20">
        <SectionHeading
          title={heading ?? "A confiança constrói-se com parcerias e resultados."}
          subtitle={subheading ?? undefined}
        />
        {displayMode === "CAROUSEL" ? (
          <PartnersMarquee partners={partners} />
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {partners.map((partner) => (
              <div
                key={partner.id}
                className="group relative overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-low transition-all duration-500 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_20px_60px_-15px_rgba(255,106,19,0.35)]"
              >
                <Lightbox src={partner.logoUrl} alt={partner.name} className={cn(LOGO_BOX, "cursor-zoom-in")}>
                  {/* object-contain e não cover: um logótipo recortado deixa
                      de ser o logótipo daquela empresa. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={partner.logoUrl}
                    alt={partner.name}
                    className={cn(LOGO_IMAGE_GRID, "transition-transform duration-700 group-hover:scale-110")}
                  />
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/0 opacity-0 transition-all duration-300 group-hover:bg-background/40 group-hover:opacity-100">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg">
                      <Icon name="zoom_in" className="text-2xl" />
                    </span>
                  </span>
                </Lightbox>
                <div className="flex items-center justify-between gap-3 p-6">
                  <span className="font-heading text-lg font-bold text-on-surface">{partner.name}</span>
                  {partner.websiteUrl ? (
                    <a
                      href={partner.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Visitar site de ${partner.name}`}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
                    >
                      <Icon name="north_east" className="text-lg" />
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Reveal>
  );
}

function PartnersMarquee({ partners }: { partners: Partner[] }) {
  // Track is duplicated so the -50% keyframe lands exactly on a repeat of
  // the same content, giving a seamless infinite loop with plain CSS.
  const track = [...partners, ...partners];

  return (
    <div className="group/marquee overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
      <div className="flex w-max animate-marquee gap-8 group-hover/marquee:[animation-play-state:paused]">
        {track.map((partner, i) => {
          const cardClassName = cn(
            "flex shrink-0 items-center justify-center rounded-2xl border border-outline-variant/20 bg-surface-container-low transition-colors",
            partner.websiteUrl && "hover:border-primary/50",
            MARQUEE_CARD,
          );
          const logo = (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={partner.logoUrl} alt={partner.name} className={LOGO_IMAGE_MARQUEE} />
          );

          return partner.websiteUrl ? (
            <a
              key={`${partner.id}-${i}`}
              href={partner.websiteUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={partner.name}
              className={cardClassName}
            >
              {logo}
            </a>
          ) : (
            <div key={`${partner.id}-${i}`} aria-label={partner.name} className={cardClassName}>
              {logo}
            </div>
          );
        })}
      </div>
    </div>
  );
}
