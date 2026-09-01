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
    <section className="relative flex min-h-screen items-center overflow-hidden" id="hero">
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
      <div className="relative z-10 mx-auto w-full max-w-site px-5 py-32 text-center md:px-20 lg:text-left">
        <div className="max-w-4xl lg:mx-0 mx-auto">
          {eyebrow ? (
            <span className="mb-8 inline-block bg-gradient-to-r from-primary to-primary-deep px-4 py-1.5 font-mono text-label-mono uppercase tracking-[0.3em] text-white shadow-[0_4px_20px_rgba(255,106,19,0.35)]">
              {eyebrow}
            </span>
          ) : null}
          <h1 className="mb-8 font-heading text-[2.75rem] leading-[1.1] text-white drop-shadow-lg md:text-headline-xl">
            {renderHeadingWithEmphasis(heading)}
          </h1>
          {subheading ? (
            <p className="mx-auto mb-12 max-w-2xl text-body-lg leading-relaxed text-white/90 lg:mx-0">
              {subheading}
            </p>
          ) : null}
          {cta ? (
            <div className="flex flex-col items-center gap-6 lg:items-start">
              <Button href={cta.url} variant="cta" size="lg" pulse icon={cta.iconName ?? undefined}>
                👉 {cta.label}
              </Button>
              {trustBadges.length > 0 ? (
                <div className="flex flex-wrap items-center justify-center gap-6 border-t border-white/10 pt-4 lg:justify-start">
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
