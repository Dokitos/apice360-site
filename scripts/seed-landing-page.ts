/**
 * Conteúdo inicial da landing page (/lp), portado da LP estática que vivia
 * em apice360-lp.vercel.app. Corre com:
 *
 *   npx tsx scripts/seed-landing-page.ts           # base local (.env)
 *   npx tsx scripts/seed-landing-page.ts --prod    # base de produção (.env.production.local)
 *
 * É idempotente e escreve os quatro idiomas de uma vez (o texto foi
 * traduzido à mão, não pela DeepL). Só cria o que ainda não existe — se o
 * cliente já editou uma secção no admin, este script atualiza os campos
 * seguindo o mesmo padrão do prisma/seed.ts e não apaga nada fora da LP.
 */
import "dotenv/config";
import { config as loadEnv } from "dotenv";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Mesmo interruptor do scripts/backfill-translations.ts: sem --prod escreve
// na base local, para nunca se semear produção por engano.
const isProd = process.argv.includes("--prod");
if (isProd) loadEnv({ path: ".env.production.local", override: true });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type Locale = "PT" | "EN" | "ES" | "FR";
const LOCALES: Locale[] = ["PT", "EN", "ES", "FR"];

type L = Record<Locale, string>;
type LOpt = Partial<Record<Locale, string>>;

type SectionItem = {
  order: number;
  iconName?: string;
  numberLabel?: string;
  title: L;
  body?: LOpt;
};

type Section = {
  key: string;
  order: number;
  layout?: string;
  imageUrl?: string;
  ctaKey?: string;
  eyebrow?: LOpt;
  heading?: LOpt;
  subheading?: LOpt;
  body?: LOpt;
  ctaLabel?: LOpt;
  items?: SectionItem[];
};

const WA = "https://wa.me/351924107846";
const waWith = (message: string) => `${WA}?text=${encodeURIComponent(message)}`;

const CTAS = [
  {
    key: "lp_hero",
    url: "#simulador",
    iconName: "bolt",
    label: {
      PT: "Simular a minha estimativa",
      EN: "Calculate my estimate",
      ES: "Simular mi estimación",
      FR: "Simuler mon estimation",
    } satisfies L,
  },
  {
    key: "lp_trust_visit",
    url: waWith("Olá! Gostava de agendar uma visita ao showroom da Ápice 360."),
    iconName: "bolt",
    label: {
      PT: "Agendar uma Visita",
      EN: "Schedule a Visit",
      ES: "Programar una Visita",
      FR: "Planifier une Visite",
    } satisfies L,
  },
];

