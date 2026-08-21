// Every admin area a group's permissions can be scoped to. Adding a new
// admin section later means adding its key here and wiring
// requirePermission() at its actions.ts call sites — see src/lib/permissions.ts.
export const RESOURCES = [
  "leads",
  "blog_posts",
  "blog_comments",
  "blog_categories",
  "portfolio",
  "ctas",
  "page_sections",
  "services",
  "partners",
  "seo",
  "site_settings",
  "stats",
  "testimonials",
] as const;

export type Resource = (typeof RESOURCES)[number];

export const RESOURCE_LABELS: Record<Resource, string> = {
  leads: "Leads",
  blog_posts: "Artigos do Blog",
  blog_comments: "Comentários do Blog",
  blog_categories: "Categorias do Blog",
  portfolio: "Portfólio",
  ctas: "CTAs",
  page_sections: "Secções de Página",
  services: "Serviços",
  partners: "Parceiros",
  seo: "SEO por Página",
  site_settings: "Definições do Site",
  stats: "Estatísticas",
  testimonials: "Testemunhos",
};

export const PERMISSION_ACTIONS = ["view", "create", "edit", "delete"] as const;
export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

export const PERMISSION_ACTION_LABELS: Record<PermissionAction, string> = {
  view: "Ver",
  create: "Criar",
  edit: "Editar",
  delete: "Eliminar",
};
