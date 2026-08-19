import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { RichText } from "@/components/ui/RichText";
import { getCta } from "@/lib/content";

type Item = { id: string; title: string; iconName: string | null; ctaKey?: string | null };

type WhyChooseSectionProps = {
  eyebrow?: string | null;
  heading: string;
  body?: string | null;
  imageUrl?: string | null;
  items: Item[];
  cta?: { label: string; url: string; iconName?: string | null } | null;
  locale?: "PT" | "EN";
};

export function WhyChooseSection({ eyebrow, heading, body, imageUrl, items, cta, locale = "PT" }: WhyChooseSectionProps) {
  return (
    <Reveal as="section" className="bg-surface-container-lowest py-32">
      <div className="mx-auto max-w-[1280px] px-5 md:px-20">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="h-[420px] w-full rounded-lg object-cover" />
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

async function WhyChooseItem({ item, locale }: { item: Item; locale: "PT" | "EN" }) {
  const cta = item.ctaKey ? await getCta(item.ctaKey, locale) : null;

  return (
    <li className="flex items-center gap-3">
      <Icon name={item.iconName ?? "check_circle"} className="text-primary" />
      <span>{item.title}</span>
      {cta ? (
        <Link href={cta.url} className="text-sm font-bold text-primary hover:underline">
          {cta.label}
        </Link>
      ) : null}
    </li>
  );
}