const SECTIONS: Section[] = [
  {
    key: "hero",
    order: 0,
    imageUrl: "/images/hero-bg.jpg",
    ctaKey: "lp_hero",
    eyebrow: {
      PT: "O Modelo de Construção Mais Utilizado em Portugal",
      EN: "The Most Widely Used Construction Method in Portugal",
      ES: "El Modelo de Construcción Más Utilizado en Portugal",
      FR: "Le Modèle de Construction le Plus Utilisé au Portugal",
    },
    heading: {
      PT: "A Sua Moradia Pronta Até 3x Mais Rápido, Com a Segurança do Aço Leve.",
      EN: "Your Home Ready Up to 3x Faster, With the Safety of Light Steel.",
      ES: "Su Vivienda Lista Hasta 3x Más Rápido, Con la Seguridad del Acero Ligero.",
      FR: "Votre Maison Prête Jusqu'à 3x Plus Rapide, Avec la Sécurité de l'Acier Léger.",
    },
    subheading: {
      PT: "Construímos com a inteligência do Light Steel Frame: precisão milimétrica, conforto térmico e acústico superior, e uma equipa própria que acompanha a sua obra do início ao fim. Cuidamos do seu projeto, em Portugal.",
      EN: "We build with the intelligence of Light Steel Frame: millimetric precision, superior thermal and acoustic comfort, and an in-house team that follows your build from start to finish. We take care of your project, in Portugal.",
      ES: "Construimos con la inteligencia del Light Steel Frame: precisión milimétrica, confort térmico y acústico superior, y un equipo propio que acompaña su obra de principio a fin. Cuidamos de su proyecto, en Portugal.",
      FR: "Nous construisons avec l'intelligence du Light Steel Frame : précision millimétrique, confort thermique et acoustique supérieur, et une équipe interne qui suit votre chantier du début à la fin. Nous prenons soin de votre projet, au Portugal.",
    },
    ctaLabel: {
      PT: "Simular a minha estimativa",
      EN: "Calculate my estimate",
      ES: "Simular mi estimación",
      FR: "Simuler mon estimation",
    },
  },
  {
    key: "benefits",
    order: 1,
    heading: {
      PT: "Porque o LSF é a Melhor Escolha em Portugal?",
      EN: "Why Is LSF the Best Choice in Portugal?",
      ES: "¿Por Qué el LSF es la Mejor Opción en Portugal?",
      FR: "Pourquoi le LSF est-il le Meilleur Choix au Portugal ?",
    },
    items: [
      {
        order: 0,
        iconName: "timer",
        title: {
          PT: "Rapidez Sem Perder Qualidade",
          EN: "Speed Without Losing Quality",
          ES: "Rapidez Sin Perder Calidad",
          FR: "Rapidité Sans Perdre en Qualité",
        },
        body: {
          PT: "Entrega até 3x mais rápida do que os métodos tradicionais, sem abrir mão da qualidade construtiva.",
          EN: "Delivery up to 3x faster than traditional methods, with no compromise on build quality.",
          ES: "Entrega hasta 3x más rápida que los métodos tradicionales, sin renunciar a la calidad constructiva.",
          FR: "Livraison jusqu'à 3x plus rapide que les méthodes traditionnelles, sans renoncer à la qualité de construction.",
        },
      },
      {
        order: 1,
        iconName: "thermostat",
        title: {
          PT: "Conforto Térmico e Acústico",
          EN: "Thermal and Acoustic Comfort",
          ES: "Confort Térmico y Acústico",
          FR: "Confort Thermique et Acoustique",
        },
        body: {
          PT: "Conforto térmico durante todo o ano e conforto acústico muito acima da média da construção tradicional.",
          EN: "Thermal comfort all year round and acoustic comfort well above the average of traditional construction.",
          ES: "Confort térmico durante todo el año y confort acústico muy por encima de la media de la construcción tradicional.",
          FR: "Confort thermique toute l'année et confort acoustique bien supérieur à la moyenne de la construction traditionnelle.",
        },
      },
      {
        order: 2,
        iconName: "energy_savings_leaf",
        title: {
          PT: "Melhor Certificação Energética",
          EN: "Better Energy Rating",
          ES: "Mejor Certificación Energética",
          FR: "Meilleure Certification Énergétique",
        },
        body: {
          PT: "Cumpre os requisitos atuais de eficiência energética, com melhor certificação para a sua moradia.",
          EN: "Meets current energy-efficiency requirements, with a better rating for your home.",
          ES: "Cumple los requisitos actuales de eficiencia energética, con mejor certificación para su vivienda.",
          FR: "Répond aux exigences actuelles d'efficacité énergétique, avec une meilleure certification pour votre maison.",
        },
      },
      {
        order: 3,
        iconName: "cleaning_services",
        title: {
          PT: "Construção Limpa e Organizada",
          EN: "Clean and Organised Construction",
          ES: "Construcción Limpia y Organizada",
          FR: "Chantier Propre et Organisé",
        },
        body: {
          PT: "Obra limpa, previsível e organizada, com elevado controlo de execução do início ao fim.",
          EN: "A clean, predictable and organised site, with tight execution control from start to finish.",
          ES: "Obra limpia, previsible y organizada, con un elevado control de ejecución de principio a fin.",
          FR: "Un chantier propre, prévisible et organisé, avec un contrôle d'exécution rigoureux du début à la fin.",
        },
      },
      {
        order: 4,
        iconName: "foundation",
        title: {
          PT: "Durabilidade a Longo Prazo",
          EN: "Long-Term Durability",
          ES: "Durabilidad a Largo Plazo",
          FR: "Durabilité à Long Terme",
        },
        body: {
          PT: "Baixa humidade e mofo, evitando fissuras comuns na construção tradicional.",
          EN: "Low humidity and mould, avoiding the cracks common in traditional construction.",
          ES: "Baja humedad y moho, evitando las fisuras habituales en la construcción tradicional.",
          FR: "Peu d'humidité et de moisissures, évitant les fissures courantes dans la construction traditionnelle.",
        },
      },
      {
        order: 5,
        iconName: "shield",
        title: {
          PT: "Segurança Estrutural",
          EN: "Structural Safety",
          ES: "Seguridad Estructural",
          FR: "Sécurité Structurelle",
        },
        body: {
          PT: "Segurança estrutural e resistência a sismos, com estrutura em aço galvanizado.",
          EN: "Structural safety and earthquake resistance, with a galvanised steel frame.",
          ES: "Seguridad estructural y resistencia sísmica, con estructura de acero galvanizado.",
          FR: "Sécurité structurelle et résistance aux séismes, avec une ossature en acier galvanisé.",
        },
      },
    ],
  },
  {
    key: "simulator",
    order: 2,
    heading: {
      PT: "Simule a Sua Estimativa em 1 Minuto",
      EN: "Get Your Estimate in 1 Minute",
      ES: "Simule Su Estimación en 1 Minuto",
      FR: "Simulez Votre Estimation en 1 Minute",
    },
    subheading: {
      PT: "Preencha os 3 passos abaixo e receba uma estimativa personalizada para o seu projeto.",
      EN: "Complete the 3 steps below and get a personalised estimate for your project.",
      ES: "Complete los 3 pasos siguientes y reciba una estimación personalizada para su proyecto.",
      FR: "Remplissez les 3 étapes ci-dessous et recevez une estimation personnalisée pour votre projet.",
    },
  },
  {
    key: "trust",
    order: 3,
    ctaKey: "lp_trust_visit",
    heading: {
      PT: "Porque Escolher a Ápice 360",
      EN: "Why Choose Ápice 360",
      ES: "Por Qué Elegir Ápice 360",
      FR: "Pourquoi Choisir Ápice 360",
    },
    body: {
      PT: "Venha conhecer o nosso showroom e toda a estrutura em LSF. Esperamos por si!",
      EN: "Come and see our showroom and the full LSF structure. We are waiting for you!",
      ES: "Venga a conocer nuestro showroom y toda la estructura en LSF. ¡Le esperamos!",
      FR: "Venez découvrir notre showroom et toute la structure en LSF. Nous vous attendons !",
    },
    ctaLabel: {
      PT: "Agendar uma Visita",
      EN: "Schedule a Visit",
      ES: "Programar una Visita",
      FR: "Planifier une Visite",
    },
    items: [
      {
        order: 0,
        iconName: "verified",
        numberLabel: "+60",
        title: {
          PT: "Obras Realizadas",
          EN: "Projects Delivered",
          ES: "Obras Realizadas",
          FR: "Chantiers Réalisés",
        },
      },
      {
        order: 1,
        iconName: "military_tech",
        numberLabel: "+8",
        title: {
          PT: "Anos em Portugal",
          EN: "Years in Portugal",
          ES: "Años en Portugal",
          FR: "Ans au Portugal",
        },
      },
      {
        order: 2,
        iconName: "groups",
        numberLabel: "100%",
        title: {
          PT: "Equipa Própria",
          EN: "In-House Team",
          ES: "Equipo Propio",
          FR: "Équipe Interne",
        },
      },
      {
        order: 3,
        iconName: "workspace_premium",
        numberLabel: "Top 5%",
        title: {
          PT: "Scoring Portugal",
          EN: "Scoring Portugal",
          ES: "Scoring Portugal",
          FR: "Scoring Portugal",
        },
      },
      {
        order: 4,
        iconName: "storefront",
        numberLabel: "Showroom",
        title: {
          PT: "Para Atendimento",
          EN: "Open to Visitors",
          ES: "Para Atención",
          FR: "Ouvert aux Visites",
        },
      },
    ],
  },
  {
    key: "contact",
    order: 4,
    heading: {
      PT: "Construímos o Seu Sonho",
      EN: "We Build Your Dream",
      ES: "Construimos Su Sueño",
      FR: "Nous Construisons Votre Rêve",
    },
    subheading: {
      PT: "A nossa equipa está pronta para analisar o seu projeto e mostrar como o Light Steel Frame pode acelerar a construção da sua moradia, com segurança e qualidade.",
      EN: "Our team is ready to review your project and show how Light Steel Frame can speed up the construction of your home, safely and with quality.",
      ES: "Nuestro equipo está listo para analizar su proyecto y mostrarle cómo el Light Steel Frame puede acelerar la construcción de su vivienda, con seguridad y calidad.",
      FR: "Notre équipe est prête à analyser votre projet et à vous montrer comment le Light Steel Frame peut accélérer la construction de votre maison, en toute sécurité et avec qualité.",
    },
    items: [
      {
        order: 0,
        iconName: "military_tech",
        title: {
          PT: "+8 Anos de Experiência em Portugal",
          EN: "+8 Years of Experience in Portugal",
          ES: "+8 Años de Experiencia en Portugal",
          FR: "+8 Ans d'Expérience au Portugal",
        },
        body: {
          PT: "Mais de 60 obras realizadas, com equipa própria.",
          EN: "More than 60 projects delivered, with our own team.",
          ES: "Más de 60 obras realizadas, con equipo propio.",
          FR: "Plus de 60 chantiers réalisés, avec notre propre équipe.",
        },
      },
      {
        order: 1,
        iconName: "groups",
        title: {
          PT: "Equipa Própria",
          EN: "In-House Team",
          ES: "Equipo Propio",
          FR: "Équipe Interne",
        },
        body: {
          PT: "Supervisão técnica constante e comunicação clara em todas as fases da obra.",
          EN: "Constant technical supervision and clear communication at every stage of the build.",
          ES: "Supervisión técnica constante y comunicación clara en todas las fases de la obra.",
          FR: "Supervision technique constante et communication claire à chaque étape du chantier.",
        },
      },
      {
        order: 2,
        iconName: "storefront",
        title: {
          PT: "Showroom no Seixal",
          EN: "Showroom in Seixal",
          ES: "Showroom en Seixal",
          FR: "Showroom à Seixal",
        },
        body: {
          PT: "Venha conhecer a estrutura em LSF de perto. Agende uma visita.",
          EN: "Come and see the LSF structure up close. Schedule a visit.",
          ES: "Venga a conocer la estructura en LSF de cerca. Programe una visita.",
          FR: "Venez découvrir la structure LSF de près. Planifiez une visite.",
        },
      },
    ],
  },
];

