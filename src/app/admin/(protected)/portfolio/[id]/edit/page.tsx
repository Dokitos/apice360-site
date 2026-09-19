import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PortfolioProjectForm } from "@/components/admin/PortfolioProjectForm";
import { updateProject } from "../../actions";

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
      {/* A galeria passou a ser um campo do formulário (ver GalleryField), em
          vez de uma tabela à parte com uma página por imagem. */}
      <PortfolioProjectForm project={project} action={updateProject.bind(null, id)} />
    </div>
  );
}
