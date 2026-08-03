import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";

type Project = {
  id: string;
  slug: string;
  title: string;
  locationLabel: string | null;
  clientName: string | null;
  coverImageUrl: string | null;
  testimonialQuote: string | null;
};

type PortfolioGridProps = {
  heading?: string;
  projects: Project[];
  variant?: "featured" | "numbered";
};

export function PortfolioGrid({ heading, projects, variant = "featured" }: PortfolioGridProps) {
  if (projects.length === 0) return null;

  return (
    <Reveal as="section" className="py-16">
      <div className="mx-auto max-w-[1280px] px-5 md:px-20">
        {heading ? <h2 className="mb-10 font-heading text-headline-md">{heading}</h2> : null}
        <div
          className={
            variant === "featured"
              ? "grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
              : "grid grid-cols-1 gap-8 md:grid-cols-3"
          }
        >
          {projects.map((project, index) => (
            <Link
              key={project.id}
              href={`/portfolio/${project.slug}`}
              className="group flex flex-col overflow-hidden rounded-lg border border-outline-variant/20"
            >
              <div className="relative">
                {project.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={project.coverImageUrl}
                    alt={project.title}
                    className="h-56 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-56 w-full bg-surface-container" />
                )}
                {variant === "numbered" ? (
                  <span className="absolute left-4 top-4 font-heading text-headline-lg text-primary drop-shadow">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                ) : null}
              </div>
              <div className="flex flex-1 flex-col p-6">
                {project.locationLabel ? (
                  <span className="mb-2 font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
                    {project.locationLabel}
                  </span>
                ) : null}
                {variant === "featured" && project.testimonialQuote ? (
                  <p className="mb-4 flex-1 text-sm italic leading-relaxed text-on-surface">
                    &ldquo;{project.testimonialQuote}&rdquo;
                  </p>
                ) : (
                  <p className="mb-4 flex-1 text-sm leading-relaxed text-on-surface-variant">{project.title}</p>
                )}
                {project.clientName ? <span className="text-xs text-on-surface-variant">{project.clientName}</span> : null}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
