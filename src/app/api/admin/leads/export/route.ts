import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const TYPE_LABEL: Record<string, string> = {
  CONTACT: "Contacto",
  BUDGET: "Orçamento",
  ARCHITECT_PARTNERSHIP: "Parceria Arquiteto",
};

const STATUS_LABEL: Record<string, string> = {
  NEW: "Novo",
  CONTACTED: "Contactado",
  QUALIFIED: "Qualificado",
  WON: "Ganho",
  LOST: "Perdido",
};

// Brand palette, mirrored from the admin UI's STATUS_CLASS/TYPE_BADGE tailwind
// classes so the PDF export reads consistently with the on-screen leads table.
const BRAND_ORANGE = "#ff6a13";
const BRAND_ORANGE_DEEP = "#d9540c";
const BRAND_INK = "#0f0f0f";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  NEW: { bg: "#ffe8d9", text: BRAND_ORANGE_DEEP },
  CONTACTED: { bg: "#dbeafe", text: "#2563eb" },
  QUALIFIED: { bg: "#fef3c7", text: "#b45309" },
  WON: { bg: "#d1fae5", text: "#059669" },
  LOST: { bg: "#fee2e2", text: "#dc2626" },
};

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  CONTACT: { bg: "#e9e9e9", text: "#404040" },
  BUDGET: { bg: "#ffe8d9", text: BRAND_ORANGE_DEEP },
  ARCHITECT_PARTNERSHIP: { bg: "#ededed", text: "#555555" },
};

// --- PDF export -------------------------------------------------------

const PAGE_MARGIN = 40;
const PAGE_WIDTH = 595.28; // A4 in points
const PAGE_HEIGHT = 841.89;
const HEADER_HEIGHT = 100;
const FOOTER_RESERVED = 65;
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;
const BLOCK_PADDING = 12;
const INNER_WIDTH = CONTENT_WIDTH - BLOCK_PADDING * 2;
const PILL_WIDTH = 95;
const PILL_GAP = 8;
const NAME_AREA_WIDTH = INNER_WIDTH - (PILL_WIDTH * 2 + PILL_GAP + 10);

const COMPANY_NAME = "Ápice 360";
const COMPANY_ADDRESS = "Rua Bento Gonçalves, 62, Seixal, Portugal";
const COMPANY_PHONE = "+351 924 107 846";

type PdfLead = {
  refNumber: number;
  name: string;
  email: string;
  phone: string | null;
  type: string;
  status: string;
  message: string | null;
  notes: string | null;
  sourcePage: string | null;
  createdAt: Date;
  assignedTo: { name: string } | null;
};

function pdfPill(
  doc: PDFKit.PDFDocument,
  label: string,
  x: number,
  y: number,
  width: number,
  colors: { bg: string; text: string },
) {
  doc.roundedRect(x, y, width, 15, 7.5).fill(colors.bg);
  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .fillColor(colors.text)
    .text(label, x, y + 4, { width, align: "center", lineBreak: false });
}

function measureLeadBlock(doc: PDFKit.PDFDocument, lead: PdfLead): number {
  doc.font("Helvetica-Bold").fontSize(12);
  const nameHeight = Math.max(15, doc.heightOfString(`#${lead.refNumber}  ${lead.name}`, { width: NAME_AREA_WIDTH }));

  let height = BLOCK_PADDING + nameHeight + 6;
  height += 14; // contact line
  if (lead.assignedTo || lead.sourcePage) height += 13;

  if (lead.message) {
    doc.font("Helvetica").fontSize(9);
    height += 15 + doc.heightOfString(lead.message, { width: INNER_WIDTH }) + 4;
  }
  if (lead.notes) {
    doc.font("Helvetica").fontSize(9);
    height += 15 + doc.heightOfString(lead.notes, { width: INNER_WIDTH }) + 4;
  }
  height += BLOCK_PADDING;
  return height;
}

