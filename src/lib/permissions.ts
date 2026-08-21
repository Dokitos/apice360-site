import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Resource, PermissionAction } from "@/lib/resources";

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

/** ADMIN-only actions (user/group management). */
export async function requireAdmin() {
  const user = await requireEditorOrAdmin();
  if (user.role !== "ADMIN") {
    throw new UnauthorizedError("Apenas administradores podem executar esta ação.");
  }
  return user;
}

const ACTION_COLUMN: Record<PermissionAction, "canView" | "canCreate" | "canEdit" | "canDelete"> = {
  view: "canView",
  create: "canCreate",
  edit: "canEdit",
  delete: "canDelete",
};

/**
 * Granular check layered on top of requireEditorOrAdmin: ADMIN always
 * passes, and an EDITOR with no group assigned (groupId null) always passes
 * too — preserves the exact pre-groups behavior ("any signed-in editor can
 * do everything") for every account that hasn't been explicitly restricted.
 * Only EDITORs assigned to a group get checked against that group's matrix.
 */
export async function requirePermission(resource: Resource, action: PermissionAction) {
  const user = await requireEditorOrAdmin();
  if (user.role === "ADMIN" || !user.groupId) return user;

  const permission = await prisma.groupPermission.findUnique({
    where: { groupId_resource: { groupId: user.groupId, resource } },
  });
  const allowed = permission?.[ACTION_COLUMN[action]] ?? false;
  if (!allowed) {
    throw new UnauthorizedError("Não tens permissão para executar esta ação.");
  }
  return user;
}

/**
 * Resolves which resources a user can at least view — drives sidebar
 * filtering. Returns an array (not a Set) so it can be passed straight
 * through as a prop to the client-side sidebar.
 */
export async function getViewableResources(user: {
  role: "ADMIN" | "EDITOR";
  groupId: string | null;
}): Promise<Resource[] | null> {
  if (user.role === "ADMIN" || !user.groupId) return null; // null = "everything"
  const permissions = await prisma.groupPermission.findMany({
    where: { groupId: user.groupId, canView: true },
    select: { resource: true },
  });
  return permissions.map((p) => p.resource as Resource);
}
