import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import { RichText } from "@/components/ui/RichText";
import { Button } from "@/components/ui/Button";
import { getCta } from "@/lib/content";
import type { SiteLocale } from "@/lib/locale";
import { CardGridSection } from "@/components/sections/CardGridSection";
import { TimelineSection } from "@/components/sections/TimelineSection";
import { WhyChooseSection } from "@/components/sections/WhyChooseSection";
import { ServiceDetailSection } from "@/components/sections/ServiceDetailSection";
import { ResultsStatsSection } from "@/components/sections/ResultsStatsSection";

type GenericSectionItem = {
  id: string;
  iconName: string | null;
  imageUrl: string | null;
  numberLabel: string | null;
  ctaKey: string | null;
  title: string;
  body: string | null;
};

export type GenericSectionData = {
  key: string;
  /** Uma das montagens de src/lib/section-layouts.ts — ver o despacho abaixo. */
  layout: string;
  imageUrl: string | null;
  iconName: string | null;
  ctaKey: string | null;
  eyebrow: string | null;
  heading: string | null;
  subheading: string | null;
  body: string | null;
  items: GenericSectionItem[];
};

/**
 * Apresenta as secções criadas no painel que não têm componente próprio.
 *
 * Despacha por section.layout para uma secção criada no painel não ficar
 * presa ao mesmo aspeto de todas as outras: cada montagem delega nos mesmos
 * componentes que as páginas feitas à mão usam, por isso uma secção nova sai
 * com a linguagem visual do resto do site. A lista das montagens e o que
 * cada uma precisa está em src/lib/section-layouts.ts; "standard" (a
 * predefinição) é a montagem deste ficheiro: texto ao centro, itens por baixo.
 */
export async function GenericPageSection({
  section,
  locale,
  alt = false,
}: {
  section: GenericSectionData;
  locale: SiteLocale;
  alt?: boolean;
}) {
  const hasContent = Boolean(
    section.heading || section.subheading || section.body || section.imageUrl || section.items.length > 0,
  );
  if (!hasContent) return null;

  const cta = section.ctaKey ? await getCta(section.ctaKey, locale) : null;

  // Todas as montagens delegadas desenham um <h2>: sem título ficariam com um
  // cabeçalho vazio, por isso caem para a montagem padrão lá em baixo.
  if (section.heading) {
    const fundo = alt ? "bg-surface-container-lowest py-32" : "bg-surface py-32";

    if (section.layout === "grid") {
      return (
        <CardGridSection
          eyebrow={section.eyebrow}
          heading={section.heading}
          body={section.body}
          items={section.items}
          columns={3}
          cta={cta}
          locale={locale}
        />
      );
    }

    if (section.layout === "timeline") {
      return (
        <TimelineSection
          eyebrow={section.eyebrow}
          heading={section.heading}
          items={section.items}
          cta={cta}
          className={fundo}
          locale={locale}
        />
      );
    }

    if (section.layout === "stats") {
      return (
        <ResultsStatsSection
          eyebrow={section.eyebrow}
          heading={section.heading}
          body={section.body}
          stats={section.items.map((item) => ({
            id: item.id,
            // O campo "Número" do item é o valor em destaque. Sem ele fica o
            // título nesse lugar, em vez de um número grande em branco; o
            // texto do item não entra, porque um parágrafo na legenda de um
            // número sai espremido e ilegível.
            value: item.numberLabel || item.title,
            label: item.numberLabel ? item.title : "",
            iconName: item.iconName,
          }))}
          columns={(Math.min(Math.max(section.items.length, 1), 5) as 1 | 2 | 3 | 4 | 5)}
          cta={cta}
        />
      );
    }

    if (section.layout === "split" || section.layout === "split_reverse") {
      return (
        <WhyChooseSection
          eyebrow={section.eyebrow}
          heading={section.heading}
          body={section.body}
          imageUrl={section.imageUrl}
          items={section.items}
          cta={cta}
          locale={locale}
          reverse={section.layout === "split_reverse"}
          className={fundo}
        />
      );
    }

    if (section.layout === "features" || section.layout === "features_reverse") {
      return (
        <ServiceDetailSection
          id={section.key}
          eyebrow={section.eyebrow}
          title={section.heading}
          intro={section.body}
          imageUrl={section.imageUrl}
          features={section.items}
          cta={cta}
          reverse={section.layout === "features_reverse"}
          className={fundo}
        />
      );
    }

    if (section.layout === "banner") {
      return <BannerLayout section={section} cta={cta} />;
    }
  }

  return (
    <Reveal as="section" className={alt ? "bg-surface-container-lowest py-24" : "bg-surface py-24"}>
      <div className="mx-auto max-w-site px-5 md:px-20">
        <div className="mx-auto max-w-3xl text-center">
          {section.iconName ? (
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Icon name={section.iconName} className="text-2xl text-primary" />
            </div>
          ) : null}
          {section.eyebrow ? (
            <span className="mb-3 block font-mono text-label-mono uppercase tracking-widest text-primary">
              {section.eyebrow}
            </span>
          ) : null}
          {section.heading ? <h2 className="mb-4 font-heading text-headline-lg">{section.heading}</h2> : null}
          {section.subheading ? (
            <p className="mb-4 text-body-lg text-on-surface-variant">{section.subheading}</p>
          ) : null}
          {section.body ? <RichText html={section.body} className="mx-auto text-on-surface-variant" /> : null}
        </div>

        {section.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={section.imageUrl}
            alt=""
            className="mx-auto mt-12 h-[360px] w-full max-w-4xl rounded-lg object-cover"
          />
        ) : null}

        {section.items.length > 0 ? (
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {section.items.map((item) => (
              <ItemCard key={item.id} item={item} locale={locale} />
            ))}
          </div>
        ) : null}

        {cta ? (
          <div className="mt-12 text-center">
            <Button href={cta.url} variant="cta" icon={cta.iconName ?? undefined}>
              {cta.label}
            </Button>
          </div>
        ) : null}
      </div>
    </Reveal>
  );
}

