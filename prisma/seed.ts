import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const img = (seed: string, w = 1200, h = 800) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

async function seedAdminAndSettings() {
  const adminEmail = process.env.ADMIN_SEED_EMAIL;
  const adminPassword = process.env.ADMIN_SEED_PASSWORD;
  const adminName = process.env.ADMIN_SEED_NAME ?? "Administrador";

  if (!adminEmail || !adminPassword) {
    throw new Error(
      "ADMIN_SEED_EMAIL e ADMIN_SEED_PASSWORD precisam estar definidos no .env para gerar o utilizador admin inicial.",
    );
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { name: adminName, email: adminEmail, passwordHash, role: "ADMIN" },
  });

  const siteSettingsData = {
    phone: "+351 924 107 846",
    whatsappCommercial: "https://wa.me/351924107846",
    whatsappGeneral: "https://wa.me/351924107846",
    email: "geral@apice360.com",
    addressLine: "Rua Bento Gonçalves, 62",
    addressCity: "Seixal",
    addressPostalCode: "",
    addressCountry: "Portugal",
    mapEmbedUrl: "https://www.google.com/maps?q=Rua+Bento+Gonçalves+62+Seixal+Portugal&output=embed",
    socialFacebook: "https://facebook.com",
    socialInstagram: "https://instagram.com",
    socialLinkedin: "https://linkedin.com",
  };

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: siteSettingsData,
    create: { id: "singleton", ...siteSettingsData },
  });

  const translationDefaults = {
    PT: {
      footerDescription:
        "Referência em tecnologia Light Steel Frame em Portugal. Engenharia de alta performance para construções duráveis e sustentáveis.",
      showroomText: "Venha conhecer o nosso showroom no Seixal e toda a estrutura em LSF de perto. Esperamos por si!",
      defaultSeoTitle: "Ápice 360 | Construção em Light Steel Frame de Alta Performance",
      defaultSeoDescription:
        "Estruturas em LSF - Light Steel Frame e Remodelações completas para transformar o seu espaço com tecnologia, rapidez e excelência.",
    },
    EN: {
      footerDescription:
        "A reference in Light Steel Frame technology in Portugal. High-performance engineering for durable, sustainable construction.",
      showroomText: "Come visit our showroom in Seixal and see the LSF structure up close. We look forward to it!",
      defaultSeoTitle: "Ápice 360 | High-Performance Light Steel Frame Construction",
      defaultSeoDescription:
        "LSF - Light Steel Frame structures and full renovations to transform your space with technology, speed and excellence.",
    },
  } as const;

  for (const locale of ["PT", "EN"] as const) {
    await prisma.siteSettingsTranslation.upsert({
      where: { siteSettingsId_locale: { siteSettingsId: "singleton", locale } },
      update: translationDefaults[locale],
      create: { siteSettingsId: "singleton", locale, ...translationDefaults[locale] },
    });
  }

  console.log(`Admin & site settings ok (${admin.email})`);
}

async function seedCtas() {
  const WA = "https://wa.me/351924107846";
  const waWith = (message: string) => `${WA}?text=${encodeURIComponent(message)}`;
  const ctas = [
    { key: "header_budget", url: WA, iconName: "bolt", labelPt: "Faça seu Orçamento", labelEn: "Get a Quote" },
    { key: "home_hero", url: WA, iconName: "bolt", labelPt: "Falar com a Nossa Equipa", labelEn: "Talk to Our Team" },
    { key: "why_choose_services", url: "/servicos", iconName: "architecture", labelPt: "Conheça Nossos Serviços", labelEn: "See Our Services" },
    {
      key: "results_portfolio",
      url: waWith("Olá! Gostava de agendar uma visita ao showroom da Ápice 360."),
      iconName: "bolt",
      labelPt: "Agendar uma Visita",
      labelEn: "Schedule a Visit",
    },
    { key: "blog_see_more", url: "/blog", iconName: "menu_book", labelPt: "Ver Mais Artigos", labelEn: "See More Articles" },
    { key: "about_talk_to_team", url: "/contacto", iconName: "chat", labelPt: "Converse com Nossa Equipa", labelEn: "Talk to Our Team" },
    { key: "services_lsf_advantages", url: "/contacto", iconName: "bolt", labelPt: "Conheça as Vantagens do LSF", labelEn: "Discover LSF Advantages" },
    { key: "services_remodelacao_cta", url: "/contacto", iconName: "chat", labelPt: "Converse e Entenda a Melhor Solução", labelEn: "Talk and Find the Best Solution" },
    { key: "services_final_cta", url: "/contacto", iconName: "chat", labelPt: "Fale com a Nossa Equipa", labelEn: "Talk to Our Team" },
    { key: "portfolio_final_budget", url: "/contacto", iconName: "bolt", labelPt: "Faça seu Orçamento", labelEn: "Get a Quote" },
    { key: "project_detail_budget", url: "/contacto", iconName: "bolt", labelPt: "Faça seu Orçamento", labelEn: "Get a Quote" },
    {
      key: "contact_whatsapp_commercial",
      url: WA,
      iconName: "chat",
      labelPt: "Clique Aqui e Converse com a Nossa Equipa Comercial",
      labelEn: "Click Here to Chat with Our Sales Team",
    },
  ];

  for (const cta of ctas) {
    await prisma.cta.upsert({
      where: { key: cta.key },
      update: { url: cta.url, iconName: cta.iconName },
      create: {
        key: cta.key,
        url: cta.url,
        iconName: cta.iconName,
        translations: {
          create: [
            { locale: "PT", label: cta.labelPt },
            { locale: "EN", label: cta.labelEn },
          ],
        },
      },
    });
  }
  console.log(`CTAs ok (${ctas.length})`);
}

