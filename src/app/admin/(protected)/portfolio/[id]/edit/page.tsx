import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PortfolioProjectForm } from "@/components/admin/PortfolioProjectForm";
import { DataTable } from "@/components/admin/DataTable";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { updateProject, deleteProjectImage } from "../../actions";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await prisma.portfolioProject.findUnique({
    where: { id },
    include: { translations: true, images: { orderBy: { order: "asc" } } },
  });
  if (!project) notFound();

  return (
    <div>
      <AdminPageHeader title="Editar Projeto" />
      <PortfolioProjectForm project={project} action={updateProject.bind(null, id)} />

      <div className="mt-16 max-w-2xl">
        <AdminPageHeader
          title="Galeria de Imagens"
          description="Fotos exibidas no carrossel da página de detalhe deste projeto."
          newHref={`/admin/portfolio/${id}/images/new`}
          newLabel="Adicionar Imagem"
        />
        <DataTable
          rows={project.images}
          getRowId={(img) => img.id}
          emptyMessage="Ainda não há imagens."
          columns={[
            {
              header: "Imagem",
              render: (img) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img.url} alt={img.alt ?? ""} className="h-12 w-12 rounded object-cover" />
              ),
            },
            { header: "Alt", render: (img) => img.alt ?? "—" },
            { header: "Ordem", render: (img) => img.order },
          ]}
          renderActions={(img) => (
            <DeleteButton action={deleteProjectImage.bind(null, id, img.id)} />
          )}
        />
      </div>
    </div>
  );
}
