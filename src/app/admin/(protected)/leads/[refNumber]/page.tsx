import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Icon } from "@/components/ui/Icon";
import { LeadDetailPanel } from "@/components/admin/leads/LeadDetailPanel";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({ params }: { params: Promise<{ refNumber: string }> }) {
  const { refNumber: refNumberParam } = await params;
  const refNumber = Number(refNumberParam);
  if (Number.isNaN(refNumber)) notFound();

  const [lead, users] = await Promise.all([
    prisma.leadSubmission.findUnique({
      where: { refNumber },
      include: {
        assignedTo: { select: { id: true, name: true } },
        activities: {
          orderBy: { createdAt: "desc" },
          include: { user: { select: { name: true } } },
        },
      },
    }),
    prisma.user.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  if (!lead) notFound();

  return (
    <div>
      <Link
        href="/admin/leads"
        className="mb-6 inline-flex items-center gap-1 text-sm text-on-surface-variant transition-colors hover:text-primary"
      >
        <Icon name="arrow_back" className="text-base" />
        Voltar às Leads
      </Link>

      <LeadDetailPanel
        lead={{
          id: lead.id,
          refNumber: lead.refNumber,
          type: lead.type,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          message: lead.message,
          sourcePage: lead.sourcePage,
          locale: lead.locale,
          status: lead.status,
          notes: lead.notes,
          createdAt: lead.createdAt.toISOString(),
          updatedAt: lead.updatedAt.toISOString(),
          assignedTo: lead.assignedTo,
        }}
        activities={lead.activities.map((a) => ({
          id: a.id,
          type: a.type,
          note: a.note,
          createdAt: a.createdAt.toISOString(),
          userName: a.user?.name ?? null,
        }))}
        users={users}
      />
    </div>
  );
}
