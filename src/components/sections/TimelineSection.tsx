import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { getCta } from "@/lib/content";
import type { SiteLocale } from "@/lib/locale";

type Item = {
  id: string;
  title: string;
  body: string | null;
  iconName: string | null;
  numberLabel: string | null;
  ctaKey?: string | null;
};

type TimelineSectionProps = {
  eyebrow?: string | null;
  heading: string;
  items: Item[];
  cta?: { label: string; url: string; iconName?: string | null } | null;
  className?: string;
  locale?: SiteLocale;
};

export function TimelineSection({ eyebrow, heading, items, cta, className, locale = "PT" }: TimelineSectionProps) {
  return (
    <Reveal as="section" className={className ?? "bg-surface-container-high py-32"}>
      <div className="mx-auto max-w-[1280px] px-5 md:px-20">
        <div className="mx-auto max-w-3xl">
          {eyebrow ? (
            <span className="mb-4 block text-center font-mono text-label-mono uppercase tracking-widest text-primary">
              {eyebrow}
            </span>
          ) : null}
          <h2 className="mb-12 text-center font-heading text-headline-lg">{heading}</h2>
          <div className="relative space-y-16">
            <div className="absolute bottom-4 left-7 top-4 hidden w-0.5 bg-primary/20 sm:block" />
            {items.map((item, index) => (
              <TimelineItem key={item.id} item={item} index={index} locale={locale} />
            ))}
          </div>
          {cta ? (
            <div className="mt-16 text-center">
              <Button href={cta.url} variant="cta" icon={cta.iconName ?? undefined}>
                {cta.label}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </Reveal>
  );
}

async function TimelineItem({ item, index, locale }: { item: Item; index: number; locale: SiteLocale }) {
  const cta = item.ctaKey ? await getCta(item.ctaKey, locale) : null;

  return (
    <div className="relative flex items-start gap-8 pl-0 sm:pl-20">
      <div className="z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-on-primary shadow-[0_0_20px_rgba(255,106,19,0.4)]">
        {item.numberLabel ? <span>{item.numberLabel}</span> : <Icon name={item.iconName ?? "check"} />}
      </div>
      <div>
        <h4 className="mb-3 text-headline-md font-bold">{item.title}</h4>
        {item.body ? <p className="leading-relaxed text-on-surface-variant">{item.body}</p> : null}
        {cta ? (
          <div className="mt-3">
            <Button href={cta.url} variant="ghost" size="sm" icon={cta.iconName ?? undefined}>
              {cta.label}
            </Button>
          </div>
        ) : null}
      </div>
      <span className="sr-only">{index + 1}</span>
    </div>
  );
}
