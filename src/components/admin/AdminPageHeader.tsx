import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

type AdminPageHeaderProps = {
  title: string;
  description?: string;
  newHref?: string;
  newLabel?: string;
};

export function AdminPageHeader({ title, description, newHref, newLabel = "Novo" }: AdminPageHeaderProps) {
  return (
    <div className="mb-8 flex items-start justify-between gap-4">
      <div>
        <h1 className="font-heading text-headline-lg">{title}</h1>
        {description ? <p className="mt-2 text-sm text-on-surface-variant">{description}</p> : null}
      </div>
      {newHref ? (
        <Link
          href={newHref}
          className="flex shrink-0 items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold uppercase text-on-primary transition-transform hover:scale-105"
        >
          <Icon name="add" />
          {newLabel}
        </Link>
      ) : null}
    </div>
  );
}
