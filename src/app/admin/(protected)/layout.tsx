import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { auth } from "@/auth";
import { getViewableResources } from "@/lib/permissions";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { SavedToast } from "@/components/admin/SavedToast";

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

  const viewableResources = await getViewableResources(session.user);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar role={session.user.role} viewableResources={viewableResources} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader name={session.user.name ?? session.user.email ?? ""} role={session.user.role} />
        <main className="min-w-0 flex-1 overflow-x-hidden bg-background p-4 md:p-8">{children}</main>
      </div>
      <Suspense fallback={null}>
        <SavedToast />
      </Suspense>
      <Toaster richColors position="top-right" closeButton />
    </div>
  );
}
