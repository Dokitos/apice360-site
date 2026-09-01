import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import { RichText } from "@/components/ui/RichText";
import { Button } from "@/components/ui/Button";
import { getCta } from "@/lib/content";
import type { SiteLocale } from "@/lib/locale";
import { CardGridSection } from "@/components/sections/CardGridSection";
import { TimelineSection } from "@/components/sections/TimelineSection";

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
  /** "standard" (this file's own layout) | "grid" | "timeline" — see the dispatch below. */
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
 * Renderer for page sections created in the admin that aren't tied to a
 * page-specific hand-built component. Dispatches on section.layout so an
 * admin-created section isn't permanently stuck looking like every other
 * one — "grid" and "timeline" delegate to the same components the
 * hand-built pages use; "standard" (the default) is this file's own
 * centered-text-then-items layout.
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

  // Both delegated layouts require a heading; without one, fall back to the
  // standard layout below rather than rendering an empty <h2>.
  if (section.layout === "grid" && section.heading) {
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

  if (section.layout === "timeline" && section.heading) {
    return (
      <TimelineSection
        eyebrow={section.eyebrow}
        heading={section.heading}
        items={section.items}
        cta={cta}
        className={alt ? "bg-surface-container-lowest py-32" : "bg-surface py-32"}
        locale={locale}
      />
    );
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
