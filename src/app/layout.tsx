import type { Metadata } from "next";
import { Montserrat, Inter, JetBrains_Mono } from "next/font/google";
import { getLocale } from "@/lib/locale";
import { getSiteSettings } from "@/lib/content";
import { SITE_URL } from "@/lib/site-url";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

/** Códigos que o Open Graph espera, que não são os nossos de duas letras. */
const OG_LOCALE: Record<string, string> = {
  PT: "pt_PT",
  EN: "en_GB",
  ES: "es_ES",
  FR: "fr_FR",
};

const FALLBACK_TITLE = "Ápice 360 | Construção em Light Steel Frame de Alta Performance";
const FALLBACK_DESCRIPTION =
  "Construímos o futuro com leveza, velocidade e confiança. Estruturas em LSF - Light Steel Frame para transformar o seu espaço com tecnologia, rapidez e excelência.";

/**
 * Título e descrição para páginas que não definem os seus — o que o painel
 * chama "SEO Padrão", em Definições do Site. Estes dois campos existiam no
 * formulário mas não eram lidos em lado nenhum: o cliente escrevia, gravava,
 * e nada mudava.
 *
 * Quem tem entrada própria em "SEO por Página" (início, serviços, portefólio,
 * blog, contactos...) continua a mandar sobre isto.
 */
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const settings = await getSiteSettings(locale);
  const title = settings?.t?.defaultSeoTitle || FALLBACK_TITLE;
  const description = settings?.t?.defaultSeoDescription || FALLBACK_DESCRIPTION;
  const imagem = settings?.defaultOgImageUrl || "/images/hero-site.png";

  return {
    title,
    description,
    // Sem metadataBase, as imagens e os canónicos das páginas filhas saem
    // como caminhos relativos, que nem o Google nem as redes sociais sabem
    // resolver.
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      siteName: "Ápice 360",
      locale: OG_LOCALE[locale] ?? OG_LOCALE.PT,
      title,
      description,
      url: SITE_URL,
      images: [{ url: imagem, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [imagem] },
    robots: {
      index: !settings?.maintenanceMode,
      follow: !settings?.maintenanceMode,
      googleBot: {
        index: !settings?.maintenanceMode,
        follow: !settings?.maintenanceMode,
        // Sem isto o Google corta a pré-visualização a um par de linhas e
        // não mostra a imagem nos resultados.
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt"
      className={`${montserrat.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        {/* Icon font isn't served through next/font — Material Symbols has no npm package, and this link only renders once from the root layout. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans text-body-md">
        {children}
      </body>
    </html>
  );
}
