# Plano de Implementação — Site Institucional Ápice 360

## Contexto

A LP (`Lp/index.html`) já validou a identidade visual do projeto: tema escuro, laranja `#ff5f00` como cor de ação, tipografia Montserrat/Inter/JetBrains Mono, efeitos `neon-border`, `glass-effect`, `gradient-text`, `pulse-glow`, floating labels e scroll-reveal. O cliente enviou um wireframe (`Wireframe Site.pdf`) com 8 páginas + navegação/rodapé consistentes, e pediu um site institucional completo com painel de administração onde ele possa editar praticamente tudo (CTAs, Blog, Parceiros, Testemunhos, Portfólio, textos institucionais, etc.), sem depender de um programador para alterações de conteúdo.

Decisões já confirmadas com o cliente antes deste plano:
- **Stack**: Next.js (App Router) + Prisma + PostgreSQL, projeto full-stack único.
- **Área do Arquiteto**: nesta fase é só uma página pública de apresentação + CTA/formulário — sem login de arquitetos.
- **Conteúdo**: usar placeholders (texto do wireframe + imagens de stock/IA) agora; o admin torna trivial substituir tudo depois.
- **Idiomas**: PT e EN desde já, com todo o conteúdo editável duplicado por idioma no admin.
- **Autenticação do admin**: multi-utilizador com papéis `ADMIN` e `EDITOR`.
- **Upload de imagens**: cloud storage (Cloudinary) em vez de disco local, para funcionar em qualquer hospedagem.

---

## 1. Arquitetura de Pastas

O admin fica fora do segmento `[locale]` (`/admin/**`, não `/pt/admin`) — a UI do painel é só em PT, mas os formulários editam conteúdo PT+EN via tabs.

```
Site/
├─ prisma/
│  ├─ schema.prisma
│  └─ seed.ts
├─ src/
│  ├─ middleware.ts              # next-intl nas rotas públicas + guarda de sessão em /admin
│  ├─ auth.ts                    # NextAuth v5 (Credentials + JWT)
│  ├─ i18n/{routing.ts,request.ts}
│  ├─ messages/{pt.json,en.json} # strings de UI/chrome (nav, footer legal, labels)
│  ├─ app/
│  │  ├─ [locale]/
│  │  │  ├─ layout.tsx           # Header, Footer, fonts, dot-grid bg
│  │  │  ├─ page.tsx             # Home
│  │  │  ├─ quem-somos/page.tsx
│  │  │  ├─ servicos/page.tsx
│  │  │  ├─ portfolio/{page.tsx, [slug]/page.tsx}
│  │  │  ├─ blog/{page.tsx, [slug]/page.tsx}
│  │  │  ├─ contacto/page.tsx
│  │  │  ├─ area-do-arquiteto/page.tsx
│  │  │  └─ actions/{leads.ts, comments.ts}
│  │  ├─ admin/
│  │  │  ├─ layout.tsx           # AdminSidebar + guarda de sessão
│  │  │  ├─ login/page.tsx
│  │  │  ├─ page.tsx             # dashboard (leads novos, comentários pendentes)
│  │  │  ├─ site-settings/page.tsx
│  │  │  ├─ ctas/**
│  │  │  ├─ partners/**
│  │  │  ├─ testimonials/**
│  │  │  ├─ stats/**
│  │  │  ├─ page-sections/[page]/**   # blocos de Home/Quem Somos/Serviços/Contacto
│  │  │  ├─ services/**
│  │  │  ├─ portfolio/**
│  │  │  ├─ blog/{posts/**, categories/**, comments/page.tsx}
│  │  │  ├─ leads/**
│  │  │  ├─ seo/[page]/page.tsx
│  │  │  └─ users/**             # só ADMIN
│  │  └─ api/{auth/[...nextauth]/route.ts, uploads/sign/route.ts}
│  ├─ components/
│  │  ├─ ui/        # Button, Card, GradientText, SectionHeading, Reveal, FloatingLabelInput,
│  │  │              # FloatingLabelTextarea, Carousel, StatItem, Icon — design system puro
│  │  ├─ layout/     # Header, Footer, MobileNav, LocaleSwitcher
│  │  ├─ sections/   # HeroSection, PartnersSection, TestimonialsSection, WhyChooseSection,
│  │  │              # ResultsStatsSection, BlogPreviewSection, HistorySection, MethodSection,
│  │  │              # ValuesSection, ServiceCard, ServiceDetailSection, ManagementModelSection,
│  │  │              # PortfolioGrid, PortfolioDetailGallery, BlogGrid, BlogArticleBody,
│  │  │              # CommentsSection, ContactForm, MapEmbed, ShowroomBlock, ArchitectPartnershipSection
│  │  └─ admin/      # AdminSidebar, DataTable, LocaleTabs, ImageUploader, OrderableList,
│  │                 # RichTextEditor, ConfirmDialog, LeadTable, CommentModerationRow
│  ├─ lib/
│  │  ├─ prisma.ts / cloudinary.ts / cta-keys.ts
│  │  ├─ content.ts        # getters públicos (site settings, CTAs, secções, stats, parceiros,
│  │  │                    # testemunhos, serviços, projetos, posts, comentários aprovados)
│  │  ├─ permissions.ts    # requireAdmin(), requireEditorOrAdmin()
│  │  └─ validations/      # zod por entidade
│  ├─ styles/globals.css   # tokens + .neon-border/.glass-effect/.gradient-text/keyframes
│  └─ types/next-auth.d.ts
├─ public/
├─ tailwind.config.ts
├─ next.config.js          # next-intl + images.remotePatterns (res.cloudinary.com)
└─ .env.example
```

