import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Defense in depth: `proxy.ts` already redirects unauthenticated requests,
  // this covers direct renders (e.g. during local dev without the proxy).
  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar role={session.user.role} />
      <div className="flex flex-1 flex-col">
        <AdminHeader name={session.user.name ?? session.user.email ?? ""} role={session.user.role} />
        <main className="flex-1 bg-background p-8">{children}</main>
      </div>
    </div>
  );
}
