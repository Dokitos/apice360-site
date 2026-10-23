"use client";

import { useState } from "react";
import { LsfChapter } from "@/components/lsf/LsfChapter";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import {
  LSF_ADVANTAGES,
  LSF_FAMILIES,
  LSF_HIGHLIGHTS,
  LSF_STRUCTURE_IMAGE,
  LSF_WHAT_IS,
  type System,
  type SystemFamily,
} from "@/lib/lsf-systems";

type Props = {
  id: string;
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
 * Cada solução é desenhada camada a camada, com a espessura a mandar na
 * proporção do desenho, porque é isso que torna a informação legível: uma
 * lista de oito linhas com milímetros diz pouco a quem nunca viu uma parede
 * em corte. A escala é comprimida pela raiz quadrada — a olho, 150 mm ao
 * lado de 1 mm numa escala fiel faria a camada fina desaparecer.
 */
export function LsfSystemsChapter({ id, eyebrow, heading, subheading, position }: Props) {
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
          O que é
        </Separador>
        {LSF_FAMILIES.map((f, i) => (
          <Separador key={f.key} ativo={pagina === i + 1} onClick={() => setPagina(i + 1)}>
            {f.title.replace(" em LSF", "").replace(" — 200 mm", "")}
          </Separador>
        ))}
      </div>

      <div
        data-reveal
        className="overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface shadow-[0_20px_60px_rgba(0,0,0,0.06)]"
      >
        <div className="p-6 md:p-10">
          {familia ? <PaginaDaFamilia familia={familia} /> : <PaginaDeAbertura />}
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-outline-variant/20 bg-surface-container-lowest px-6 py-4">
          <button
            type="button"
            onClick={() => setPagina((p) => Math.max(0, p - 1))}
            disabled={pagina === 0}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold uppercase tracking-wide text-on-surface-variant transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Icon name="arrow_back" className="text-base" />
            Anterior
          </button>
          <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
            Página {pagina + 1} de {paginas.length}
          </span>
          <button
            type="button"
            onClick={() => setPagina((p) => Math.min(paginas.length - 1, p + 1))}
            disabled={pagina === paginas.length - 1}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold uppercase tracking-wide text-on-surface-variant transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
          >
            Seguinte
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

function PaginaDeAbertura() {
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
      <div>
        <h3 className="mb-4 font-heading text-headline-md">O que é o LSF?</h3>
        <p className="mb-6 leading-relaxed text-on-surface-variant">{LSF_WHAT_IS}</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={LSF_STRUCTURE_IMAGE}
          alt="Estrutura em Light Steel Frame de uma moradia de dois pisos"
          className="mb-8 w-full rounded-lg border border-outline-variant/20"
        />
        <div className="flex flex-wrap gap-3">
          {LSF_HIGHLIGHTS.map((destaque) => (
            <span
              key={destaque.label}
              className="flex items-center gap-2 rounded-full bg-primary/5 px-4 py-2 text-sm text-on-surface"
            >
              <Icon name={destaque.icon} className="text-base text-primary" />
              {destaque.label}
            </span>
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-4 font-heading text-headline-md">Principais vantagens</h3>
        <ul className="space-y-3">
          {LSF_ADVANTAGES.map((vantagem) => (
            <li key={vantagem} className="flex items-start gap-3">
              <Icon name="check_circle" className="mt-0.5 shrink-0 text-primary" />
              <span>{vantagem}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PaginaDaFamilia({ familia }: { familia: SystemFamily }) {
  return (
    <div>
      <div className="mb-8">
        <h3 className="font-heading text-headline-md">{familia.title}</h3>
        <p className="mt-1 text-sm uppercase tracking-wide text-on-surface-variant">{familia.subtitle}</p>
      </div>
      {/* Uma coluna por solução: com duas soluções numa grelha de quatro
          sobrava meia página em branco à direita. */}
      <div
        className={cn(
          "grid grid-cols-1 gap-6 md:grid-cols-2",
          familia.systems.length >= 4 ? "xl:grid-cols-4" : familia.systems.length === 3 ? "xl:grid-cols-3" : "xl:max-w-3xl",
        )}
      >
        {familia.systems.map((sistema) => (
          <CartaoDoSistema key={sistema.title} sistema={sistema} />
        ))}
      </div>
    </div>
  );
}

function CartaoDoSistema({ sistema }: { sistema: System }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest">
      <header className="border-b border-outline-variant/20 bg-surface p-4">
        <div className="flex items-start gap-2">
          {sistema.code ? (
            <span className="shrink-0 rounded-md bg-primary px-2 py-0.5 font-mono text-[11px] font-bold text-on-primary">
              {sistema.code}
            </span>
          ) : null}
          <h4 className="font-heading text-base font-bold leading-tight">{sistema.title}</h4>
        </div>
        {sistema.subtitle ? (
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
            {sistema.subtitle}
          </p>
        ) : null}
      </header>

      <div className="p-4">
        {/* O corte da solução, recortado do infográfico da empresa. Os números
            desenhados na imagem são os mesmos da lista por baixo.
            eslint-disable-next-line @next/next/no-img-element */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={sistema.image}
          alt={`Corte de ${sistema.title.toLowerCase()}, camada a camada`}
          loading="lazy"
          className="w-full rounded-lg border border-outline-variant/20 bg-white"
        />

        <ol className="mt-4 space-y-1.5">
          {sistema.layers.map((camada, i) => (
            <li key={camada.name} className="flex items-baseline gap-2 text-xs">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-[9px] font-bold text-on-primary">
                {i + 1}
              </span>
              <span className="flex-1 leading-snug">{camada.name}</span>
              {camada.thickness ? (
                <span className="shrink-0 font-mono text-[10px] text-on-surface-variant">{camada.thickness}</span>
              ) : null}
            </li>
          ))}
        </ol>
      </div>

      {sistema.bestFor ? (
        <footer className="mt-auto border-t border-outline-variant/20 bg-primary/5 p-3 text-center">
          <p className="font-mono text-[10px] font-bold uppercase leading-snug tracking-wide text-primary">
            {sistema.bestFor}
          </p>
        </footer>
      ) : null}
    </article>
  );
}
