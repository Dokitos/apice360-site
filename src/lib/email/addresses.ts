/**
 * Endereços de email no formato dos cabeçalhos: `Ápice 360 <geral@exemplo.pt>`
 * ou só `geral@exemplo.pt`.
 */

export type ParsedAddress = { name: string | null; address: string };

export function parseAddress(raw: string): ParsedAddress {
  const valor = raw.trim();
  const comNome = valor.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  if (comNome) {
    const nome = comNome[1].replace(/^["']|["']$/g, "").trim();
    return { name: nome || null, address: comNome[2].trim().toLowerCase() };
  }
  return { name: null, address: valor.toLowerCase() };
}

export function formatAddress(name: string | null | undefined, address: string): string {
  if (!name) return address;
  // Aspas quando o nome tem vírgulas ou parênteses, que de outra forma
  // partiriam o cabeçalho em dois endereços.
  const precisaAspas = /[",;:<>@()\[\]\\]/.test(name);
  return `${precisaAspas ? `"${name.replace(/"/g, '\\"')}"` : name} <${address}>`;
}

/**
 * Lista de destinatários escrita à mão: separada por vírgulas, ponto e vírgula
 * ou mudanças de linha, porque é assim que as pessoas colam endereços.
 */
export function parseAddressList(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(/[,;\n]+/)
    .map((parte) => parte.trim())
    .filter(Boolean)
    .map((parte) => parseAddress(parte).address);
}

const EMAIL = /^[^\s@]+@[^\s@.]+\.[^\s@]+$/;

export function isValidAddress(address: string): boolean {
  return EMAIL.test(address);
}

/** O que falha numa lista de destinatários, para o erro dizer qual é. */
export function invalidAddresses(addresses: string[]): string[] {
  return addresses.filter((a) => !isValidAddress(a));
}

export function domainOf(address: string): string {
  return address.split("@")[1]?.toLowerCase() ?? "";
}

/** "Ana Silva" a partir de um endereço sem nome, para a lista não ficar só com @. */
export function displayNameFor(name: string | null | undefined, address: string): string {
  return name?.trim() || address.split("@")[0] || address;
}
