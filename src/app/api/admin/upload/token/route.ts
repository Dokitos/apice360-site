import { NextResponse, type NextRequest } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { requireEditorOrAdmin, UnauthorizedError } from "@/lib/permissions";

/**
 * Emite um token para o browser enviar o ficheiro directamente para o Vercel
 * Blob, sem passar por aqui.
 *
 * A rota /api/admin/upload recebe o ficheiro inteiro no corpo do pedido, e
 * uma função serverless da Vercel aceita no máximo 4,5 MB — chega para
 * fotografias, não chega para vídeo. Com o upload directo o ficheiro nunca
 * atravessa o servidor, e o limite deixa de existir.
 *
 * O que continua do lado do servidor é o que interessa: só quem tem sessão
 * de editor ou administrador recebe token, e o token só serve para os tipos
 * e o tamanho declarados abaixo.
 */

// MP4 e WebM apenas. O .mov do iPhone costuma vir em HEVC, que o Safari lê e
// o Chrome e o Firefox não — seria um vídeo que grava bem e não toca para
// metade dos visitantes. Mais vale recusar e dizer porquê.
const ALLOWED_CONTENT_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
];

const MAX_SIZE_BYTES = 100 * 1024 * 1024;

export async function POST(request: NextRequest) {
  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // Corre duas vezes por upload (pedido do token e conclusão), por isso
        // a sessão é verificada aqui e não à entrada da rota.
        await requireEditorOrAdmin();
        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: MAX_SIZE_BYTES,
          addRandomSuffix: true,
        };
      },
      // Sem efeitos: o ficheiro só entra na galeria quando o formulário for
      // gravado, para um upload abandonado não deixar lixo na página.
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("[upload/token] falha ao emitir token do Blob:", error);
    const message = error instanceof Error ? error.message : "Falha ao preparar o envio.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
