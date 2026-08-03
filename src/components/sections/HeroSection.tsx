import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

type HeroSectionProps = {
  eyebrow?: string | null;
  heading: string;
  subheading?: string | null;
  imageUrl?: string | null;
  cta?: { label: string; url: string; iconName?: string | null } | null;
};

export function HeroSection({ eyebrow, heading, subheading, imageUrl, cta }: HeroSectionProps) {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden" id="hero">
      <div
        className="absolute inset-0 z-0 h-full w-full bg-cover bg-center bg-fixed"
        style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-background/10" />
      </div>
      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-5 py-32 text-center md:px-20 lg:text-left">
        <div className="max-w-4xl lg:mx-0 mx-auto">
          {eyebrow ? (
            <span className="mb-8 inline-block border border-primary bg-primary/5 px-4 py-1.5 font-mono text-label-mono uppercase tracking-[0.3em] text-primary">
              {eyebrow}
            </span>
          ) : null}
          <h1 className="mb-8 font-heading text-[2.75rem] leading-[1.1] md:text-headline-xl">
            {heading}
          </h1>
          {subheading ? (
            <p className="mx-auto mb-12 max-w-2xl text-body-lg leading-relaxed text-on-surface-variant lg:mx-0">
              {subheading}
            </p>
          ) : null}
          {cta ? (
            <Button href={cta.url} variant="cta" size="lg" pulse icon={cta.iconName ?? "bolt"}>
              {cta.label}
            </Button>
          ) : null}
        </div>
      </div>
      <div className="absolute bottom-12 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/60">
          Ver Mais
        </span>
        <Icon name="keyboard_double_arrow_down" className="animate-bounce-slow text-3xl text-primary" />
      </div>
    </section>
  );
}