async function upsertSection(
  page:
    | "HOME"
    | "QUEM_SOMOS"
    | "SERVICOS"
    | "PORTFOLIO"
    | "BLOG"
    | "CONTACTO"
    | "AREA_ARQUITETO",
  key: string,
  data: {
    order?: number;
    imageUrl?: string;
    eyebrowPt?: string;
    eyebrowEn?: string;
    headingPt?: string;
    headingEn?: string;
    subheadingPt?: string;
    subheadingEn?: string;
    bodyPt?: string;
    bodyEn?: string;
  },
  items: {
    order: number;
    iconName?: string;
    numberLabel?: string;
    titlePt: string;
    titleEn: string;
    bodyPt?: string;
    bodyEn?: string;
  }[] = [],
) {
  const existing = await prisma.pageSection.findUnique({ where: { page_key: { page, key } } });

  // Seed content is only meant to seed the initial state — once the client starts
  // editing via /admin this reseed path is not run again against that data.
  if (existing) {
    await prisma.pageSectionItem.deleteMany({ where: { sectionId: existing.id } });
    return prisma.pageSection.update({
      where: { id: existing.id },
      data: {
        order: data.order ?? 0,
        imageUrl: data.imageUrl,
        translations: {
          upsert: [
            {
              where: { sectionId_locale: { sectionId: existing.id, locale: "PT" } },
              update: { eyebrow: data.eyebrowPt, heading: data.headingPt, subheading: data.subheadingPt, body: data.bodyPt },
              create: { locale: "PT", eyebrow: data.eyebrowPt, heading: data.headingPt, subheading: data.subheadingPt, body: data.bodyPt },
            },
            {
              where: { sectionId_locale: { sectionId: existing.id, locale: "EN" } },
              update: { eyebrow: data.eyebrowEn, heading: data.headingEn, subheading: data.subheadingEn, body: data.bodyEn },
              create: { locale: "EN", eyebrow: data.eyebrowEn, heading: data.headingEn, subheading: data.subheadingEn, body: data.bodyEn },
            },
          ],
        },
        items: {
          create: items.map((item) => ({
            order: item.order,
            iconName: item.iconName,
            numberLabel: item.numberLabel,
            translations: {
              create: [
                { locale: "PT", title: item.titlePt, body: item.bodyPt },
                { locale: "EN", title: item.titleEn, body: item.bodyEn },
              ],
            },
          })),
        },
      },
    });
  }

  return prisma.pageSection.create({
    data: {
      page,
      key,
      order: data.order ?? 0,
      imageUrl: data.imageUrl,
      translations: {
        create: [
          {
            locale: "PT",
            eyebrow: data.eyebrowPt,
            heading: data.headingPt,
            subheading: data.subheadingPt,
            body: data.bodyPt,
          },
          {
            locale: "EN",
            eyebrow: data.eyebrowEn,
            heading: data.headingEn,
            subheading: data.subheadingEn,
            body: data.bodyEn,
          },
        ],
      },
      items: {
        create: items.map((item) => ({
          order: item.order,
          iconName: item.iconName,
          numberLabel: item.numberLabel,
          translations: {
            create: [
              { locale: "PT", title: item.titlePt, body: item.bodyPt },
              { locale: "EN", title: item.titleEn, body: item.bodyEn },
            ],
          },
        })),
      },
    },
  });
}

