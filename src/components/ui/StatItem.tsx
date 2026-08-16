import { Icon } from "@/components/ui/Icon";

type StatItemProps = {
  value: string;
  label: string;
  icon?: string;
};

export function StatItem({ value, label, icon }: StatItemProps) {
  return (
    <div className="flex flex-col items-center text-center">
      {icon ? <Icon name={icon} className="mb-3 text-3xl text-primary" /> : null}
      <span className="font-heading text-headline-md font-bold text-primary">{value}</span>
      <span className="mt-1 font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
        {label}
      </span>
    </div>
  );
}