---

## 2. Modelo de Dados (Prisma + PostgreSQL)

**Padrão de tradução**: tabelas relacionais `<Model>Translation` com `locale: Locale (PT|EN)` e `@@unique([<parentId>, locale])`, em vez de colunas `_pt`/`_en`. Isto permite adicionar um 3º idioma sem migrar tabelas de conteúdo, e o admin usa um único componente `<LocaleTabs>` genérico para qualquer formulário bilingue.

Modelos principais:
- `User` (role `ADMIN`/`EDITOR`, passwordHash bcrypt)
- `SiteSettings` (+ tradução: descrição do rodapé, texto do showroom, SEO padrão) — contactos, morada, redes sociais, mapa
- `Cta` + `CtaTranslation` — todos os botões de ação do site (chave livre tipo `home_hero`, `header_budget`, `contact_whatsapp_commercial`, etc.), editáveis sem deploy
- `PageSeo` + `PageSeoTranslation` — título/descrição SEO por página
- `PageSection` + `PageSectionTranslation` + `PageSectionItem`/`Translation` — blocos genéricos reutilizáveis (Home: parceiros/porquê-escolher/resultados/blog-preview; Quem Somos: história/método/valores; Serviços: modelo chave-na-mão; Contacto: triagem/showroom)
- `Stat` + `StatTranslation` — estatísticas da Home (120+ obras, 97% satisfação, etc.)
- `Partner` — logos de parceiros (sem tradução: nome, logo, link, ordem)
- `Testimonial` + `TestimonialTranslation` — depoimentos (autor, localização, avatar, aparece na home)
- `Service` + `ServiceTranslation` + `ServiceFeature`/`Translation` — LSF e Remodelação com suas features
- `PortfolioProject` + `ProjectTranslation` + `ProjectImage` — categoria (LSF/Remodelação), destaque, desafio/metodologia/resultado/depoimento, galeria
- `BlogCategory`/`Translation`, `BlogPost`/`Translation` (corpo em HTML via editor rico), `BlogComment` (moderação: pending/approved/rejected)
- `LeadSubmission` — contacto, orçamento e parceria de arquitetos, com `status` (novo/contactado/fechado)

Schema Prisma completo (todos os campos) está detalhado no plano técnico gerado — será escrito diretamente em `prisma/schema.prisma` na Fase 1.

---

## 3. Design System em Código

- **`tailwind.config.ts`**: portar cores (`primary #ff5f00`, superfícies escuras, `on-surface-variant`), fontes (`heading`=Montserrat, `sans`=Inter, `mono`=JetBrains Mono), escala tipográfica custom (`headline-xl/lg/md`, `body-lg/md`, `label-mono`), keyframes `pulse-glow`/`bounce-slow`.
- **`globals.css`**: utilities `@layer components` para `.neon-border`, `.glass-effect`, `.gradient-text`, `.bg-dot-grid`, estilos base de floating label.
- **Componentes `ui/`** (contratos):
  - `<Button variant="cta|cta-outline|ghost|link" pulse? icon?>`
  - `<Card variant="neon|glass">`
  - `<Reveal>` — scroll-reveal via IntersectionObserver, respeita `prefers-reduced-motion`
  - `<SectionHeading eyebrow title subtitle>`
  - `<Carousel items renderItem showArrows showDots>` (parceiros, testemunhos, galeria de portfólio)
  - `<FloatingLabelInput>` / `<FloatingLabelTextarea>`
  - `<StatItem value label icon>`