async function seedPageSections() {
  await upsertSection("HOME", "hero", {
    imageUrl: "/images/hero-lsf-house.png",
    eyebrowPt: "O Modelo de Construção Mais Utilizado em Portugal",
    eyebrowEn: "Portugal's Most Widely Used Construction Model",
    headingPt: "A Sua Moradia Pronta Até 3x Mais Rápido, Com a Segurança do Aço Leve.",
    headingEn: "Your Home Ready Up to 3x Faster, With the Safety of Light Steel.",
    subheadingPt:
      "Construímos com a inteligência do Light Steel Frame: precisão milimétrica, conforto térmico e acústico superior, e uma equipa própria que acompanha a sua obra do início ao fim. Cuidamos do seu projeto, em Portugal.",
    subheadingEn:
      "We build with the intelligence of Light Steel Frame: millimetric precision, superior thermal and acoustic comfort, and an in-house team that follows your project from start to finish. We take care of your project, in Portugal.",
  });

  await upsertSection("HOME", "partners", {
    headingPt: "A confiança constrói-se com parcerias e resultados.",
    headingEn: "Trust is built with partnerships and results.",
    subheadingPt: "Trabalhamos lado a lado com gabinetes de arquitetura e design que partilham o nosso compromisso com a qualidade e a inovação construtiva.",
    subheadingEn: "We work side by side with architecture and design offices that share our commitment to quality and construction innovation.",
  });

  await upsertSection(
    "HOME",
    "why_choose",
    {
      imageUrl: "/images/lsf-detail-1.png",
      eyebrowPt: "Porquê Escolher a Ápice 360",
      eyebrowEn: "Why Choose Ápice 360",
      headingPt: "Porque uma obra de alto valor exige mais do que promessas — exige controlo total.",
      headingEn: "Because a high-value build demands more than promises — it demands total control.",
    },
    [
      { order: 0, iconName: "groups", titlePt: "Equipa Própria e Especializada", titleEn: "In-house Specialized Team" },
      { order: 1, iconName: "bolt", titlePt: "Rapidez sem Perder Qualidade", titleEn: "Speed Without Losing Quality" },
      { order: 2, iconName: "thermostat", titlePt: "Conforto Térmico e Acústico Superior", titleEn: "Superior Thermal and Acoustic Comfort" },
      { order: 3, iconName: "shield", titlePt: "Durabilidade e Resistência a Sismos", titleEn: "Durability and Earthquake Resistance" },
    ],
  );

  await upsertSection("HOME", "results", {
    headingPt: "Porque Escolher a Ápice 360",
    headingEn: "Why Choose Ápice 360",
    bodyPt: "Venha conhecer o nosso showroom e toda a estrutura em LSF. Esperamos por si!",
    bodyEn: "Come visit our showroom and see the whole LSF structure up close. We look forward to it!",
  });

  await upsertSection("HOME", "blog_preview", {
    headingPt: "Aprenda com quem constrói no mais alto nível.",
    headingEn: "Learn from those who build at the highest level.",
    subheadingPt: "No Blog da Ápice 360 partilhamos tudo o que precisa de saber sobre LSF, remodelações e construção inteligente.",
    subheadingEn: "On the Ápice 360 Blog we share everything you need to know about LSF, renovations and smart construction.",
  });

  await upsertSection("QUEM_SOMOS", "intro", {
    imageUrl: "/images/lsf-detail-2.png",
    headingPt: "Ápice 360: Nascidos para Solucionar a Insegurança da Construção em Portugal.",
    headingEn: "Ápice 360: Born to Solve the Insecurity of Construction in Portugal.",
    bodyPt:
      "Quando chegámos a Lisboa, confrontámo-nos com a realidade do setor: promessas quebradas, obras paralisadas e um mercado refém da incerteza. Recusámo-nos a aceitar este padrão. A Ápice 360 nasce como a resposta a este problema: somos o ponto final da insegurança.",
    bodyEn:
      "When we arrived in Lisbon, we faced the reality of the sector: broken promises, stalled projects and a market held hostage by uncertainty. We refused to accept this standard. Ápice 360 was born as the answer to this problem: we are the end point of insecurity.",
  });

  await upsertSection(
    "QUEM_SOMOS",
    "history",
    {
      headingPt: "A Nossa História (Fundação e Visão)",
      headingEn: "Our History (Foundation and Vision)",
      bodyPt: "A Ápice 360 é a força que alia a visão de um fundador experiente à disciplina de uma equipa própria de especialistas.",
      bodyEn: "Ápice 360 is the force that combines the vision of an experienced founder with the discipline of an in-house team of specialists.",
    },
    [
      {
        order: 0,
        iconName: "engineering",
        titlePt: "Fundador e Autoridade",
        titleEn: "Founder and Authority",
        bodyPt: "Jefferson, Arquiteto com mais de 30 anos de experiência na área da construção, identificou a ineficiência do mercado português e viu a oportunidade de atuar em remodelações chave na mão e no sistema LSF.",
        bodyEn: "Jefferson, an Architect with more than 30 years of experience in construction, identified the inefficiency of the Portuguese market and saw the opportunity to act in turnkey renovations and the LSF system.",
      },
      {
        order: 1,
        iconName: "flag",
        titlePt: "A Nossa Missão",
        titleEn: "Our Mission",
        bodyPt: "Transformar o processo de construção e remodelação em Portugal e na Europa, entregando projetos de excelência com segurança, rapidez e total responsabilidade.",
        bodyEn: "Transform the construction and renovation process in Portugal and Europe, delivering projects of excellence with safety, speed and full accountability.",
      },
      {
        order: 2,
        iconName: "visibility",
        titlePt: "A Nossa Visão",
        titleEn: "Our Vision",
        bodyPt: "Ser a maior e mais respeitada referência em construção LSF e Remodelações de elevado valor em Portugal, e expandir essa autoridade para o mercado europeu.",
        bodyEn: "Be the largest and most respected reference in LSF construction and high-value renovations in Portugal, expanding that authority into the European market.",
      },
    ],
  );

  await upsertSection(
    "QUEM_SOMOS",
    "method",
    {
      headingPt: "O Nosso Método: A Gestão 360° de Alto Desempenho",
      headingEn: "Our Method: 360° High-Performance Management",
    },
    [
      {
        order: 0,
        numberLabel: "01",
        titlePt: "Integridade e Controlo Total",
        titleEn: "Integrity and Total Control",
        bodyPt: "Garantimos o modelo Chave na Mão, com controlo total e uma garantia estrutural. Eliminamos os riscos da subcontratação através de uma equipa própria e especializada.",
        bodyEn: "We guarantee the Turnkey model, with total control and a structural warranty. We eliminate subcontracting risks through an in-house, specialized team.",
      },
      {
        order: 1,
        numberLabel: "02",
        titlePt: "Foco em LSF e Inovação",
        titleEn: "Focus on LSF and Innovation",
        bodyPt: "Apostamos no Light Steel Frame (LSF), a tecnologia construtiva mais eficiente da Europa, que nos permite entregar a sua obra em meses.",
        bodyEn: "We invest in Light Steel Frame (LSF), the most efficient construction technology in Europe, allowing us to deliver your project in months.",
      },
      {
        order: 2,
        numberLabel: "03",
        titlePt: "Excelência e Compromisso",
        titleEn: "Excellence and Commitment",
        bodyPt: "Os nossos valores sustentam cada projeto: Integridade, Velocidade e Qualidade Inegociável, garantidas pela equipa própria e pelo conceito chave na mão.",
        bodyEn: "Our values sustain every project: Integrity, Speed and Non-negotiable Quality, guaranteed by our in-house team and the turnkey concept.",
      },
    ],
  );

  await upsertSection(
    "QUEM_SOMOS",
    "values",
    { headingPt: "Valores", headingEn: "Values" },
    [
      {
        order: 0,
        iconName: "verified",
        titlePt: "Integridade",
        titleEn: "Integrity",
        bodyPt: "Transparência e ética em todas as relações. Sem surpresas no orçamento ou no prazo.",
        bodyEn: "Transparency and ethics in every relationship. No surprises in budget or schedule.",
      },
      {
        order: 1,
        iconName: "handshake",
        titlePt: "Compromisso",
        titleEn: "Commitment",
        bodyPt: "Garantia de qualidade e cumprimento de prazos, assegurada pelo conceito de entrega Chave na Mão.",
        bodyEn: "Quality guarantee and deadline compliance, ensured by the Turnkey delivery concept.",
      },
      {
        order: 2,
        iconName: "auto_awesome",
        titlePt: "Inovação",
        titleEn: "Innovation",
        bodyPt: "Utilização do LSF e novas tecnologias, garantindo conforto térmico e acústico superiores.",
        bodyEn: "Use of LSF and new technologies, ensuring superior thermal and acoustic comfort.",
      },
      {
        order: 3,
        iconName: "workspace_premium",
        titlePt: "Excelência Técnica",
        titleEn: "Technical Excellence",
        bodyPt: "Sustentada por uma equipa própria e profissional com vasto conhecimento prático, garantindo o mais alto desempenho.",
        bodyEn: "Backed by an in-house, professional team with extensive practical knowledge, ensuring the highest performance.",
      },
    ],
  );

  await upsertSection("SERVICOS", "intro", {
    headingPt: "Soluções de Alto Desempenho: Construção em LSF e Remodelação Total, ambos no modelo Chave na Mão.",
    headingEn: "High-Performance Solutions: LSF Construction and Full Renovation, both Turnkey.",
    bodyPt: "Na Ápice 360, a nossa equipa própria e a gestão rigorosa garantem que o seu projeto de elevado valor é entregue com a máxima segurança e rapidez, do início ao fim.",
    bodyEn: "At Ápice 360, our in-house team and rigorous management ensure your high-value project is delivered with maximum safety and speed, start to finish.",
  });

  await upsertSection(
    "SERVICOS",
    "management_model",
    {
      headingPt: "O Caminho da Construção Inteligente: Método de 4 Fases",
      headingEn: "The Smart Construction Path: Our 4-Phase Method",
      bodyPt: "Aqui não seguimos o modelo clássico terreno → licenciamento → execução. Criamos uma estrutura 100% original, mais simples e mais clara para o cliente final.",
      bodyEn: "We don't follow the classic land → licensing → execution model. We built a 100% original structure — simpler and clearer for the client.",
    },
    [
      {
        order: 0,
        numberLabel: "01",
        titlePt: "Visão: onde começa uma obra inteligente",
        titleEn: "Vision: where a smart build begins",
        bodyPt: "Traduzimos as suas intenções em possibilidades reais: entendemos o projeto, avaliamos o terreno, analisamos a viabilidade e definimos o que é possível construir — alinhando expectativas desde o primeiro dia.",
        bodyEn: "We turn your intentions into real possibilities: we understand the project, assess the site, analyse feasibility and define what can be built — aligning expectations from day one.",
      },
      {
        order: 1,
        numberLabel: "02",
        titlePt: "Base: o projeto que dá vida à obra",
        titleEn: "Foundation: the project that brings the build to life",
        bodyPt: "Construímos o projeto técnico completo — arquitetura, engenharia, especialidades, preparação documental e licenciamento — a base sólida que sustenta toda a construção.",
        bodyEn: "We build the complete technical project — architecture, engineering, specialties, documentation and licensing — the solid foundation that supports the entire build.",
      },
      {
        order: 2,
        numberLabel: "03",
        titlePt: "Execução: onde a moradia ganha forma",
        titleEn: "Execution: where the home takes shape",
        bodyPt: "Da produção da estrutura em fábrica à montagem no local, fechamentos, isolamentos e acabamentos — tudo com equipa própria, supervisão técnica constante e controlo rigoroso de cada etapa.",
        bodyEn: "From the structure's factory production to on-site assembly, cladding, insulation and finishes — all with our in-house team, constant technical supervision and rigorous control of every stage.",
      },
      {
        order: 3,
        numberLabel: "04",
        titlePt: "Finalização: da última verificação à entrega das chaves",
        titleEn: "Completion: from final inspection to handover",
        bodyPt: "Validamos qualidade, testamos todos os sistemas e entregamos a moradia pronta, documentada e com garantia. A entrega não é um fim, é um início.",
        bodyEn: "We validate quality, test every system and hand over the home ready, documented and under warranty. Handover isn't an end — it's a beginning.",
      },
    ],
  );

  await upsertSection("CONTACTO", "triagem", {
    headingPt: "Triagem Rápida (Recomendado)",
    headingEn: "Quick Screening (Recommended)",
    subheadingPt: "Utilize o canal mais direto para iniciar a qualificação do seu projeto e falar com a equipa Comercial ou Arquiteta responsável.",
    subheadingEn: "Use the most direct channel to start qualifying your project and talk to our Sales or Architecture team.",
  });

  await upsertSection("AREA_ARQUITETO", "intro", {
    imageUrl: img("architect-partnership", 1400, 900),
    headingPt: "Uma Parceria Construída em Confiança e Especialização Técnica.",
    headingEn: "A Partnership Built on Trust and Technical Expertise.",
    bodyPt: "Trabalhamos lado a lado com gabinetes de arquitetura que partilham o nosso compromisso com a qualidade e a inovação construtiva. Se procura um parceiro de execução rigoroso para os seus projetos em LSF ou remodelação, fale connosco.",
    bodyEn: "We work side by side with architecture firms that share our commitment to quality and construction innovation. If you're looking for a rigorous execution partner for your LSF or renovation projects, talk to us.",
  });

  console.log("Page sections ok");
}

