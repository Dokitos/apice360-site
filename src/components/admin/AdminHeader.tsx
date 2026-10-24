import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";
import { AdminIcon as Icon } from "@/components/admin/AdminIcon";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";

type AdminHeaderProps = { name: string; role: "ADMIN" | "EDITOR" };

export function AdminHeader({ name, role }: AdminHeaderProps) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  return (
    <header className="admin-header">
      <div className="min-w-0 flex-1"><AdminBreadcrumbs /></div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <Link href="/" target="_blank" rel="noreferrer" className="admin-secondary-button">
          <Icon name="open_in_new" className="text-base" /><span className="hidden sm:inline">Ver site</span><span className="sr-only sm:hidden">Ver site</span>
        </Link>
        <div className="hidden items-center gap-3 border-l border-slate-200 pl-4 md:flex">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600" aria-hidden="true">{initials || "A"}</span>
          <div className="max-w-40">
            <p className="truncate text-sm font-medium text-slate-800">{name}</p>
            <p className="text-xs text-slate-500">{role === "ADMIN" ? "Administrador" : "Editor"}</p>
          </div>
        </div>
        <form action={logoutAction}>
          <button type="submit" className="admin-header-logout" title="Terminar sessão" aria-label="Terminar sessão">
            <Icon name="logout" className="text-lg" />
          </button>
        </form>
      </div>
    </header>
  );
}
