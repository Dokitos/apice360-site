import { Reveal } from "@/components/ui/Reveal";
import { RichText } from "@/components/ui/RichText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

type Item = { id: string; title: string; body: string | null; iconName: string | null };

type PageIntroSectionProps = {
  eyebrow?: string | null;
  heading: string;
  body?: string | null;
  imageUrl?: string | null;
  /**
   * O formulário de secções deixa acrescentar itens a qualquer secção,
   * incluindo a intro. Antes eram aceites no painel, apareciam na
   * pré-visualização e desapareciam na página — ficavam sem sítio para
   * serem desenhados.
   */
  items?: Item[];
  cta?: { label: string; url: string; iconName?: string | null } | null;
};

export function PageIntroSection({ eyebrow, heading, body, imageUrl, items = [], cta }: PageIntroSectionProps) {
  return (
    <Reveal as="section" className="bg-surface-container-lowest py-32">
      <div className="mx-auto max-w-site px-5 text-center md:px-20">
        {eyebrow ? (
          <span className="mb-4 block font-mono text-label-mono uppercase tracking-widest text-primary">
            {eyebrow}
          </span>
        ) : null}
        <h1 className="mx-auto mb-6 max-w-3xl font-heading text-headline-lg">{heading}</h1>
        {body ? (
          <RichText html={body} className="mx-auto max-w-2xl text-body-lg text-on-surface-variant" />
        ) : null}
        {items.length > 0 ? (
          <div
            className={`mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-6 text-left ${
              items.length > 1 ? "md:grid-cols-2" : ""
            }`}
          >
            {items.map((item) => (
              <Card key={item.id} className="p-8">
                {item.iconName ? <Icon name={item.iconName} className="mb-4 text-3xl text-primary" /> : null}
                <h3 className="mb-3 font-heading text-headline-md">{item.title}</h3>
                {item.body ? (
                  <p className="text-sm leading-relaxed text-on-surface-variant">{item.body}</p>
                ) : null}
              </Card>
            ))}
          </div>
        ) : null}

        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="mx-auto mt-16 h-[360px] w-full max-w-4xl rounded-lg object-cover" />
        ) : null}
        {cta ? (
          <div className="mt-10">
            <Button href={cta.url} variant="cta" icon={cta.iconName ?? undefined}>
              {cta.label}
            </Button>
          </div>
        ) : null}
      </div>
    </Reveal>
  );
}
