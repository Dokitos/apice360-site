/**
 * Conteúdo inicial da página informativa /lsf. Corre com:
 *
 *   npx tsx scripts/seed-lsf-page.ts           # base local (.env)
 *   npx tsx scripts/seed-lsf-page.ts --prod    # base de produção (.env.production.local)
 *
 * As secções são as mesmas que o admin edita em "Secções de Página → LSF";
 * este script apenas semeia o primeiro conteúdo, nos quatro idiomas.
 *
 * Origem do texto:
 *   - Guias da Ápice 360 (PDFS/): "LSF em Portugal", "LSF é para si",
 *     "Construção Inteligente" e "Estimativa de Preço". Daqui vêm as
 *     afirmações de marca (as ~3x mais rápido, as quatro fases do processo,
 *     os erros comuns, o perfil de cliente).
 *   - Factos técnicos verificados: aço 100% reciclável e incombustível,
 *     proteção por galvanização, dimensionamento pelo Eurocódigo 3
 *     (EN 1993-1-3, aço enformado a frio) e o cuidado com pontes térmicas
 *     resolvido por isolamento exterior contínuo.
 */
import "dotenv/config";
import { config as loadEnv } from "dotenv";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const isProd = process.argv.includes("--prod");
if (isProd) loadEnv({ path: ".env.production.local", override: true });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type Locale = "PT" | "EN" | "ES" | "FR";
const LOCALES: Locale[] = ["PT", "EN", "ES", "FR"];
type L = Record<Locale, string>;
type LOpt = Partial<Record<Locale, string>>;

type Item = { order: number; iconName?: string; numberLabel?: string; title: L; body?: LOpt };
type Section = {
  key: string;
  order: number;
  imageUrl?: string;
  ctaKey?: string;
  eyebrow?: LOpt;
  heading?: LOpt;
  subheading?: LOpt;
  body?: LOpt;
  ctaLabel?: LOpt;
  items?: Item[];
};

const WA = "https://wa.me/351924107846";
const CTA = {
  key: "lsf_talk_to_us",
  url: `${WA}?text=${encodeURIComponent("Olá! Li a página sobre LSF e gostava de falar com a equipa técnica.")}`,
  iconName: "bolt",
  label: {
    PT: "Falar com a equipa técnica",
    EN: "Talk to the technical team",
    ES: "Hablar con el equipo técnico",
    FR: "Parler à l'équipe technique",
  } satisfies L,
};

