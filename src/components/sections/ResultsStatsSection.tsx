import { Reveal } from "@/components/ui/Reveal";
import { StatItem } from "@/components/ui/StatItem";
import { Button } from "@/components/ui/Button";
import { RichText } from "@/components/ui/RichText";
import { cn } from "@/lib/cn";

type Stat = { id: string; value: string; label: string; iconName: string | null };

type ResultsStatsSectionProps = {
  eyebrow?: string | null;
  heading: string;
  body?: string | null;
  stats: Stat[];
  cta?: { label: string; url: string; iconName?: string | null } | null;
  /** Colunas em ecrã largo. Três números numa grelha de cinco deixavam duas
   *  colunas vazias à direita, com o bloco todo encostado a um lado. */
  columns?: 1 | 2 | 3 | 4 | 5;
};

// Escritas por extenso porque o Tailwind lê as classes do código-fonte: uma
// classe montada com `md:grid-cols-${n}` nunca chega à folha de estilos.
const COLUNAS: Record<number, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  5: "md:grid-cols-5",
};

export function ResultsStatsSection({ eyebrow, heading, body, stats, cta, columns = 5 }: ResultsStatsSectionProps) {
  return (
    <Reveal as="section" className="bg-surface py-32 text-center">
      <div className="mx-auto max-w-site px-5 md:px-20">
        {eyebrow ? (
          <span className="mb-4 block font-mono text-label-mono uppercase tracking-widest text-primary">
            {eyebrow}
          </span>
        ) : null}
        <h2 className="mb-4 font-heading text-headline-lg">{heading}</h2>
        <div className="mx-auto mb-16 h-1 w-24 rounded-full bg-primary" />
        <div className={cn("grid grid-cols-2 gap-10", COLUNAS[columns] ?? COLUNAS[5])}>
          {stats.map((stat, i) => (
            <div
              key={stat.id}
              className={cn(
                "neon-border flex flex-col items-center rounded-2xl bg-surface-container-low p-6",
                i === stats.length - 1 && stats.length % 2 === 1 ? "col-span-2 md:col-span-1" : undefined,
              )}
            >
              <StatItem value={stat.value} label={stat.label} icon={stat.iconName ?? undefined} />
            </div>
          ))}
        </div>
        {body || cta ? (
          <div className="mt-16">
            {body ? <RichText html={body} className="mb-6 mx-auto text-on-surface-variant" /> : null}
            {cta ? (
              <Button href={cta.url} variant="cta" icon={cta.iconName ?? undefined}>
                {cta.label}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </Reveal>
  );
}
