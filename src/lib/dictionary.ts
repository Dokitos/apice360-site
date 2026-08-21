import type { SiteLocale } from "@/lib/locale";

// Hardcoded UI chrome strings (not CMS-editable content, which already has
// its own PT/EN translation tables — see src/lib/content.ts). Keep the PT
// values byte-identical to what shipped before this file existed.
const dictionary = {
  PT: {
    nav: {
      inicio: "Início",
      quemSomos: "Quem Somos",
      servicos: "Serviços",
      portfolio: "Portfólio",
      blog: "Blog de Construção",
      contactos: "Contactos",
      areaArquiteto: "Área do Arquiteto",
    },
    header: {
      orcamentoDefault: "Faça seu Orçamento",
      aTraduzir: "A traduzir a página...",
    },
    mobileNav: {
      abrirMenu: "Abrir menu",
      fecharMenu: "Fechar menu",
    },
    footer: {
      navegacao: "Navegação",
      servicos: "Serviços",
      legal: "Legal",
      privacidade: "Privacidade",
      lsf: "LSF",
      trabalheConnosco: "Trabalhe Connosco",
      areaDosArquitetos: "Área dos Arquitetos",
      orcamento: "Orçamento",
      descricaoDefault: "Construções em Light Steel Frame em Portugal. Cuidamos do seu projeto do início ao fim.",
      direitos: (year: number) => `© ${year} Ápice 360 — Construções em LSF.`,
      tagline: "Velocidade · Durabilidade · Qualidade",
      nifLabel: "NIF",
      creditsPrefix: "Desenvolvido por",
    },
    contactForm: {
      nomeCompleto: "Nome Completo",
      email: "Endereço de Email",
      telefone: "Número de Contacto",
      mensagem: "Mensagem",
      aEnviar: "A enviar...",
      enviar: "Enviar Contacto",
    },
    commentsSection: {
      comentarios: (n: number) => `Comentários (${n})`,
      nome: "Nome",
      email: "Email",
      corpo: "O teu comentário",
      aEnviar: "A enviar...",
      comentar: "Comentar",
    },
    quemSomos: {
      eyebrow: "Quem Somos",
      headingDefault: "Ápice 360: Nascidos para Solucionar a Insegurança da Construção.",
      historiaEyebrow: "A Nossa História",
      historiaHeadingDefault: "Fundação e Visão",
      metodoEyebrow: "O Nosso Método",
      metodoHeadingDefault: "Gestão 360° de Alto Desempenho",
      valoresEyebrow: "Valores",
      valoresHeadingDefault: "O que nos move",
      ctaHeading: "Está a Procurar Velocidade e Garantia?",
    },
    servicos: {
      eyebrow: "Serviços",
      headingDefault: "Construção em LSF, no modelo Chave na Mão.",
      modeloEyebrow: "O Nosso Modelo",
      modeloHeadingDefault: "Gestão Chave na Mão",
    },
    portfolio: {
      eyebrow: "Portfólio",
      heading: "O Nosso Portfólio: A Excelência da Ápice 360 em Imagens.",
      body: "Cada projeto é uma promessa cumprida. Veja em detalhe como a nossa equipa transforma projetos de elevado valor em obras prontas a viver ou a rentabilizar, com segurança e sem surpresas.",
      projetosDestaque: "Projetos de Alto Desempenho",
      lsfHeading: "LSF - Light Steel Frame",
    },
    portfolioDetail: {
      voltar: "Voltar ao Portfólio",
      nomeProjeto: "Nome do Projeto:",
      tipoServico: "Tipo de Serviço:",
      construcaoLsf: "Construção LSF - Chave na Mão",
      remodelacaoTotal: "Remodelação Total - Chave na Mão",
      desafioResolvido: "Desafio Resolvido:",
      metodologiaApice: "Metodologia Ápice:",
      resultado: "Resultado:",
      aprovacaoCliente: "Aprovação do Cliente:",
    },
    blog: {
      eyebrow: "Blog da Construção",
      heading: "Blog Ápice 360: Conhecimento de Construção em Alto Desempenho.",
      body: "O seu recurso especializado sobre LSF e gestão de projetos. Educamos o mercado para que possa investir com segurança e total confiança.",
      semArtigos: "Ainda não há artigos publicados.",
      lerArtigo: "Ler artigo →",
      lerMais: "Ler mais",
      voltar: "Voltar aos Artigos",
      artigosRelacionados: "Artigos Relacionados",
    },
    contacto: {
      eyebrow: "Contacto",
      heading: "Contacte a Ápice 360 e Inicie a Triagem do Seu Projeto.",
      body: "Para projetos de elevado valor, a comunicação eficiente e a segurança são fundamentais. Conecte-se diretamente com a nossa equipa de especialistas.",
      triagemHeadingDefault: "Triagem Rápida (Recomendado)",
      triagemBodyDefault:
        "Utilize o canal mais direto para iniciar a qualificação do seu projeto e falar com a equipa Comercial ou Arquiteta responsável.",
      emailHeading: "Se preferir, envie-nos um email",
      emailBody: "O seu projeto exige velocidade e garantia de qualidade na entrega? Envie-nos uma mensagem.",
      showroomHeading: "Conheça o Nosso Showroom",
      showroomBodyDefault: "Agende uma visita e conheça o nosso escritório e galpão de exposição.",
      seguranca: "Segurança",
      velocidade: "Velocidade",
      qualidade: "Qualidade",
    },
    areaArquiteto: {
      eyebrow: "Área do Arquiteto",
      headingDefault: "Uma Parceria Construída em Confiança e Especialização Técnica.",
      bodyDefault:
        "Trabalhamos lado a lado com gabinetes de arquitetura que partilham o nosso compromisso com a qualidade e a inovação construtiva. Se procura um parceiro de execução rigoroso para os seus projetos em LSF, fale connosco.",
      ctaHeading: "Vamos Construir Juntos o Próximo Projeto",
    },
    privacy: {
      bannerPrefix:
        "🍪 Usamos cookies e armazenamento local essenciais para o funcionamento do site, bem como ferramentas de analítica para compreender a utilização do site. Ao continuar a navegar, está a concordar com a nossa ",
      bannerLinkLabel: "Política de Privacidade",
      bannerSuffix: ".",
      reject: "Recusar",
      acceptAll: "Aceitar todos",
      pageEyebrow: "Privacidade",
      pageTitle: "Política de Privacidade e Cookies",
      rgpdNote: "Conforme o RGPD (Regulamento UE 2016/679)",
      sections: [
        {
          title: "Dados que recolhemos.",
          body: "Nome, e-mail, telefone/WhatsApp e informações sobre o seu projeto, fornecidos voluntariamente por si através do formulário de contacto, do simulador ou de conversas iniciadas pelo WhatsApp.",
        },
        {
          title: "Finalidade.",
          body: "Usamos estes dados exclusivamente para responder ao seu pedido, elaborar estudos de viabilidade e orçamentos, e apresentar os serviços da Ápice 360.",
        },
        {
          title: "Partilha.",
          body: "Não vendemos nem partilhamos os seus dados com terceiros para fins de marketing. Os dados só são partilhados quando exigido por lei ou necessário para prestar o serviço solicitado.",
        },
        {
          title: "Cookies e armazenamento local.",
          body: "Este site utiliza armazenamento local essencial para lembrar a sua escolha neste aviso de cookies.",
        },
        {
          title: "Dados de Analítica.",
          body: "Este site também recolhe dados analíticos sobre a utilização (como páginas visitadas, tempo de permanência e origem do acesso), através de ferramentas de analítica, com o objetivo de compreender e melhorar a experiência dos visitantes.",
        },
        {
          title: "Os seus direitos.",
          body: "A qualquer momento pode solicitar acesso, correção, portabilidade ou eliminação dos seus dados pessoais, contactando-nos pelo WhatsApp ou pelo e-mail geral@apice360.com.",
        },
      ],
      manageHeading: "Gerir Definições de Privacidade e Cookies",
      manageBody: "Pode alterar a sua escolha sobre cookies e armazenamento local a qualquer momento.",
      manageButton: "Gerir Preferências",
      manageConfirmation: "As suas preferências foram repostas. Escolha novamente no aviso no fundo da página.",
      deletionHeading: "Eliminação dos Seus Dados",
      deletionBody:
        "Para solicitar o acesso, a correção, a portabilidade ou a eliminação dos seus dados pessoais, contacte-nos através do email:",
      deletionEmail: "geral@apice360.com",
    },
    maintenance: {
      eyebrow: "Em breve",
      heading: "Estamos a melhorar o site.",
      body: "Voltamos em breve com novidades. Obrigado pela paciência.",
      contact: "Precisa de falar connosco entretanto?",
    },
  },
  EN: {
    nav: {
      inicio: "Home",
      quemSomos: "About Us",
      servicos: "Services",
      portfolio: "Portfolio",
      blog: "Construction Blog",
      contactos: "Contact",
      areaArquiteto: "For Architects",
    },
    header: {
      orcamentoDefault: "Get a Quote",
      aTraduzir: "Translating the page...",
    },
    mobileNav: {
      abrirMenu: "Open menu",
      fecharMenu: "Close menu",
    },
    footer: {
      navegacao: "Navigation",
      servicos: "Services",
      legal: "Legal",
      privacidade: "Privacy",
      lsf: "LSF",
      trabalheConnosco: "Work With Us",
      areaDosArquitetos: "For Architects",
      orcamento: "Get a Quote",
      descricaoDefault: "Light Steel Frame construction in Portugal. We take care of your project from start to finish.",
      direitos: (year: number) => `© ${year} Ápice 360 — LSF Construction.`,
      tagline: "Speed · Durability · Quality",
      nifLabel: "Tax ID",
      creditsPrefix: "Developed by",
    },
    contactForm: {
      nomeCompleto: "Full Name",
      email: "Email Address",
      telefone: "Phone Number",
      mensagem: "Message",
      aEnviar: "Sending...",
      enviar: "Send Message",
    },
    commentsSection: {
      comentarios: (n: number) => `Comments (${n})`,
      nome: "Name",
      email: "Email",
      corpo: "Your comment",
      aEnviar: "Sending...",
      comentar: "Comment",
    },
    quemSomos: {
      eyebrow: "About Us",
      headingDefault: "Ápice 360: Born to Solve Construction Uncertainty.",
      historiaEyebrow: "Our History",
      historiaHeadingDefault: "Founding and Vision",
      metodoEyebrow: "Our Method",
      metodoHeadingDefault: "360° High-Performance Management",
      valoresEyebrow: "Values",
      valoresHeadingDefault: "What drives us",
      ctaHeading: "Looking for Speed and Guarantee?",
    },
    servicos: {
      eyebrow: "Services",
      headingDefault: "LSF Construction, turnkey.",
      modeloEyebrow: "Our Model",
      modeloHeadingDefault: "Turnkey Management",
    },
    portfolio: {
      eyebrow: "Portfolio",
      heading: "Our Portfolio: The Excellence of Ápice 360 in Pictures.",
      body: "Every project is a promise kept. See in detail how our team turns high-value projects into homes ready to live in or generate income, safely and without surprises.",
      projetosDestaque: "High-Performance Projects",
      lsfHeading: "LSF - Light Steel Frame",
    },
    portfolioDetail: {
      voltar: "Back to Portfolio",
      nomeProjeto: "Project Name:",
      tipoServico: "Service Type:",
      construcaoLsf: "LSF Construction - Turnkey",
      remodelacaoTotal: "Full Renovation - Turnkey",
      desafioResolvido: "Challenge Solved:",
      metodologiaApice: "Ápice Methodology:",
      resultado: "Result:",
      aprovacaoCliente: "Client Approval:",
    },
    blog: {
      eyebrow: "Construction Blog",
      heading: "Ápice 360 Blog: High-Performance Construction Knowledge.",
      body: "Your specialized resource on LSF and project management. We educate the market so you can invest with security and full confidence.",
      semArtigos: "No articles published yet.",
      lerArtigo: "Read article →",
      lerMais: "Load more",
      voltar: "Back to Articles",
      artigosRelacionados: "Related Articles",
    },
    contacto: {
      eyebrow: "Contact",
      heading: "Contact Ápice 360 and Start Screening Your Project.",
      body: "For high-value projects, efficient communication and security are essential. Connect directly with our team of specialists.",
      triagemHeadingDefault: "Quick Screening (Recommended)",
      triagemBodyDefault:
        "Use the most direct channel to start qualifying your project and talk to our Sales or Architecture team.",
      emailHeading: "If you prefer, send us an email",
      emailBody: "Does your project demand speed and guaranteed delivery quality? Send us a message.",
      showroomHeading: "Visit Our Showroom",
      showroomBodyDefault: "Book a visit and see our office and exhibition space.",
      seguranca: "Security",
      velocidade: "Speed",
      qualidade: "Quality",
    },
    areaArquiteto: {
      eyebrow: "For Architects",
      headingDefault: "A Partnership Built on Trust and Technical Expertise.",
      bodyDefault:
        "We work side by side with architecture firms that share our commitment to quality and construction innovation. If you're looking for a rigorous execution partner for your LSF projects, talk to us.",
      ctaHeading: "Let's Build the Next Project Together",
    },
    privacy: {
      bannerPrefix:
        "🍪 We use essential cookies and local storage for the site to work, as well as analytics tools to understand how the site is used. By continuing to browse, you agree to our ",
      bannerLinkLabel: "Privacy Policy",
      bannerSuffix: ".",
      reject: "Reject",
      acceptAll: "Accept all",
      pageEyebrow: "Privacy",
      pageTitle: "Privacy & Cookie Policy",
      rgpdNote: "In compliance with GDPR (EU Regulation 2016/679)",
      sections: [
        {
          title: "Data we collect.",
          body: "Name, email, phone/WhatsApp number, and information about your project, voluntarily provided by you through the contact form, the simulator, or conversations started via WhatsApp.",
        },
        {
          title: "Purpose.",
          body: "We use this data exclusively to respond to your request, prepare feasibility studies and quotes, and present Ápice 360's services.",
        },
        {
          title: "Sharing.",
          body: "We do not sell or share your data with third parties for marketing purposes. Data is only shared when required by law or necessary to provide the requested service.",
        },
        {
          title: "Cookies and local storage.",
          body: "This site uses essential local storage to remember your choice in this cookie notice.",
        },
        {
          title: "Analytics data.",
          body: "This site also collects analytics data about usage (such as pages visited, time spent, and traffic source) through analytics tools, in order to understand and improve the visitor experience.",
        },
        {
          title: "Your rights.",
          body: "At any time you may request access, correction, portability, or deletion of your personal data by contacting us via WhatsApp or by email at geral@apice360.com.",
        },
      ],
      manageHeading: "Manage Privacy and Cookie Settings",
      manageBody: "You can change your choice about cookies and local storage at any time.",
      manageButton: "Manage Preferences",
      manageConfirmation: "Your preferences have been reset. Choose again in the notice at the bottom of the page.",
      deletionHeading: "Deleting Your Data",
      deletionBody:
        "To request access to, correction of, portability of, or deletion of your personal data, contact us at:",
      deletionEmail: "geral@apice360.com",
    },
    maintenance: {
      eyebrow: "Coming soon",
      heading: "We're making the site better.",
      body: "We'll be back shortly with news. Thanks for your patience.",
      contact: "Need to reach us in the meantime?",
    },
  },
  ES: {
    nav: {
      inicio: "Inicio",
      quemSomos: "Quiénes Somos",
      servicos: "Servicios",
      portfolio: "Portafolio",
      blog: "Blog de Construcción",
      contactos: "Contacto",
      areaArquiteto: "Área del Arquitecto",
    },
    header: {
      orcamentoDefault: "Solicite su Presupuesto",
      aTraduzir: "Traduciendo la página...",
    },
    mobileNav: {
      abrirMenu: "Abrir menú",
      fecharMenu: "Cerrar menú",
    },
    footer: {
      navegacao: "Navegación",
      servicos: "Servicios",
      legal: "Legal",
      privacidade: "Privacidad",
      lsf: "LSF",
      trabalheConnosco: "Trabaje con Nosotros",
      areaDosArquitetos: "Área de los Arquitectos",
      orcamento: "Presupuesto",
      descricaoDefault: "Construcciones en Light Steel Frame en Portugal. Cuidamos su proyecto de principio a fin.",
      direitos: (year: number) => `© ${year} Ápice 360 — Construcción en LSF.`,
      tagline: "Velocidad · Durabilidad · Calidad",
      nifLabel: "NIF",
      creditsPrefix: "Desarrollado por",
    },
    contactForm: {
      nomeCompleto: "Nombre Completo",
      email: "Dirección de Email",
      telefone: "Número de Contacto",
      mensagem: "Mensaje",
      aEnviar: "Enviando...",
      enviar: "Enviar Contacto",
    },
    commentsSection: {
      comentarios: (n: number) => `Comentarios (${n})`,
      nome: "Nombre",
      email: "Email",
      corpo: "Su comentario",
      aEnviar: "Enviando...",
      comentar: "Comentar",
    },
    quemSomos: {
      eyebrow: "Quiénes Somos",
      headingDefault: "Ápice 360: Nacidos para Resolver la Inseguridad en la Construcción.",
      historiaEyebrow: "Nuestra Historia",
      historiaHeadingDefault: "Fundación y Visión",
      metodoEyebrow: "Nuestro Método",
      metodoHeadingDefault: "Gestión 360° de Alto Rendimiento",
      valoresEyebrow: "Valores",
      valoresHeadingDefault: "Lo que nos mueve",
      ctaHeading: "¿Busca Velocidad y Garantía?",
    },
    servicos: {
      eyebrow: "Servicios",
      headingDefault: "Construcción en LSF, en modalidad Llave en Mano.",
      modeloEyebrow: "Nuestro Modelo",
      modeloHeadingDefault: "Gestión Llave en Mano",
    },
    portfolio: {
      eyebrow: "Portafolio",
      heading: "Nuestro Portafolio: La Excelencia de Ápice 360 en Imágenes.",
      body: "Cada proyecto es una promesa cumplida. Vea en detalle cómo nuestro equipo transforma proyectos de alto valor en obras listas para vivir o rentabilizar, con seguridad y sin sorpresas.",
      projetosDestaque: "Proyectos de Alto Rendimiento",
      lsfHeading: "LSF - Light Steel Frame",
    },
    portfolioDetail: {
      voltar: "Volver al Portafolio",
      nomeProjeto: "Nombre del Proyecto:",
      tipoServico: "Tipo de Servicio:",
      construcaoLsf: "Construcción LSF - Llave en Mano",
      remodelacaoTotal: "Remodelación Total - Llave en Mano",
      desafioResolvido: "Desafío Resuelto:",
      metodologiaApice: "Metodología Ápice:",
      resultado: "Resultado:",
      aprovacaoCliente: "Aprobación del Cliente:",
    },
    blog: {
      eyebrow: "Blog de Construcción",
      heading: "Blog Ápice 360: Conocimiento de Construcción de Alto Rendimiento.",
      body: "Su recurso especializado sobre LSF y gestión de proyectos. Formamos al mercado para que pueda invertir con seguridad y total confianza.",
      semArtigos: "Aún no hay artículos publicados.",
      lerArtigo: "Leer artículo →",
      lerMais: "Cargar más",
      voltar: "Volver a los Artículos",
      artigosRelacionados: "Artículos Relacionados",
    },
    contacto: {
      eyebrow: "Contacto",
      heading: "Contacte con Ápice 360 e Inicie la Evaluación de su Proyecto.",
      body: "Para proyectos de alto valor, la comunicación eficiente y la seguridad son fundamentales. Conéctese directamente con nuestro equipo de especialistas.",
      triagemHeadingDefault: "Evaluación Rápida (Recomendado)",
      triagemBodyDefault:
        "Utilice el canal más directo para iniciar la calificación de su proyecto y hablar con el equipo Comercial o de Arquitectura responsable.",
      emailHeading: "Si lo prefiere, envíenos un email",
      emailBody: "¿Su proyecto exige velocidad y garantía de calidad en la entrega? Envíenos un mensaje.",
      showroomHeading: "Conozca Nuestro Showroom",
      showroomBodyDefault: "Programe una visita y conozca nuestra oficina y espacio de exposición.",
      seguranca: "Seguridad",
      velocidade: "Velocidad",
      qualidade: "Calidad",
    },
    areaArquiteto: {
      eyebrow: "Área del Arquitecto",
      headingDefault: "Una Alianza Construida sobre Confianza y Especialización Técnica.",
      bodyDefault:
        "Trabajamos codo a codo con estudios de arquitectura que comparten nuestro compromiso con la calidad y la innovación constructiva. Si busca un socio de ejecución riguroso para sus proyectos en LSF, hable con nosotros.",
      ctaHeading: "Construyamos Juntos el Próximo Proyecto",
    },
    privacy: {
      bannerPrefix:
        "🍪 Utilizamos cookies y almacenamiento local esenciales para el funcionamiento del sitio, así como herramientas de analítica para comprender el uso del sitio. Al continuar navegando, acepta nuestra ",
      bannerLinkLabel: "Política de Privacidad",
      bannerSuffix: ".",
      reject: "Rechazar",
      acceptAll: "Aceptar todo",
      pageEyebrow: "Privacidad",
      pageTitle: "Política de Privacidad y Cookies",
      rgpdNote: "De acuerdo con el RGPD (Reglamento UE 2016/679)",
      sections: [
        {
          title: "Datos que recopilamos.",
          body: "Nombre, email, teléfono/WhatsApp e información sobre su proyecto, proporcionados voluntariamente por usted a través del formulario de contacto, el simulador o conversaciones iniciadas por WhatsApp.",
        },
        {
          title: "Finalidad.",
          body: "Utilizamos estos datos exclusivamente para responder a su solicitud, elaborar estudios de viabilidad y presupuestos, y presentar los servicios de Ápice 360.",
        },
        {
          title: "Compartición.",
          body: "No vendemos ni compartimos sus datos con terceros con fines de marketing. Los datos solo se comparten cuando lo exige la ley o es necesario para prestar el servicio solicitado.",
        },
        {
          title: "Cookies y almacenamiento local.",
          body: "Este sitio utiliza almacenamiento local esencial para recordar su elección en este aviso de cookies.",
        },
        {
          title: "Datos de Analítica.",
          body: "Este sitio también recopila datos analíticos sobre el uso (como páginas visitadas, tiempo de permanencia y origen del acceso), mediante herramientas de analítica, con el objetivo de comprender y mejorar la experiencia de los visitantes.",
        },
        {
          title: "Sus derechos.",
          body: "En cualquier momento puede solicitar acceso, corrección, portabilidad o eliminación de sus datos personales, contactándonos por WhatsApp o por email a geral@apice360.com.",
        },
      ],
      manageHeading: "Gestionar Ajustes de Privacidad y Cookies",
      manageBody: "Puede cambiar su elección sobre cookies y almacenamiento local en cualquier momento.",
      manageButton: "Gestionar Preferencias",
      manageConfirmation: "Sus preferencias han sido restablecidas. Elija de nuevo en el aviso al final de la página.",
      deletionHeading: "Eliminación de sus Datos",
      deletionBody:
        "Para solicitar el acceso, la corrección, la portabilidad o la eliminación de sus datos personales, contáctenos a través del email:",
      deletionEmail: "geral@apice360.com",
    },
    maintenance: {
      eyebrow: "Próximamente",
      heading: "Estamos mejorando el sitio.",
      body: "Volvemos pronto con novedades. Gracias por su paciencia.",
      contact: "¿Necesita hablar con nosotros mientras tanto?",
    },
  },
  FR: {
    nav: {
      inicio: "Accueil",
      quemSomos: "Qui Sommes-Nous",
      servicos: "Services",
      portfolio: "Portfolio",
      blog: "Blog Construction",
      contactos: "Contact",
      areaArquiteto: "Espace Architectes",
    },
    header: {
      orcamentoDefault: "Demander un Devis",
      aTraduzir: "Traduction de la page...",
    },
    mobileNav: {
      abrirMenu: "Ouvrir le menu",
      fecharMenu: "Fermer le menu",
    },
    footer: {
      navegacao: "Navigation",
      servicos: "Services",
      legal: "Mentions Légales",
      privacidade: "Confidentialité",
      lsf: "LSF",
      trabalheConnosco: "Travaillez avec Nous",
      areaDosArquitetos: "Espace Architectes",
      orcamento: "Devis",
      descricaoDefault: "Construction en Light Steel Frame au Portugal. Nous prenons soin de votre projet du début à la fin.",
      direitos: (year: number) => `© ${year} Ápice 360 — Construction LSF.`,
      tagline: "Rapidité · Durabilité · Qualité",
      nifLabel: "N° TVA",
      creditsPrefix: "Développé par",
    },
    contactForm: {
      nomeCompleto: "Nom Complet",
      email: "Adresse Email",
      telefone: "Numéro de Contact",
      mensagem: "Message",
      aEnviar: "Envoi en cours...",
      enviar: "Envoyer",
    },
    commentsSection: {
      comentarios: (n: number) => `Commentaires (${n})`,
      nome: "Nom",
      email: "Email",
      corpo: "Votre commentaire",
      aEnviar: "Envoi en cours...",
      comentar: "Commenter",
    },
    quemSomos: {
      eyebrow: "Qui Sommes-Nous",
      headingDefault: "Ápice 360 : Nés pour Résoudre l'Insécurité dans la Construction.",
      historiaEyebrow: "Notre Histoire",
      historiaHeadingDefault: "Fondation et Vision",
      metodoEyebrow: "Notre Méthode",
      metodoHeadingDefault: "Gestion 360° Haute Performance",
      valoresEyebrow: "Valeurs",
      valoresHeadingDefault: "Ce qui nous anime",
      ctaHeading: "Vous Recherchez Rapidité et Garantie ?",
    },
    servicos: {
      eyebrow: "Services",
      headingDefault: "Construction en LSF, clé en main.",
      modeloEyebrow: "Notre Modèle",
      modeloHeadingDefault: "Gestion Clé en Main",
    },
    portfolio: {
      eyebrow: "Portfolio",
      heading: "Notre Portfolio : L'Excellence d'Ápice 360 en Images.",
      body: "Chaque projet est une promesse tenue. Découvrez en détail comment notre équipe transforme des projets à forte valeur en réalisations prêtes à habiter ou à rentabiliser, en toute sécurité et sans surprises.",
      projetosDestaque: "Projets Haute Performance",
      lsfHeading: "LSF - Light Steel Frame",
    },
    portfolioDetail: {
      voltar: "Retour au Portfolio",
      nomeProjeto: "Nom du Projet :",
      tipoServico: "Type de Service :",
      construcaoLsf: "Construction LSF - Clé en Main",
      remodelacaoTotal: "Rénovation Complète - Clé en Main",
      desafioResolvido: "Défi Résolu :",
      metodologiaApice: "Méthodologie Ápice :",
      resultado: "Résultat :",
      aprovacaoCliente: "Approbation du Client :",
    },
    blog: {
      eyebrow: "Blog Construction",
      heading: "Blog Ápice 360 : Savoir-Faire en Construction Haute Performance.",
      body: "Votre ressource spécialisée sur le LSF et la gestion de projets. Nous formons le marché pour que vous puissiez investir en toute sécurité et en toute confiance.",
      semArtigos: "Aucun article publié pour l'instant.",
      lerArtigo: "Lire l'article →",
      lerMais: "Charger plus",
      voltar: "Retour aux Articles",
      artigosRelacionados: "Articles Similaires",
    },
    contacto: {
      eyebrow: "Contact",
      heading: "Contactez Ápice 360 et Lancez l'Évaluation de Votre Projet.",
      body: "Pour les projets à forte valeur, une communication efficace et la sécurité sont essentielles. Connectez-vous directement avec notre équipe de spécialistes.",
      triagemHeadingDefault: "Évaluation Rapide (Recommandé)",
      triagemBodyDefault:
        "Utilisez le canal le plus direct pour lancer la qualification de votre projet et parler à l'équipe Commerciale ou Architecture responsable.",
      emailHeading: "Si vous préférez, envoyez-nous un email",
      emailBody: "Votre projet exige-t-il rapidité et garantie de qualité de livraison ? Envoyez-nous un message.",
      showroomHeading: "Découvrez Notre Showroom",
      showroomBodyDefault: "Planifiez une visite et découvrez notre bureau et notre espace d'exposition.",
      seguranca: "Sécurité",
      velocidade: "Rapidité",
      qualidade: "Qualité",
    },
    areaArquiteto: {
      eyebrow: "Espace Architectes",
      headingDefault: "Un Partenariat Bâti sur la Confiance et l'Expertise Technique.",
      bodyDefault:
        "Nous travaillons main dans la main avec des cabinets d'architecture qui partagent notre engagement envers la qualité et l'innovation constructive. Si vous recherchez un partenaire d'exécution rigoureux pour vos projets en LSF, contactez-nous.",
      ctaHeading: "Construisons Ensemble le Prochain Projet",
    },
    privacy: {
      bannerPrefix:
        "🍪 Nous utilisons des cookies et un stockage local essentiels au fonctionnement du site, ainsi que des outils d'analyse pour comprendre l'utilisation du site. En continuant à naviguer, vous acceptez notre ",
      bannerLinkLabel: "Politique de Confidentialité",
      bannerSuffix: ".",
      reject: "Refuser",
      acceptAll: "Tout accepter",
      pageEyebrow: "Confidentialité",
      pageTitle: "Politique de Confidentialité et Cookies",
      rgpdNote: "Conformément au RGPD (Règlement UE 2016/679)",
      sections: [
        {
          title: "Données que nous collectons.",
          body: "Nom, email, téléphone/WhatsApp et informations sur votre projet, fournis volontairement par vous via le formulaire de contact, le simulateur ou des conversations initiées par WhatsApp.",
        },
        {
          title: "Finalité.",
          body: "Nous utilisons ces données exclusivement pour répondre à votre demande, élaborer des études de faisabilité et des devis, et présenter les services d'Ápice 360.",
        },
        {
          title: "Partage.",
          body: "Nous ne vendons ni ne partageons vos données avec des tiers à des fins marketing. Les données ne sont partagées que lorsque la loi l'exige ou que cela est nécessaire pour fournir le service demandé.",
        },
        {
          title: "Cookies et stockage local.",
          body: "Ce site utilise un stockage local essentiel pour mémoriser votre choix dans cet avis relatif aux cookies.",
        },
        {
          title: "Données Analytiques.",
          body: "Ce site collecte également des données analytiques sur l'utilisation (comme les pages visitées, le temps passé et l'origine de l'accès), via des outils d'analyse, afin de comprendre et d'améliorer l'expérience des visiteurs.",
        },
        {
          title: "Vos droits.",
          body: "Vous pouvez à tout moment demander l'accès, la rectification, la portabilité ou la suppression de vos données personnelles, en nous contactant par WhatsApp ou par email à geral@apice360.com.",
        },
      ],
      manageHeading: "Gérer les Paramètres de Confidentialité et Cookies",
      manageBody: "Vous pouvez modifier votre choix concernant les cookies et le stockage local à tout moment.",
      manageButton: "Gérer les Préférences",
      manageConfirmation: "Vos préférences ont été réinitialisées. Choisissez à nouveau dans l'avis en bas de page.",
      deletionHeading: "Suppression de Vos Données",
      deletionBody:
        "Pour demander l'accès, la rectification, la portabilité ou la suppression de vos données personnelles, contactez-nous par email :",
      deletionEmail: "geral@apice360.com",
    },
    maintenance: {
      eyebrow: "Bientôt disponible",
      heading: "Nous améliorons le site.",
      body: "De retour bientôt avec des nouveautés. Merci de votre patience.",
      contact: "Besoin de nous contacter en attendant ?",
    },
  },
} as const;

// Widens PT's inferred string/array literal types (from `as const`) back to
// plain string/array so this check compares *shape* (same keys at every
// level) across locales, not exact text — otherwise every locale's strings
// would need to literally match PT's, which defeats the purpose.
type Widen<T> = T extends readonly (infer U)[]
  ? readonly Widen<U>[]
  : T extends (...args: infer A) => infer R
    ? (...args: A) => R
    : T extends object
      ? { [K in keyof T]: Widen<T[K]> }
      : T extends string
        ? string
        : T;

// Compile-time check: EN/ES/FR must have every key PT has (missing keys fail
// to typecheck here instead of silently falling back at runtime).
type DictionaryShape = Widen<typeof dictionary.PT>;
const _localeShapeCheck: Record<SiteLocale, DictionaryShape> = dictionary;
void _localeShapeCheck;

export function getDictionary(locale: SiteLocale) {
  return dictionary[locale];
}

export type Dictionary = ReturnType<typeof getDictionary>;
