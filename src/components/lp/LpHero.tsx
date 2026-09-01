import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { getDictionary } from "@/lib/dictionary";
import type { SiteLocale } from "@/lib/locale";

type TrustBadge = { id: string; value: string; label: string; iconName: string | null };

type LpHeroProps = {
  locale: SiteLocale;
  eyebrow?: string | null;
  heading: string;
  subheading?: string | null;
  imageUrl?: string | null;
  ctaLabel: string;
  /** Âncora dentro da própria página (o simulador) — a LP não leva o visitante para fora. */
  ctaHref?: string;
  trustBadges?: TrustBadge[];
};

/**
 * Realça "3x Mais Rápido" (e os equivalentes EN/ES/FR) dentro do título,
 * como na landing page original. Se a copy mudar e a expressão desaparecer,
 * o título é desenhado como texto normal.
 */
function withEmphasis(heading: string) {
  const targets = ["3x Mais Rápido", "3x Faster", "3x Más Rápido", "3x Plus Rapide"];
  const target = targets.find((t) => heading.includes(t));
  if (!target) return heading;
  const idx = heading.indexOf(target);
  return (
    <>
      {heading.slice(0, idx)}
      <span className="gradient-text">{target}</span>
      {heading.slice(idx + target.length)}
    </>
  );
}

export function LpHero({
  locale,
  eyebrow,
  heading,
  subheading,
  imageUrl,
  ctaLabel,
  ctaHref = "#simulador",
  trustBadges = [],
}: LpHeroProps) {
  const dict = getDictionary(locale);

  return (
    <section className="relative flex min-h-screen items-start overflow-hidden" id="hero">
      <div
        className="absolute inset-0 z-0 h-full w-full bg-cover bg-center bg-no-repeat"
        style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
      >
        {/* Escurecido de propósito para o texto branco ser legível sobre a fotografia. */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/40 to-ink/10" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-site px-5 pb-32 pt-10 text-center md:px-20 lg:text-left">
        <div className="max-w-4xl">
          <div className="mb-10 flex items-center justify-center lg:justify-start">
            <Logo variant="light" className="h-16 drop-shadow-[0_0_10px_rgba(0,0,0,0.3)] md:h-20" />
          </div>

          {eyebrow ? (
            <span className="mb-8 inline-block bg-primary px-4 py-1.5 font-mono text-label-mono uppercase tracking-[0.3em] text-on-primary shadow-lg shadow-primary/30">
              {eyebrow}
            </span>
          ) : null}

          <h1 className="mb-8 font-heading text-[2.75rem] leading-[1.1] text-white drop-shadow-lg md:text-headline-xl">
            {withEmphasis(heading)}
          </h1>

          {subheading ? (
            <p className="mx-auto mb-12 max-w-2xl text-body-lg leading-relaxed text-white/90 lg:mx-0">
              {subheading}
            </p>
          ) : null}

          <div className="flex flex-col items-center gap-8 lg:items-start">
            <div className="flex flex-col gap-4">
              <a
                href={ctaHref}
                className="group flex animate-pulse-glow cursor-pointer items-center gap-4 bg-primary px-10 py-6 text-lg font-bold uppercase text-white transition-all hover:scale-105"
              >
                👉 {ctaLabel}
                <Icon name="bolt" className="transition-transform group-hover:translate-x-1" />
              </a>

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
          </div>
        </div>
      </div>

      <div className="absolute bottom-12 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/70">
          {dict.lp.scrollHint}
        </span>
        <Icon name="keyboard_double_arrow_down" className="animate-bounce-slow text-3xl text-primary" />
      </div>
    </section>
  );
}
