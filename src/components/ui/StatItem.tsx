import { Icon } from "@/components/ui/Icon";

type StatItemProps = {
  value: string;
  label: string;
  icon?: string;
};

export function StatItem({ value, label, icon }: StatItemProps) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      {icon ? <Icon name={icon} className="mb-2 text-3xl text-primary" /> : null}
      <span className="font-heading text-headline-lg text-primary">{value}</span>
      <span className="font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
        {label}
      </span>
    </div>
  );
}
