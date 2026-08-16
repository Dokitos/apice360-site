import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireEditorOrAdmin, UnauthorizedError } from "@/lib/permissions";

const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const MAX_SIZE_BYTES = 8 * 1024 * 1024;

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
    return NextResponse.json({ error: "A imagem excede o tamanho máximo de 8MB." }, { status: 400 });
  }

  try {
    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true,
    });
    return NextResponse.json({ url: blob.url });
  } catch {
    return NextResponse.json({ error: "Falha ao carregar a imagem. Tenta novamente." }, { status: 500 });
  }
}
