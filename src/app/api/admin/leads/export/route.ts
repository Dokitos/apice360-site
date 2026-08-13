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
            ...(from ? { gte: new Date(`${from}T00:00:00`) } : {}),
            ...(to ? { lte: new Date(`${to}T23:59:59.999`) } : {}),
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

function csvEscape(value: string) {
  if (/[",\n;]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
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
        name: l.name,
        email: l.email,
        phone: l.phone ?? "",
        type: TYPE_LABEL[l.type] ?? l.type,
        status: STATUS_LABEL[l.status] ?? l.status,
        assignedTo: l.assignedTo?.name ?? "",
        sourcePage: l.sourcePage ?? "",
        locale: l.locale,
        createdAt: l.createdAt.toLocaleString("pt-PT"),
        message: l.message ?? "",
        notes: l.notes ?? "",
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
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    const done = new Promise<Buffer>((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
    });

    doc.fontSize(18).text("Ápice 360 — Relatório de Leads", { align: "left" });
    doc.moveDown(0.3);
    doc
      .fontSize(9)
      .fillColor("#666666")
      .text(`Gerado em ${new Date().toLocaleString("pt-PT")} · ${leads.length} lead(s)`);
    doc.moveDown(1);
    doc.fillColor("#000000");

    leads.forEach((lead, index) => {
      if (doc.y > 720) doc.addPage();

      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text(`${index + 1}. ${lead.name}`, { continued: true })
        .font("Helvetica")
        .fontSize(9)
        .fillColor("#666666")
        .text(`   [${TYPE_LABEL[lead.type]} · ${STATUS_LABEL[lead.status]}]`);

      doc.fillColor("#000000").fontSize(9);
      doc.text(`Email: ${lead.email}${lead.phone ? `   ·   Telefone: ${lead.phone}` : ""}`);
      doc.text(
        `Recebida: ${lead.createdAt.toLocaleString("pt-PT")}${lead.assignedTo ? `   ·   Responsável: ${lead.assignedTo.name}` : ""}${lead.sourcePage ? `   ·   Origem: ${lead.sourcePage}` : ""}`,
      );
      if (lead.message) {
        doc.fillColor("#333333").text(`Mensagem: ${lead.message}`, { width: 515 });
      }
      if (lead.notes) {
        doc.fillColor("#333333").text(`Notas: ${lead.notes}`, { width: 515 });
      }
      doc.fillColor("#000000");
      doc.moveDown(0.8);
    });

    doc.end();
    const buffer = await done;

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  return NextResponse.json({ error: "Formato inválido." }, { status: 400 });
}
