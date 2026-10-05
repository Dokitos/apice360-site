import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { RichText } from "@/components/ui/RichText";
import { getCta } from "@/lib/content";
import { cn } from "@/lib/cn";
import type { SiteLocale } from "@/lib/locale";

type Item = { id: string; title: string; body?: string | null; iconName: string | null; ctaKey?: string | null };

type WhyChooseSectionProps = {
  eyebrow?: string | null;
  heading: string;
  body?: string | null;
  imageUrl?: string | null;
  items: Item[];
  cta?: { label: string; url: string; iconName?: string | null } | null;
  locale?: SiteLocale;
  /** Imagem do lado direito em vez do esquerdo, para alternar secções seguidas. */
  reverse?: boolean;
  className?: string;
};

export function WhyChooseSection({
  eyebrow,
  heading,
  body,
  imageUrl,
  items,
  cta,
  locale = "PT",
  reverse = false,
  className,
}: WhyChooseSectionProps) {
  return (
    <Reveal as="section" className={className ?? "bg-surface-container-lowest py-32"}>
      <div className="mx-auto max-w-site px-5 md:px-20">
        {/* Sem imagem não há duas colunas para dividir: o texto ocupava
            metade da largura e deixava a outra metade em branco. */}
        <div className={cn("grid grid-cols-1 items-center gap-16", imageUrl && "lg:grid-cols-2")}>
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt=""
              className={cn("h-[420px] w-full rounded-lg object-cover", reverse && "lg:order-2")}
            />
          ) : null}
          <div>
            {eyebrow ? (
              <span className="mb-4 block font-mono text-label-mono uppercase tracking-widest text-primary">
                {eyebrow}
              </span>
            ) : null}
            <h2 className="mb-6 font-heading text-headline-lg">{heading}</h2>
            {body ? <RichText html={body} className="mb-8 text-on-surface-variant" /> : null}
            <ul className="mb-10 space-y-4">
              {items.map((item) => (
                <WhyChooseItem key={item.id} item={item} locale={locale} />
              ))}
            </ul>
            {cta ? (
              <Button href={cta.url} variant="cta" icon={cta.iconName ?? undefined}>
                {cta.label}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

async function WhyChooseItem({ item, locale }: { item: Item; locale: SiteLocale }) {
  const cta = item.ctaKey ? await getCta(item.ctaKey, locale) : null;

  // Um item de uma linha fica centrado com o ícone; um com parágrafo por
  // baixo tem de alinhar pelo topo, senão o ícone desce para o meio do bloco.
  return (
    <li className={cn("flex gap-3", item.body ? "items-start" : "items-center")}>
      <Icon name={item.iconName ?? "check_circle"} className={cn("text-primary", item.body && "mt-0.5")} />
      <span>
        {item.title}
        {item.body ? <span className="mt-1 block text-sm text-on-surface-variant">{item.body}</span> : null}
      </span>
      {cta ? (
        <Link href={cta.url} className="text-sm font-bold text-primary hover:underline">
          {cta.label}
        </Link>
      ) : null}
    </li>
  );
}