async function seedStats() {
  // Real figures from the LP — always resync (stats are not expected to be
  // hand-edited before the client's first content pass in /admin).
  await prisma.stat.deleteMany({});

  const stats = [
    { value: "+60", iconName: "verified", labelPt: "Obras Realizadas", labelEn: "Completed Projects", order: 0 },
    { value: "+8", iconName: "military_tech", labelPt: "Anos em Portugal", labelEn: "Years in Portugal", order: 1 },
    { value: "100%", iconName: "groups", labelPt: "Equipa Própria", labelEn: "In-house Team", order: 2 },
    { value: "Top 5%", iconName: "workspace_premium", labelPt: "Scoring em Portugal", labelEn: "Scoring in Portugal", order: 3 },
    { value: "Showroom", iconName: "storefront", labelPt: "Para Atendimento", labelEn: "For Visits", order: 4 },
  ];

  for (const stat of stats) {
    await prisma.stat.create({
      data: {
        value: stat.value,
        iconName: stat.iconName,
        order: stat.order,
        translations: {
          create: [
            { locale: "PT", label: stat.labelPt },
            { locale: "EN", label: stat.labelEn },
          ],
        },
      },
    });
  }
  console.log(`Stats ok (${stats.length})`);
}

async function seedPartners() {
  const count = await prisma.partner.count();
  if (count > 0) return console.log("Parceiros já existem, a saltar.");

  const names = ["Studio Arqvo", "Nyth Design", "Cascais Architects", "Porto Build Studio", "Lumen Arquitetura"];
  for (let i = 0; i < names.length; i++) {
    await prisma.partner.create({
      data: { name: names[i], logoUrl: img(`partner-${i}`, 300, 160), order: i },
    });
  }
  console.log(`Parceiros ok (${names.length})`);
}

async function seedTestimonials() {
  const count = await prisma.testimonial.count();
  if (count > 0) return console.log("Testemunhos já existem, a saltar.");

  const testimonials = [
    {
      authorName: "Carlos M.",
      location: "Proprietário Residencial · São Paulo/SP",
      quotePt: "Eu tinha receio por ser uma construção a seco, mas o isolamento acústico é surpreendente, muito superior ao tijolo comum. A Ápice 360 entregou a casa 2 meses antes do previsto, sem um centavo de aditivo.",
      quoteEn: "I was hesitant because it's a dry construction, but the acoustic insulation is surprising, far superior to regular brick. Ápice 360 delivered the house 2 months ahead of schedule, without a single extra cost.",
    },
    {
      authorName: "José Ferreira",
      location: "Cliente Final · Lisboa",
      quotePt: "Construímos a nossa moradia em LSF com a Ápice 360 e o resultado superou as expectativas, rápido, limpo e eficiente.",
      quoteEn: "We built our home in LSF with Ápice 360 and the result exceeded expectations — fast, clean and efficient.",
    },
    {
      authorName: "Maria Carmem",
      location: "Cliente · Cascais",
      quotePt: "A Ápice foi responsável por construir nossa casa em meio a uma ruína que adquirimos, o resultado foi acima do esperado. Obrigada a toda a equipa!",
      quoteEn: "Ápice was responsible for building our house out of a ruin we bought — the result was beyond expectations. Thank you to the whole team!",
    },
  ];

  for (let i = 0; i < testimonials.length; i++) {
    const t = testimonials[i];
    await prisma.testimonial.create({
      data: {
        authorName: t.authorName,
        location: t.location,
        avatarUrl: img(`avatar-${i}`, 200, 200),
        order: i,
        showOnHome: true,
        translations: {
          create: [
            { locale: "PT", quote: t.quotePt },
            { locale: "EN", quote: t.quoteEn },
          ],
        },
      },
    });
  }
  console.log(`Testemunhos ok (${testimonials.length})`);
}