const PRICE_TIERS = [
  {
    key: "economica",
    pricePerM2: 1350,
    order: 0,
    isHighlighted: false,
    iconName: "savings",
    label: { PT: "Económica", EN: "Economy", ES: "Económica", FR: "Économique" } satisfies L,
    description: {
      PT: "Acabamentos funcionais e eficientes, com o mesmo rigor construtivo.",
      EN: "Functional, efficient finishes, with the same construction rigour.",
      ES: "Acabados funcionales y eficientes, con el mismo rigor constructivo.",
      FR: "Finitions fonctionnelles et efficaces, avec la même rigueur de construction.",
    } satisfies L,
  },
  {
    key: "conforto",
    pricePerM2: 1550,
    order: 1,
    isHighlighted: true,
    iconName: "workspace_premium",
    label: { PT: "Conforto", EN: "Comfort", ES: "Confort", FR: "Confort" } satisfies L,
    description: {
      PT: "O melhor equilíbrio entre conforto, durabilidade e investimento.",
      EN: "The best balance between comfort, durability and investment.",
      ES: "El mejor equilibrio entre confort, durabilidad e inversión.",
      FR: "Le meilleur équilibre entre confort, durabilité et investissement.",
    } satisfies L,
  },
  {
    key: "premium",
    pricePerM2: 1850,
    order: 2,
    isHighlighted: false,
    iconName: "diamond",
    label: { PT: "Premium", EN: "Premium", ES: "Premium", FR: "Premium" } satisfies L,
    description: {
      PT: "Acabamentos e equipamentos de gama alta, à medida do seu projeto.",
      EN: "High-end finishes and equipment, tailored to your project.",
      ES: "Acabados y equipamiento de gama alta, a medida de su proyecto.",
      FR: "Finitions et équipements haut de gamme, adaptés à votre projet.",
    } satisfies L,
  },
];

