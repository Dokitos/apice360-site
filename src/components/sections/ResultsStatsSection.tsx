import { Reveal } from "@/components/ui/Reveal";
import { StatItem } from "@/components/ui/StatItem";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type Stat = { id: string; value: string; label: string; iconName: string | null };

type ResultsStatsSectionProps = {
  heading: string;
  body?: string | null;
  stats: Stat[];
  cta?: { label: string; url: string } | null;
};

export function ResultsStatsSection({ heading, body, stats, cta }: ResultsStatsSectionProps) {
  return (
    <Reveal as="section" className="bg-surface py-32 text-center">
      <div className="mx-auto max-w-[1280px] px-5 md:px-20">
        <h2 className="mb-4 font-heading text-headline-lg">{heading}</h2>
        <div className="mx-auto mb-16 h-1 w-24 rounded-full bg-primary" />
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
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
            {body ? <p className="mb-6 text-on-surface-variant">{body}</p> : null}
            {cta ? (
              <Button href={cta.url} variant="cta" icon="bolt">
                {cta.label}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </Reveal>
  );
}