async function seedServices() {
  const lsfFeatures = [
    {
      iconName: "timer",
      titlePt: "Velocidade Recorde",
      titleEn: "Record Speed",
      bodyPt: "Entregamos a sua moradia em meses, não em anos, devido à tecnologia e à gestão otimizada.",
      bodyEn: "We deliver your home in months, not years, thanks to technology and optimized management.",
    },
    {
      iconName: "thermostat",
      titlePt: "Eficiência Superior",
      titleEn: "Superior Efficiency",
      bodyPt: "Garantimos o melhor conforto térmico e acústico, com elevada poupança energética.",
      bodyEn: "We guarantee the best thermal and acoustic comfort, with high energy savings.",
    },
    {
      iconName: "verified",
      titlePt: "Qualidade Inegociável",
      titleEn: "Non-negotiable Quality",
      bodyPt: "Estruturas leves, resistentes e sustentáveis, construídas sob o rigor técnico de um Arquiteto experiente.",
      bodyEn: "Light, resistant and sustainable structures, built under the technical rigor of an experienced Architect.",
    },
  ];

  const remodelacaoFeatures = [
    {
      iconName: "trending_up",
      titlePt: "Ruínas e Alta Rentabilidade",
      titleEn: "Ruins and High Profitability",
      bodyPt: "Atuamos na remodelação de ruínas, oferecendo um atalho legal e rentável face à construção de raiz.",
      bodyEn: "We work on renovating ruins, offering a legal and profitable shortcut compared to building from scratch.",
    },
    {
      iconName: "shield",
      titlePt: "Segurança e Garantia Estendida",
      titleEn: "Safety and Extended Warranty",
      bodyPt: 'O conceito "Chave na Mão" garante controlo total e uma garantia estrutural — fator crucial em Portugal.',
      bodyEn: 'The "Turnkey" concept guarantees total control and a structural warranty — a crucial factor in Portugal.',
    },
    {
      iconName: "task_alt",
      titlePt: "Fim da Burocracia",
      titleEn: "No More Bureaucracy",
      bodyPt: "Eliminamos a necessidade de o cliente gerir múltiplos empreiteiros, simplificando processos complexos.",
      bodyEn: "We eliminate the need for clients to manage multiple contractors, simplifying complex processes.",
    },
  ];

  const lsfExisting = await prisma.service.findUnique({ where: { type: "LSF" } });
  if (lsfExisting) {
    await prisma.service.update({
      where: { type: "LSF" },
      data: { imageUrl: "/images/lsf-detail-1.png" },
    });
  } else {
    await prisma.service.create({
      data: {
        type: "LSF",
        imageUrl: "/images/lsf-detail-1.png",
        ctaKey: "services_lsf_advantages",
        translations: {
          create: [
            {
              locale: "PT",
              cardLabel: "Construção em LSF - Light Steel Frame",
              title: "LSF: A Tecnologia Construtiva Mais Eficiente da Europa.",
              intro: "O LSF é o futuro da construção e a nossa especialidade. É a escolha natural para clientes que procuram velocidade, eficiência e segurança estrutural.",
            },
            {
              locale: "EN",
              cardLabel: "LSF - Light Steel Frame Construction",
              title: "LSF: Europe's Most Efficient Construction Technology.",
              intro: "LSF is the future of construction and our specialty. It's the natural choice for clients seeking speed, efficiency and structural safety.",
            },
          ],
        },
        features: {
          create: lsfFeatures.map((f, i) => ({
            order: i,
            iconName: f.iconName,
            translations: {
              create: [
                { locale: "PT", title: f.titlePt, body: f.bodyPt },
                { locale: "EN", title: f.titleEn, body: f.bodyEn },
              ],
            },
          })),
        },
      },
    });
  }

  const remodelacaoExisting = await prisma.service.findUnique({ where: { type: "REMODELACAO" } });
  if (remodelacaoExisting) {
    await prisma.service.update({
      where: { type: "REMODELACAO" },
      data: { imageUrl: "/images/hero-lsf-house.png" },
    });
  } else {
    await prisma.service.create({
      data: {
        type: "REMODELACAO",
        imageUrl: "/images/hero-lsf-house.png",
        ctaKey: "services_remodelacao_cta",
        translations: {
          create: [
            {
              locale: "PT",
              cardLabel: "Construção em Remodelação Total",
              title: "Remodelação Total: Transformamos Ruínas em Ativos de Alta Rentabilidade.",
              intro: "Especializados em obras totais Chave na Mão para quem procura uma solução completa e sem reocupações.",
            },
            {
              locale: "EN",
              cardLabel: "Full Renovation Construction",
              title: "Full Renovation: We Turn Ruins into High-Yield Assets.",
              intro: "Specialists in full Turnkey projects for those looking for a complete solution without repeated moves.",
            },
          ],
        },
        features: {
          create: remodelacaoFeatures.map((f, i) => ({
            order: i,
            iconName: f.iconName,
            translations: {
              create: [
                { locale: "PT", title: f.titlePt, body: f.bodyPt },
                { locale: "EN", title: f.titleEn, body: f.bodyEn },
              ],
            },
          })),
        },
      },
    });
  }

  console.log("Serviços ok");
}