const SECTIONS: Section[] = [
  {
    key: "hero",
    order: 0,
    imageUrl: "/images/hero-lsf-house.png",
    eyebrow: { PT: "LSF · Light Steel Frame", EN: "LSF · Light Steel Frame", ES: "LSF · Light Steel Frame", FR: "LSF · Light Steel Frame" },
    heading: {
      PT: "O sistema construtivo que está a mudar a forma de construir em Portugal.",
      EN: "The building system that is changing how Portugal builds.",
      ES: "El sistema constructivo que está cambiando la forma de construir en Portugal.",
      FR: "Le système constructif qui change la façon de construire au Portugal.",
    },
    subheading: {
      PT: "Um guia claro sobre o Light Steel Frame: o que é, porque cresce na Europa, como se constrói uma parede, quanto custa e — sobretudo — para quem faz sentido. Sem jargão e sem promessas vagas.",
      EN: "A clear guide to Light Steel Frame: what it is, why it is growing across Europe, how a wall is built, what it costs and — above all — who it suits. No jargon, no vague promises.",
      ES: "Una guía clara sobre el Light Steel Frame: qué es, por qué crece en Europa, cómo se construye una pared, cuánto cuesta y —sobre todo— para quién tiene sentido. Sin jerga ni promesas vagas.",
      FR: "Un guide clair sur le Light Steel Frame : ce que c'est, pourquoi il progresse en Europe, comment se construit un mur, combien cela coûte et — surtout — à qui cela convient. Sans jargon ni promesses vagues.",
    },
  },
  {
    key: "what_is",
    order: 1,
    imageUrl: "/images/lsf-detail-1.png",
    eyebrow: { PT: "O que é", EN: "What it is", ES: "Qué es", FR: "Ce que c'est" },
    heading: {
      PT: "Construir com precisão, em vez de construir com massa.",
      EN: "Building with precision instead of building with mass.",
      ES: "Construir con precisión, en vez de construir con masa.",
      FR: "Construire avec précision plutôt qu'avec de la masse.",
    },
    subheading: {
      PT: "O LSF é um sistema construtivo baseado em perfis leves de aço galvanizado, enformados a frio e aparafusados entre si para formar a estrutura do edifício.",
      EN: "LSF is a building system based on lightweight cold-formed galvanised steel profiles, screwed together to form the structure of the building.",
      ES: "El LSF es un sistema constructivo basado en perfiles ligeros de acero galvanizado, conformados en frío y atornillados entre sí para formar la estructura del edificio.",
      FR: "Le LSF est un système constructif basé sur des profilés légers en acier galvanisé, formés à froid et vissés entre eux pour constituer l'ossature du bâtiment.",
    },
    body: {
      PT: "<p>A diferença essencial não está no aço: está no facto de a parede deixar de ser um bloco maciço e passar a ser um <strong>conjunto de camadas</strong>, cada uma com uma função — estrutura, isolamento, estanquidade, acabamento.</p><p>É isso que permite afinar o desempenho térmico e acústico com muito mais controlo do que na alvenaria tradicional, e é também isso que faz da execução um trabalho de precisão milimétrica, não de improviso em obra.</p>",
      EN: "<p>The essential difference is not the steel: it is that the wall stops being a solid block and becomes a <strong>set of layers</strong>, each with a job — structure, insulation, weather-tightness, finish.</p><p>That is what allows thermal and acoustic performance to be tuned with far more control than in traditional masonry, and it is also what makes execution a job of millimetric precision rather than improvisation on site.</p>",
      ES: "<p>La diferencia esencial no está en el acero: está en que la pared deja de ser un bloque macizo y pasa a ser un <strong>conjunto de capas</strong>, cada una con una función: estructura, aislamiento, estanqueidad, acabado.</p><p>Eso es lo que permite ajustar el desempeño térmico y acústico con mucho más control que en la albañilería tradicional, y es también lo que convierte la ejecución en un trabajo de precisión milimétrica, no de improvisación en obra.</p>",
      FR: "<p>La différence essentielle n'est pas l'acier : c'est que le mur cesse d'être un bloc massif pour devenir un <strong>ensemble de couches</strong>, chacune avec une fonction — structure, isolation, étanchéité, finition.</p><p>C'est ce qui permet d'ajuster les performances thermiques et acoustiques avec bien plus de contrôle que dans la maçonnerie traditionnelle, et c'est aussi ce qui fait de l'exécution un travail de précision millimétrique plutôt que d'improvisation sur le chantier.</p>",
    },
    items: [
      {
        order: 0,
        iconName: "architecture",
        title: { PT: "Estrutura em aço galvanizado", EN: "Galvanised steel structure", ES: "Estructura de acero galvanizado", FR: "Ossature en acier galvanisé" },
        body: {
          PT: "Perfis leves protegidos por zinco, que não apodrecem nem são atacados por térmitas.",
          EN: "Lightweight zinc-protected profiles that do not rot and are not attacked by termites.",
          ES: "Perfiles ligeros protegidos con zinc, que no se pudren ni sufren ataques de termitas.",
          FR: "Profilés légers protégés par du zinc, qui ne pourrissent pas et ne sont pas attaqués par les termites.",
        },
      },
      {
        order: 1,
        iconName: "layers",
        title: { PT: "Paredes multicamadas", EN: "Multi-layer walls", ES: "Paredes multicapa", FR: "Murs multicouches" },
        body: {
          PT: "Cada camada resolve um problema: estrutura, isolamento, estanquidade e acabamento.",
          EN: "Each layer solves one problem: structure, insulation, weather-tightness and finish.",
          ES: "Cada capa resuelve un problema: estructura, aislamiento, estanqueidad y acabado.",
          FR: "Chaque couche résout un problème : structure, isolation, étanchéité et finition.",
        },
      },
      {
        order: 2,
        iconName: "precision_manufacturing",
        title: { PT: "Produção com precisão milimétrica", EN: "Millimetric production", ES: "Producción con precisión milimétrica", FR: "Production au millimètre" },
        body: {
          PT: "Os perfis são cortados a partir do projeto, o que reduz desperdício e erros em obra.",
          EN: "Profiles are cut straight from the design, which cuts waste and on-site errors.",
          ES: "Los perfiles se cortan a partir del proyecto, lo que reduce desperdicio y errores en obra.",
          FR: "Les profilés sont découpés d'après le projet, ce qui réduit les chutes et les erreurs sur le chantier.",
        },
      },
    ],
  },
  {
    key: "why_portugal",
    order: 2,
    imageUrl: "/images/lsf-detail-2.png",
    eyebrow: { PT: "Porquê agora", EN: "Why now", ES: "Por qué ahora", FR: "Pourquoi maintenant" },
    heading: {
      PT: "Portugal chegou mais tarde ao LSF. Mas ainda vai a tempo.",
      EN: "Portugal came late to LSF. But it is still in time.",
      ES: "Portugal llegó más tarde al LSF. Pero aún está a tiempo.",
      FR: "Le Portugal est arrivé tard au LSF. Mais il est encore temps.",
    },
    subheading: {
      PT: "Durante décadas a construção tradicional foi o único caminho conhecido. Hoje o país enfrenta escassez de mão-de-obra especializada, materiais mais caros e exigências de eficiência energética que a alvenaria cumpre com dificuldade.",
      EN: "For decades traditional construction was the only known path. Today the country faces a shortage of skilled labour, costlier materials and energy-efficiency requirements that masonry struggles to meet.",
      ES: "Durante décadas la construcción tradicional fue el único camino conocido. Hoy el país afronta escasez de mano de obra especializada, materiales más caros y exigencias de eficiencia energética que la albañilería cumple con dificultad.",
      FR: "Pendant des décennies, la construction traditionnelle fut la seule voie connue. Aujourd'hui, le pays fait face à une pénurie de main-d'œuvre qualifiée, à des matériaux plus chers et à des exigences d'efficacité énergétique que la maçonnerie peine à satisfaire.",
    },
    body: {
      PT: "<p>É neste cenário que o LSF deixou de ser uma curiosidade e passou a ser uma escolha corrente — em França, Espanha e Itália há muito, e em Portugal cada vez mais.</p><p>Mas há um ponto que os folhetos raramente dizem: <strong>o sistema não chega, é preciso quem o saiba executar.</strong> Uma boa tecnologia mal aplicada gera exatamente os problemas que se queria evitar.</p>",
      EN: "<p>Against that backdrop LSF stopped being a curiosity and became a mainstream choice — long since in France, Spain and Italy, and increasingly in Portugal.</p><p>But there is a point brochures rarely make: <strong>the system alone is not enough; it takes people who know how to execute it.</strong> Good technology badly applied produces exactly the problems it was meant to avoid.</p>",
      ES: "<p>En ese escenario el LSF dejó de ser una curiosidad y pasó a ser una opción habitual: desde hace tiempo en Francia, España e Italia, y cada vez más en Portugal.</p><p>Pero hay un punto que los folletos rara vez mencionan: <strong>el sistema no basta, hace falta quien sepa ejecutarlo.</strong> Una buena tecnología mal aplicada genera exactamente los problemas que se querían evitar.</p>",
      FR: "<p>Dans ce contexte, le LSF a cessé d'être une curiosité pour devenir un choix courant — depuis longtemps en France, en Espagne et en Italie, et de plus en plus au Portugal.</p><p>Mais il y a un point que les brochures évoquent rarement : <strong>le système ne suffit pas, encore faut-il savoir l'exécuter.</strong> Une bonne technologie mal appliquée produit exactement les problèmes qu'on voulait éviter.</p>",
    },
  },
  {
    key: "benefits",
    order: 3,
    eyebrow: { PT: "Vantagens", EN: "Benefits", ES: "Ventajas", FR: "Avantages" },
    heading: {
      PT: "O que muda, na prática, para quem vai viver na casa.",
      EN: "What actually changes for whoever will live in the house.",
      ES: "Qué cambia, en la práctica, para quien va a vivir en la casa.",
      FR: "Ce qui change concrètement pour ceux qui vivront dans la maison.",
    },
    items: [
      {
        order: 0,
        iconName: "timer",
        title: { PT: "Rapidez sem perder qualidade", EN: "Speed without losing quality", ES: "Rapidez sin perder calidad", FR: "Rapidité sans perdre en qualité" },
        body: {
          PT: "Entrega até 3x mais rápida do que os métodos tradicionais, porque grande parte do trabalho é preparado antes de chegar ao terreno.",
          EN: "Delivery up to 3x faster than traditional methods, because much of the work is prepared before it reaches the site.",
          ES: "Entrega hasta 3x más rápida que los métodos tradicionales, porque gran parte del trabajo se prepara antes de llegar al terreno.",
          FR: "Livraison jusqu'à 3x plus rapide que les méthodes traditionnelles, car une grande partie du travail est préparée avant d'arriver sur le terrain.",
        },
      },
      {
        order: 1,
        iconName: "thermostat",
        title: { PT: "Conforto térmico e acústico superior", EN: "Superior thermal and acoustic comfort", ES: "Confort térmico y acústico superior", FR: "Confort thermique et acoustique supérieur" },
        body: {
          PT: "O isolamento ocupa toda a espessura da parede, em vez de ser um extra colado por fora.",
          EN: "Insulation fills the whole thickness of the wall instead of being an extra stuck on the outside.",
          ES: "El aislamiento ocupa todo el espesor de la pared, en vez de ser un extra pegado por fuera.",
          FR: "L'isolant occupe toute l'épaisseur du mur, au lieu d'être un ajout collé à l'extérieur.",
        },
      },
      {
        order: 2,
        iconName: "energy_savings_leaf",
        title: { PT: "Melhor certificação energética", EN: "Better energy rating", ES: "Mejor certificación energética", FR: "Meilleure certification énergétique" },
        body: {
          PT: "Cumpre com folga os requisitos atuais, o que se traduz em menos consumo ao longo dos anos.",
          EN: "Comfortably meets current requirements, which translates into lower consumption over the years.",
          ES: "Cumple con holgura los requisitos actuales, lo que se traduce en menor consumo a lo largo de los años.",
          FR: "Répond largement aux exigences actuelles, ce qui se traduit par une consommation plus faible au fil des ans.",
        },
      },
      {
        order: 3,
        iconName: "cleaning_services",
        title: { PT: "Obra limpa, previsível e organizada", EN: "A clean, predictable and organised site", ES: "Obra limpia, previsible y organizada", FR: "Chantier propre, prévisible et organisé" },
        body: {
          PT: "Menos entulho, menos água e menos decisões improvisadas a meio da construção.",
          EN: "Less rubble, less water and fewer improvised decisions mid-build.",
          ES: "Menos escombros, menos agua y menos decisiones improvisadas a mitad de la construcción.",
          FR: "Moins de gravats, moins d'eau et moins de décisions improvisées en cours de chantier.",
        },
      },
      {
        order: 4,
        iconName: "foundation",
        title: { PT: "Durabilidade e menos patologias", EN: "Durability and fewer defects", ES: "Durabilidad y menos patologías", FR: "Durabilité et moins de pathologies" },
        body: {
          PT: "Sem retração de argamassas nem humidade de construção, evitam-se as fissuras típicas dos primeiros anos.",
          EN: "With no mortar shrinkage or construction moisture, the cracks typical of the first years are avoided.",
          ES: "Sin retracción de morteros ni humedad de construcción, se evitan las fisuras típicas de los primeros años.",
          FR: "Sans retrait des mortiers ni humidité de construction, on évite les fissures typiques des premières années.",
        },
      },
      {
        order: 5,
        iconName: "shield",
        title: { PT: "Comportamento favorável a sismos", EN: "Favourable seismic behaviour", ES: "Comportamiento favorable ante sismos", FR: "Comportement favorable aux séismes" },
        body: {
          PT: "Uma estrutura leve gera forças sísmicas menores, e as ligações aparafusadas dão ductilidade ao conjunto.",
          EN: "A light structure attracts smaller seismic forces, and the screwed connections give the assembly ductility.",
          ES: "Una estructura ligera genera fuerzas sísmicas menores, y las uniones atornilladas dan ductilidad al conjunto.",
          FR: "Une structure légère génère des forces sismiques plus faibles, et les assemblages vissés donnent de la ductilité à l'ensemble.",
        },
      },
    ],
  },
  {
    key: "anatomy",
    order: 4,
    eyebrow: { PT: "Anatomia", EN: "Anatomy", ES: "Anatomía", FR: "Anatomie" },
    heading: {
      PT: "O que existe dentro de uma parede em LSF.",
      EN: "What is inside an LSF wall.",
      ES: "Qué hay dentro de una pared en LSF.",
      FR: "Ce qu'il y a dans un mur en LSF.",
    },
    subheading: {
      PT: "Do interior para o exterior. Cada camada tem uma função e nenhuma é dispensável — é a soma delas que dá o desempenho.",
      EN: "From inside to outside. Each layer has a job and none is optional — performance comes from the sum of them.",
      ES: "Del interior al exterior. Cada capa tiene una función y ninguna es prescindible: el desempeño viene de la suma.",
      FR: "De l'intérieur vers l'extérieur. Chaque couche a une fonction et aucune n'est superflue — la performance vient de leur somme.",
    },
    items: [
      {
        order: 0,
        title: { PT: "Placa de gesso laminado", EN: "Plasterboard", ES: "Placa de yeso laminado", FR: "Plaque de plâtre" },
        body: {
          PT: "O acabamento interior. É também o que dá ao conjunto grande parte da sua resistência ao fogo.",
          EN: "The interior finish. It is also what gives the assembly much of its fire resistance.",
          ES: "El acabado interior. Es también lo que da al conjunto gran parte de su resistencia al fuego.",
          FR: "La finition intérieure. C'est aussi ce qui donne à l'ensemble une grande part de sa résistance au feu.",
        },
      },
      {
        order: 1,
        title: { PT: "Estrutura em aço + lã mineral", EN: "Steel frame + mineral wool", ES: "Estructura de acero + lana mineral", FR: "Ossature acier + laine minérale" },
        body: {
          PT: "Os montantes suportam a casa e o vão entre eles é preenchido com lã mineral, que isola do calor e do ruído.",
          EN: "The studs carry the house and the cavity between them is filled with mineral wool, insulating from heat and noise.",
          ES: "Los montantes sostienen la casa y el hueco entre ellos se rellena con lana mineral, que aísla del calor y del ruido.",
          FR: "Les montants portent la maison et le vide entre eux est rempli de laine minérale, qui isole de la chaleur et du bruit.",
        },
      },
      {
        order: 2,
        title: { PT: "Placa estrutural (OSB)", EN: "Structural sheathing (OSB)", ES: "Placa estructural (OSB)", FR: "Panneau structurel (OSB)" },
        body: {
          PT: "Trava a estrutura e impede que os painéis deformem lateralmente, sobretudo com vento e sismo.",
          EN: "Braces the frame and stops the panels racking sideways, especially under wind and earthquake.",
          ES: "Arriostra la estructura e impide que los paneles se deformen lateralmente, sobre todo con viento y sismo.",
          FR: "Contrevente l'ossature et empêche les panneaux de se déformer latéralement, notamment sous le vent et les séismes.",
        },
      },
      {
        order: 3,
        title: { PT: "Membrana respirável", EN: "Breather membrane", ES: "Membrana transpirable", FR: "Membrane respirante" },
        body: {
          PT: "Barra a água que vem de fora, mas deixa sair o vapor que se forma dentro. É o que mantém a parede seca.",
          EN: "Blocks water from outside but lets vapour from inside escape. It is what keeps the wall dry.",
          ES: "Bloquea el agua que viene de fuera, pero deja salir el vapor que se forma dentro. Es lo que mantiene seca la pared.",
          FR: "Bloque l'eau venant de l'extérieur mais laisse sortir la vapeur formée à l'intérieur. C'est ce qui garde le mur sec.",
        },
      },
      {
        order: 4,
        title: { PT: "Isolamento exterior contínuo", EN: "Continuous external insulation", ES: "Aislamiento exterior continuo", FR: "Isolation extérieure continue" },
        body: {
          PT: "A camada que corta as pontes térmicas. Como o aço conduz calor, é ela que faz a diferença entre uma parede boa e uma parede excelente.",
          EN: "The layer that cuts thermal bridges. Since steel conducts heat, this is what separates a good wall from an excellent one.",
          ES: "La capa que corta los puentes térmicos. Como el acero conduce calor, es lo que separa una pared buena de una excelente.",
          FR: "La couche qui coupe les ponts thermiques. Comme l'acier conduit la chaleur, c'est elle qui distingue un bon mur d'un excellent mur.",
        },
      },
      {
        order: 5,
        title: { PT: "Revestimento exterior", EN: "External finish", ES: "Revestimiento exterior", FR: "Revêtement extérieur" },
        body: {
          PT: "Reboco delgado armado, madeira, cerâmico ou fachada ventilada — a escolha é estética, não estrutural.",
          EN: "Thin-coat render, timber, ceramic or a ventilated façade — the choice is aesthetic, not structural.",
          ES: "Revoco delgado armado, madera, cerámico o fachada ventilada: la elección es estética, no estructural.",
          FR: "Enduit mince armé, bois, céramique ou façade ventilée — le choix est esthétique, pas structurel.",
        },
      },
    ],
  },
  {
    key: "facts",
    order: 5,
    eyebrow: { PT: "Factos técnicos", EN: "Technical facts", ES: "Hechos técnicos", FR: "Faits techniques" },
    heading: {
      PT: "O que é possível afirmar sem exagero.",
      EN: "What can be stated without exaggeration.",
      ES: "Lo que se puede afirmar sin exagerar.",
      FR: "Ce que l'on peut affirmer sans exagérer.",
    },
    items: [
      {
        order: 0,
        numberLabel: "100%",
        title: { PT: "Aço reciclável no fim de vida", EN: "Steel recyclable at end of life", ES: "Acero reciclable al final de su vida", FR: "Acier recyclable en fin de vie" },
        body: {
          PT: "O aço é o material mais reciclado do mundo e não perde propriedades ao ser reciclado.",
          EN: "Steel is the most recycled material in the world and loses no properties when recycled.",
          ES: "El acero es el material más reciclado del mundo y no pierde propiedades al reciclarse.",
          FR: "L'acier est le matériau le plus recyclé au monde et ne perd pas ses propriétés au recyclage.",
        },
      },
      {
        order: 1,
        numberLabel: "Até 3x",
        title: { PT: "Mais rápido que o método tradicional", EN: "Faster than the traditional method", ES: "Más rápido que el método tradicional", FR: "Plus rapide que la méthode traditionnelle" },
        body: {
          PT: "Prazo típico das obras da Ápice 360 em LSF, face à construção em alvenaria equivalente.",
          EN: "Typical timeline for Ápice 360's LSF projects, against equivalent masonry construction.",
          ES: "Plazo típico de las obras de Ápice 360 en LSF, frente a la construcción en albañilería equivalente.",
          FR: "Délai typique des chantiers LSF d'Ápice 360, face à une construction en maçonnerie équivalente.",
        },
      },
      {
        order: 2,
        numberLabel: "EN 1993",
        title: { PT: "Dimensionado pelo Eurocódigo 3", EN: "Designed to Eurocode 3", ES: "Dimensionado según el Eurocódigo 3", FR: "Dimensionné selon l'Eurocode 3" },
        body: {
          PT: "O aço enformado a frio tem norma europeia própria de cálculo — não é um sistema fora de regulamento.",
          EN: "Cold-formed steel has its own European design standard — this is not a system outside the rules.",
          ES: "El acero conformado en frío tiene norma europea propia de cálculo: no es un sistema fuera de reglamento.",
          FR: "L'acier formé à froid dispose de sa propre norme européenne de calcul — ce n'est pas un système hors réglementation.",
        },
      },
      {
        order: 3,
        iconName: "verified_user",
        title: { PT: "Protegido contra corrosão", EN: "Protected against corrosion", ES: "Protegido contra la corrosión", FR: "Protégé contre la corrosion" },
        body: {
          PT: "A galvanização a zinco protege o perfil, e o aço não apodrece nem é atacado por térmitas.",
          EN: "Zinc galvanising protects the profile, and steel neither rots nor is attacked by termites.",
          ES: "El galvanizado de zinc protege el perfil, y el acero ni se pudre ni sufre ataques de termitas.",
          FR: "La galvanisation au zinc protège le profilé, et l'acier ne pourrit pas et n'est pas attaqué par les termites.",
        },
      },
      {
        order: 4,
        iconName: "local_fire_department",
        title: { PT: "A estrutura não arde", EN: "The structure does not burn", ES: "La estructura no arde", FR: "L'ossature ne brûle pas" },
        body: {
          PT: "O aço é incombustível. A resistência ao fogo do conjunto vem das placas de gesso e do isolamento que o revestem.",
          EN: "Steel is non-combustible. The assembly's fire resistance comes from the plasterboard and insulation around it.",
          ES: "El acero es incombustible. La resistencia al fuego del conjunto viene de las placas de yeso y del aislamiento que lo recubren.",
          FR: "L'acier est incombustible. La résistance au feu de l'ensemble provient des plaques de plâtre et de l'isolant qui l'entourent.",
        },
      },
      {
        order: 5,
        iconName: "engineering",
        title: { PT: "As pontes térmicas exigem cuidado", EN: "Thermal bridges need care", ES: "Los puentes térmicos exigen cuidado", FR: "Les ponts thermiques exigent du soin" },
        body: {
          PT: "O aço conduz calor. Resolve-se com isolamento exterior contínuo — mas tem de estar previsto em projeto.",
          EN: "Steel conducts heat. Continuous external insulation solves it — but it has to be designed in from the start.",
          ES: "El acero conduce calor. Se resuelve con aislamiento exterior continuo, pero debe estar previsto en proyecto.",
          FR: "L'acier conduit la chaleur. L'isolation extérieure continue règle le problème — mais elle doit être prévue dès la conception.",
        },
      },
    ],
  },
  {
    key: "process",
    order: 6,
    eyebrow: { PT: "O processo", EN: "The process", ES: "El proceso", FR: "Le processus" },
    heading: {
      PT: "Quatro fases, do primeiro contacto às chaves.",
      EN: "Four phases, from first contact to the keys.",
      ES: "Cuatro fases, del primer contacto a las llaves.",
      FR: "Quatre phases, du premier contact aux clés.",
    },
    subheading: {
      PT: "Não seguimos o modelo clássico terreno → licenciamento → execução. A estrutura é outra, mais simples de acompanhar de fora.",
      EN: "We do not follow the classic land → permit → build model. The structure is different, and easier to follow from the outside.",
      ES: "No seguimos el modelo clásico terreno → licencia → ejecución. La estructura es otra, más fácil de seguir desde fuera.",
      FR: "Nous ne suivons pas le modèle classique terrain → permis → exécution. La structure est différente, plus simple à suivre de l'extérieur.",
    },
    items: [
      {
        order: 0,
        numberLabel: "1",
        title: { PT: "Visão", EN: "Vision", ES: "Visión", FR: "Vision" },
        body: {
          PT: "Traduzir intenções em possibilidades reais: avaliar o terreno, analisar viabilidade e definir o que é possível construir.",
          EN: "Turning intentions into real possibilities: assessing the plot, checking feasibility and defining what can be built.",
          ES: "Traducir intenciones en posibilidades reales: evaluar el terreno, analizar viabilidad y definir qué se puede construir.",
          FR: "Traduire les intentions en possibilités réelles : évaluer le terrain, analyser la faisabilité et définir ce qui peut être construit.",
        },
      },
      {
        order: 1,
        numberLabel: "2",
        title: { PT: "Base", EN: "Foundation", ES: "Base", FR: "Base" },
        body: {
          PT: "O projeto técnico completo: arquitetura, engenharia, especialidades, documentação e licenciamento.",
          EN: "The full technical design: architecture, engineering, building services, documentation and permits.",
          ES: "El proyecto técnico completo: arquitectura, ingeniería, instalaciones, documentación y licencias.",
          FR: "Le projet technique complet : architecture, ingénierie, lots techniques, documentation et permis.",
        },
      },
      {
        order: 2,
        numberLabel: "3",
        title: { PT: "Execução", EN: "Execution", ES: "Ejecución", FR: "Exécution" },
        body: {
          PT: "A estrutura é produzida com precisão milimétrica e montada em obra, até à fase de acabamento.",
          EN: "The structure is produced to millimetric precision and assembled on site, through to the finishing stage.",
          ES: "La estructura se produce con precisión milimétrica y se monta en obra, hasta la fase de acabado.",
          FR: "L'ossature est produite au millimètre et montée sur le chantier, jusqu'à la phase de finition.",
        },
      },
      {
        order: 3,
        numberLabel: "4",
        title: { PT: "Finalização", EN: "Handover", ES: "Finalización", FR: "Finalisation" },
        body: {
          PT: "Verificação de qualidade, ajuste dos últimos detalhes e entrega com orientação e registo de garantias.",
          EN: "Quality checks, final adjustments and handover with guidance and a record of warranties.",
          ES: "Verificación de calidad, ajuste de los últimos detalles y entrega con orientación y registro de garantías.",
          FR: "Contrôle qualité, ajustement des derniers détails et remise avec accompagnement et enregistrement des garanties.",
        },
      },
    ],
  },
  {
    key: "fit",
    order: 7,
    eyebrow: { PT: "Para quem", EN: "Who it is for", ES: "Para quién", FR: "Pour qui" },
    heading: {
      PT: "O LSF não é para toda a gente — e isso é bom sinal.",
      EN: "LSF is not for everyone — and that is a good sign.",
      ES: "El LSF no es para todo el mundo, y eso es buena señal.",
      FR: "Le LSF n'est pas fait pour tout le monde — et c'est bon signe.",
    },
    subheading: {
      PT: "Um sistema construtivo deve encaixar-se no estilo de vida de cada pessoa. Perceber isso cedo evita arrependimentos tarde.",
      EN: "A building system should fit each person's way of living. Working that out early avoids regret later.",
      ES: "Un sistema constructivo debe encajar en el estilo de vida de cada persona. Verlo pronto evita arrepentimientos tarde.",
      FR: "Un système constructif doit s'accorder au mode de vie de chacun. S'en rendre compte tôt évite les regrets plus tard.",
    },
    body: {
      PT: "<p>A decisão certa é a que respeita o que é importante para si — não a que é mais moderna nem a que sempre se fez.</p>",
      EN: "<p>The right decision is the one that respects what matters to you — not the most modern one, nor the one always done.</p>",
      ES: "<p>La decisión correcta es la que respeta lo que es importante para usted, no la más moderna ni la de siempre.</p>",
      FR: "<p>La bonne décision est celle qui respecte ce qui compte pour vous — ni la plus moderne, ni celle qu'on a toujours prise.</p>",
    },
    items: [
      { order: 0, title: { PT: "Valoriza conforto térmico e acústico todo o ano", EN: "You value thermal and acoustic comfort year-round", ES: "Valora el confort térmico y acústico todo el año", FR: "Vous tenez au confort thermique et acoustique toute l'année" } },
      { order: 1, title: { PT: "Prefere uma obra rápida e organizada", EN: "You prefer a fast, organised build", ES: "Prefiere una obra rápida y organizada", FR: "Vous préférez un chantier rapide et organisé" } },
      { order: 2, title: { PT: "Quer previsibilidade de prazo e de orçamento", EN: "You want predictable timing and budget", ES: "Quiere previsibilidad de plazo y presupuesto", FR: "Vous voulez des délais et un budget prévisibles" } },
      { order: 3, title: { PT: "Dá importância à eficiência energética", EN: "Energy efficiency matters to you", ES: "Da importancia a la eficiencia energética", FR: "L'efficacité énergétique compte pour vous" } },
      { order: 4, title: { PT: "Preocupa-se com sustentabilidade e impacto ambiental", EN: "You care about sustainability and environmental impact", ES: "Le preocupa la sostenibilidad y el impacto ambiental", FR: "Vous vous souciez de durabilité et d'impact environnemental" } },
      { order: 5, title: { PT: "Quer evitar humidades, fissuras e patologias comuns", EN: "You want to avoid damp, cracks and common defects", ES: "Quiere evitar humedades, fisuras y patologías comunes", FR: "Vous voulez éviter humidité, fissures et pathologies courantes" } },
      { order: 6, numberLabel: "nao", title: { PT: "Prefere métodos tradicionais pela familiaridade", EN: "You prefer traditional methods out of familiarity", ES: "Prefiere métodos tradicionales por familiaridad", FR: "Vous préférez les méthodes traditionnelles par habitude" } },
      { order: 7, numberLabel: "nao", title: { PT: "Gosta da estética típica das construções antigas", EN: "You like the look of older buildings", ES: "Le gusta la estética típica de las construcciones antiguas", FR: "Vous aimez l'esthétique des constructions anciennes" } },
      { order: 8, numberLabel: "nao", title: { PT: "Gosta de decidir detalhes a meio da obra", EN: "You like deciding details mid-build", ES: "Le gusta decidir detalles a mitad de la obra", FR: "Vous aimez décider des détails en cours de chantier" } },
      { order: 9, numberLabel: "nao", title: { PT: "Não tem pressa na entrega", EN: "You are in no hurry for handover", ES: "No tiene prisa por la entrega", FR: "Vous n'êtes pas pressé par la livraison" } },
    ],
  },
  {
    key: "mistakes",
    order: 8,
    eyebrow: { PT: "Erros comuns", EN: "Common mistakes", ES: "Errores comunes", FR: "Erreurs courantes" },
    heading: {
      PT: "Três erros fáceis de evitar antes de decidir.",
      EN: "Three mistakes that are easy to avoid before deciding.",
      ES: "Tres errores fáciles de evitar antes de decidir.",
      FR: "Trois erreurs faciles à éviter avant de décider.",
    },
    subheading: {
      PT: "Escolher como vai construir é tão importante quanto escolher o projeto. Muita gente decide com base em percepções, não em informação.",
      EN: "Choosing how you will build matters as much as choosing the design. Many people decide on perception rather than information.",
      ES: "Elegir cómo va a construir es tan importante como elegir el proyecto. Mucha gente decide por percepciones, no por información.",
      FR: "Choisir comment vous allez construire compte autant que choisir le projet. Beaucoup décident sur des impressions, pas sur des informations.",
    },
    items: [
      {
        order: 0,
        iconName: "history",
        title: { PT: "Escolher pelo que “sempre se fez”", EN: "Choosing by what “has always been done”", ES: "Elegir por lo que “siempre se ha hecho”", FR: "Choisir par ce qui « s'est toujours fait »" },
        body: {
          PT: "Um método ser tradicional não o torna o melhor para si. Pergunta útil: responde ao meu dia a dia, ou apenas ao hábito?",
          EN: "A method being traditional does not make it best for you. Useful question: does it answer my daily life, or just habit?",
          ES: "Que un método sea tradicional no lo hace el mejor para usted. Pregunta útil: ¿responde a mi día a día o solo al hábito?",
          FR: "Qu'une méthode soit traditionnelle ne la rend pas meilleure pour vous. Question utile : répond-elle à mon quotidien, ou seulement à l'habitude ?",
        },
      },
      {
        order: 1,
        iconName: "sentiment_neutral",
        title: { PT: "Decidir sem pensar no conforto diário", EN: "Deciding without thinking about daily comfort", ES: "Decidir sin pensar en el confort diario", FR: "Décider sans penser au confort quotidien" },
        body: {
          PT: "É fácil focar na estrutura e esquecer o essencial: como vai ser viver dentro da casa, todos os dias.",
          EN: "It is easy to focus on the structure and forget the essential: what living inside the house will feel like, every day.",
          ES: "Es fácil centrarse en la estructura y olvidar lo esencial: cómo será vivir dentro de la casa, cada día.",
          FR: "Il est facile de se concentrer sur la structure et d'oublier l'essentiel : ce que sera la vie dans la maison, au quotidien.",
        },
      },
      {
        order: 2,
        iconName: "speed",
        title: { PT: "Decidir pela obra mais rápida sem olhar ao processo", EN: "Choosing the fastest build without looking at the process", ES: "Decidir por la obra más rápida sin mirar el proceso", FR: "Choisir le chantier le plus rapide sans regarder le processus" },
        body: {
          PT: "Nem toda a obra rápida é organizada, nem toda a obra organizada é rápida. O que interessa é ter as duas.",
          EN: "Not every fast build is organised, and not every organised build is fast. What matters is having both.",
          ES: "No toda obra rápida es organizada, ni toda obra organizada es rápida. Lo que importa es tener ambas.",
          FR: "Tout chantier rapide n'est pas organisé, et tout chantier organisé n'est pas rapide. L'important est d'avoir les deux.",
        },
      },
    ],
  },
  {
    key: "cta",
    order: 9,
    ctaKey: CTA.key,
    eyebrow: { PT: "Próximo passo", EN: "Next step", ES: "Próximo paso", FR: "Prochaine étape" },
    heading: {
      PT: "Construir uma moradia não deve ser um salto no escuro.",
      EN: "Building a home should not be a leap in the dark.",
      ES: "Construir una vivienda no debe ser un salto a ciegas.",
      FR: "Construire une maison ne devrait pas être un saut dans le vide.",
    },
    subheading: {
      PT: "Se quiser analisar o seu projeto, o seu terreno ou apenas ideias iniciais, falamos consigo numa conversa técnica sem compromisso.",
      EN: "If you want to look at your project, your plot or just early ideas, we will talk it through with no strings attached.",
      ES: "Si quiere analizar su proyecto, su terreno o solo ideas iniciales, hablamos con usted sin compromiso.",
      FR: "Si vous souhaitez examiner votre projet, votre terrain ou de simples idées, nous en parlons sans engagement.",
    },
    ctaLabel: CTA.label,
  },
];

