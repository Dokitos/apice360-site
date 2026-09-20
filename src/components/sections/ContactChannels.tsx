import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import { getDictionary } from "@/lib/dictionary";
import type { SiteLocale } from "@/lib/locale";

type Settings = {
  phone?: string | null;
  email?: string | null;
  whatsappCommercial?: string | null;
  whatsappGeneral?: string | null;
  addressLine?: string | null;
  addressCity?: string | null;
} | null;

/**
 * Faixa com os canais de contacto, logo abaixo da introdução.
 *
 * Aquela zona da página era só um título e um parágrafo com um vazio enorme
 * por baixo. Isto preenche-a com o que alguém procura numa página de
 * contactos — telefone, email, WhatsApp e morada — e cada cartão é uma
 * ligação directa, não texto para copiar à mão.
 *
 * Tudo vem das Definições do Site: quem não tiver um dos valores preenchido
 * simplesmente não mostra esse cartão, em vez de ficar com um espaço morto.
 */
/**
 * "https://wa.me/351924107846?text=..." → "+351 924 107 846"
 *
 * Só agrupa em três os números portugueses, que têm nove dígitos depois do
 * indicativo. Aplicar a mesma regra a um número estrangeiro dava coisas como
 * "+551 199 999 888 8" — nesses casos mostra-se o número sem agrupar, que
 * está sempre certo.
 */
function numeroDoWhatsapp(url: string): string | null {
  const digitos = url.match(/wa\.me\/(\d{6,15})/)?.[1];
  if (!digitos) return null;
  if (digitos.startsWith("351") && digitos.length === 12) {
    const n = digitos.slice(3);
    return `+351 ${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}`;
  }
  return `+${digitos}`;
}

export function ContactChannels({ settings, locale }: { settings: Settings; locale: SiteLocale }) {
  const dict = getDictionary(locale);
  const t = dict.contacto.canais;
  const whatsapp = settings?.whatsappCommercial ?? settings?.whatsappGeneral ?? null;
  const morada = [settings?.addressLine, settings?.addressCity].filter(Boolean).join(", ");

  const canais = [
    settings?.phone && {
      icon: "call",
      label: t.telefone,
      value: settings.phone,
      note: t.telefoneNota,
      href: `tel:${settings.phone.replace(/\s+/g, "")}`,
    },
    whatsapp && {
      icon: "chat",
      label: t.whatsapp,
      // O número vive dentro do link (wa.me/351...). Mostrá-lo mantém o
      // cartão com a mesma leitura dos outros: valor em cima, nota em baixo.
      value: numeroDoWhatsapp(whatsapp) ?? t.whatsappNota,
      note: numeroDoWhatsapp(whatsapp) ? t.whatsappNota : null,
      href: whatsapp,
      externo: true,
    },
    settings?.email && {
      icon: "mail",
      label: t.email,
      value: settings.email,
      note: t.emailNota,
      href: `mailto:${settings.email}`,
    },
    morada && {
      icon: "location_on",
      label: t.morada,
      value: morada,
      note: t.moradaNota,
      href: null,
    },
  ].filter(Boolean) as {
    icon: string;
    label: string;
    value: string;
    note: string | null;
    href: string | null;
    externo?: boolean;
  }[];

  if (canais.length === 0) return null;

  return (
    <Reveal as="section" className="bg-surface-container-lowest pb-24">
      <div className="mx-auto max-w-site px-5 md:px-20">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {canais.map((canal) => {
            const conteudo = (
              <>
                <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-on-primary">
                  <Icon name={canal.icon} />
                </span>
                <span className="mb-1 block font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
                  {canal.label}
                </span>
                <span className="block font-heading text-lg font-bold text-on-surface">{canal.value}</span>
                {canal.note ? (
                  <span className="mt-1 block text-sm text-on-surface-variant">{canal.note}</span>
                ) : null}
              </>
            );

            const classes =
              "group flex h-full flex-col rounded-2xl border border-outline-variant/20 bg-surface p-8 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_18px_50px_-18px_rgba(255,106,19,0.35)]";

            return canal.href ? (
              <a
                key={canal.label}
                href={canal.href}
                {...(canal.externo ? { target: "_blank", rel: "noreferrer" } : {})}
                className={classes}
              >
                {conteudo}
              </a>
            ) : (
              <div key={canal.label} className={classes}>
                {conteudo}
              </div>
            );
          })}
        </div>
      </div>
    </Reveal>
  );
}
