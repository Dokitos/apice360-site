import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";

type TrustItem = {
  id: string;
  iconName: string | null;
  /** O número em destaque no cartão ("+60", "100%", "Top 5%"). */
  numberLabel: string | null;
  title: string;
};

/**
 * Faixa de credenciais da landing page: um cartão por item da secção
 * "trust" no admin, mais um convite final para agendar visita ao showroom.
 */
export function LpTrust({
  heading,
  items,
  ctaBody,
  ctaLabel,
  ctaHref,
}: {
  heading: string;
  items: TrustItem[];
  ctaBody?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
}) {
  if (items.length === 0) return null;

  return (
    <Reveal as="section" id="confianca" className="relative z-20 overflow-hidden bg-surface py-32">
      <div className="mx-auto max-w-site px-5 text-center md:px-20">
        <h2 className="mb-4 font-heading text-headline-lg">{heading}</h2>
        <div className="mx-auto mb-16 h-1 w-24 rounded-full bg-primary" />

        <div className="grid grid-cols-2 gap-6 md:grid-cols-5">
          {items.map((item, i) => (
            <div
              key={item.id}
              className={[
                "neon-border flex flex-col items-center rounded-2xl bg-surface-container-low p-6",
                // Com 5 cartões, o último fica sozinho na 3.ª linha em mobile — ocupa as duas colunas.
                items.length % 2 === 1 && i === items.length - 1 ? "col-span-2 md:col-span-1" : "",
              ].join(" ")}
            >
              <Icon name={item.iconName ?? "verified"} className="mb-3 text-3xl text-primary" />
              {item.numberLabel ? (
                <p className="font-heading text-headline-md font-bold text-primary">{item.numberLabel}</p>
              ) : null}
              <p className="mt-1 font-mono text-xs uppercase tracking-widest text-on-surface-variant">
                {item.title}
              </p>
            </div>
          ))}
        </div>

        {ctaBody || (ctaLabel && ctaHref) ? (
          <div className="mt-16">
            {ctaBody ? <p className="mb-6 text-on-surface-variant">{ctaBody}</p> : null}
            {ctaLabel && ctaHref ? (
              <a
                href={ctaHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-sm font-bold uppercase text-white transition-all hover:scale-105"
              >
                {ctaLabel}
                <Icon name="bolt" className="text-lg" />
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </Reveal>
  );
}
