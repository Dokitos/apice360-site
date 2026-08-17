import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Carousel } from "@/components/ui/Carousel";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import type { SiteLocale } from "@/lib/locale";

type Testimonial = {
  id: string;
  authorName: string;
  location: string | null;
  quote: string;
};

export function TestimonialsSection({
  testimonials,
  locale = "PT",
}: {
  testimonials: Testimonial[];
  locale?: SiteLocale;
}) {
  if (testimonials.length === 0) return null;

  return (
    <Reveal as="section" className="overflow-hidden bg-surface py-32">
      <div className="mx-auto max-w-[1280px] px-5 md:px-20">
        <SectionHeading title={locale === "EN" ? "Trust That Builds" : "Confiança que Constrói"} />
        <Carousel slideClassName="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%]">
          {testimonials.map((t) => (
            <Card key={t.id} variant="plain" className="flex h-full flex-col justify-between p-10">
              <Icon name="format_quote" className="mb-4 text-4xl text-primary" />
              <p className="mb-8 italic leading-relaxed text-on-surface">&ldquo;{t.quote}&rdquo;</p>
              <div>
                <p className="font-bold">{t.authorName}</p>
                {t.location ? (
                  <p className="font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
                    {t.location}
                  </p>
                ) : null}
              </div>
            </Card>
          ))}
        </Carousel>
      </div>
    </Reveal>
  );
}
