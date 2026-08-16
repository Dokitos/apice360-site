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

  // Prefer matching by category, but some environments seeded these posts
  // before the "remodelacao" category existed, leaving categoryId null —
  // fall back to matching the known post slugs directly so the fix is
  // robust either way.
  const remodelacaoCategory = await prisma.blogCategory.findFirst({
    where: { translations: { some: { slug: "remodelacao" } } },
  });
  const knownSlugs = ["remodelar-uma-ruina-o-caminho", "remodelacao-ou-construcao-convencional"];

  const targetPosts = await prisma.blogPost.findMany({
    where: {
      OR: [
        ...(remodelacaoCategory ? [{ categoryId: remodelacaoCategory.id }] : []),
        { translations: { some: { slug: { in: knownSlugs } } } },
      ],
    },
    select: { id: true },
  });

  const posts = await prisma.blogPost.updateMany({
    where: { id: { in: targetPosts.map((p) => p.id) } },
    data: { status: "DRAFT" },
  });
  console.log(`Blog: ${posts.count} artigo(s) de Remodelação movido(s) para Rascunho.`);

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
