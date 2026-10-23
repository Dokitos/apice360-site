/**
 * As soluções construtivas em LSF, camada a camada.
 *
 * Transcrição do infográfico técnico da Ápice 360 ("A escolha inteligente
 * para o seu futuro"). Os valores são os da folha do cliente e não devem ser
 * arredondados, resumidos nem "corrigidos" aqui: quem decide uma parede pela
 * espessura de uma camada precisa do número que a empresa assume, não de uma
 * aproximação. Para mudar qualquer um deles, muda-se primeiro o documento.
 */

export type Layer = {
  /** Nome da camada, do interior para o exterior (paredes) ou de cima para baixo (pavimentos e coberturas). */
  name: string;
  /** Espessura tal como está na folha. Vazio quando o documento não a indica. */
  thickness: string | null;
  /** Espessura em milímetros, só para desenhar a proporção da camada. */
  mm: number;
};

export type System = {
  code: string | null;
  title: string;
  subtitle: string | null;
  layers: Layer[];
  /** A frase de fecho do cartão, em maiúsculas no original. */
  bestFor: string | null;
};

export type SystemFamily = {
  key: string;
  title: string;
  subtitle: string;
  /** Paredes leem-se de lado (corte horizontal); o resto empilha-se. */
  direction: "horizontal" | "vertical";
  /** Como se chamam as duas faces do corte. Num pavimento não são "exterior" e "interior". */
  faces: [string, string];
  systems: System[];
};

const l = (name: string, thickness: string | null, mm: number): Layer => ({ name, thickness, mm });

export const LSF_ADVANTAGES: string[] = [
  "Construção até 60% mais rápida",
  "Menos desperdício e obra mais limpa",
  "Excelente isolamento térmico e acústico",
  "Liberdade arquitetónica",
  "Versatilidade de acabamentos",
  "Elevada durabilidade",
  "Solução sustentável",
];

export const LSF_HIGHLIGHTS: { icon: string; label: string }[] = [
  { icon: "speed", label: "Construção até 60% mais rápida" },
  { icon: "eco", label: "Conforto térmico e acústico" },
  { icon: "settings", label: "Qualidade e precisão industrial" },
  { icon: "verified_user", label: "Mais durabilidade" },
  { icon: "recycling", label: "Solução sustentável" },
];

export const LSF_WHAT_IS =
  "O LSF (Light Steel Frame) é um sistema construtivo moderno e industrializado, composto por perfis de aço galvanizado de alta resistência, que formam a estrutura da casa. Com ele é possível construir de forma mais rápida, seca, precisa e sustentável, garantindo excelente desempenho térmico, acústico e estrutural.";

