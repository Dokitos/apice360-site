import { Reveal } from "@/components/ui/Reveal";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";

type Item = { id: string; title: string; body: string | null; iconName: string | null };

type CardGridSectionProps = {
  eyebrow?: string | null;
  heading: string;
  body?: string | null;
  items: Item[];
  columns?: 2 | 3 | 4;
  cta?: { label: string; url: string; iconName?: string | null } | null;
};

export function CardGridSection({ eyebrow, heading, body, items, columns = 2, cta }: CardGridSectionProps) {
  const colsClass =
    columns === 4
      ? "md:grid-cols-2 lg:grid-cols-4"
      : columns === 3
        ? "md:grid-cols-3"
        : "md:grid-cols-2";

  return (
    <Reveal as="section" className="bg-surface py-32">
      <div className="mx-auto max-w-[1280px] px-5 md:px-20">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          {eyebrow ? (
            <span className="mb-4 block font-mono text-label-mono uppercase tracking-widest text-primary">
              {eyebrow}
            </span>
          ) : null}
          <h2 className="mb-4 font-heading text-headline-lg">{heading}</h2>
          {body ? <p className="leading-relaxed text-on-surface-variant">{body}</p> : null}
        </div>
        <div className={`grid grid-cols-1 gap-6 ${colsClass}`}>
          {items.map((item) => (
            <Card key={item.id} className="p-8">
              {item.iconName ? <Icon name={item.iconName} className="mb-4 text-3xl text-primary" /> : null}
              <h3 className="mb-3 font-heading text-headline-md">{item.title}</h3>
              {item.body ? <p className="text-sm leading-relaxed text-on-surface-variant">{item.body}</p> : null}
            </Card>
          ))}
        </div>
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
