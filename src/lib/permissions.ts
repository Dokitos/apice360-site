import { auth } from "@/auth";

export class UnauthorizedError extends Error {
  constructor(message = "Não autorizado.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/** Any authenticated admin-panel user (ADMIN or EDITOR). */
export async function requireEditorOrAdmin() {
  const session = await auth();
  if (!session?.user) {
    throw new UnauthorizedError("Sessão expirada. Inicia sessão novamente.");
  }
  return session.user;
}

/** ADMIN-only actions (user management). */
export async function requireAdmin() {
  const user = await requireEditorOrAdmin();
  if (user.role !== "ADMIN") {
    throw new UnauthorizedError("Apenas administradores podem executar esta ação.");
  }
  return user;
}
