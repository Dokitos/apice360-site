import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProjectImageForm } from "@/components/admin/ProjectImageForm";
import { createProjectImage } from "../../../actions";

export default async function NewProjectImagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await prisma.portfolioProject.findUnique({ where: { id } });
  if (!project) notFound();

  return (
    <div>
      <AdminPageHeader title="Adicionar Imagem" />
      <ProjectImageForm action={createProjectImage.bind(null, id)} />
    </div>
  );
}
