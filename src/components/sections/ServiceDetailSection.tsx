import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { RichText } from "@/components/ui/RichText";

type Feature = { id: string; title: string; body: string | null; iconName: string | null };

type ServiceDetailSectionProps = {
  id: string;
  title: string;
  intro: string;
  imageUrl?: string | null;
  features: Feature[];
  cta?: { label: string; url: string; iconName?: string | null } | null;
  reverse?: boolean;
  className?: string;
};

export function ServiceDetailSection({
  id,
  title,
  intro,
  imageUrl,
  features,
  cta,
  reverse = false,
  className,
}: ServiceDetailSectionProps) {
  return (
    <Reveal as="section" id={id} className={className ?? "bg-surface py-32"}>
      <div className="mx-auto max-w-[1280px] px-5 md:px-20">
        <div
          className={`flex flex-col items-center gap-16 lg:flex-row ${reverse ? "lg:flex-row-reverse" : ""}`}
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={title} className="h-[420px] w-full rounded-lg object-cover lg:w-1/2" />
          ) : null}
          <div className="lg:w-1/2">
            <h2 className="mb-6 font-heading text-headline-lg">{title}</h2>
            <RichText html={intro} className="mb-10 text-on-surface-variant" />
            <div className="mb-10 space-y-8">
              {features.map((feature) => (
                <div key={feature.id} className="flex items-start gap-4">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Icon name={feature.iconName ?? "check_circle"} className="text-primary" />
                  </div>
                  <div>
                    <h5 className="mb-1 font-bold">{feature.title}</h5>
                    {feature.body ? <p className="text-sm text-on-surface-variant">{feature.body}</p> : null}
                  </div>
                </div>
              ))}
            </div>
            {cta ? (
              <Button href={cta.url} variant="ghost" icon={cta.iconName ?? undefined}>
                {cta.label}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </Reveal>
  );
}
