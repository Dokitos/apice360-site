import { absoluteUrl, SITE_URL } from "@/lib/site-url";

type Settings = {
  phone?: string | null;
  email?: string | null;
  addressLine?: string | null;
  addressCity?: string | null;
  addressPostalCode?: string | null;
  addressCountry?: string | null;
  nif?: string | null;
  mapLatitude?: number | null;
  mapLongitude?: number | null;
  socialFacebook?: string | null;
  socialInstagram?: string | null;
  socialLinkedin?: string | null;
  socialYoutube?: string | null;
} | null;

/**
 * Dados estruturados (JSON-LD) para o Google e para os rastreadores de IA.
 *
 * O texto da página diz o que a empresa faz a quem lê; isto diz a mesma coisa
 * a quem indexa, num formato que não depende de interpretar prosa: que é uma
 * empresa de construção, onde fica, como se contacta e que serviços presta.
 * É o que alimenta o painel lateral do Google e as respostas de assistentes.
 */
export function OrganizationSchema({ settings }: { settings: Settings }) {
  const redes = [
    settings?.socialFacebook,
    settings?.socialInstagram,
    settings?.socialLinkedin,
    settings?.socialYoutube,
  ].filter(Boolean);

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "GeneralContractor",
    "@id": `${SITE_URL}/#organizacao`,
    name: "Ápice 360",
    url: SITE_URL,
    logo: absoluteUrl("/images/logo-preta.png"),
    image: absoluteUrl("/images/hero-site.png"),
    description:
      "Construção e remodelação em Light Steel Frame (LSF) em Portugal, no modelo chave na mão, com equipa própria.",
    areaServed: { "@type": "Country", name: "Portugal" },
    knowsAbout: ["Light Steel Frame", "LSF", "Construção modular", "Remodelação", "Construção chave na mão"],
  };

  if (settings?.phone) schema.telephone = settings.phone;
  if (settings?.email) schema.email = settings.email;
  if (settings?.nif) schema.vatID = settings.nif;
  if (redes.length > 0) schema.sameAs = redes;

  if (settings?.addressLine) {
    schema.address = {
      "@type": "PostalAddress",
      streetAddress: settings.addressLine,
      addressLocality: settings.addressCity ?? undefined,
      postalCode: settings.addressPostalCode ?? undefined,
      addressCountry: settings.addressCountry ?? "Portugal",
    };
  }
  if (settings?.mapLatitude != null && settings?.mapLongitude != null) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude: settings.mapLatitude,
      longitude: settings.mapLongitude,
    };
  }

  return <JsonLd data={schema} />;
}

/** Artigo do blog: autor, datas e imagem, para aparecer como notícia. */
export function ArticleSchema({
  title,
  description,
  slug,
  imageUrl,
  authorName,
  publishedAt,
  updatedAt,
}: {
  title: string;
  description?: string | null;
  slug: string;
  imageUrl?: string | null;
  authorName?: string | null;
  publishedAt?: Date | string | null;
  updatedAt?: Date | string | null;
}) {
  const quando = (d?: Date | string | null) =>
    d ? new Date(d).toISOString() : undefined;

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: title,
        description: description ?? undefined,
        image: imageUrl ? [imageUrl] : undefined,
        datePublished: quando(publishedAt),
        dateModified: quando(updatedAt) ?? quando(publishedAt),
        author: { "@type": authorName ? "Person" : "Organization", name: authorName ?? "Ápice 360" },
        publisher: { "@id": `${SITE_URL}/#organizacao` },
        mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(`/blog/${slug}`) },
      }}
    />
  );
}

/** Caminho de navegação, para o Google desenhar a linha de migalhas. */
export function BreadcrumbSchema({ items }: { items: { name: string; path: string }[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: absoluteUrl(item.path),
        })),
      }}
    />
  );
}

/**
 * O conteúdo é construído por nós a partir da base de dados, nunca de texto
 * escrito por visitantes, e JSON.stringify escapa o que lá vai. Os `<` são
 * escapados à mão porque um `</script>` dentro de uma string fecharia a
 * etiqueta mais cedo.
 */
function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
