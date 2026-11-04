import type { SiteLocale } from "@/lib/locale";

/**
 * As soluções construtivas em LSF, camada a camada.
 *
 * Transcrição do infográfico técnico da Ápice 360 ("A escolha inteligente
 * para o seu futuro"). Os valores são os da folha do cliente e não devem ser
 * arredondados, resumidos nem "corrigidos" aqui: quem decide uma parede pela
 * espessura de uma camada precisa do número que a empresa assume, não de uma
 * aproximação. Para mudar qualquer um deles, muda-se primeiro o documento.
 *
 * O texto vive aqui, nos quatro idiomas, e não nos dicionários: é conteúdo
 * técnico que só esta secção usa, e separar os nomes das camadas das
 * espessuras a que pertencem seria pedir que se dessincronizassem. O texto
 * de interface do livro (separadores, botões, cabeçalhos) está onde todo o
 * resto do site o tem, em src/lib/dictionary.ts.
 */

export type Texto = Record<SiteLocale, string>;

const t = (pt: string, en: string, es: string, fr: string): Texto => ({ PT: pt, EN: en, ES: es, FR: fr });

export function texto(valor: Texto, locale: SiteLocale): string {
  return valor[locale] || valor.PT;
}

export type Layer = {
  /** Nome da camada, do interior para o exterior (paredes) ou de cima para baixo (pavimentos e coberturas). */
  name: Texto;
  /** Espessura tal como está na folha. Vazio quando o documento não a indica. */
  thickness: string | null;
};

export type System = {
  code: string | null;
  title: Texto;
  subtitle: Texto | null;
  /** O corte desta solução, recortado do infográfico da empresa. */
  image: string;
  layers: Layer[];
  /** A frase de fecho do cartão, em maiúsculas no original. */
  bestFor: Texto | null;
};

export type SystemFamily = {
  key: string;
  title: Texto;
  /** Nome curto, para o separador do livro. */
  tab: Texto;
  subtitle: Texto;
  systems: System[];
};

const l = (name: Texto, thickness: string | null): Layer => ({ name, thickness });

// Camadas que se repetem entre soluções, traduzidas uma só vez.
const PINTURA_INTERIOR = t("Pintura interior", "Interior paint", "Pintura interior", "Peinture intérieure");
const PLACA_GESSO = t("Placa de gesso", "Plasterboard", "Placa de yeso", "Plaque de plâtre");
const OSB = t("OSB", "OSB", "OSB", "OSB");
const ESTRUTURA_LSF = t("Estrutura LSF", "LSF frame", "Estructura LSF", "Ossature LSF");
const LA_DE_ROCHA = t("Lã de rocha", "Rock wool", "Lana de roca", "Laine de roche");
const CAPOTO_EPS = t("Capoto EPS", "EPS external insulation (ETICS)", "SATE de EPS", "ITE en EPS");
const ARGAMASSA = t("Argamassa + pintura", "Render + paint", "Mortero + pintura", "Enduit + peinture");
const OSB_SUPERIOR = t("OSB superior", "Upper OSB", "OSB superior", "OSB supérieur");
const OSB_INFERIOR = t("OSB inferior", "Lower OSB", "OSB inferior", "OSB inférieur");
const XPS = t("XPS", "XPS", "XPS", "XPS");
const XPS_THERMOCHIP = t("XPS (Thermochip)", "XPS (Thermochip)", "XPS (Thermochip)", "XPS (Thermochip)");
const GEOTEXTIL = t("Geotêxtil", "Geotextile", "Geotextil", "Géotextile");
const PAVIMENTO_CERAMICO = t("Pavimento cerâmico", "Ceramic tiling", "Pavimento cerámico", "Carrelage");
const COLA_CERAMICA = t("Cola para cerâmica", "Tile adhesive", "Adhesivo cerámico", "Colle à carrelage");
const XPS_ISOLAMENTO = t(
  "XPS (isolamento térmico)",
  "XPS (thermal insulation)",
  "XPS (aislamiento térmico)",
  "XPS (isolation thermique)",
);
const GESSO_TETO = t(
  "Placa de gesso (teto interior)",
  "Plasterboard (interior ceiling)",
  "Placa de yeso (techo interior)",
  "Plaque de plâtre (plafond intérieur)",
);