export const LSF_FAMILIES: SystemFamily[] = [
  {
    key: "paredes",
    title: "Paredes em LSF",
    subtitle: "Quatro soluções conforme a sua necessidade",
    direction: "horizontal",
    faces: ["Interior", "Exterior"],
    systems: [
      {
        code: null,
        title: "Parede com Glasroc",
        subtitle: "Placa de gesso especial",
        layers: [
          l("Pintura interior", "1 mm", 1),
          l("Placa de gesso acartonado", "12 mm", 12),
          l("OSB", "12 mm", 12),
          l("Estrutura LSF", "150 mm", 150),
          l("Lã de rocha", "60 mm", 60),
          l("Glasroc (MGO)", "12 mm", 12),
          l("Capoto EPS", "60 mm", 60),
          // 22 mm é o que está na folha do cliente; nas outras três paredes
          // a mesma camada aparece com 2 mm.
          l("Argamassa + pintura", "22 mm", 22),
        ],
        bestFor: "Ideal para zonas húmidas e maior resistência ao fogo",
      },
      {
        code: null,
        title: "Parede com MGO",
        subtitle: "Placa cimentícia",
        layers: [
          l("Pintura interior", "1 mm", 1),
          l("Placa de gesso", "12 mm", 12),
          l("OSB", "12 mm", 12),
          l("Estrutura LSF", "150 mm", 150),
          l("Lã de rocha", "60 mm", 60),
          l("Placa MGO", "12 mm", 12),
          l("Capoto EPS", "60 mm", 60),
          l("Argamassa + pintura", "2 mm", 2),
        ],
        bestFor: "Excelente resistência mecânica e à humidade",
      },
      {
        code: null,
        title: "Parede com Thermochip",
        subtitle: "Viroc + XPS + Viroc",
        layers: [
          l("Pintura interior", "1 mm", 1),
          l("Placa de gesso", "12 mm", 12),
          l("Estrutura LSF", "150 mm", 150),
          l("Viroc (interior)", "12 mm", 12),
          l("XPS (Thermochip)", "60 mm", 60),
          l("Viroc (exterior)", "12 mm", 12),
          l("Capoto EPS", "60 mm", 60),
          l("Argamassa + pintura", "2 mm", 2),
        ],
        bestFor: "Alto desempenho térmico e grande durabilidade",
      },
      {
        code: null,
        title: "Parede com Coretech",
        subtitle: "Placa cimentícia de alta resistência",
        layers: [
          l("Pintura interior", "1 mm", 1),
          l("Placa de gesso", "12 mm", 12),
          l("OSB", "12 mm", 12),
          l("Estrutura LSF", "150 mm", 150),
          l("Lã de rocha", "60 mm", 60),
          l("Coretech", "12 mm", 12),
          l("Capoto EPS", "60 mm", 60),
          l("Argamassa + pintura", "2 mm", 2),
        ],
        bestFor: "Máxima resistência e estabilidade estrutural",
      },
    ],
  },
  {
    key: "pavimentos",
    title: "Pavimentos em LSF — 200 mm",
    subtitle: "Quatro soluções para diferentes acabamentos",
    direction: "vertical",
    faces: ["Acabamento", "Estrutura"],
    systems: [
      {
        code: "P1",
        title: "Duas placas OSB + piso flutuante",
        subtitle: null,
        layers: [
          l("Piso flutuante (madeira, vinílico)", "8–12 mm", 10),
          l("Manta acústica", "2–5 mm", 4),
          l("OSB superior", "18 mm", 18),
          l("OSB inferior", "18 mm", 18),
          l("Estrutura LSF", "200 mm", 200),
        ],
        bestFor: "Conforto, rapidez e excelente desempenho acústico",
      },
      {
        code: "P2",
        title: "Duas placas OSB + pavimento cerâmico",
        subtitle: null,
        layers: [
          l("Pavimento cerâmico", "8–12 mm", 10),
          l("Cola para cerâmica", "3–5 mm", 4),
          l("OSB superior", "18 mm", 18),
          l("OSB inferior", "18 mm", 18),
          l("Estrutura LSF", "200 mm", 200),
        ],
        bestFor: "Ideal para zonas sociais e alta resistência",
      },
      {
        code: "P3",
        title: "Placa colaborante + betonilha + cerâmico",
        subtitle: null,
        layers: [
          l("Pavimento cerâmico", "8–12 mm", 10),
          l("Cola para cerâmica", "3–5 mm", 4),
          l("Betonilha de regularização", "50 mm", 50),
          l("Placa colaborante metálica", "120 mm", 120),
          l("Estrutura LSF", "200 mm", 200),
        ],
        bestFor: "Maior rigidez e desempenho para grandes vãos",
      },
      {
        code: "P4",
        title: "Thermochip 84 mm + acabamento",
        subtitle: null,
        layers: [
          l("Pavimento final (cerâmico ou flutuante)", "8–12 mm", 10),
          l("Cola ou manta acústica", "2–5 mm", 4),
          l("Viroc (superior)", "12 mm", 12),
          l("XPS (Thermochip)", "60 mm", 60),
          l("Viroc (inferior)", "12 mm", 12),
          l("Estrutura LSF", "200 mm", 200),
        ],
        bestFor: "Solução com excelente isolamento térmico e acústico",
      },
    ],
  },
  {
    key: "cobertura-plana",
    title: "Cobertura plana em LSF",
    subtitle: "Três soluções de impermeabilização",
    direction: "vertical",
    faces: ["Exterior", "Interior"],
    systems: [
      {
        code: "CP1",
        title: "Dupla manta betuminosa com seixos",
        subtitle: null,
        layers: [
          l("Seixos (proteção)", "40–60 mm", 50),
          l("Geotêxtil", "1–2 mm", 2),
          l("Manta betuminosa (2 camadas)", "8–10 mm", 9),
          l("OSB superior", "18 mm", 18),
          l("XPS", "80 mm", 80),
          l("OSB inferior", "18 mm", 18),
          l("Estrutura LSF", "200 mm", 200),
        ],
        bestFor: null,
      },
      {
        code: "CP2",
        title: "Manta sintética (PVC/TPO/EPDM) com lastro",
        subtitle: null,
        layers: [
          l("Lajetas / seixos", "40–60 mm", 50),
          l("Geotêxtil", "1–2 mm", 2),
          l("Manta sintética (PVC/TPO/EPDM)", "1,5 mm", 2),
          l("OSB superior", "18 mm", 18),
          l("XPS", "80 mm", 80),
          l("OSB inferior", "18 mm", 18),
          l("Estrutura LSF", "200 mm", 200),
        ],
        bestFor: null,
      },
      {
        code: "CP3",
        title: "Cobertura verde (ajardinada)",
        subtitle: null,
        layers: [
          l("Vegetação e substrato", "60–120 mm", 90),
          l("Geotêxtil filtrante", "1 mm", 1),
          l("Manta anti-raiz", "1,2–2 mm", 2),
          l("Manta betuminosa", "4–5 mm", 5),
          l("OSB superior", "18 mm", 18),
          l("XPS", "80 mm", 80),
          l("OSB inferior", "18 mm", 18),
          l("Estrutura LSF", "200 mm", 200),
        ],
        bestFor: null,
      },
    ],
  },
  {
    key: "cobertura-inclinada",
    title: "Cobertura inclinada em LSF",
    subtitle: "Duas opções de revestimento",
    direction: "vertical",
    faces: ["Exterior", "Interior"],
    systems: [
      {
        code: "CI1",
        title: "Telha cerâmica",
        subtitle: null,
        // A folha do cliente não indica espessuras nesta família; as
        // proporções aqui servem só para o desenho ficar legível.
        layers: [
          l("Telha cerâmica", null, 30),
          l("Ripas de fixação", null, 20),
          l("Membrana respirável (impermeável ao vento e à água)", null, 6),
          l("OSB", null, 18),
          l("XPS (isolamento térmico)", null, 60),
          l("Estrutura LSF", null, 150),
          l("Placa de gesso (teto interior)", null, 13),
        ],
        bestFor: null,
      },
      {
        code: "CI2",
        title: "Telha sanduíche",
        subtitle: null,
        layers: [
          l("Telha sanduíche (painel metálico com isolamento)", null, 40),
          l("Fixações e acessórios", null, 10),
          l("Membrana de separação (opcional)", null, 6),
          l("OSB", null, 18),
          l("XPS (isolamento térmico)", null, 60),
          l("Estrutura LSF", null, 150),
          l("Placa de gesso (teto interior)", null, 13),
        ],
        bestFor: null,
      },
    ],
  },
];

/**
 * Cores das camadas. Repetem-se de propósito dentro de um sistema: servem
 * para ligar o número do desenho ao número da lista, não para codificar
 * material nenhum.
 */
export const LAYER_COLORS = [
  "#E11D48",
  "#F59E0B",
  "#10B981",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#F97316",
];
