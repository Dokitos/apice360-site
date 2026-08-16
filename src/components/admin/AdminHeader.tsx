import { logoutAction } from "@/app/admin/actions";
import { Icon } from "@/components/ui/Icon";

type AdminHeaderProps = {
  name: string;
  role: "ADMIN" | "EDITOR";
};

export function AdminHeader({ name, role }: AdminHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-outline-variant/20 bg-surface-container-lowest py-4 pl-20 pr-4 lg:px-8">
      <div>
        <p className="text-sm font-bold text-on-surface">{name}</p>
        <p className="font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
          {role === "ADMIN" ? "Administrador" : "Editor"}
        </p>
      </div>
      <form action={logoutAction}>
        <button
          type="submit"
          className="flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 text-sm text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
        >
          <Icon name="logout" className="text-lg" />
          Sair
        </button>
      </form>
    </header>
  );
}