function drawLeadBlock(doc: PDFKit.PDFDocument, lead: PdfLead, top: number, blockHeight: number) {
  const left = PAGE_MARGIN;
  const textLeft = left + BLOCK_PADDING;

  doc.roundedRect(left, top, CONTENT_WIDTH, blockHeight, 5).fillAndStroke("#fafafa", "#e5e5e5");

  let cursorY = top + BLOCK_PADDING;

  doc.font("Helvetica-Bold").fontSize(12).fillColor(BRAND_INK);
  const nameHeight = Math.max(15, doc.heightOfString(`#${lead.refNumber}  ${lead.name}`, { width: NAME_AREA_WIDTH }));
  doc.text(`#${lead.refNumber}  ${lead.name}`, textLeft, cursorY, { width: NAME_AREA_WIDTH });

  const typeColors = TYPE_COLORS[lead.type] ?? TYPE_COLORS.CONTACT;
  const typeLabel = TYPE_LABEL[lead.type] ?? lead.type;
  const statusColors = STATUS_COLORS[lead.status] ?? STATUS_COLORS.NEW;
  const statusLabel = STATUS_LABEL[lead.status] ?? lead.status;
  const statusPillX = left + CONTENT_WIDTH - BLOCK_PADDING - PILL_WIDTH;
  const typePillX = statusPillX - PILL_WIDTH - PILL_GAP;
  pdfPill(doc, typeLabel, typePillX, cursorY, PILL_WIDTH, typeColors);
  pdfPill(doc, statusLabel, statusPillX, cursorY, PILL_WIDTH, statusColors);

  cursorY += nameHeight + 6;

  doc.font("Helvetica").fontSize(9).fillColor("#333333");
  const contactParts = [`Email: ${lead.email}`];
  if (lead.phone) contactParts.push(`Telefone: ${lead.phone}`);
  doc.text(contactParts.join("   ·   "), textLeft, cursorY, { width: INNER_WIDTH });
  cursorY += 14;

  if (lead.assignedTo || lead.sourcePage) {
    doc.font("Helvetica").fontSize(8).fillColor("#666666");
    const metaParts = [`Recebida: ${lead.createdAt.toLocaleString("pt-PT")}`];
    if (lead.assignedTo) metaParts.push(`Responsável: ${lead.assignedTo.name}`);
    if (lead.sourcePage) metaParts.push(`Origem: ${lead.sourcePage}`);
    doc.text(metaParts.join("   ·   "), textLeft, cursorY, { width: INNER_WIDTH });
    cursorY += 13;
  }

  if (lead.message) {
    doc.font("Helvetica-Bold").fontSize(8).fillColor("#555555").text("MENSAGEM", textLeft, cursorY, { width: INNER_WIDTH });
    cursorY += 11;
    doc.font("Helvetica").fontSize(9).fillColor("#222222");
    doc.text(lead.message, textLeft, cursorY, { width: INNER_WIDTH });
    cursorY += doc.heightOfString(lead.message, { width: INNER_WIDTH }) + 4;
  }

  if (lead.notes) {
    doc.font("Helvetica-Bold").fontSize(8).fillColor("#555555").text("NOTAS INTERNAS", textLeft, cursorY, { width: INNER_WIDTH });
    cursorY += 11;
    doc.font("Helvetica-Oblique").fontSize(9).fillColor("#444444");
    doc.text(lead.notes, textLeft, cursorY, { width: INNER_WIDTH });
    cursorY += doc.heightOfString(lead.notes, { width: INNER_WIDTH }) + 4;
  }

  doc.fillColor(BRAND_INK);
}