export const LSF_ADVANTAGES: Texto[] = [
  t(
    "Construção até 60% mais rápida",
    "Up to 60% faster construction",
    "Construcción hasta un 60% más rápida",
    "Construction jusqu'à 60% plus rapide",
  ),
  t(
    "Menos desperdício e obra mais limpa",
    "Less waste and a cleaner site",
    "Menos desperdicio y obra más limpia",
    "Moins de déchets et un chantier plus propre",
  ),
  t(
    "Excelente isolamento térmico e acústico",
    "Excellent thermal and acoustic insulation",
    "Excelente aislamiento térmico y acústico",
    "Excellente isolation thermique et acoustique",
  ),
  t("Liberdade arquitetónica", "Architectural freedom", "Libertad arquitectónica", "Liberté architecturale"),
  t(
    "Versatilidade de acabamentos",
    "Versatile finishes",
    "Versatilidad de acabados",
    "Polyvalence des finitions",
  ),
  t("Elevada durabilidade", "High durability", "Elevada durabilidad", "Grande durabilité"),
  t("Solução sustentável", "Sustainable solution", "Solución sostenible", "Solution durable"),
];

export const LSF_HIGHLIGHTS: { icon: string; label: Texto }[] = [
  {
    icon: "speed",
    label: t(
      "Construção até 60% mais rápida",
      "Up to 60% faster",
      "Hasta un 60% más rápida",
      "Jusqu'à 60% plus rapide",
    ),
  },
  {
    icon: "eco",
    label: t(
      "Conforto térmico e acústico",
      "Thermal and acoustic comfort",
      "Confort térmico y acústico",
      "Confort thermique et acoustique",
    ),
  },
  {
    icon: "settings",
    label: t(
      "Qualidade e precisão industrial",
      "Industrial quality and precision",
      "Calidad y precisión industrial",
      "Qualité et précision industrielles",
    ),
  },
  {
    icon: "verified_user",
    label: t("Mais durabilidade", "More durability", "Más durabilidad", "Plus de durabilité"),
  },
  {
    icon: "recycling",
    label: t("Solução sustentável", "Sustainable solution", "Solución sostenible", "Solution durable"),
  },
];

export const LSF_WHAT_IS: Texto = t(
  "O LSF (Light Steel Frame) é um sistema construtivo moderno e industrializado, composto por perfis de aço galvanizado de alta resistência, que formam a estrutura da casa. Com ele é possível construir de forma mais rápida, seca, precisa e sustentável, garantindo excelente desempenho térmico, acústico e estrutural.",
  "LSF (Light Steel Frame) is a modern, industrialised building system made of high-strength galvanised steel profiles that form the structure of the house. It makes construction faster, drier, more precise and more sustainable, with excellent thermal, acoustic and structural performance.",
  "El LSF (Light Steel Frame) es un sistema constructivo moderno e industrializado, compuesto por perfiles de acero galvanizado de alta resistencia que forman la estructura de la casa. Permite construir de forma más rápida, seca, precisa y sostenible, garantizando un excelente comportamiento térmico, acústico y estructural.",
  "Le LSF (Light Steel Frame) est un système constructif moderne et industrialisé, composé de profilés en acier galvanisé haute résistance qui forment la structure de la maison. Il permet de construire plus vite, à sec, avec précision et de façon durable, en garantissant d'excellentes performances thermiques, acoustiques et structurelles.",
);

