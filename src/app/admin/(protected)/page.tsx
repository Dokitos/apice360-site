import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

async function getDashboardCounts() {
  const [newLeads, pendingComments, publishedPosts, projects] = await Promise.all([
    prisma.leadSubmission.count({ where: { status: "NEW" } }),
    prisma.blogComment.count({ where: { status: "PENDING" } }),
    prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
    prisma.portfolioProject.count(),
  ]);
  return { newLeads, pendingComments, publishedPosts, projects };
}

export default async function AdminDashboardPage() {
  const counts = await getDashboardCounts();

  const cards = [
    { label: "Leads Novos", value: counts.newLeads, icon: "contact_mail", href: "/admin/leads" },
    {
      label: "Comentários Pendentes",
      value: counts.pendingComments,
      icon: "forum",
      href: "/admin/blog/comments",
    },
    {
      label: "Artigos Publicados",
      value: counts.publishedPosts,
      icon: "article",
      href: "/admin/blog/posts",
    },
    {
      label: "Projetos no Portfólio",
      value: counts.projects,
      icon: "photo_library",
      href: "/admin/portfolio",
    },
  ];

  return (
    <div>
      <h1 className="mb-8 font-heading text-headline-lg">Dashboard</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card className="flex flex-col gap-4 p-6">
              <div className="flex items-center justify-between">
                <Icon name={card.icon} className="text-2xl text-primary" />
              </div>
              <div>
                <p className="font-heading text-headline-lg text-on-surface">{card.value}</p>
                <p className="font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
                  {card.label}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
