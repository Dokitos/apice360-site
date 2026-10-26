import { NextResponse, type NextRequest } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { requireEditorOrAdmin, UnauthorizedError } from "@/lib/permissions";
import { recordAuditEvent } from "@/lib/audit/events";

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
  // Anexos da caixa de correio do painel. Documentos, e só estes: os
  // ficheiros ficam num endereço público, e um executável aqui era um sítio
  // conveniente para alojar o que não se quer alojar.
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
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
      onBeforeGenerateToken: async (pathname) => {
        // Corre duas vezes por upload (pedido do token e conclusão), por isso
        // a sessão é verificada aqui e não à entrada da rota.
        const actor = await requireEditorOrAdmin();
        await recordAuditEvent("UPLOAD_AUTHORIZED", actor, "Media", pathname);
        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: MAX_SIZE_BYTES,
          addRandomSuffix: true,
        };
      },
      // Completion callbacks are authenticated by the Blob SDK; no personal
      // data is sent to storage. Attribution is in the authorization event.
      onUploadCompleted: async ({ blob }) => {
        await recordAuditEvent("UPLOAD", undefined, "Media", blob.pathname);
      },
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
