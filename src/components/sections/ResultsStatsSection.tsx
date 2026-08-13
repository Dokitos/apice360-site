import { Reveal } from "@/components/ui/Reveal";
import { StatItem } from "@/components/ui/StatItem";
import { Button } from "@/components/ui/Button";

type Stat = { id: string; value: string; label: string; iconName: string | null };

type ResultsStatsSectionProps = {
  heading: string;
  body?: string | null;
  stats: Stat[];
  cta?: { label: string; url: string } | null;
};

export function ResultsStatsSection({ heading, body, stats, cta }: ResultsStatsSectionProps) {
  return (
    <Reveal as="section" className="bg-surface-container-lowest py-24 text-center">
      <div className="mx-auto max-w-[1280px] px-5 md:px-20">
        <h2 className="mb-4 font-heading text-headline-lg text-primary">{heading}</h2>
        {body ? <p className="mx-auto mb-16 max-w-2xl text-on-surface-variant">{body}</p> : null}
        <div className="mb-16 grid grid-cols-2 gap-10 md:grid-cols-5">
          {stats.map((stat, i) => (
            <div key={stat.id} className={i === stats.length - 1 && stats.length % 2 === 1 ? "col-span-2 md:col-span-1" : undefined}>
              <StatItem value={stat.value} label={stat.label} icon={stat.iconName ?? undefined} />
            </div>
          ))}
        </div>
        {cta ? (
          <Button href={cta.url} variant="cta">
            {cta.label}
          </Button>
        ) : null}
      </div>
    </Reveal>
  );
}
