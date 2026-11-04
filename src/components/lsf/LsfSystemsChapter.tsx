"use client";

import { useState } from "react";
import { LsfChapter } from "@/components/lsf/LsfChapter";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { getDictionary } from "@/lib/dictionary";
import type { SiteLocale } from "@/lib/locale";
import {
  LSF_ADVANTAGES,
  LSF_FAMILIES,
  LSF_HIGHLIGHTS,
  LSF_WHAT_IS,
  texto,
  type System,
  type SystemFamily,
} from "@/lib/lsf-systems";

type Props = {
  id: string;
  locale: SiteLocale;
  eyebrow: string | null;
  heading: string;
  subheading: string | null;
  position: { index: number; total: number };
};

/**
 * O "livro" das soluções construtivas: uma página de abertura com o resumo e
 * as vantagens, e depois uma página por família — paredes, pavimentos,
 * cobertura plana e cobertura inclinada.
 *
 * Cada solução mostra o corte desenhado pela empresa, com a numeração da
 * imagem a corresponder à da lista ao lado. Os nomes das camadas vêm
 * traduzidos de src/lib/lsf-systems.ts; o texto de interface, dos
 * dicionários, como no resto do site.
 */
export function LsfSystemsChapter({ id, locale, eyebrow, heading, subheading, position }: Props) {
  const t = getDictionary(locale).lsfPage;
  const paginas = ["resumo", ...LSF_FAMILIES.map((f) => f.key)];
  const [pagina, setPagina] = useState(0);
  const familia = pagina === 0 ? null : LSF_FAMILIES[pagina - 1];

  return (
    <LsfChapter id={id} tone="muted" height="auto">
      <div data-reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          {eyebrow ? (
            <span className="mb-3 block font-mono text-label-mono uppercase tracking-widest text-primary">
              {eyebrow}
            </span>
          ) : null}
          <h2 className="max-w-3xl font-heading text-headline-lg">{heading}</h2>
          {subheading ? <p className="mt-3 max-w-2xl text-on-surface-variant">{subheading}</p> : null}
        </div>
        <span className="font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
          {String(position.index).padStart(2, "0")} / {String(position.total).padStart(2, "0")}
        </span>
      </div>

      {/* Separadores do livro: a navegação principal em ecrã largo. */}
      <div data-reveal className="mb-6 flex flex-wrap gap-2">
        <Separador ativo={pagina === 0} onClick={() => setPagina(0)} icone="menu_book">
          {t.systemsWhatIsTab}
        </Separador>
        {LSF_FAMILIES.map((f, i) => (
          <Separador key={f.key} ativo={pagina === i + 1} onClick={() => setPagina(i + 1)}>
            {texto(f.tab, locale)}
          </Separador>
        ))}
      </div>

      <div
        data-reveal
        className="overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface shadow-[0_20px_60px_rgba(0,0,0,0.06)]"
      >
        <div className="p-6 md:p-10">
          {familia ? (
            <PaginaDaFamilia familia={familia} locale={locale} legenda={t.systemsSectionOf} />
          ) : (
            <PaginaDeAbertura locale={locale} />
          )}
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-outline-variant/20 bg-surface-container-lowest px-6 py-4">
          <button
            type="button"
            onClick={() => setPagina((p) => Math.max(0, p - 1))}
            disabled={pagina === 0}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold uppercase tracking-wide text-on-surface-variant transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Icon name="arrow_back" className="text-base" />
            {t.systemsPrevious}
          </button>
          <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
            {t.systemsPageOf(pagina + 1, paginas.length)}
          </span>
          <button
            type="button"
            onClick={() => setPagina((p) => Math.min(paginas.length - 1, p + 1))}
            disabled={pagina === paginas.length - 1}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold uppercase tracking-wide text-on-surface-variant transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
          >
            {t.systemsNext}
            <Icon name="arrow_forward" className="text-base" />
          </button>
        </div>
      </div>
    </LsfChapter>
  );
}

function Separador({
  ativo,
  onClick,
  icone,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  icone?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={cn(
        "flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors",
        ativo
          ? "border-primary bg-primary text-on-primary"
          : "border-outline-variant/40 text-on-surface-variant hover:border-primary hover:text-primary",
      )}
    >
      {icone ? <Icon name={icone} className="text-base" /> : null}
      {children}
    </button>
  );
}