async function seedPortfolio() {
  const count = await prisma.portfolioProject.count();
  if (count > 0) return console.log("Projetos de portfólio já existem, a saltar.");

  const projects = [
    {
      slug: "moradia-lsf-lisboa",
      category: "LSF" as const,
      isFeatured: true,
      locationLabel: "Lisboa",
      clientName: "John August",
      clientLocation: "Paris/França",
      titlePt: "Projeto realizado para cliente final de outro país. Acompanhamento 360.",
      titleEn: "Project delivered for a foreign client. Full 360 follow-up.",
      shortDescriptionPt: "Projeto realizado para cliente final em 8 meses.",
      shortDescriptionEn: "Project delivered for a final client in 8 months.",
      challengePt: "Necessidade de entrega ultrarrápida (8 meses) e cliente noutro país.",
      challengeEn: "Need for ultra-fast delivery (8 months) with a client abroad.",
      methodologyPt: "Gestão 360 com equipa própria e utilização integral de LSF para garantir o prazo e a qualidade superior.",
      methodologyEn: "360 management with an in-house team and full use of LSF to guarantee schedule and superior quality.",
      resultPt: "Moradia de Alto Valor entregue no prazo e acompanhamento total do processo.",
      resultEn: "High-value home delivered on time with full process follow-up.",
      testimonialQuotePt: "Entregaram dentro do prazo combinado, sem surpresas e reportando periodicamente os avanços da obra do início até à conclusão. Satisfação total e recomendação garantida!",
      testimonialQuoteEn: "They delivered within the agreed deadline, no surprises, reporting progress periodically from start to finish. Total satisfaction and guaranteed recommendation!",
    },
    {
      slug: "moradia-lsf-porto",
      category: "LSF" as const,
      isFeatured: true,
      locationLabel: "Porto",
      clientName: "Rita Almeida",
      clientLocation: "Porto",
      titlePt: "Projeto realizado em parceria com Gabinete de Arquitetura totalmente personalizado.",
      titleEn: "Project delivered in partnership with an architecture firm, fully customized.",
      shortDescriptionPt: "Projeto realizado em parceria com Gabinete de Arquitetura.",
      shortDescriptionEn: "Project delivered in partnership with an architecture firm.",
      challengePt: "Design totalmente personalizado com prazos rígidos definidos pelo gabinete parceiro.",
      challengeEn: "Fully custom design with strict deadlines set by the partner firm.",
      methodologyPt: "Coordenação direta entre a nossa equipa técnica e o gabinete de arquitetura durante toda a obra.",
      methodologyEn: "Direct coordination between our technical team and the architecture firm throughout the project.",
      resultPt: "Entrega de um projeto arquitetónico complexo sem desvios de prazo ou orçamento.",
      resultEn: "Delivery of a complex architectural project with no schedule or budget deviations.",
      testimonialQuotePt: "Qualidade impecável, realmente entrega o que promete.",
      testimonialQuoteEn: "Impeccable quality, they really deliver what they promise.",
    },
    {
      slug: "moradia-lsf-cascais",
      category: "LSF" as const,
      isFeatured: false,
      locationLabel: "Cascais",
      clientName: "Diogo Ribeiro",
      clientLocation: "Cascais",
      titlePt: "Projeto realizado para cliente final em 8 meses.",
      titleEn: "Project delivered for a final client in 8 months.",
      shortDescriptionPt: "Construção LSF completa junto ao litoral de Cascais.",
      shortDescriptionEn: "Full LSF construction near the Cascais coastline.",
      challengePt: "Exposição salina exigindo especificações técnicas reforçadas na estrutura de aço.",
      challengeEn: "Salt exposure requiring reinforced technical specifications for the steel structure.",
      methodologyPt: "Aço galvanizado de alta resistência e tratamento anticorrosivo adicional.",
      methodologyEn: "High-resistance galvanized steel with additional anti-corrosion treatment.",
      resultPt: "Moradia entregue com garantia estrutural estendida para ambiente costeiro.",
      resultEn: "Home delivered with an extended structural warranty for coastal environments.",
      testimonialQuotePt: "Velocidade na entrega sem perder na qualidade.",
      testimonialQuoteEn: "Fast delivery without compromising on quality.",
    },
    {
      slug: "remodelacao-ruina-coimbra",
      category: "REMODELACAO" as const,
      isFeatured: true,
      locationLabel: "Coimbra",
      clientName: "Sofia Martins",
      clientLocation: "Coimbra",
      titlePt: "Projeto realizado em uma ruína em Coimbra para cliente final.",
      titleEn: "Project delivered on a ruin in Coimbra for a final client.",
      shortDescriptionPt: "Transformação completa de ruína em moradia de alto padrão.",
      shortDescriptionEn: "Complete transformation of a ruin into a high-end home.",
      challengePt: "Estrutura original comprometida, exigindo reforço e reconstrução parcial.",
      challengeEn: "Original structure compromised, requiring reinforcement and partial reconstruction.",
      methodologyPt: "Diagnóstico técnico detalhado seguido de reconstrução Chave na Mão com equipa própria.",
      methodologyEn: "Detailed technical assessment followed by Turnkey reconstruction with an in-house team.",
      resultPt: "Transformou uma ruína num sonho, entregue com garantia estrutural total.",
      resultEn: "Turned a ruin into a dream home, delivered with full structural warranty.",
      testimonialQuotePt: "Transformou uma ruína num sonho.",
      testimonialQuoteEn: "They turned a ruin into a dream.",
    },
    {
      slug: "remodelacao-casa-lisboa",
      category: "REMODELACAO" as const,
      isFeatured: true,
      locationLabel: "Lisboa",
      clientName: "Miguel Santos",
      clientLocation: "Lisboa",
      titlePt: "Projeto realizado de remodelação total realizado em tempo recorde para cliente final.",
      titleEn: "Full renovation project delivered in record time for a final client.",
      shortDescriptionPt: "Remodelação completa de casa abandonada em Lisboa.",
      shortDescriptionEn: "Complete renovation of an abandoned house in Lisbon.",
      challengePt: "Imóvel devoluto há mais de uma década, com instalações elétricas e hidráulicas obsoletas.",
      challengeEn: "Property vacant for over a decade, with outdated electrical and plumbing systems.",
      methodologyPt: "Renovação integral com equipa própria e parceria com Gabinete de Arquitetura.",
      methodologyEn: "Full renovation with an in-house team and partnership with an architecture firm.",
      resultPt: "Imóvel totalmente requalificado e valorizado, pronto para habitar ou rentabilizar.",
      resultEn: "Fully requalified and valued property, ready to live in or generate income.",
      testimonialQuotePt: "Foi realizado em tempo recorde e sem surpresas.",
      testimonialQuoteEn: "It was completed in record time with no surprises.",
    },
    {
      slug: "remodelacao-cascais",
      category: "REMODELACAO" as const,
      isFeatured: false,
      locationLabel: "Cascais",
      clientName: "Beatriz Costa",
      clientLocation: "Cascais",
      titlePt: "Remodelação completa de casa abandonada em Lisboa. Parceria com Gabinete de Arquitetura.",
      titleEn: "Complete renovation of an abandoned house in Lisbon. Partnership with an architecture firm.",
      shortDescriptionPt: "Remodelação total em parceria com gabinete de arquitetura local.",
      shortDescriptionEn: "Full renovation in partnership with a local architecture firm.",
      challengePt: "Coordenação entre múltiplos stakeholders sem perder o modelo chave na mão.",
      challengeEn: "Coordinating multiple stakeholders without losing the turnkey model.",
      methodologyPt: "Ponto único de contacto com o cliente, mesmo trabalhando em parceria com terceiros.",
      methodologyEn: "Single point of contact for the client, even while partnering with third parties.",
      resultPt: "Entrega dentro do prazo com total satisfação do cliente e do gabinete parceiro.",
      resultEn: "On-time delivery with full satisfaction from both the client and the partner firm.",
      testimonialQuotePt: "Acompanhamento 360 do início ao fim.",
      testimonialQuoteEn: "360 follow-up from start to finish.",
    },
  ];

  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    const project = await prisma.portfolioProject.create({
      data: {
        slug: p.slug,
        category: p.category,
        isFeatured: p.isFeatured,
        locationLabel: p.locationLabel,
        clientName: p.clientName,
        clientLocation: p.clientLocation,
        coverImageUrl: img(p.slug, 1200, 800),
        order: i,
        isPublished: true,
        publishedAt: new Date(),
        translations: {
          create: [
            {
              locale: "PT",
              title: p.titlePt,
              shortDescription: p.shortDescriptionPt,
              challenge: p.challengePt,
              methodology: p.methodologyPt,
              result: p.resultPt,
              testimonialQuote: p.testimonialQuotePt,
            },
            {
              locale: "EN",
              title: p.titleEn,
              shortDescription: p.shortDescriptionEn,
              challenge: p.challengeEn,
              methodology: p.methodologyEn,
              result: p.resultEn,
              testimonialQuote: p.testimonialQuoteEn,
            },
          ],
        },
      },
    });

    await prisma.projectImage.createMany({
      data: [0, 1, 2].map((n) => ({
        projectId: project.id,
        url: img(`${p.slug}-${n}`, 1400, 900),
        order: n,
      })),
    });
  }

  console.log(`Projetos de portfólio ok (${projects.length})`);
}

