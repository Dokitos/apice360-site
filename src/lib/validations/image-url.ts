import { z } from "zod";

/**
 * Regra única para os campos de imagem do painel.
 *
 * Um `z.string().url()` simples rejeita caminhos relativos, e metade do
 * conteúdo semeado aponta para ficheiros em /public ("/images/hero-bg.jpg").
 * O efeito era invisível até alguém abrir o registo: bastava carregar em
 * Guardar, sem tocar em nada, para o formulário recusar com "Indica um URL de
 * imagem válido." — e a imagem parecia não mudar nunca.
 *
 * Aceita, portanto, http(s) ou um caminho a começar numa única barra. Por
 * arrasto fecha também o que o `.url()` deixava passar: `javascript:` e
 * `data:` não correspondem ao padrão, e estes valores acabam num src de
 * <img> vindos do que um editor escreveu.
 */
const IMAGE_URL = /^(https?:\/\/[^/]|\/(?!\/))/i;
const MESSAGE = "Indica um URL de imagem válido (https://... ou /images/...).";

/** Campo de imagem obrigatório. */
export const imageUrl = z.string().trim().regex(IMAGE_URL, MESSAGE);

/** Campo de imagem opcional — aceita string vazia para o limpar. */
export const optionalImageUrl = z.string().trim().regex(IMAGE_URL, MESSAGE).optional().or(z.literal(""));
