import { NextResponse, type NextRequest } from "next/server";
import { list, BlobError } from "@vercel/blob";
import { requireEditorOrAdmin, UnauthorizedError } from "@/lib/permissions";

/**
 * Lista o que já está no armazenamento, para o painel poder reaproveitar uma
 * imagem em vez de a enviar outra vez.
 *
 * O Blob devolve as entradas por ordem alfabética do caminho, e os ficheiros
 * têm um sufixo aleatório no nome — ou seja, por ordem nenhuma. Quem procura
 * uma imagem procura quase sempre uma recente, por isso as páginas são todas
 * lidas aqui e ordenadas pela data de envio antes de seguirem para o painel.
 */

const PAGINA = 1000;
// Teto para o número de pedidos ao Blob: cada um é uma ida à rede, e o
// painel não pode ficar à espera indefinidamente se o armazenamento crescer.
const MAX_PAGINAS = 5;

const EXT_VIDEO = /\.(mp4|webm)$/i;
const EXT_IMAGEM = /\.(png|jpe?g|webp|gif|avif|svg)$/i;

export async function GET(request: NextRequest) {
  try {
    await requireEditorOrAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "O armazenamento de imagens ainda não está configurado neste projeto." },
      { status: 503 },
    );
  }

  // "image" esconde os vídeos: um campo de imagem única não os sabe mostrar.
  const apenasImagens = request.nextUrl.searchParams.get("kind") !== "media";

  try {
    const blobs = [];
    let cursor: string | undefined;

    for (let pagina = 0; pagina < MAX_PAGINAS; pagina++) {
      const resultado = await list({ limit: PAGINA, cursor });
      blobs.push(...resultado.blobs);
      if (!resultado.hasMore || !resultado.cursor) break;
      cursor = resultado.cursor;
    }

    const items = blobs
      .map((blob) => ({
        url: blob.url,
        pathname: blob.pathname,
        size: blob.size,
        uploadedAt: blob.uploadedAt,
        kind: EXT_VIDEO.test(blob.pathname) ? ("video" as const) : ("image" as const),
      }))
      // Qualquer outra coisa que esteja no armazenamento não se mostra numa
      // grelha de miniaturas e só confundiria quem está a escolher.
      .filter((item) => EXT_VIDEO.test(item.pathname) || EXT_IMAGEM.test(item.pathname))
      .filter((item) => !apenasImagens || item.kind === "image")
      .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
      .map((item) => ({ ...item, uploadedAt: item.uploadedAt.toISOString() }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error("[media] falha ao listar o Vercel Blob:", error);
    if (error instanceof BlobError) {
      return NextResponse.json({ error: `O armazenamento recusou o pedido: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ error: "Não foi possível ler a biblioteca de imagens." }, { status: 500 });
  }
}