async function seedBlog() {
  const categoryCount = await prisma.blogCategory.count();
  let categories: Record<string, string> = {};

  if (categoryCount === 0) {
    const defs = [
      { slug: "lsf", namePt: "LSF", nameEn: "LSF" },
      { slug: "remodelacao", namePt: "Remodelação", nameEn: "Renovation" },
      { slug: "construtora", namePt: "Construtora", nameEn: "Builder" },
    ];
    for (let i = 0; i < defs.length; i++) {
      const d = defs[i];
      const category = await prisma.blogCategory.create({
        data: {
          order: i,
          translations: {
            create: [
              { locale: "PT", name: d.namePt, slug: d.slug },
              { locale: "EN", name: d.nameEn, slug: d.slug },
            ],
          },
        },
      });
      categories[d.slug] = category.id;
    }
    console.log("Categorias de blog ok (3)");
  } else {
    const all = await prisma.blogCategory.findMany({ include: { translations: true } });
    categories = Object.fromEntries(
      all.map((c) => [c.translations.find((t) => t.locale === "PT")?.slug ?? c.id, c.id]),
    );
    console.log("Categorias de blog já existem, a reutilizar.");
  }

  const postCount = await prisma.blogPost.count();
  if (postCount > 0) return console.log("Artigos de blog já existem, a saltar.");

  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });

  const posts = [
    {
      categorySlug: "lsf",
      slug: "futuro-da-construcao-em-portugal",
      titlePt: "O Futuro da Construção em Portugal",
      titleEn: "The Future of Construction in Portugal",
      excerptPt: "Descubra como o sistema Light Steel Frame está a revolucionar a construção europeia — com mais rapidez, precisão e eficiência energética.",
      excerptEn: "Discover how the Light Steel Frame system is revolutionizing European construction — with more speed, precision and energy efficiency.",
      bodyPt: `<h2>A Inovação que a Europa Acolheu e Portugal Resiste</h2><p>O sistema Light Steel Frame (LSF) já não é uma tendência, é uma realidade consolidada em grande parte da Europa (França, Espanha, Itália). A sua velocidade de execução, eficiência energética e sustentabilidade fazem dele a escolha natural para projetos de alto desempenho.</p><h3>Os 3 Fatores que Impulsionam o LSF na Europa</h3><ul><li><strong>Velocidade e Qualidade Inegociável.</strong> Padrão Europeu: LSF é sinónimo de entregas em meses, permitindo que investidores e proprietários rentabilizem ou usufruam rapidamente do imóvel.</li><li><strong>Qualidade Técnica vs. Amadorismo.</strong> O sistema exige conhecimento técnico especializado para garantir a excelência.</li><li><strong>Segurança Estrutural vs. Incerteza.</strong> O mercado exige garantias estruturais sólidas e transparência no processo.</li></ul><p>Se o LSF é o futuro na Europa, é essencial que em Portugal seja executado com a mesma excelência e rigor.</p>`,
      bodyEn: `<h2>The Innovation Europe Embraced and Portugal Resists</h2><p>The Light Steel Frame (LSF) system is no longer a trend, it's an established reality across much of Europe. Its execution speed, energy efficiency and sustainability make it the natural choice for high-performance projects.</p><h3>3 Factors Driving LSF in Europe</h3><ul><li><strong>Non-negotiable speed and quality.</strong> European standard: LSF means delivery in months.</li><li><strong>Technical quality vs. amateurism.</strong> The system demands specialized technical knowledge.</li><li><strong>Structural safety vs. uncertainty.</strong> The market demands solid structural guarantees and process transparency.</li></ul><p>If LSF is the future in Europe, it's essential that in Portugal it's executed with the same excellence and rigor.</p>`,
    },
    {
      categorySlug: "remodelacao",
      slug: "remodelar-uma-ruina-o-caminho",
      titlePt: "Remodelar uma Ruína: O Caminho Mais Rentável",
      titleEn: "Renovating a Ruin: The Most Profitable Path",
      excerptPt: "Saiba porque a remodelação total de ruínas é uma das opções mais rentáveis e menos burocráticas no mercado português.",
      excerptEn: "Learn why fully renovating ruins is one of the most profitable, least bureaucratic options in the Portuguese market.",
      bodyPt: `<h2>Porque Investir numa Ruína?</h2><p>A compra e remodelação de ruínas oferece um atalho legal e financeiramente atrativo face à construção de raiz, especialmente em centros urbanos consolidados.</p><h3>Vantagens do Modelo Chave na Mão</h3><ul><li>Controlo total do orçamento desde o primeiro dia.</li><li>Garantia estrutural em todo o processo de reconstrução.</li><li>Eliminação da necessidade de gerir múltiplos empreiteiros.</li></ul><p>Com a equipa própria da Ápice 360, cada ruína é avaliada tecnicamente antes de qualquer compromisso, evitando surpresas depois do início da obra.</p>`,
      bodyEn: `<h2>Why Invest in a Ruin?</h2><p>Buying and renovating ruins offers a legally and financially attractive shortcut compared to building from scratch, especially in established urban centers.</p><h3>Advantages of the Turnkey Model</h3><ul><li>Total budget control from day one.</li><li>Structural warranty throughout the reconstruction process.</li><li>No need to manage multiple contractors.</li></ul><p>With Ápice 360's in-house team, every ruin is technically assessed before any commitment, avoiding surprises once work begins.</p>`,
    },
    {
      categorySlug: "construtora",
      slug: "chave-na-mao-a-garantia-de-uma-obra-sem-riscos",
      titlePt: "Chave na Mão: A Garantia de uma Obra sem Riscos",
      titleEn: "Turnkey: The Guarantee of a Risk-Free Build",
      excerptPt: "Entenda como o modelo de Gestão 360° da Ápice 360 elimina falhas, reduz prazos e assegura qualidade total.",
      excerptEn: "Understand how Ápice 360's 360° Management model eliminates failures, reduces timelines and ensures total quality.",
      bodyPt: `<h2>O Que Significa "Chave na Mão"?</h2><p>Significa que o cliente não precisa de se preocupar com nada. Do planeamento à entrega, toda a responsabilidade técnica e de gestão fica com a Ápice 360.</p><h3>Os Três Pilares</h3><ol><li>Planeamento 360°, com rigor desde a visão estratégica.</li><li>Execução com equipa própria, sem subcontratação descontrolada.</li><li>Entrega garantida e a tempo, sem surpresas no orçamento.</li></ol><p>É esta metodologia que nos permite prometer — e cumprir — prazos que o mercado tradicional considera impossíveis.</p>`,
      bodyEn: `<h2>What Does "Turnkey" Mean?</h2><p>It means the client doesn't need to worry about anything. From planning to delivery, all technical and management responsibility rests with Ápice 360.</p><h3>The Three Pillars</h3><ol><li>360° planning, with rigor from the strategic vision onward.</li><li>Execution with an in-house team, no uncontrolled subcontracting.</li><li>Guaranteed, on-time delivery, with no budget surprises.</li></ol><p>This methodology is what allows us to promise — and deliver — timelines the traditional market considers impossible.</p>`,
    },
    {
      categorySlug: "construtora",
      slug: "por-detras-da-excelencia",
      titlePt: "Por Detrás da Excelência",
      titleEn: "Behind the Excellence",
      excerptPt: "Conheça a nossa equipa e quem atua em cada etapa do seu projeto, colaboradores próprios e especializados do início ao fim da obra.",
      excerptEn: "Meet our team and who's behind every stage of your project — an in-house, specialized team from start to finish.",
      bodyPt: `<h2>Uma Equipa, Zero Subcontratação Descontrolada</h2><p>Cada etapa da obra — desde a engenharia estrutural até ao acabamento — é executada por profissionais que fazem parte da nossa equipa própria.</p><p>Esta é a base da nossa garantia de qualidade: quem projeta é quem constrói, e quem constrói responde diretamente pelo resultado.</p>`,
      bodyEn: `<h2>One Team, Zero Uncontrolled Subcontracting</h2><p>Every stage of the build — from structural engineering to finishing — is carried out by professionals who are part of our in-house team.</p><p>This is the foundation of our quality guarantee: those who design are those who build, and those who build answer directly for the result.</p>`,
    },
    {
      categorySlug: "remodelacao",
      slug: "remodelacao-ou-construcao-convencional",
      titlePt: "Remodelação ou Construção Convencional: Qual Escolher?",
      titleEn: "Renovation or Conventional Construction: Which to Choose?",
      excerptPt: "Descubra qual a melhor opção para a sua obra e como a Ápice 360 pode ajudar nesse processo de decisão.",
      excerptEn: "Discover the best option for your project and how Ápice 360 can help with that decision.",
      bodyPt: `<h2>Depende do Ponto de Partida</h2><p>Se já possui um imóvel devoluto ou uma ruína, a remodelação total costuma ser mais rápida e rentável. Se parte de um terreno vazio, o LSF oferece a melhor relação entre velocidade e qualidade.</p><p>A nossa equipa técnica avalia gratuitamente o seu caso e recomenda o caminho mais seguro.</p>`,
      bodyEn: `<h2>It Depends on Your Starting Point</h2><p>If you already own a vacant property or a ruin, full renovation tends to be faster and more profitable. If you're starting from an empty plot, LSF offers the best balance between speed and quality.</p><p>Our technical team assesses your case for free and recommends the safest path.</p>`,
    },
    {
      categorySlug: "lsf",
      slug: "o-mercado-que-mais-cresce-na-europa",
      titlePt: "O Mercado que Mais Cresce na Europa (e Como a Maioria em Portugal Faz Errado)",
      titleEn: "Europe's Fastest-Growing Market (and How Most in Portugal Get It Wrong)",
      excerptPt: "Descubra o porquê de o LSF estar a crescer na Europa e como a maioria em Portugal faz errado.",
      excerptEn: "Discover why LSF is growing across Europe and how most in Portugal get it wrong.",
      bodyPt: `<h2>Portugal Está a Chegar Atrasado — Mas Ainda Vai a Tempo</h2><p>Enquanto o LSF já representa uma fatia significativa da construção residencial em vários países europeus, em Portugal o sistema ainda é subutilizado — muitas vezes mal executado por falta de equipas especializadas.</p><p>A Ápice 360 nasce precisamente para corrigir esse desvio, aplicando o rigor técnico europeu ao mercado português.</p>`,
      bodyEn: `<h2>Portugal Is Behind — But There's Still Time</h2><p>While LSF already represents a significant share of residential construction in several European countries, in Portugal the system is still underused — often poorly executed due to a lack of specialized teams.</p><p>Ápice 360 exists precisely to correct that gap, applying European technical rigor to the Portuguese market.</p>`,
    },
  ];

  for (let i = 0; i < posts.length; i++) {
    const p = posts[i];
    const post = await prisma.blogPost.create({
      data: {
        categoryId: categories[p.categorySlug] ?? null,
        authorId: admin?.id,
        featuredImageUrl: img(p.slug, 1200, 700),
        status: "PUBLISHED",
        publishedAt: new Date(Date.now() - (posts.length - i) * 1000 * 60 * 60 * 24 * 7),
        translations: {
          create: [
            {
              locale: "PT",
              slug: p.slug,
              title: p.titlePt,
              excerpt: p.excerptPt,
              bodyHtml: p.bodyPt,
              seoTitle: p.titlePt,
              seoDescription: p.excerptPt,
            },
            {
              locale: "EN",
              slug: p.slug,
              title: p.titleEn,
              excerpt: p.excerptEn,
              bodyHtml: p.bodyEn,
              seoTitle: p.titleEn,
              seoDescription: p.excerptEn,
            },
          ],
        },
      },
    });

    if (i === 0) {
      await prisma.blogComment.createMany({
        data: [
          {
            postId: post.id,
            authorName: "Ricardo Oliveira",
            authorEmail: "ricardo@example.com",
            body: "Foi a minha casa e foi a melhor escolha da minha vida.",
            status: "APPROVED",
          },
          {
            postId: post.id,
            authorName: "Ana Beatriz",
            authorEmail: "ana@example.com",
            body: "Está a crescer porque é rápido e bom.",
            status: "APPROVED",
          },
        ],
      });
    }
  }

  console.log(`Artigos de blog ok (${posts.length})`);
}

