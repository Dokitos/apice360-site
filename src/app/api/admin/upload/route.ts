import { NextRequest, NextResponse } from "next/server";
import {
  put,
  BlobError,
  BlobAccessError,
  BlobStoreNotFoundError,
  BlobStoreSuspendedError,
} from "@vercel/blob";
import { requireEditorOrAdmin, UnauthorizedError } from "@/lib/permissions";

const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
// 4 MB e não mais: uma função serverless na Vercel recebe no máximo 4,5 MB de
// corpo, e acima disso o pedido é cortado pela plataforma antes de chegar aqui
// — o painel mostrava uma falha genérica sem dizer que o problema era o
// tamanho. Para ficheiros maiores seria preciso enviar do browser direto para
// o Blob (upload do @vercel/blob/client), que é outra conversa.
const MAX_SIZE_BYTES = 4 * 1024 * 1024;

/**
 * Assinaturas dos formatos aceites. O `file.type` é escolhido por quem envia
 * e não prova nada sobre o conteúdo — só os primeiros bytes do ficheiro é que
 * dizem o que ele é de facto.
 */
const MAGIC_NUMBERS: { ext: string; type: string; matches: (b: Uint8Array) => boolean }[] = [
  { ext: "png", type: "image/png", matches: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  { ext: "jpg", type: "image/jpeg", matches: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: "gif", type: "image/gif", matches: (b) => b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 },
  {
    ext: "webp",
    type: "image/webp",
    // "RIFF" .... "WEBP"
    matches: (b) =>
      b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
  },
];

function detectImage(bytes: Uint8Array) {
  return MAGIC_NUMBERS.find((candidate) => candidate.matches(bytes)) ?? null;
}

export async function POST(request: NextRequest) {
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
      { error: "Upload de imagens ainda não está configurado. Ative o Vercel Blob Storage no dashboard do projeto." },
      { status: 503 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Nenhum ficheiro enviado." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Formato de imagem inválido. Usa PNG, JPEG, WEBP ou GIF." },
      { status: 400 },
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "A imagem excede o tamanho máximo de 4MB." }, { status: 400 });
  }

  // O conteúdo tem de corresponder ao que foi declarado — caso contrário
  // bastava rotular qualquer ficheiro como image/png para o alojar aqui.
  const bytes = new Uint8Array(await file.arrayBuffer());
  const detected = detectImage(bytes);
  if (!detected || detected.type !== file.type) {
    return NextResponse.json(
      { error: "O ficheiro não é uma imagem válida. Usa PNG, JPEG, WEBP ou GIF." },
      { status: 400 },
    );
  }

  try {
    // O nome é derivado do formato detetado, não do que veio no pedido: um
    // nome enviado pelo cliente pode trazer "../" ou uma extensão enganadora.
    const blob = await put(`uploads/imagem.${detected.ext}`, Buffer.from(bytes), {
      access: "public",
      addRandomSuffix: true,
      contentType: detected.type,
    });
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    // Sem isto o motivo real perde-se e a única pista é um 500 genérico —
    // que não distingue um token recusado de uma falha de rede. Fica nos
    // logs da função, onde não chega a quem está a usar o painel.
    console.error("[upload] falha ao escrever no Vercel Blob:", error);

    // Os erros de configuração merecem uma mensagem própria: são os únicos
    // que quem edita o site não resolve tentando outra vez.
    if (error instanceof BlobAccessError) {
      return NextResponse.json(
        {
          error:
            "O armazenamento recusou o acesso. O BLOB_READ_WRITE_TOKEN do projeto é inválido ou pertence a outro store.",
        },
        { status: 500 },
      );
    }
    if (error instanceof BlobStoreNotFoundError) {
      return NextResponse.json(
        { error: "O armazenamento indicado no BLOB_READ_WRITE_TOKEN já não existe." },
        { status: 500 },
      );
    }
    if (error instanceof BlobStoreSuspendedError) {
      return NextResponse.json(
        { error: "O armazenamento de imagens está suspenso na Vercel." },
        { status: 500 },
      );
    }

    // Um store privado serve ficheiros só a quem está autenticado, e estas
    // imagens vão para dentro de <img> em páginas públicas. Não há aqui nada
    // a corrigir no código: o store tem de ser público.
    if (error instanceof BlobError && /private/i.test(error.message)) {
      return NextResponse.json(
        {
          error:
            "O armazenamento está configurado como privado e as imagens do site têm de ser públicas. Liga um Blob store com acesso público ao projeto na Vercel.",
        },
        { status: 500 },
      );
    }

    // Qualquer outra falha do Blob: a mensagem do SDK é curta e diz mais do
    // que "tenta novamente". Só quem edita o site chega aqui.
    if (error instanceof BlobError) {
      return NextResponse.json({ error: `O armazenamento recusou o pedido: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ error: "Falha ao carregar a imagem. Tenta novamente." }, { status: 500 });
  }
}