const SEO = {
  title: {
    PT: "Ápice 360 | Construções em Light Steel Frame em Portugal",
    EN: "Ápice 360 | Light Steel Frame Construction in Portugal",
    ES: "Ápice 360 | Construcciones en Light Steel Frame en Portugal",
    FR: "Ápice 360 | Constructions en Light Steel Frame au Portugal",
  } satisfies L,
  description: {
    PT: "Simule a estimativa da sua moradia em LSF em 1 minuto. Construção até 3x mais rápida, com equipa própria e showroom no Seixal.",
    EN: "Get an estimate for your LSF home in 1 minute. Construction up to 3x faster, with an in-house team and a showroom in Seixal.",
    ES: "Simule la estimación de su vivienda en LSF en 1 minuto. Construcción hasta 3x más rápida, con equipo propio y showroom en Seixal.",
    FR: "Simulez l'estimation de votre maison en LSF en 1 minute. Construction jusqu'à 3x plus rapide, avec équipe interne et showroom à Seixal.",
  } satisfies L,
};

async function seedCtas() {
  for (const cta of CTAS) {
    const record = await prisma.cta.upsert({
      where: { key: cta.key },
      update: { url: cta.url, iconName: cta.iconName },
      create: { key: cta.key, url: cta.url, iconName: cta.iconName },
    });
    for (const locale of LOCALES) {
      await prisma.ctaTranslation.upsert({
        where: { ctaId_locale: { ctaId: record.id, locale } },
        update: { label: cta.label[locale], isAutoTranslated: false },
        create: { ctaId: record.id, locale, label: cta.label[locale], isAutoTranslated: false },
      });
    }
  }
  console.log(`CTAs da LP ok (${CTAS.length})`);
}

