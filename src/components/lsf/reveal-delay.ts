import type { CSSProperties } from "react";

/**
 * Espaçamento em cascata para a entrada dos elementos de um capítulo da
 * /lsf: cada filho entra um pouco depois do anterior.
 *
 * Vive num módulo sem "use client" de propósito — é chamada a partir dos
 * capítulos, que são componentes de servidor, e o React não deixa o
 * servidor invocar funções exportadas de um módulo de cliente.
 */
export function revealDelay(index: number, step = 90): CSSProperties {
  return { "--reveal-delay": `${index * step}ms` } as CSSProperties;
}
