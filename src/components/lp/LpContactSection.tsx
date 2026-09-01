import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { LpContactForm } from "@/components/lp/LpContactForm";
import { getDictionary } from "@/lib/dictionary";
import type { SiteLocale } from "@/lib/locale";

type ContactHighlight = {
  id: string;
  iconName: string | null;
  title: string;
  body: string | null;
};

export function LpContactSection({
  locale,
  heading,
  body,
  highlights,
}: {
  locale: SiteLocale;
  heading: string;
  body?: string | null;
  highlights: ContactHighlight[];
}) {
  const dict = getDictionary(locale);

  return (
    <Reveal
      as="section"
      id="contact"
      className="relative z-20 border-t border-outline-variant/10 bg-surface-container-low py-32"
    >
      <div className="mx-auto max-w-site px-5 md:px-20">
        <div className="flex flex-col gap-20 lg:flex-row">
          <div className="lg:w-1/2">
            <h2 className="mb-8 font-heading text-headline-lg">{heading}</h2>
            {body ? <p className="mb-12 text-body-lg leading-relaxed text-on-surface-variant">{body}</p> : null}

            {highlights.length > 0 ? (
              <div className="mb-12 grid grid-cols-1 gap-8">
                {highlights.map((item) => (
                  <div key={item.id} className="flex items-start gap-4">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Icon name={item.iconName ?? "check_circle"} className="text-primary" />
                    </div>
                    <div>
                      <h5 className="mb-1 font-bold">{item.title}</h5>
                      {item.body ? <p className="text-sm text-on-surface-variant">{item.body}</p> : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface p-8 shadow-2xl md:p-12 lg:w-1/2">
            {/* Brilho laranja difuso no canto, como na LP original. */}
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
            <h3 className="relative mb-8 font-heading text-headline-md font-bold">
              {dict.lp.contactForm.heading}
            </h3>
            <LpContactForm locale={locale} />
          </div>
        </div>
      </div>
    </Reveal>
  );
}
