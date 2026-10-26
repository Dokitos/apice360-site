export const auditActions: Record<string, string> = {
  CREATE: "Criação", UPDATE: "Alteração", DELETE: "Eliminação",
  LOGIN_SUCCESS: "Login efetuado", LOGIN_FAILURE: "Login falhado",
  LOGIN_BLOCKED: "Login bloqueado", LOGOUT: "Sessão terminada",
  UPLOAD: "Ficheiro enviado", UPLOAD_AUTHORIZED: "Envio autorizado",
};

export const auditEntities: Record<string, string> = {
  Auth: "Acessos", Media: "Ficheiros", User: "Utilizadores", Group: "Grupos", GroupPermission: "Permissões de grupo",
  SiteSettings: "Definições do site", SiteSettingsTranslation: "Definições · traduções",
  Cta: "Chamadas para ação", CtaTranslation: "Chamadas para ação · traduções",
  PageSeo: "SEO", PageSeoTranslation: "SEO · traduções",
  PageSection: "Secções de página", PageSectionTranslation: "Secções · traduções",
  PageSectionItem: "Itens de secção", PageSectionItemTranslation: "Itens de secção · traduções",
  CustomPage: "Páginas personalizadas", CustomPageTranslation: "Páginas · traduções",
  Stat: "Estatísticas", StatTranslation: "Estatísticas · traduções", Partner: "Parceiros",
  Testimonial: "Testemunhos", TestimonialTranslation: "Testemunhos · traduções",
  Service: "Serviços", ServiceTranslation: "Serviços · traduções", ServiceFeature: "Características de serviço", ServiceFeatureTranslation: "Características · traduções",
  PortfolioProject: "Projetos", ProjectTranslation: "Projetos · traduções", ProjectImage: "Imagens e vídeos de projetos",
  BlogCategory: "Categorias do blog", BlogCategoryTranslation: "Categorias · traduções", BlogPost: "Artigos do blog", BlogPostTranslation: "Artigos · traduções", BlogComment: "Comentários",
  LeadSubmission: "Contactos", LeadActivity: "Atividade de contactos",
  LpPriceTier: "Preços da landing page", LpPriceTierTranslation: "Preços · traduções", LpSimulatorField: "Campos do simulador", LpSimulatorFieldTranslation: "Simulador · traduções",
  EmailAccount: "Contas de email", EmailMessage: "Mensagens de email", EmailAttachment: "Anexos", EmailEvent: "Entrega de emails", EmailTemplate: "Modelos de email", NewsletterSubscriber: "Subscritores da newsletter",
};

/** Date inputs use UTC explicitly, independent of the server's timezone. */
export function auditDate(value: string, end = false): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) return undefined;
  if (end) date.setUTCDate(date.getUTCDate() + 1);
  return date;
}