const SEO = {
  title: {
    PT: "LSF — Light Steel Frame explicado | Ápice 360",
    EN: "LSF — Light Steel Frame explained | Ápice 360",
    ES: "LSF — Light Steel Frame explicado | Ápice 360",
    FR: "LSF — Le Light Steel Frame expliqué | Ápice 360",
  } satisfies L,
  description: {
    PT: "O que é o Light Steel Frame, o que existe dentro de uma parede LSF, as quatro fases da obra e para quem este sistema faz (ou não) sentido.",
    EN: "What Light Steel Frame is, what is inside an LSF wall, the four phases of the build and who this system suits — or does not.",
    ES: "Qué es el Light Steel Frame, qué hay dentro de una pared LSF, las cuatro fases de la obra y para quién tiene (o no) sentido.",
    FR: "Ce qu'est le Light Steel Frame, ce qu'il y a dans un mur LSF, les quatre phases du chantier et à qui ce système convient — ou non.",
  } satisfies L,
};

async function seedCta() {
  const record = await prisma.cta.upsert({
    where: { key: CTA.key },
    update: { url: CTA.url, iconName: CTA.iconName },
    create: { key: CTA.key, url: CTA.url, iconName: CTA.iconName },
  });
  for (const locale of LOCALES) {
    await prisma.ctaTranslation.upsert({
      where: { ctaId_locale: { ctaId: record.id, locale } },
      update: { label: CTA.label[locale], isAutoTranslated: false },
      create: { ctaId: record.id, locale, label: CTA.label[locale], isAutoTranslated: false },
    });
  }
  console.log("CTA da LSF ok");
}

