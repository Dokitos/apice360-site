import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import { RichText } from "@/components/ui/RichText";

type GenericSectionItem = {
  id: string;
  iconName: string | null;
  imageUrl: string | null;
  numberLabel: string | null;
  title: string;
  body: string | null;
};

export type GenericSectionData = {
  key: string;
  imageUrl: string | null;
  iconName: string | null;
  eyebrow: string | null;
  heading: string | null;
  subheading: string | null;
  body: string | null;
  items: GenericSectionItem[];
};

/**
 * Fallback renderer for page sections created in the admin that aren't tied
 * to a specific hand-built layout on the page. Lets an editor add a new
 * section from the admin ("+ Nova Secção") and have it actually show up on
 * the site, instead of silently doing nothing.
 */
export function GenericPageSection({ section, alt = false }: { section: GenericSectionData; alt?: boolean }) {
  const hasContent = Boolean(
    section.heading || section.subheading || section.body || section.imageUrl || section.items.length > 0,
  );
  if (!hasContent) return null;

  return (
    <Reveal as="section" className={alt ? "bg-surface-container-lowest py-24" : "bg-surface py-24"}>
      <div className="mx-auto max-w-[1280px] px-5 md:px-20">
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
              <div key={item.id} className="rounded-lg border border-outline-variant/20 p-8 text-center">
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
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </Reveal>
  );
}