/**
 * Faixa de largura total na cor da marca, para uma chamada à ação entre duas
 * secções de conteúdo. Esta não delega: nenhuma página feita à mão tem igual.
 */
function BannerLayout({
  section,
  cta,
}: {
  section: GenericSectionData;
  cta: { label: string; url: string; iconName?: string | null } | null;
}) {
  return (
    <Reveal as="section" className="bg-primary py-24 text-on-primary">
      <div className="mx-auto max-w-site px-5 text-center md:px-20">
        {section.eyebrow ? (
          <span className="mb-4 block font-mono text-label-mono uppercase tracking-widest text-on-primary/70">
            {section.eyebrow}
          </span>
        ) : null}
        <h2 className="mx-auto mb-6 max-w-4xl font-heading text-headline-lg">{section.heading}</h2>
        {section.subheading ? (
          <p className="mx-auto mb-6 max-w-2xl text-body-lg text-on-primary/80">{section.subheading}</p>
        ) : null}
        {section.body ? (
          // prose-invert porque as cores do prose são as de um fundo claro:
          // em cima do laranja o texto sairia quase a desaparecer.
          <RichText html={section.body} className="prose-invert mx-auto max-w-2xl" />
        ) : null}
        {section.items.length > 0 ? (
          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {section.items.map((item) => (
              <li key={item.id} className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
                <Icon name={item.iconName ?? "check"} className="text-xl" />
                {item.title}
              </li>
            ))}
          </ul>
        ) : null}
        {cta ? (
          <div className="mt-10">
            <Button
              href={cta.url}
              variant="ghost"
              icon={cta.iconName ?? undefined}
              className="border-on-primary text-on-primary hover:bg-on-primary hover:text-primary"
            >
              {cta.label}
            </Button>
          </div>
        ) : null}
      </div>
    </Reveal>
  );
}

async function ItemCard({ item, locale }: { item: GenericSectionItem; locale: SiteLocale }) {
  const cta = item.ctaKey ? await getCta(item.ctaKey, locale) : null;

  return (
    <div className="rounded-lg border border-outline-variant/20 p-8 text-center">
      {item.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.imageUrl} alt="" className="mx-auto mb-4 h-32 w-full rounded-lg object-cover" />
      ) : item.iconName ? (
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Icon name={item.iconName} className="text-primary" />
        </div>
      ) : null}
      {item.numberLabel ? (
        <span className="mb-2 block font-mono text-sm text-primary/60">{item.numberLabel}</span>
      ) : null}
      <h3 className="mb-2 font-heading text-lg font-bold">{item.title}</h3>
      {item.body ? <p className="text-sm text-on-surface-variant">{item.body}</p> : null}
      {cta ? (
        <div className="mt-4">
          <Button href={cta.url} variant="ghost" size="sm" icon={cta.iconName ?? undefined}>
            {cta.label}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
