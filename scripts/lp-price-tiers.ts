/**
 * Escalões de preço da landing page, num módulo próprio para o seed e os
 * scripts de manutenção lerem exactamente o mesmo conteúdo.
 */
export type TierLocale = "PT" | "EN" | "ES" | "FR";
type L = Record<TierLocale, string>;

/**
 * Os três escalões são uma transcrição do PDF do cliente
 * "Estimativa de Preço - Ápice 360" (€/m² + IVA): `description` vem do
 * campo "Indicado para" e `features` da lista "Características", ponto a
 * ponto e pela mesma ordem. Não resumir nem suavizar — se o cliente revir
 * os preços ou os acabamentos, é esse PDF que manda.
 */
export const PRICE_TIERS = [
  {
    key: "economica",
    pricePerM2: 1350,
    order: 0,
    isHighlighted: false,
    // Sem mealheiro: sugeria poupança/inferioridade em vez de "a casa essencial".
    iconName: "home",
    label: { PT: "Económica", EN: "Economy", ES: "Económica", FR: "Économique" } satisfies L,
    description: {
      PT: "Indicado para construções simples, práticas e funcionais.",
      EN: "For simple, practical and functional builds.",
      ES: "Para construcciones sencillas, prácticas y funcionales.",
      FR: "Pour des constructions simples, pratiques et fonctionnelles.",
    } satisfies L,
    features: {
      PT: "Arquitetura de linhas retas e volumetria simples\nTipologia térrea ou de fácil execução\nAcabamentos de gama média/baixa (PVP 20,00 €)\nPavimentos cerâmicos standard (PVP 20,00 €)\nCaixilharia em PVC standard, branca ou preto acetinado, com vidros duplos simples\nCozinha e roupeiros básicos, com portas em melamina\nEquipamentos de cozinha básicos, linha branca\nVMC — ventilação mecanizada de fluxo simples\nPré-instalação de ar condicionado\nCobertura plana impermeabilizada, não acessível\nValor previsto para uma única casa de banho",
      EN: "Straight lines and simple massing\nSingle-storey or easy-to-build layout\nMid/low range finishes (RRP €20.00)\nStandard ceramic flooring (RRP €20.00)\nStandard PVC frames, white or satin black, with plain double glazing\nBasic kitchen and wardrobes, melamine doors\nBasic kitchen appliances, white goods range\nCMV — single-flow mechanical ventilation\nAir-conditioning pre-installation\nWaterproofed flat roof, non-accessible\nPrice allows for a single bathroom",
      ES: "Arquitectura de líneas rectas y volumetría simple\nTipología de una planta o de fácil ejecución\nAcabados de gama media/baja (PVP 20,00 €)\nPavimentos cerámicos estándar (PVP 20,00 €)\nCarpintería de PVC estándar, blanca o negro satinado, con vidrios dobles simples\nCocina y armarios básicos, con puertas de melamina\nEquipamiento de cocina básico, línea blanca\nVMC — ventilación mecánica de flujo simple\nPreinstalación de aire acondicionado\nCubierta plana impermeabilizada, no transitable\nValor previsto para un solo baño",
      FR: "Architecture aux lignes droites et volumétrie simple\nTypologie de plain-pied ou d'exécution simple\nFinitions de gamme moyenne/basse (prix public 20,00 €)\nCarrelage standard (prix public 20,00 €)\nMenuiseries PVC standard, blanches ou noir satiné, double vitrage simple\nCuisine et placards basiques, portes en mélamine\nÉquipements de cuisine basiques, ligne blanche\nVMC — ventilation mécanique simple flux\nPré-installation de climatisation\nToiture-terrasse étanchée, non accessible\nMontant prévu pour une seule salle de bain",
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
      PT: "Indicado para moradias personalizadas com bom nível de conforto e design.",
      EN: "For custom homes with a good level of comfort and design.",
      ES: "Para viviendas personalizadas con buen nivel de confort y diseño.",
      FR: "Pour des maisons personnalisées avec un bon niveau de confort et de design.",
    } satisfies L,
    features: {
      PT: "Arquitetura moderna, com varandas ou volumes diferenciados\nRevestimentos de qualidade média: pavimento vinílico, cerâmicas retificadas (PVP 30,00 €)\nCaixilharias em PVC ou alumínio standard, vidros duplos térmicos, cor branca ou preto acetinado\nCozinha e roupeiros personalizados com portas lacadas à cor\nVMC — ventilação mecânica de duplo fluxo\nPré-instalação de ar condicionado\nCobertura plana acessível ou inclinada em telha cerâmica\nPré-instalação de energia fotovoltaica",
      EN: "Modern architecture, with balconies or distinct volumes\nMid-quality coverings: vinyl flooring, rectified ceramics (RRP €30.00)\nStandard PVC or aluminium frames, thermal double glazing, white or satin black\nCustom kitchen and wardrobes with colour-lacquered doors\nCMV — dual-flow mechanical ventilation\nAir-conditioning pre-installation\nAccessible flat roof or pitched roof in ceramic tile\nSolar power pre-installation",
      ES: "Arquitectura moderna, con balcones o volúmenes diferenciados\nRevestimientos de calidad media: pavimento vinílico, cerámicas rectificadas (PVP 30,00 €)\nCarpintería de PVC o aluminio estándar, vidrios dobles térmicos, blanco o negro satinado\nCocina y armarios personalizados con puertas lacadas al color\nVMC — ventilación mecánica de doble flujo\nPreinstalación de aire acondicionado\nCubierta plana transitable o inclinada con teja cerámica\nPreinstalación de energía fotovoltaica",
      FR: "Architecture moderne, avec balcons ou volumes différenciés\nRevêtements de qualité moyenne : sol vinyle, céramiques rectifiées (prix public 30,00 €)\nMenuiseries PVC ou aluminium standard, double vitrage thermique, blanc ou noir satiné\nCuisine et placards sur mesure avec portes laquées dans la couleur\nVMC — ventilation mécanique double flux\nPré-installation de climatisation\nToiture-terrasse accessible ou toiture inclinée en tuile céramique\nPré-installation photovoltaïque",
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
      PT: "Indicado para moradias de design sofisticado e alto padrão de acabamentos.",
      EN: "For homes with sophisticated design and a high standard of finishes.",
      ES: "Para viviendas de diseño sofisticado y alto nivel de acabados.",
      FR: "Pour des maisons au design sophistiqué et aux finitions haut de gamme.",
    } satisfies L,
    features: {
      PT: "Arquitetura complexa: vários níveis, terraços e fachadas diferenciadas\nAcabamentos premium: pedras naturais, madeira nobre, pavimentos contínuos (PVP 40,00 € ou superior)\nCaixilharias em alumínio premium minimalista, cores à escolha, vidros duplos térmicos de alto desempenho\nCozinha e roupeiros personalizados com portas lacadas à cor\nSistema AVAC completo, VMC e energia fotovoltaica\nIluminação embutida e detalhes de design de interiores",
      EN: "Complex architecture: multiple levels, terraces and varied façades\nPremium finishes: natural stone, hardwood, seamless flooring (RRP €40.00 or above)\nMinimalist premium aluminium frames, colours of your choice, high-performance thermal double glazing\nCustom kitchen and wardrobes with colour-lacquered doors\nFull HVAC system, CMV and solar power\nRecessed lighting and interior design detailing",
      ES: "Arquitectura compleja: varios niveles, terrazas y fachadas diferenciadas\nAcabados premium: piedras naturales, madera noble, pavimentos continuos (PVP 40,00 € o superior)\nCarpintería de aluminio premium minimalista, colores a elegir, vidrios dobles térmicos de alto rendimiento\nCocina y armarios personalizados con puertas lacadas al color\nSistema de climatización completo, VMC y energía fotovoltaica\nIluminación empotrada y detalles de diseño interior",
      FR: "Architecture complexe : plusieurs niveaux, terrasses et façades différenciées\nFinitions haut de gamme : pierres naturelles, bois noble, sols continus (prix public 40,00 € ou plus)\nMenuiseries aluminium premium minimalistes, couleurs au choix, double vitrage thermique haute performance\nCuisine et placards sur mesure avec portes laquées dans la couleur\nSystème CVC complet, VMC et énergie photovoltaïque\nÉclairage encastré et détails de design intérieur",
    } satisfies L,
  },
];
