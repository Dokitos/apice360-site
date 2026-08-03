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
        <div className="mb-16 grid grid-cols-2 gap-10 md:grid-cols-4">
          {stats.map((stat) => (
            <StatItem key={stat.id} value={stat.value} label={stat.label} icon={stat.iconName ?? undefined} />
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