function PaginaDeAbertura({ locale }: { locale: SiteLocale }) {
  const t = getDictionary(locale).lsfPage;

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
      <div>
        <h3 className="mb-4 font-heading text-headline-md">{t.systemsWhatIsHeading}</h3>
        <p className="mb-8 leading-relaxed text-on-surface-variant">{texto(LSF_WHAT_IS, locale)}</p>
        <div className="flex flex-wrap gap-3">
          {LSF_HIGHLIGHTS.map((destaque) => (
            <span
              key={destaque.icon}
              className="flex items-center gap-2 rounded-full bg-primary/5 px-4 py-2 text-sm text-on-surface"
            >
              <Icon name={destaque.icon} className="text-base text-primary" />
              {texto(destaque.label, locale)}
            </span>
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-4 font-heading text-headline-md">{t.systemsAdvantages}</h3>
        <ul className="space-y-3">
          {LSF_ADVANTAGES.map((vantagem) => (
            <li key={vantagem.PT} className="flex items-start gap-3">
              <Icon name="check_circle" className="mt-0.5 shrink-0 text-primary" />
              <span>{texto(vantagem, locale)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PaginaDaFamilia({
  familia,
  locale,
  legenda,
}: {
  familia: SystemFamily;
  locale: SiteLocale;
  legenda: (title: string) => string;
}) {
  return (
    <div>
      <div className="mb-8">
        <h3 className="font-heading text-headline-md">{texto(familia.title, locale)}</h3>
        <p className="mt-1 text-sm uppercase tracking-wide text-on-surface-variant">
          {texto(familia.subtitle, locale)}
        </p>
      </div>
      {/* Uma coluna por solução: com duas soluções numa grelha de quatro
          sobrava meia página em branco à direita. */}
      <div
        className={cn(
          "grid grid-cols-1 gap-6 md:grid-cols-2",
          familia.systems.length >= 4
            ? "xl:grid-cols-4"
            : familia.systems.length === 3
              ? "xl:grid-cols-3"
              : "xl:max-w-3xl",
        )}
      >
        {familia.systems.map((sistema) => (
          <CartaoDoSistema key={sistema.image} sistema={sistema} locale={locale} legenda={legenda} />
        ))}
      </div>
    </div>
  );
}

function CartaoDoSistema({
  sistema,
  locale,
  legenda,
}: {
  sistema: System;
  locale: SiteLocale;
  legenda: (title: string) => string;
}) {
  const titulo = texto(sistema.title, locale);

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest">
      <header className="border-b border-outline-variant/20 bg-surface p-4">
        <div className="flex items-start gap-2">
          {sistema.code ? (
            <span className="shrink-0 rounded-md bg-primary px-2 py-0.5 font-mono text-[11px] font-bold text-on-primary">
              {sistema.code}
            </span>
          ) : null}
          <h4 className="font-heading text-base font-bold leading-tight">{titulo}</h4>
        </div>
        {sistema.subtitle ? (
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
            {texto(sistema.subtitle, locale)}
          </p>
        ) : null}
      </header>

      <div className="p-4">
        {/* O corte da solução, recortado do infográfico da empresa. Os números
            desenhados na imagem são os mesmos da lista por baixo. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={sistema.image}
          srcSet={`${sistema.image} 1x, ${emDobro(sistema.image)} 2x`}
          alt={legenda(titulo)}
          loading="lazy"
          className="w-full rounded-lg border border-outline-variant/20 bg-white"
        />

        <ol className="mt-4 space-y-1.5">
          {sistema.layers.map((camada, i) => (
            <li key={camada.name.PT} className="flex items-baseline gap-2 text-xs">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-[9px] font-bold text-on-primary">
                {i + 1}
              </span>
              <span className="flex-1 leading-snug">{texto(camada.name, locale)}</span>
              {camada.thickness ? (
                <span className="shrink-0 font-mono text-[10px] text-on-surface-variant">
                  {camada.thickness}
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </div>

      {sistema.bestFor ? (
        <footer className="mt-auto border-t border-outline-variant/20 bg-primary/5 p-3 text-center">
          <p className="font-mono text-[10px] font-bold uppercase leading-snug tracking-wide text-primary">
            {texto(sistema.bestFor, locale)}
          </p>
        </footer>
      ) : null}
    </article>
  );
}

/**
 * O mesmo recorte ao dobro do tamanho, para ecrãs de alta densidade.
 *
 * Não tem mais detalhe do que o infográfico de origem; o que evita é a
 * ampliação do browser, que é bicúbica e sai visivelmente mais lavada do que
 * a reamostragem com que estes ficheiros foram feitos.
 */
function emDobro(caminho: string): string {
  return caminho.replace(/\.webp$/, "@2x.webp");
}