function drawPdfHeader(doc: PDFKit.PDFDocument, isFirstPage: boolean, generatedAt: string, leadCount: number) {
  doc.rect(0, 0, PAGE_WIDTH, HEADER_HEIGHT).fill(BRAND_ORANGE);

  const logoPath = path.join(process.cwd(), "public/images/logo.png");
  try {
    doc.image(logoPath, PAGE_MARGIN, 22, { width: 56, height: 56 });
  } catch {
    // Logo missing on disk — fall back to text-only header rather than failing the export.
  }

  const textX = PAGE_MARGIN + 72;
  const textWidth = CONTENT_WIDTH - 72;
  doc
    .font("Helvetica-Bold")
    .fontSize(18)
    .fillColor("#ffffff")
    .text("Ápice 360 — Relatório de Leads", textX, isFirstPage ? 26 : 40, { width: textWidth });

  if (isFirstPage) {
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#ffe8d9")
      .text(`Gerado em ${generatedAt} · ${leadCount} lead(s)`, textX, 54, { width: textWidth });
  }

  doc.fillColor(BRAND_INK);
  doc.x = PAGE_MARGIN;
  doc.y = HEADER_HEIGHT + 20;
}

function drawPdfFooter(doc: PDFKit.PDFDocument, pageNum: number, pageCount: number) {
  const lineY = PAGE_HEIGHT - FOOTER_RESERVED + 8;

  // The footer is drawn inside the page's reserved bottom margin by design.
  // pdfkit's .text() auto-paginates when a draw position falls past
  // page.maxY() (derived from margins.bottom) even with explicit x/y
  // coordinates — silently inserting a blank extra page. Zero the bottom
  // margin for the duration of this draw so it stays on the current page.
  const originalBottomMargin = doc.page.margins.bottom;
  doc.page.margins.bottom = 0;

  doc
    .moveTo(PAGE_MARGIN, lineY)
    .lineTo(PAGE_WIDTH - PAGE_MARGIN, lineY)
    .lineWidth(0.5)
    .strokeColor("#e5d5c8")
    .stroke();

  const textY = lineY + 10;
  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#777777")
    .text(`${COMPANY_NAME} · ${COMPANY_ADDRESS} · ${COMPANY_PHONE}`, PAGE_MARGIN, textY, {
      width: CONTENT_WIDTH - 120,
      lineBreak: false,
    });
  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#777777")
    .text(`Página ${pageNum} de ${pageCount}`, PAGE_WIDTH - PAGE_MARGIN - 120, textY, {
      width: 120,
      align: "right",
      lineBreak: false,
    });
  doc.fillColor(BRAND_INK);

  doc.page.margins.bottom = originalBottomMargin;
}

async function buildLeadsPdf(leads: PdfLead[]): Promise<Buffer> {
  const doc = new PDFDocument({
    size: "A4",
    autoFirstPage: false,
    bufferPages: true,
    margins: { top: HEADER_HEIGHT + 20, bottom: FOOTER_RESERVED, left: PAGE_MARGIN, right: PAGE_MARGIN },
  });

  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  const generatedAt = new Date().toLocaleString("pt-PT");
  let pageIndex = 0;

  function newPage() {
    doc.addPage();
    pageIndex += 1;
    drawPdfHeader(doc, pageIndex === 1, generatedAt, leads.length);
  }

  newPage();

  if (leads.length === 0) {
    doc.font("Helvetica").fontSize(11).fillColor("#666666").text("Sem leads para os filtros selecionados.");
  }

  for (const lead of leads) {
    const blockHeight = measureLeadBlock(doc, lead);
    if (doc.y + blockHeight > PAGE_HEIGHT - FOOTER_RESERVED) {
      newPage();
    }
    const top = doc.y;
    drawLeadBlock(doc, lead, top, blockHeight);
    doc.x = PAGE_MARGIN;
    doc.y = top + blockHeight + 10;
  }

  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(range.start + i);
    drawPdfFooter(doc, i + 1, range.count);
  }

  doc.end();
  return done;
}

