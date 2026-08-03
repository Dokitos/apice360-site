import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

type Item = { id: string; title: string; iconName: string | null };

type WhyChooseSectionProps = {
  eyebrow?: string | null;
  heading: string;
  body?: string | null;
  imageUrl?: string | null;
  items: Item[];
  cta?: { label: string; url: string } | null;
};

export function WhyChooseSection({ eyebrow, heading, body, imageUrl, items, cta }: WhyChooseSectionProps) {
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
            {body ? <p className="mb-8 leading-relaxed text-on-surface-variant">{body}</p> : null}
            <ul className="mb-10 space-y-4">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-3">
                  <Icon name={item.iconName ?? "check_circle"} className="text-primary" />
                  <span>{item.title}</span>
                </li>
              ))}
            </ul>
            {cta ? (
              <Button href={cta.url} variant="cta">
                {cta.label}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </Reveal>
  );
}
