import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { RichText } from "@/components/ui/RichText";
import { LsfChapter } from "@/components/lsf/LsfChapter";
import { revealDelay } from "@/components/lsf/reveal-delay";
import { LsfChapterMarker } from "@/components/lsf/LsfDeck";
import { getDictionary } from "@/lib/dictionary";
import type { SiteLocale } from "@/lib/locale";

export type LsfSectionItem = {
  id: string;
  iconName: string | null;
  imageUrl: string | null;
  numberLabel: string | null;
  title: string;
  body: string | null;
};

export type LsfSection = {
  key: string;
  imageUrl: string | null;
  iconName: string | null;
  eyebrow: string | null;
  heading: string | null;
  subheading: string | null;
  body: string | null;
  ctaLabel: string | null;
  items: LsfSectionItem[];
};

type ChapterPosition = { locale: SiteLocale; index: number; total: number };

/** Cabeçalho comum a quase todos os capítulos: sobrancelha + título + entrada. */
function ChapterHeading({
  eyebrow,
  heading,
  subheading,
  align = "left",
  tone = "light",
}: {
  eyebrow?: string | null;
  heading?: string | null;
  subheading?: string | null;
  align?: "left" | "center";
  tone?: "light" | "ink";
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
      {eyebrow ? (
        <span
          data-reveal
          style={revealDelay(0)}
          className="mb-4 block font-mono text-label-mono uppercase tracking-[0.25em] text-primary"
        >
          {eyebrow}
        </span>
      ) : null}
      {heading ? (
        <h2 data-reveal style={revealDelay(1)} className="font-heading text-headline-lg leading-tight">
          {heading}
        </h2>
      ) : null}
      {subheading ? (
        <p
          data-reveal
          style={revealDelay(2)}
          className={cn(
            "mt-6 text-body-lg leading-relaxed",
            tone === "ink" ? "text-white/80" : "text-on-surface-variant",
          )}
        >
          {subheading}
        </p>
      ) : null}
    </div>
  );
}

