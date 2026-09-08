import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

type TrustBadge = { id: string; value: string; label: string; iconName: string | null };

type HeroSectionProps = {
  eyebrow?: string | null;
  heading: string;
  subheading?: string | null;
  imageUrl?: string | null;
  cta?: { label: string; url: string; iconName?: string | null } | null;
  trustBadges?: TrustBadge[];
};

// Gives the exact phrase "3x Mais Rápido" / "3x Faster" a distinct accent
// color to call it out within the hero heading, whichever locale is active.
// Falls back to plain text if the copy ever changes and no longer contains
// either phrase.
function renderHeadingWithEmphasis(heading: string) {
  const targets = ["3x Mais Rápido", "3x Faster"];
  const target = targets.find((t) => heading.includes(t));
  if (!target) return heading;
  const idx = heading.indexOf(target);
  return (
    <>
      {heading.slice(0, idx)}
      <span className="text-primary">{target}</span>
      {heading.slice(idx + target.length)}
    </>
  );
}

export function HeroSection({ eyebrow, heading, subheading, imageUrl, cta, trustBadges = [] }: HeroSectionProps) {
  return (
    <section className="relative flex min-h-screen items-start overflow-hidden" id="hero">
      <div
        // bg-fixed (parallax) is desktop-only: mobile Safari/Chrome render
        // fixed-attachment backgrounds incorrectly (clipped/blurry), so it
        // falls back to a normal scrolling background below md.
        className="absolute inset-0 z-0 h-full w-full bg-cover bg-center bg-scroll md:bg-fixed"
        style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
      >
        {/* Kept dark for legibility over the photo, independent of the site's light theme. */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/40 to-ink/10" />
      </div>
      <div className="relative z-10 mx-auto w-full max-w-site px-5 pb-24 pt-10 text-center md:px-20 md:pb-24 md:pt-12 lg:text-left">
        <div className="max-w-4xl lg:mx-0 mx-auto">
          {eyebrow ? (
            <span className="mb-5 inline-block bg-gradient-to-r from-primary to-primary-deep px-3 py-1 font-mono text-[9px] uppercase tracking-[0.08em] text-white shadow-[0_4px_20px_rgba(255,106,19,0.35)] md:mb-6 md:px-3.5 md:text-[10px] md:tracking-[0.2em]">
              {eyebrow}
            </span>
          ) : null}
          <h1 className="mb-5 font-heading text-[1.75rem] leading-[1.15] text-white drop-shadow-lg sm:text-[2.25rem] md:mb-6 md:text-[2.5rem] md:leading-[1.1] lg:text-[3.25rem]">
            {renderHeadingWithEmphasis(heading)}
          </h1>
          {subheading ? (
            <p className="mx-auto mb-8 max-w-xl text-[15px] leading-relaxed text-white/90 md:text-base lg:mx-0">
              {subheading}
            </p>
          ) : null}
          {cta ? (
            <div className="flex flex-col items-center gap-5 lg:items-start md:gap-6">
              {/* O tamanho "lg" do Button é desenhado para desktop; em mobile
                  ocupava duas linhas, por isso desce aqui e volta a subir em md. */}
              <Button
                href={cta.url}
                variant="cta"
                size="lg"
                pulse
                icon={cta.iconName ?? undefined}
                className="px-6 py-3.5 text-sm md:px-8 md:py-4 md:text-base"
              >
                {cta.label}
              </Button>
              {trustBadges.length > 0 ? (
                <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-white/10 pt-4 md:gap-6 lg:justify-start">
                  {trustBadges.map((badge) => (
                    <div key={badge.id} className="flex items-center gap-2 font-mono text-xs text-white/80">
                      <Icon name={badge.iconName ?? "verified"} className="text-sm text-primary" />
                      {badge.value} {badge.label.toUpperCase()}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
      <div className="absolute bottom-12 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/70">
          Descubra o LSF
        </span>
        <Icon name="keyboard_double_arrow_down" className="animate-bounce-slow text-3xl text-primary" />
      </div>
    </section>
  );
}
