/**
 * Casca do modo quiosque. Sem cabeçalho, sem rodapé e sem os botões
 * flutuantes do site: o tablet da loja só deve deixar fazer a simulação.
 */
export default function KioskLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