async function seedSections() {
  for (const section of SECTIONS) {
    const record = await prisma.pageSection.upsert({
      where: { page_key: { page: "LSF", key: section.key } },
      update: { order: section.order, imageUrl: section.imageUrl ?? null, ctaKey: section.ctaKey ?? null },
      create: {
        page: "LSF",
        key: section.key,
        order: section.order,
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

    // Lista ordenada: recriada de raiz, como no seed da landing page.
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
  console.log(`Secções da LSF ok (${SECTIONS.length})`);
}

async function seedSeo() {
  const record = await prisma.pageSeo.upsert({ where: { page: "LSF" }, update: {}, create: { page: "LSF" } });
  for (const locale of LOCALES) {
    const fields = { title: SEO.title[locale], description: SEO.description[locale], isAutoTranslated: false };
    await prisma.pageSeoTranslation.upsert({
      where: { pageSeoId_locale: { pageSeoId: record.id, locale } },
      update: fields,
      create: { pageSeoId: record.id, locale, ...fields },
    });
  }
  console.log("SEO da LSF ok");
}

async function main() {
  console.log(`Base: ${isProd ? "PRODUÇÃO" : "local"}\n`);
  await seedCta();
  await seedSections();
  await seedSeo();
  console.log("Página LSF semeada com sucesso.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
