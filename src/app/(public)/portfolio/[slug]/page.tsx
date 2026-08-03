import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, getCta } from "@/lib/content";
import { Reveal } from "@/components/ui/Reveal";
import { Carousel } from "@/components/ui/Carousel";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};
  return { title: project.title, description: project.shortDescription ?? undefined };
}

export default async function PortfolioDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [project, cta] = await Promise.all([getProject(slug), getCta("project_detail_budget")]);
  if (!project) notFound();

  const images = project.images.length > 0
    ? project.images
    : project.coverImageUrl
      ? [{ id: "cover", url: project.coverImageUrl, alt: project.title }]
      : [];

  return (
    <Reveal as="section" className="py-24">
      <div className="mx-auto max-w-[1000px] px-5 md:px-20">
        <Link
          href="/portfolio"
          className="mb-10 inline-flex items-center gap-2 rounded-lg bg-surface-container px-5 py-2.5 text-sm font-bold uppercase text-on-surface transition-colors hover:bg-surface-container-high"
        >
          <Icon name="arrow_back" /> Voltar ao Portfólio
        </Link>

        <h1 className="mb-10 font-heading text-headline-lg">{project.title}</h1>

        {images.length > 0 ? (
          <Carousel className="mb-12" slideClassName="flex-[0_0_100%]">
            {images.map((img) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={img.id}
                src={img.url}
                alt={img.alt ?? project.title}
                className="h-[420px] w-full rounded-lg object-cover"
              />
            ))}
          </Carousel>
        ) : null}

        <dl className="space-y-8">
          <div>
            <dt className="mb-1 font-bold">Nome do Projeto:</dt>
            <dd className="text-on-surface-variant">{project.title}</dd>
          </div>
          <div>
            <dt className="mb-1 font-bold">Tipo de Serviço:</dt>
            <dd className="text-on-surface-variant">
              {project.category === "LSF" ? "Construção LSF - Chave na Mão" : "Remodelação Total - Chave na Mão"}
            </dd>
          </div>
          {project.challenge ? (
            <div>
              <dt className="mb-1 font-bold">Desafio Resolvido:</dt>
              <dd className="text-on-surface-variant">{project.challenge}</dd>
            </div>
          ) : null}
          {project.methodology ? (
            <div>
              <dt className="mb-1 font-bold">Metodologia Ápice:</dt>
              <dd className="text-on-surface-variant">{project.methodology}</dd>
            </div>
          ) : null}
          {project.result ? (
            <div>
              <dt className="mb-1 font-bold">Resultado:</dt>
              <dd className="text-on-surface-variant">{project.result}</dd>
            </div>
          ) : null}
          {project.testimonialQuote ? (
            <div>
              <dt className="mb-1 font-bold">Aprovação do Cliente:</dt>
              <dd className="italic text-on-surface-variant">
                &ldquo;{project.testimonialQuote}&rdquo;
                {project.clientName ? ` — ${project.clientName}${project.clientLocation ? `, ${project.clientLocation}` : ""}` : null}
              </dd>
            </div>
          ) : null}
        </dl>

        {cta ? (
          <div className="mt-16 text-center">
            <Button href={cta.url} variant="cta">
              {cta.label}
            </Button>
          </div>
        ) : null}
      </div>
    </Reveal>
  );
}