- Os componentes de `sections/` são Server Components que só recebem props já resolvidas por `lib/content.ts` — sem queries Prisma dentro deles, mantendo design separado de dados.
- **Nota**: o canvas de 225 frames (scroll-scrub) da LP não é replicado no site principal (peso de banda); o padrão que se generaliza é o `<Reveal>` (fade+translate ao entrar no viewport).

---

## 4. Painel de Administração

- **Auth**: NextAuth v5, Credentials + JWT, `role` no token/sessão.
- **Proteção**: `middleware.ts` bloqueia `/admin/**` sem sessão (exceto `/admin/login`); `/admin/users/**` exige `role=ADMIN`.
- **Layout**: sidebar por módulo — Dashboard, Definições do Site, CTAs, Parceiros, Testemunhos, Estatísticas, Secções de Página, Serviços, Portfólio, Blog (Posts/Categorias/Comentários), Leads, SEO, Utilizadores.
- **Padrão CRUD replicado em cada módulo**: lista (`DataTable`) → formulário create/edit (`react-hook-form` + zod, campos bilingues em `<LocaleTabs>`) → server actions (`create/update/delete`, `revalidatePath` nos dois locales).
- **Upload de imagens**: `<ImageUploader>` envia direto do browser para Cloudinary (assinatura gerada por rota admin autenticada) — nunca passa pelo disco do servidor.
- **Leads**: lista com tabs por tipo (Contacto/Orçamento/Parceria Arquiteto) e status.
- **Comentários do blog**: fila de moderação (pendente → aprovado/rejeitado); só comentários aprovados aparecem no site público.

---

## 5. Fases de Execução

| Fase | Entregável | Ficheiros-chave |
|---|---|---|
| **0 — Setup** | Projeto Next.js, Tailwind config, design system (`components/ui`), i18n básico funcionando | `tailwind.config.ts`, `src/styles/globals.css`, `src/i18n/routing.ts`, `src/components/ui/*` |
| **1 — Base** | Schema Prisma completo + migração + seed inicial, autenticação, shell do admin | `prisma/schema.prisma`, `src/auth.ts`, `src/middleware.ts`, `src/app/admin/layout.tsx` |
| **2 — Admin: conteúdo** | Todos os módulos CRUD do painel (settings → CTAs → parceiros → testemunhos → estatísticas → secções → serviços → portfólio → blog → comentários → leads → SEO → utilizadores) | `src/app/admin/**/actions.ts`, `src/components/admin/*` |
| **3 — Site público** | 8 páginas do wireframe consumindo dados reais do banco, SEO por página | `src/lib/content.ts`, `src/app/[locale]/**/page.tsx`, `src/components/sections/*` |
| **4 — Formulários públicos** | Contacto, Orçamento (CTA), Área do Arquiteto, comentários de blog gravando no banco | `src/app/[locale]/actions/{leads,comments}.ts` |
| **5 — i18n & polish** | Traduções de UI completas, seletor de idioma, fallback EN→PT, revisão de animações | `src/messages/*.json`, `src/components/layout/LocaleSwitcher.tsx` |
| **6 — QA** | Seed de dados de exemplo completo, checklist página-a-página vs. wireframe, testes de login/CRUD/roles/idioma, `npm run build` limpo | `prisma/seed.ts` |

---

## 6. Verificação

1. `npx prisma migrate dev` + `npx prisma db seed` → `npm run dev`, confirmar `/pt` e `/en` a renderizar dados do seed.
2. Checklist manual por página comparando com o wireframe (ordem das secções, CTAs presentes, carrosséis, hover states, scroll-reveal).
3. Login em `/admin` → CRUD completo num módulo (ex: criar Parceiro com upload de logo) → confirmar reflexo no site público após `revalidatePath`.
4. Testar que um utilizador `EDITOR` não acede a `/admin/users`.
5. Submeter formulário de Contacto → aparece em `/admin/leads`. Submeter comentário de blog → só aparece publicamente após aprovação.
6. Trocar idioma em várias páginas → mesma rota, fallback correto quando falta tradução EN.
7. `npm run build`, `npx tsc --noEmit`, `npx prisma validate` sem erros.

---

## Próximos Passos

Antes de começar a Fase 0, preciso de:
- Confirmação para iniciar o setup do projeto (`create-next-app`) dentro desta pasta.
- Uma conta Cloudinary (gratuita) para o upload de imagens — posso indicar os passos, mas as credenciais (`CLOUDINARY_CLOUD_NAME`, `API_KEY`, `API_SECRET`) precisam ser criadas/fornecidas pelo cliente.
- Uma base de dados PostgreSQL (local via Docker para desenvolvimento é suficiente para já; produção pode ser decidida mais tarde consoante a hospedagem).