function buildWhere(searchParams: URLSearchParams) {
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const q = searchParams.get("q")?.trim();
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  return {
    ...(type && type !== "ALL" ? { type: type as "CONTACT" | "BUDGET" | "ARCHITECT_PARTNERSHIP" } : {}),
    ...(status && status !== "ALL"
      ? { status: status as "NEW" | "CONTACTED" | "QUALIFIED" | "WON" | "LOST" }
      : {}),
    ...(from || to
      ? {
          createdAt: {
            ...(from && !Number.isNaN(Date.parse(`${from}T00:00:00`))
              ? { gte: new Date(`${from}T00:00:00`) }
              : {}),
            ...(to && !Number.isNaN(Date.parse(`${to}T23:59:59.999`))
              ? { lte: new Date(`${to}T23:59:59.999`) }
              : {}),
          },
        }
      : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
            { phone: { contains: q, mode: "insensitive" as const } },
            { message: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
}

// Leads originate from public, unauthenticated submissions — a value like
// `=HYPERLINK("http://evil","x")` would be evaluated as a formula by
// Excel/LibreOffice/Sheets when staff open the export. Prefix any value
// that could be interpreted as a formula with an apostrophe to force it to
// be read as plain text (CWE-1236).
function neutralizeFormula(value: string) {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

function csvEscape(value: string) {
  const safe = neutralizeFormula(value);
  if (/[",\n;]/.test(safe)) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const format = searchParams.get("format") ?? "csv";
  const where = buildWhere(searchParams);

  const leads = await prisma.leadSubmission.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { assignedTo: { select: { name: true } } },
  });

  const stamp = new Date().toISOString().slice(0, 10);
  const filename = `leads-apice360-${stamp}.${format === "xlsx" ? "xlsx" : format}`;

  if (format === "csv") {
    const headers = [
      "Nome",
      "Email",
      "Telefone",
      "Tipo",
      "Estado",
      "Responsável",
      "Origem",
      "Idioma",
      "Data",
      "Mensagem",
      "Notas",
    ];
    const rows = leads.map((l) =>
      [
        l.name,
        l.email,
        l.phone ?? "",
        TYPE_LABEL[l.type] ?? l.type,
        STATUS_LABEL[l.status] ?? l.status,
        l.assignedTo?.name ?? "",
        l.sourcePage ?? "",
        l.locale,
        l.createdAt.toISOString(),
        l.message ?? "",
        l.notes ?? "",
      ]
        .map((v) => csvEscape(String(v)))
        .join(","),
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const body = `﻿${csv}`;

    return new NextResponse(body, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  if (format === "xlsx") {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Ápice 360";
    workbook.created = new Date();
    const sheet = workbook.addWorksheet("Leads");

    sheet.columns = [
      { header: "Nome", key: "name", width: 26 },
      { header: "Email", key: "email", width: 30 },
      { header: "Telefone", key: "phone", width: 16 },
      { header: "Tipo", key: "type", width: 18 },
      { header: "Estado", key: "status", width: 14 },
      { header: "Responsável", key: "assignedTo", width: 18 },
      { header: "Origem", key: "sourcePage", width: 20 },
      { header: "Idioma", key: "locale", width: 8 },
      { header: "Data", key: "createdAt", width: 18 },
      { header: "Mensagem", key: "message", width: 40 },
      { header: "Notas", key: "notes", width: 40 },
    ];

    for (const l of leads) {
      sheet.addRow({
        name: neutralizeFormula(l.name),
        email: neutralizeFormula(l.email),
        phone: neutralizeFormula(l.phone ?? ""),
        type: TYPE_LABEL[l.type] ?? l.type,
        status: STATUS_LABEL[l.status] ?? l.status,
        assignedTo: l.assignedTo?.name ?? "",
        sourcePage: neutralizeFormula(l.sourcePage ?? ""),
        locale: l.locale,
        createdAt: l.createdAt.toLocaleString("pt-PT"),
        message: neutralizeFormula(l.message ?? ""),
        notes: neutralizeFormula(l.notes ?? ""),
      });
    }

    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEFEFEF" } };
    sheet.autoFilter = { from: "A1", to: "K1" };
    sheet.views = [{ state: "frozen", ySplit: 1 }];

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  if (format === "pdf") {
    const buffer = await buildLeadsPdf(leads);

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  return NextResponse.json({ error: "Formato inválido." }, { status: 400 });
}