/** Capítulo de abertura: fotografia a toda a largura com o título por cima. */
export function LsfHeroChapter({
  section,
  locale,
  total,
}: {
  section: LsfSection;
  locale: SiteLocale;
  total: number;
}) {
  const dict = getDictionary(locale);

  return (
    <LsfChapter id="lsf-hero" tone="ink" className="!px-0 !py-0">
      <div className="absolute inset-0 z-0">
        {section.imageUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${section.imageUrl})` }}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/40" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-76px)] w-full max-w-site flex-col justify-center px-5 py-24 md:px-20">
        {section.eyebrow ? (
          <span
            data-reveal
            style={revealDelay(0)}
            className="mb-6 inline-block w-fit bg-primary px-4 py-1.5 font-mono text-label-mono uppercase tracking-[0.3em] text-on-primary"
          >
            {section.eyebrow}
          </span>
        ) : null}

        <h1
          data-reveal
          style={revealDelay(1)}
          className="max-w-4xl font-heading text-[2.5rem] leading-[1.05] text-white md:text-headline-xl"
        >
          {section.heading}
        </h1>

        {section.subheading ? (
          <p data-reveal style={revealDelay(2)} className="mt-8 max-w-2xl text-body-lg leading-relaxed text-white/85">
            {section.subheading}
          </p>
        ) : null}

        <div data-reveal style={revealDelay(3)} className="mt-16 flex items-center gap-4 text-white/70">
          <Icon name="keyboard_double_arrow_down" className="animate-bounce-slow text-2xl text-primary" />
          <span className="font-mono text-[10px] uppercase tracking-[0.25em]">{dict.lsfPage.scrollHint}</span>
          <span className="ml-auto hidden font-mono text-[10px] uppercase tracking-[0.25em] sm:block">
            {dict.lsfPage.chapterOf(1, total)}
          </span>
        </div>
      </div>
    </LsfChapter>
  );
}

/**
 * Capítulo de texto: título grande, corpo e — se houver — uma imagem ao lado
 * e destaques curtos por baixo. É o formato de leitura da página.
 */
export function LsfStatementChapter({
  section,
  position,
  tone = "light",
  reverse = false,
}: {
  section: LsfSection;
  position: ChapterPosition;
  tone?: "light" | "muted" | "ink";
  reverse?: boolean;
}) {
  const hasImage = Boolean(section.imageUrl);

  return (
    <LsfChapter id={`lsf-${section.key}`} tone={tone}>
      <div className={cn("flex flex-col gap-12", hasImage && "lg:flex-row lg:items-center lg:gap-20")}>
        <div className={cn(hasImage && "lg:w-1/2", reverse && "lg:order-2")}>
          <ChapterHeading
            eyebrow={section.eyebrow}
            heading={section.heading}
            subheading={section.subheading}
            tone={tone === "ink" ? "ink" : "light"}
          />
          {section.body ? (
            <div data-reveal style={revealDelay(3)} className="mt-8 max-w-2xl">
              <RichText
                html={section.body}
                className={tone === "ink" ? "text-white/75" : "text-on-surface-variant"}
              />
            </div>
          ) : null}
        </div>

        {hasImage ? (
          <div data-reveal style={revealDelay(2)} className={cn("lg:w-1/2", reverse && "lg:order-1")}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={section.imageUrl as string}
              alt=""
              className="h-[280px] w-full rounded-2xl object-cover shadow-2xl md:h-[440px]"
            />
          </div>
        ) : null}
      </div>

      {section.items.length > 0 ? (
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {section.items.map((item, i) => (
            <div
              key={item.id}
              data-reveal
              style={revealDelay(i + 4)}
              className={cn(
                "rounded-2xl border p-6",
                tone === "ink" ? "border-white/15 bg-white/5" : "border-outline-variant/40 bg-surface-container-lowest",
              )}
            >
              {item.iconName ? <Icon name={item.iconName} className="mb-3 text-2xl text-primary" /> : null}
              <h3 className="font-heading text-base font-bold">{item.title}</h3>
              {item.body ? (
                <p
                  className={cn(
                    "mt-2 text-sm leading-relaxed",
                    tone === "ink" ? "text-white/70" : "text-on-surface-variant",
                  )}
                >
                  {item.body}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      <LsfChapterMarker
        locale={position.locale}
        current={position.index}
        total={position.total}
        className="mt-12 block"
      />
    </LsfChapter>
  );
}

/** Grelha de cartões com ícone — usada nos benefícios e nos factos técnicos. */
export function LsfCardsChapter({
  section,
  position,
  tone = "muted",
  columns = 3,
  showNumbers = false,
}: {
  section: LsfSection;
  position: ChapterPosition;
  tone?: "light" | "muted" | "ink";
  columns?: 2 | 3;
  showNumbers?: boolean;
}) {
  return (
    <LsfChapter id={`lsf-${section.key}`} tone={tone} height={section.items.length > 6 ? "auto" : "full"}>
      <ChapterHeading
        eyebrow={section.eyebrow}
        heading={section.heading}
        subheading={section.subheading}
        align="center"
        tone={tone === "ink" ? "ink" : "light"}
      />

      <div
        className={cn(
          "mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2",
          columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2",
        )}
      >
        {section.items.map((item, i) => (
          <div
            key={item.id}
            data-reveal
            style={revealDelay(i + 3)}
            className={cn(
              "flex flex-col rounded-2xl border p-8 transition-transform hover:-translate-y-1",
              tone === "ink"
                ? "border-white/15 bg-white/5"
                : "border-outline-variant/40 bg-surface shadow-[0_1px_3px_rgba(23,24,26,0.06)]",
            )}
          >
            {showNumbers && item.numberLabel ? (
              <span className="mb-2 font-heading text-headline-lg font-bold leading-none text-primary">
                {item.numberLabel}
              </span>
            ) : item.iconName ? (
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Icon name={item.iconName} className="text-2xl text-primary" />
              </span>
            ) : null}

            <h3 className="font-heading text-lg font-bold leading-tight">{item.title}</h3>
            {item.body ? (
              <p
                className={cn(
                  "mt-3 text-sm leading-relaxed",
                  tone === "ink" ? "text-white/70" : "text-on-surface-variant",
                )}
              >
                {item.body}
              </p>
            ) : null}
          </div>
        ))}
      </div>

      <LsfChapterMarker
        locale={position.locale}
        current={position.index}
        total={position.total}
        className="mt-12 block text-center"
      />
    </LsfChapter>
  );
}

/**
 * Corte de uma parede LSF, camada a camada. Cada item da secção é uma
 * camada: o `numberLabel` serve de espessura indicativa e o corpo explica
 * a função. As camadas entram da esquerda, uma a uma.
 */
export function LsfAnatomyChapter({
  section,
  position,
}: {
  section: LsfSection;
  position: ChapterPosition;
}) {
  const layerTones = [
    "bg-surface-container-high",
    "bg-primary/15",
    "bg-primary/30",
    "bg-primary/50",
    "bg-primary/70",
    "bg-primary",
  ];

  return (
    <LsfChapter id={`lsf-${section.key}`} tone="light" height="auto">
      <ChapterHeading eyebrow={section.eyebrow} heading={section.heading} subheading={section.subheading} />

      <div className="mt-14 flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">
        {/* Corte esquemático: barras empilhadas do interior para o exterior. */}
        <div data-reveal style={revealDelay(3)} className="lg:w-1/3">
          <div className="flex h-16 w-full overflow-hidden rounded-xl border border-outline-variant/40 lg:h-[420px] lg:w-full lg:flex-col">
            {section.items.map((item, i) => (
              <div
                key={item.id}
                title={item.title}
                className={cn(
                  "flex flex-1 items-center justify-center font-mono text-[10px] font-bold",
                  // A partir do meio da pilha o fundo já é escuro o suficiente
                  // para o número precisar de contraste invertido.
                  i >= 4 ? "text-white/90" : "text-on-surface/50",
                  layerTones[i % layerTones.length],
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
            ))}
          </div>
          <p className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
            <span>{section.items[0]?.title}</span>
            <span>{section.items[section.items.length - 1]?.title}</span>
          </p>
        </div>

        <ol className="flex-1 space-y-5">
          {section.items.map((item, i) => (
            <li
              key={item.id}
              data-reveal
              style={revealDelay(i + 4)}
              className="flex gap-5 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5"
            >
              <span
                className={cn(
                  "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold",
                  i === 0 ? "bg-primary text-on-primary" : "bg-primary/10 text-primary",
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-heading text-base font-bold">
                  {item.title}
                  {item.numberLabel ? (
                    <span className="ml-2 font-mono text-xs font-normal text-on-surface-variant">
                      {item.numberLabel}
                    </span>
                  ) : null}
                </h3>
                {item.body ? (
                  <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">{item.body}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </div>

      <LsfChapterMarker locale={position.locale} current={position.index} total={position.total} className="mt-12 block" />
    </LsfChapter>
  );
}

/** As quatro fases do processo, em linha do tempo numerada. */
export function LsfProcessChapter({
  section,
  position,
}: {
  section: LsfSection;
  position: ChapterPosition;
}) {
  return (
    <LsfChapter id={`lsf-${section.key}`} tone="ink" height="auto">
      <ChapterHeading
        eyebrow={section.eyebrow}
        heading={section.heading}
        subheading={section.subheading}
        tone="ink"
      />

      <div className="relative mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
        {section.items.map((item, i) => (
          <div key={item.id} data-reveal style={revealDelay(i + 3)} className="relative">
            <div className="mb-5 flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-xl font-bold text-on-primary shadow-[0_0_24px_rgba(255,106,19,0.45)]">
                {item.numberLabel ?? i + 1}
              </span>
              {/* Fio que liga as fases; some na última e nos ecrãs empilhados. */}
              {i < section.items.length - 1 ? (
                <span className="hidden h-px flex-1 bg-white/20 xl:block" />
              ) : null}
            </div>
            <h3 className="font-heading text-lg font-bold">{item.title}</h3>
            {item.body ? <p className="mt-3 text-sm leading-relaxed text-white/70">{item.body}</p> : null}
          </div>
        ))}
      </div>

      <LsfChapterMarker locale={position.locale} current={position.index} total={position.total} className="mt-16 block" />
    </LsfChapter>
  );
}

/**
 * "Para quem faz sentido / para quem talvez não." Os itens da secção são
 * repartidos pelo `numberLabel`: "nao" cai na coluna da direita, tudo o
 * resto na da esquerda.
 */
export function LsfFitChapter({
  section,
  position,
}: {
  section: LsfSection;
  position: ChapterPosition;
}) {
  const dict = getDictionary(position.locale);
  const isNo = (item: LsfSectionItem) => (item.numberLabel ?? "").trim().toLowerCase() === "nao";
  const yes = section.items.filter((item) => !isNo(item));
  const no = section.items.filter(isNo);

  const columns = [
    { key: "yes", title: dict.lsfPage.fitYes, items: yes, icon: "check_circle", accent: true },
    { key: "no", title: dict.lsfPage.fitNo, items: no, icon: "remove_circle_outline", accent: false },
  ].filter((column) => column.items.length > 0);

  return (
    <LsfChapter id={`lsf-${section.key}`} tone="muted" height="auto">
      <ChapterHeading
        eyebrow={section.eyebrow}
        heading={section.heading}
        subheading={section.subheading}
        align="center"
      />

      <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {columns.map((column, columnIndex) => (
          <div
            key={column.key}
            data-reveal
            style={revealDelay(columnIndex + 3)}
            className={cn(
              "rounded-2xl border p-8",
              column.accent ? "border-primary/30 bg-primary/5" : "border-outline-variant/40 bg-surface",
            )}
          >
            <h3
              className={cn(
                "mb-6 font-heading text-lg font-bold",
                column.accent ? "text-primary" : "text-on-surface-variant",
              )}
            >
              {column.title}
            </h3>
            <ul className="space-y-4">
              {column.items.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <Icon
                    name={item.iconName ?? column.icon}
                    className={cn("mt-0.5 shrink-0 text-lg", column.accent ? "text-primary" : "text-on-surface-variant/60")}
                  />
                  <div>
                    <p className="font-medium leading-snug">{item.title}</p>
                    {item.body ? (
                      <p className="mt-1 text-sm text-on-surface-variant">{item.body}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {section.body ? (
        <div data-reveal style={revealDelay(6)} className="mx-auto mt-12 max-w-2xl text-center">
          <RichText html={section.body} className="text-on-surface-variant" />
        </div>
      ) : null}

      <LsfChapterMarker
        locale={position.locale}
        current={position.index}
        total={position.total}
        className="mt-12 block text-center"
      />
    </LsfChapter>
  );
}

/** Erros comuns na escolha do sistema construtivo, em cartões numerados. */
export function LsfMistakesChapter({
  section,
  position,
}: {
  section: LsfSection;
  position: ChapterPosition;
}) {
  return (
    <LsfChapter id={`lsf-${section.key}`} tone="light" height="auto">
      <ChapterHeading eyebrow={section.eyebrow} heading={section.heading} subheading={section.subheading} />

      <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {section.items.map((item, i) => (
          <div
            key={item.id}
            data-reveal
            style={revealDelay(i + 3)}
            className="relative overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-8"
          >
            <span className="pointer-events-none absolute -right-2 -top-6 font-heading text-[6rem] font-bold leading-none text-primary/10">
              {i + 1}
            </span>
            <Icon name={item.iconName ?? "highlight_off"} className="mb-4 text-3xl text-primary" />
            <h3 className="relative font-heading text-lg font-bold leading-tight">{item.title}</h3>
            {item.body ? (
              <p className="relative mt-3 text-sm leading-relaxed text-on-surface-variant">{item.body}</p>
            ) : null}
          </div>
        ))}
      </div>

      <LsfChapterMarker locale={position.locale} current={position.index} total={position.total} className="mt-12 block" />
    </LsfChapter>
  );
}

/** Capítulo final: convite para falar com a equipa. */
export function LsfCtaChapter({
  section,
  position,
  cta,
}: {
  section: LsfSection;
  position: ChapterPosition;
  cta?: { label: string; url: string; iconName?: string | null } | null;
}) {
  return (
    <LsfChapter id={`lsf-${section.key}`} tone="ink">
      <div className="mx-auto max-w-3xl text-center">
        <ChapterHeading
          eyebrow={section.eyebrow}
          heading={section.heading}
          subheading={section.subheading}
          align="center"
          tone="ink"
        />

        {section.body ? (
          <div data-reveal style={revealDelay(3)} className="mt-8">
            <RichText html={section.body} className="text-white/75" />
          </div>
        ) : null}

        {cta ? (
          <div data-reveal style={revealDelay(4)} className="mt-12">
            <Button href={cta.url} variant="cta" size="lg" icon={cta.iconName ?? "bolt"}>
              {section.ctaLabel ?? cta.label}
            </Button>
          </div>
        ) : null}

        <LsfChapterMarker
          locale={position.locale}
          current={position.index}
          total={position.total}
          className="mt-16 block"
        />
      </div>
    </LsfChapter>
  );
}