async function seedSections() {
  for (const section of SECTIONS) {
    const record = await prisma.pageSection.upsert({
      where: { page_key: { page: "LP", key: section.key } },
      update: {
        order: section.order,
        layout: section.layout ?? "standard",
        imageUrl: section.imageUrl ?? null,
        ctaKey: section.ctaKey ?? null,
      },
      create: {
        page: "LP",
        key: section.key,
        order: section.order,
        layout: section.layout ?? "standard",
        imageUrl: section.imageUrl ?? null,
        ctaKey: section.ctaKey ?? null,
      },
    });

    for (const locale of LOCALES) {
      const fields = {
        eyebrow: section.eyebrow?.[locale] ?? null,
        heading: section.heading?.[locale] ?? null,
        subheading: section.subheading?.[locale] ?? null,
        body: section.body?.[locale] ?? null,
        ctaLabel: section.ctaLabel?.[locale] ?? null,
        isAutoTranslated: false,
      };
      await prisma.pageSectionTranslation.upsert({
        where: { sectionId_locale: { sectionId: record.id, locale } },
        update: fields,
        create: { sectionId: record.id, locale, ...fields },
      });
    }

    // Os itens são recriados de raiz: são uma lista ordenada, e casar item a
    // item por posição daria merges silenciosos difíceis de perceber.
    await prisma.pageSectionItem.deleteMany({ where: { sectionId: record.id } });
    for (const item of section.items ?? []) {
      await prisma.pageSectionItem.create({
        data: {
          sectionId: record.id,
          order: item.order,
          iconName: item.iconName ?? null,
          numberLabel: item.numberLabel ?? null,
          translations: {
            create: LOCALES.map((locale) => ({
              locale,
              isAutoTranslated: false,
              title: item.title[locale],
              body: item.body?.[locale] ?? null,
            })),
          },
        },
      });
    }
  }
  console.log(`Secções da LP ok (${SECTIONS.length})`);
}

async function seedPriceTiers() {
  for (const tier of PRICE_TIERS) {
    const record = await prisma.lpPriceTier.upsert({
      where: { key: tier.key },
      update: {
        pricePerM2: tier.pricePerM2,
        order: tier.order,
        isHighlighted: tier.isHighlighted,
        iconName: tier.iconName,
      },
      create: {
        key: tier.key,
        pricePerM2: tier.pricePerM2,
        order: tier.order,
        isHighlighted: tier.isHighlighted,
        iconName: tier.iconName,
      },
    });

    for (const locale of LOCALES) {
      const fields = {
        label: tier.label[locale],
        description: tier.description[locale],
        isAutoTranslated: false,
      };
      await prisma.lpPriceTierTranslation.upsert({
        where: { tierId_locale: { tierId: record.id, locale } },
        update: fields,
        create: { tierId: record.id, locale, ...fields },
      });
    }
  }
  console.log(`Escalões de preço ok (${PRICE_TIERS.length})`);
}

async function seedSeo() {
  const record = await prisma.pageSeo.upsert({
    where: { page: "LP" },
    update: {},
    create: { page: "LP" },
  });
  for (const locale of LOCALES) {
    const fields = { title: SEO.title[locale], description: SEO.description[locale], isAutoTranslated: false };
    await prisma.pageSeoTranslation.upsert({
      where: { pageSeoId_locale: { pageSeoId: record.id, locale } },
      update: fields,
      create: { pageSeoId: record.id, locale, ...fields },
    });
  }
  console.log("SEO da LP ok");
}

async function main() {
  console.log(`Base: ${isProd ? "PRODUÇÃO" : "local"}
`);
  await seedCtas();
  await seedSections();
  await seedPriceTiers();
  await seedSeo();
  console.log("Landing page semeada com sucesso.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