async function seedPageSeo() {
  const entries: {
    page: "HOME" | "QUEM_SOMOS" | "SERVICOS" | "PORTFOLIO" | "BLOG" | "CONTACTO" | "AREA_ARQUITETO";
    titlePt: string;
    titleEn: string;
    descriptionPt: string;
    descriptionEn: string;
  }[] = [
    {
      page: "HOME",
      titlePt: "Ápice 360 | Construção em Light Steel Frame de Alta Performance",
      titleEn: "Ápice 360 | High-Performance Light Steel Frame Construction",
      descriptionPt: "Construímos o futuro com leveza, velocidade e confiança. Estruturas em LSF e Remodelações completas.",
      descriptionEn: "We build the future with lightness, speed and trust. LSF structures and full renovations.",
    },
    {
      page: "QUEM_SOMOS",
      titlePt: "Quem Somos | Ápice 360",
      titleEn: "About Us | Ápice 360",
      descriptionPt: "Conheça a história, a missão e o método de gestão 360° da Ápice 360.",
      descriptionEn: "Learn about Ápice 360's history, mission and 360° management method.",
    },
    {
      page: "SERVICOS",
      titlePt: "Serviços | Ápice 360",
      titleEn: "Services | Ápice 360",
      descriptionPt: "Construção em LSF e Remodelação Total, ambos no modelo Chave na Mão.",
      descriptionEn: "LSF construction and full renovation, both delivered turnkey.",
    },
    {
      page: "PORTFOLIO",
      titlePt: "Portfólio | Ápice 360",
      titleEn: "Portfolio | Ápice 360",
      descriptionPt: "Veja em detalhe como transformamos projetos de elevado valor em obras prontas a viver.",
      descriptionEn: "See in detail how we turn high-value projects into move-in ready homes.",
    },
    {
      page: "BLOG",
      titlePt: "Blog da Construção | Ápice 360",
      titleEn: "Construction Blog | Ápice 360",
      descriptionPt: "O seu recurso especializado sobre LSF, Remodelações de Alto Valor e gestão de projetos.",
      descriptionEn: "Your specialized resource on LSF, high-value renovations and project management.",
    },
    {
      page: "CONTACTO",
      titlePt: "Contacto | Ápice 360",
      titleEn: "Contact | Ápice 360",
      descriptionPt: "Contacte a Ápice 360 e inicie a triagem do seu projeto.",
      descriptionEn: "Contact Ápice 360 and start the screening of your project.",
    },
    {
      page: "AREA_ARQUITETO",
      titlePt: "Área do Arquiteto | Ápice 360",
      titleEn: "Architect Area | Ápice 360",
      descriptionPt: "Uma parceria construída em confiança e especialização técnica com gabinetes de arquitetura.",
      descriptionEn: "A partnership built on trust and technical expertise with architecture firms.",
    },
  ];

  for (const entry of entries) {
    const existing = await prisma.pageSeo.findUnique({ where: { page: entry.page } });
    if (existing) continue;
    await prisma.pageSeo.create({
      data: {
        page: entry.page,
        translations: {
          create: [
            { locale: "PT", title: entry.titlePt, description: entry.descriptionPt },
            { locale: "EN", title: entry.titleEn, description: entry.descriptionEn },
          ],
        },
      },
    });
  }
  console.log("SEO por página ok");
}

async function main() {
  await seedAdminAndSettings();
  await seedCtas();
  await seedPageSections();
  await seedStats();
  await seedPartners();
  await seedTestimonials();
  await seedServices();
  await seedPortfolio();
  await seedBlog();
  await seedPageSeo();
  console.log("Seed concluído.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
