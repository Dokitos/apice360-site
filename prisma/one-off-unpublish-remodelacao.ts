/**
 * One-off data fix: unpublish existing Remodelação portfolio projects and blog
 * posts without deleting them (client wants LSF-only focus on the public site,
 * but reversible if they change their mind later).
 *
 * Not run automatically by `prisma db seed` — seedPortfolio()/seedBlog() skip
 * entirely once rows exist, so editing the seed arrays alone doesn't retroactively
 * fix already-seeded rows. Run this script directly instead, once, against each
 * DATABASE_URL that already has seeded data:
 *
 *   npx tsx prisma/one-off-unpublish-remodelacao.ts
 *
 * DATABASE_URL is read from the environment the same way prisma/seed.ts does
 * (via dotenv), so point your shell/.env at the target database before running.
 * Safe to re-run (idempotent).
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const projects = await prisma.portfolioProject.updateMany({
    where: { category: "REMODELACAO" },
    data: { isPublished: false },
  });
  console.log(`Portfolio: ${projects.count} projeto(s) Remodelação despublicado(s).`);

  const remodelacaoCategory = await prisma.blogCategory.findFirst({
    where: { translations: { some: { slug: "remodelacao" } } },
  });

  if (!remodelacaoCategory) {
    console.log("Blog: categoria 'remodelacao' não encontrada — nada a fazer.");
  } else {
    const posts = await prisma.blogPost.updateMany({
      where: { categoryId: remodelacaoCategory.id },
      data: { status: "DRAFT" },
    });
    console.log(`Blog: ${posts.count} artigo(s) da categoria Remodelação movido(s) para Rascunho.`);
  }

  const service = await prisma.service.updateMany({
    where: { type: "REMODELACAO" },
    data: { isActive: false },
  });
  console.log(`Serviços: ${service.count} serviço(s) REMODELACAO marcado(s) como inativo.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