export const LSF_FAMILIES: SystemFamily[] = [
  {
    key: "paredes",
    title: t("Paredes em LSF", "LSF walls", "Paredes en LSF", "Murs en LSF"),
    tab: t("Paredes", "Walls", "Paredes", "Murs"),
    subtitle: t(
      "Quatro soluções conforme a sua necessidade",
      "Four solutions to suit your needs",
      "Cuatro soluciones según su necesidad",
      "Quatre solutions selon vos besoins",
    ),
    systems: [
      {
        code: null,
        title: t("Parede com Glasroc", "Glasroc wall", "Pared con Glasroc", "Mur avec Glasroc"),
        subtitle: t(
          "Placa de gesso especial",
          "Special plasterboard",
          "Placa de yeso especial",
          "Plaque de plâtre spéciale",
        ),
        image: "/images/lsf/parede-glasroc.webp",
        layers: [
          l(PINTURA_INTERIOR, "1 mm"),
          l(
            t("Placa de gesso acartonado", "Plasterboard", "Placa de yeso laminado", "Plaque de plâtre"),
            "12 mm",
          ),
          l(OSB, "12 mm"),
          l(ESTRUTURA_LSF, "150 mm"),
          l(LA_DE_ROCHA, "60 mm"),
          l(t("Glasroc (MGO)", "Glasroc (MGO)", "Glasroc (MGO)", "Glasroc (MGO)"), "12 mm"),
          l(CAPOTO_EPS, "60 mm"),
          // 22 mm é o que está na folha do cliente; nas outras três paredes
          // a mesma camada aparece com 2 mm.
          l(ARGAMASSA, "22 mm"),
        ],
        bestFor: t(
          "Ideal para zonas húmidas e maior resistência ao fogo",
          "Ideal for wet areas and greater fire resistance",
          "Ideal para zonas húmedas y mayor resistencia al fuego",
          "Idéal pour les pièces humides et une meilleure résistance au feu",
        ),
      },
      {
        code: null,
        title: t("Parede com MGO", "MGO wall", "Pared con MGO", "Mur avec MGO"),
        subtitle: t("Placa cimentícia", "Cement board", "Placa cementosa", "Panneau ciment"),
        image: "/images/lsf/parede-mgo.webp",
        layers: [
          l(PINTURA_INTERIOR, "1 mm"),
          l(PLACA_GESSO, "12 mm"),
          l(OSB, "12 mm"),
          l(ESTRUTURA_LSF, "150 mm"),
          l(LA_DE_ROCHA, "60 mm"),
          l(t("Placa MGO", "MGO board", "Placa MGO", "Panneau MGO"), "12 mm"),
          l(CAPOTO_EPS, "60 mm"),
          l(ARGAMASSA, "2 mm"),
        ],
        bestFor: t(
          "Excelente resistência mecânica e à humidade",
          "Excellent mechanical and moisture resistance",
          "Excelente resistencia mecánica y a la humedad",
          "Excellente résistance mécanique et à l'humidité",
        ),
      },
      {
        code: null,
        title: t("Parede com Thermochip", "Thermochip wall", "Pared con Thermochip", "Mur avec Thermochip"),
        subtitle: t("Viroc + XPS + Viroc", "Viroc + XPS + Viroc", "Viroc + XPS + Viroc", "Viroc + XPS + Viroc"),
        image: "/images/lsf/parede-thermochip.webp",
        layers: [
          l(PINTURA_INTERIOR, "1 mm"),
          l(PLACA_GESSO, "12 mm"),
          l(ESTRUTURA_LSF, "150 mm"),
          l(t("Viroc (interior)", "Viroc (interior)", "Viroc (interior)", "Viroc (intérieur)"), "12 mm"),
          l(XPS_THERMOCHIP, "60 mm"),
          l(t("Viroc (exterior)", "Viroc (exterior)", "Viroc (exterior)", "Viroc (extérieur)"), "12 mm"),
          l(CAPOTO_EPS, "60 mm"),
          l(ARGAMASSA, "2 mm"),
        ],
        bestFor: t(
          "Alto desempenho térmico e grande durabilidade",
          "High thermal performance and great durability",
          "Alto rendimiento térmico y gran durabilidad",
          "Haute performance thermique et grande durabilité",
        ),
      },
      {
        code: null,
        title: t("Parede com Coretech", "Coretech wall", "Pared con Coretech", "Mur avec Coretech"),
        subtitle: t(
          "Placa cimentícia de alta resistência",
          "High-strength cement board",
          "Placa cementosa de alta resistencia",
          "Panneau ciment haute résistance",
        ),
        image: "/images/lsf/parede-coretech.webp",
        layers: [
          l(PINTURA_INTERIOR, "1 mm"),
          l(PLACA_GESSO, "12 mm"),
          l(OSB, "12 mm"),
          l(ESTRUTURA_LSF, "150 mm"),
          l(LA_DE_ROCHA, "60 mm"),
          l(t("Coretech", "Coretech", "Coretech", "Coretech"), "12 mm"),
          l(CAPOTO_EPS, "60 mm"),
          l(ARGAMASSA, "2 mm"),
        ],
        bestFor: t(
          "Máxima resistência e estabilidade estrutural",
          "Maximum strength and structural stability",
          "Máxima resistencia y estabilidad estructural",
          "Résistance maximale et stabilité structurelle",
        ),
      },
    ],
  },
  {
    key: "pavimentos",
    title: t(
      "Pavimentos em LSF — 200 mm",
      "LSF floors — 200 mm",
      "Forjados en LSF — 200 mm",
      "Planchers en LSF — 200 mm",
    ),
    tab: t("Pavimentos", "Floors", "Forjados", "Planchers"),
    subtitle: t(
      "Quatro soluções para diferentes acabamentos",
      "Four solutions for different finishes",
      "Cuatro soluciones para diferentes acabados",
      "Quatre solutions pour différentes finitions",
    ),
    systems: [
      {
        code: "P1",
        title: t(
          "Duas placas OSB + piso flutuante",
          "Two OSB boards + floating floor",
          "Dos placas OSB + suelo flotante",
          "Deux panneaux OSB + sol flottant",
        ),
        subtitle: null,
        image: "/images/lsf/pavimento-p1.webp",
        layers: [
          l(
            t(
              "Piso flutuante (madeira, vinílico)",
              "Floating floor (wood, vinyl)",
              "Suelo flotante (madera, vinílico)",
              "Sol flottant (bois, vinyle)",
            ),
            "8–12 mm",
          ),
          l(
            t("Manta acústica", "Acoustic underlay", "Lámina acústica", "Sous-couche acoustique"),
            "2–5 mm",
          ),
          l(OSB_SUPERIOR, "18 mm"),
          l(OSB_INFERIOR, "18 mm"),
          l(ESTRUTURA_LSF, "200 mm"),
        ],
        bestFor: t(
          "Conforto, rapidez e excelente desempenho acústico",
          "Comfort, speed and excellent acoustic performance",
          "Confort, rapidez y excelente rendimiento acústico",
          "Confort, rapidité et excellentes performances acoustiques",
        ),
      },
      {
        code: "P2",
        title: t(
          "Duas placas OSB + pavimento cerâmico",
          "Two OSB boards + ceramic tiling",
          "Dos placas OSB + pavimento cerámico",
          "Deux panneaux OSB + carrelage",
        ),
        subtitle: null,
        image: "/images/lsf/pavimento-p2.webp",
        layers: [
          l(PAVIMENTO_CERAMICO, "8–12 mm"),
          l(COLA_CERAMICA, "2–5 mm"),
          l(OSB_SUPERIOR, "18 mm"),
          l(OSB_INFERIOR, "18 mm"),
          l(ESTRUTURA_LSF, "200 mm"),
        ],
        bestFor: t(
          "Ideal para zonas sociais e alta resistência",
          "Ideal for living areas and high resistance",
          "Ideal para zonas sociales y alta resistencia",
          "Idéal pour les pièces de vie et haute résistance",
        ),
      },
      {
        code: "P3",
        title: t(
          "Placa colaborante + betonilha + cerâmico",
          "Composite decking + screed + tiling",
          "Chapa colaborante + mortero + cerámico",
          "Bac collaborant + chape + carrelage",
        ),
        subtitle: null,
        image: "/images/lsf/pavimento-p3.webp",
        layers: [
          l(PAVIMENTO_CERAMICO, "8–12 mm"),
          l(COLA_CERAMICA, "3–5 mm"),
          l(
            t(
              "Betonilha de regularização",
              "Levelling screed",
              "Mortero de regularización",
              "Chape de ragréage",
            ),
            "50 mm",
          ),
          l(
            t(
              "Placa colaborante metálica",
              "Composite metal decking",
              "Chapa colaborante metálica",
              "Bac acier collaborant",
            ),
            "120 mm",
          ),
          l(ESTRUTURA_LSF, "200 mm"),
        ],
        bestFor: t(
          "Maior rigidez e desempenho para grandes vãos",
          "Greater rigidity and performance for long spans",
          "Mayor rigidez y rendimiento para grandes luces",
          "Plus grande rigidité et performance pour les grandes portées",
        ),
      },
      {
        code: "P4",
        title: t(
          "Thermochip 84 mm + acabamento",
          "Thermochip 84 mm + finish",
          "Thermochip 84 mm + acabado",
          "Thermochip 84 mm + finition",
        ),
        subtitle: null,
        image: "/images/lsf/pavimento-p4.webp",
        layers: [
          l(
            t(
              "Pavimento final (cerâmico ou flutuante)",
              "Final flooring (ceramic or floating)",
              "Pavimento final (cerámico o flotante)",
              "Revêtement final (carrelage ou flottant)",
            ),
            "8–12 mm",
          ),
          l(
            t(
              "Cola ou manta acústica",
              "Adhesive or acoustic underlay",
              "Adhesivo o lámina acústica",
              "Colle ou sous-couche acoustique",
            ),
            "2–5 mm",
          ),
          l(t("Viroc (superior)", "Upper Viroc", "Viroc (superior)", "Viroc (supérieur)"), "12 mm"),
          l(XPS_THERMOCHIP, "60 mm"),
          l(t("Viroc (inferior)", "Lower Viroc", "Viroc (inferior)", "Viroc (inférieur)"), "12 mm"),
          l(ESTRUTURA_LSF, "200 mm"),
        ],
        bestFor: t(
          "Solução com excelente isolamento térmico e acústico",
          "Solution with excellent thermal and acoustic insulation",
          "Solución con excelente aislamiento térmico y acústico",
          "Solution avec une excellente isolation thermique et acoustique",
        ),
      },
    ],
  },
  {
    key: "cobertura-plana",
    title: t(
      "Cobertura plana em LSF",
      "LSF flat roof",
      "Cubierta plana en LSF",
      "Toiture-terrasse en LSF",
    ),
    tab: t("Cobertura plana", "Flat roof", "Cubierta plana", "Toiture-terrasse"),
    subtitle: t(
      "Três soluções de impermeabilização",
      "Three waterproofing solutions",
      "Tres soluciones de impermeabilización",
      "Trois solutions d'étanchéité",
    ),
    systems: [
      {
        code: "CP1",
        title: t(
          "Dupla manta betuminosa com seixos",
          "Double bituminous membrane with gravel",
          "Doble lámina bituminosa con grava",
          "Double membrane bitumineuse avec gravier",
        ),
        subtitle: null,
        image: "/images/lsf/cobertura-plana-cp1.webp",
        layers: [
          l(
            t("Seixos (proteção)", "Gravel (protection)", "Grava (protección)", "Gravier (protection)"),
            "40–60 mm",
          ),
          l(GEOTEXTIL, "1–2 mm"),
          l(
            t(
              "Manta betuminosa (2 camadas)",
              "Bituminous membrane (2 layers)",
              "Lámina bituminosa (2 capas)",
              "Membrane bitumineuse (2 couches)",
            ),
            "8–10 mm",
          ),
          l(OSB_SUPERIOR, "18 mm"),
          l(XPS, "80 mm"),
          l(OSB_INFERIOR, "18 mm"),
          l(ESTRUTURA_LSF, "200 mm"),
        ],
        bestFor: null,
      },
      {
        code: "CP2",
        title: t(
          "Manta sintética (PVC/TPO/EPDM) com lastro",
          "Synthetic membrane (PVC/TPO/EPDM) with ballast",
          "Lámina sintética (PVC/TPO/EPDM) con lastre",
          "Membrane synthétique (PVC/TPO/EPDM) avec lestage",
        ),
        subtitle: null,
        image: "/images/lsf/cobertura-plana-cp2.webp",
        layers: [
          l(
            t("Lajetas / seixos", "Paving slabs / gravel", "Losetas / grava", "Dalles / gravier"),
            "40–60 mm",
          ),
          l(GEOTEXTIL, "1–2 mm"),
          l(
            t(
              "Manta sintética (PVC/TPO/EPDM)",
              "Synthetic membrane (PVC/TPO/EPDM)",
              "Lámina sintética (PVC/TPO/EPDM)",
              "Membrane synthétique (PVC/TPO/EPDM)",
            ),
            "1,5–2 mm",
          ),
          l(OSB_SUPERIOR, "18 mm"),
          l(XPS, "80 mm"),
          l(OSB_INFERIOR, "18 mm"),
          l(ESTRUTURA_LSF, "200 mm"),
        ],
        bestFor: null,
      },
      {
        code: "CP3",
        title: t(
          "Cobertura verde (ajardinada)",
          "Green roof (planted)",
          "Cubierta verde (ajardinada)",
          "Toiture végétalisée",
        ),
        subtitle: null,
        image: "/images/lsf/cobertura-plana-cp3.webp",
        layers: [
          l(
            t(
              "Vegetação e substrato",
              "Vegetation and substrate",
              "Vegetación y sustrato",
              "Végétation et substrat",
            ),
            "60–120 mm",
          ),
          l(
            t("Geotêxtil filtrante", "Filter geotextile", "Geotextil filtrante", "Géotextile filtrant"),
            "1 mm",
          ),
          l(
            t("Manta anti-raiz", "Root barrier", "Lámina antirraíces", "Membrane anti-racines"),
            "1,2–2 mm",
          ),
          l(
            t(
              "Manta betuminosa",
              "Bituminous membrane",
              "Lámina bituminosa",
              "Membrane bitumineuse",
            ),
            "4–5 mm",
          ),
          l(XPS, "80 mm"),
          l(OSB_INFERIOR, "18 mm"),
          l(ESTRUTURA_LSF, "200 mm"),
        ],
        bestFor: null,
      },
    ],
  },
  {
    key: "cobertura-inclinada",
    title: t(
      "Cobertura inclinada em LSF",
      "LSF pitched roof",
      "Cubierta inclinada en LSF",
      "Toiture inclinée en LSF",
    ),
    tab: t("Cobertura inclinada", "Pitched roof", "Cubierta inclinada", "Toiture inclinée"),
    subtitle: t(
      "Duas opções de revestimento",
      "Two covering options",
      "Dos opciones de revestimiento",
      "Deux options de couverture",
    ),
    systems: [
      {
        code: "CI1",
        title: t("Telha cerâmica", "Clay roof tile", "Teja cerámica", "Tuile en terre cuite"),
        subtitle: null,
        image: "/images/lsf/cobertura-inclinada-ci1.webp",
        // A folha do cliente não indica espessuras nesta família.
        layers: [
          l(t("Telha cerâmica", "Clay roof tile", "Teja cerámica", "Tuile en terre cuite"), null),
          l(t("Ripas de fixação", "Fixing battens", "Rastreles de fijación", "Liteaux de fixation"), null),
          l(
            t(
              "Membrana respirável (impermeável ao vento e água)",
              "Breathable membrane (wind and water tight)",
              "Membrana transpirable (impermeable al viento y al agua)",
              "Membrane respirante (pare-pluie et pare-vent)",
            ),
            null,
          ),
          l(OSB, null),
          l(XPS_ISOLAMENTO, null),
          l(ESTRUTURA_LSF, null),
          l(GESSO_TETO, null),
        ],
        bestFor: null,
      },
      {
        code: "CI2",
        title: t("Telha sanduíche", "Sandwich panel roof", "Teja sándwich", "Tuile sandwich"),
        subtitle: null,
        image: "/images/lsf/cobertura-inclinada-ci2.webp",
        layers: [
          l(
            t(
              "Telha sanduíche (painel metálico com isolamento)",
              "Sandwich panel (insulated metal panel)",
              "Teja sándwich (panel metálico con aislamiento)",
              "Tuile sandwich (panneau métallique isolé)",
            ),
            null,
          ),
          l(
            t(
              "Fixação e acessórios",
              "Fixings and accessories",
              "Fijación y accesorios",
              "Fixations et accessoires",
            ),
            null,
          ),
          l(
            t(
              "Membrana de separação (opcional)",
              "Separation membrane (optional)",
              "Membrana de separación (opcional)",
              "Membrane de séparation (optionnelle)",
            ),
            null,
          ),
          l(OSB, null),
          l(XPS_ISOLAMENTO, null),
          l(ESTRUTURA_LSF, null),
          l(GESSO_TETO, null),
        ],
        bestFor: null,
      },
    ],
  },
];
