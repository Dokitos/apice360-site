/**
 * Preenche as traduções em falta (EN/ES/FR) do conteúdo já existente na base
 * de dados.
 *
 *   npx tsx scripts/backfill-translations.ts            # base local (.env)
 *   npx tsx scripts/backfill-translations.ts --prod     # base de produção (.env.production.local)
 *   npx tsx scripts/backfill-translations.ts --dry-run  # só relatório, não escreve
 *
 * Porquê é preciso: o conteúdo do site foi criado quando só existiam PT e EN.
 * A tradução automática (src/lib/auto-translate.ts) só corre quando alguém
 * grava o formulário no admin, por isso as linhas antigas nunca ganharam
 * ES/FR e o site caía de volta para PT nesses idiomas.
 *
 * Duas fontes de tradução, por esta ordem:
 *   1. scripts/translation-memory.json — traduções revistas à mão, indexadas
 *      pelo texto PT de origem. Cobre todo o conteúdo que existia quando o
 *      ficheiro foi gerado e é o que dá resultados imediatos sem chave DeepL.
 *   2. DeepL, se DEEPL_API_KEY estiver definida — apanha o que for novo.
 *
 * Regras de segurança:
 *   - Nunca toca numa linha que já exista. Só cria as que faltam.
 *   - Escreve isAutoTranslated: true, para que o admin continue a poder
 *     substituir o texto à mão (e a partir daí a linha fica intocável).
 *   - O que não conseguir traduzir aparece no relatório final, em vez de
 *     ser gravado a meio ou em PT.
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { config as loadEnv } from "dotenv";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { translateTexts } from "../src/lib/translate";
import { slugify } from "../src/lib/slugify";

type Locale = "PT" | "EN" | "ES" | "FR";
const TARGET_LOCALES = ["EN", "ES", "FR"] as const;
type TargetLocale = (typeof TARGET_LOCALES)[number];

const args = new Set(process.argv.slice(2));
const isProd = args.has("--prod");
const isDryRun = args.has("--dry-run");

if (isProd) {
  // Sobrepõe o DATABASE_URL de .env pelo de produção.
  loadEnv({ path: ".env.production.local", override: true });
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const memory: Record<string, Partial<Record<TargetLocale, string>>> = JSON.parse(
  fs.readFileSync(path.join(import.meta.dirname, "translation-memory.json"), "utf8"),
);

type FieldSpec = {
  name: string;
  /** Coluna NOT NULL: sem tradução para ela, a linha inteira não pode ser criada. */
  required?: boolean;
  isHtml?: boolean;
  /** Derivada de outro campo em vez de traduzida (slugs). */
  slugOf?: string;
};

type TableSpec = {
  table: string;
  parentColumn: string;
  fields: FieldSpec[];
};

const TABLES: TableSpec[] = [
  {
    table: "PageSectionTranslation",
    parentColumn: "sectionId",
    fields: [
      { name: "eyebrow" },
      { name: "heading" },
      { name: "subheading" },
      { name: "body", isHtml: true },
      { name: "ctaLabel" },
    ],
  },
  {
    table: "PageSectionItemTranslation",
    parentColumn: "itemId",
    fields: [{ name: "title", required: true }, { name: "body" }],
  },
  {
    table: "ServiceTranslation",
    parentColumn: "serviceId",
    fields: [
      { name: "cardLabel", required: true },
      { name: "title", required: true },
      { name: "intro", required: true },
    ],
  },
  {
    table: "ServiceFeatureTranslation",
    parentColumn: "featureId",
    fields: [{ name: "title", required: true }, { name: "body" }],
  },
  { table: "CtaTranslation", parentColumn: "ctaId", fields: [{ name: "label", required: true }] },
  { table: "StatTranslation", parentColumn: "statId", fields: [{ name: "label", required: true }] },
  {
    table: "PageSeoTranslation",
    parentColumn: "pageSeoId",
    fields: [{ name: "title", required: true }, { name: "description", required: true }],
  },
  {
    table: "SiteSettingsTranslation",
    parentColumn: "siteSettingsId",
    fields: [
      { name: "footerDescription" },
      { name: "showroomText" },
      { name: "defaultSeoTitle" },
      { name: "defaultSeoDescription" },
    ],
  },
  {
    table: "ProjectTranslation",
    parentColumn: "projectId",
    fields: [
      { name: "title", required: true },
      { name: "shortDescription" },
      { name: "challenge" },
      { name: "methodology" },
      { name: "result" },
      { name: "testimonialQuote" },
    ],
  },
  {
    table: "BlogPostTranslation",
    parentColumn: "postId",
    fields: [
      { name: "title", required: true },
      { name: "slug", required: true, slugOf: "title" },
      { name: "excerpt" },
      { name: "bodyHtml", required: true, isHtml: true },
      { name: "seoTitle" },
      { name: "seoDescription" },
    ],
  },
  {
    table: "BlogCategoryTranslation",
    parentColumn: "categoryId",
    fields: [{ name: "name", required: true }, { name: "slug", required: true, slugOf: "name" }],
  },
  { table: "TestimonialTranslation", parentColumn: "testimonialId", fields: [{ name: "quote", required: true }] },
  {
    table: "CustomPageTranslation",
    parentColumn: "customPageId",
    fields: [
      { name: "navLabel", required: true },
      { name: "heading" },
      { name: "seoTitle" },
      { name: "seoDescription" },
    ],
  },
  {
    table: "LpPriceTierTranslation",
    parentColumn: "tierId",
    fields: [{ name: "label", required: true }, { name: "description" }, { name: "features" }],
  },
];

const unresolved: { table: string; locale: string; field: string; text: string }[] = [];
let created = 0;
let skipped = 0;

/** Traduz um texto: primeiro a memória revista à mão, depois a DeepL. */
async function translate(text: string, locale: TargetLocale, isHtml: boolean): Promise<string | null> {
  const remembered = memory[text]?.[locale];
  if (remembered) return remembered;

  if (!process.env.DEEPL_API_KEY) return null;
  const result = await translateTexts([text], locale, { isHtml });
  return result.ok ? (result.texts[0] ?? null) : null;
}

/** Slugs de blog têm de ser únicos por idioma — junta um sufixo se já existir. */
async function uniqueSlug(table: string, base: string, locale: Locale): Promise<string> {
  let candidate = base || "artigo";
  for (let attempt = 2; attempt < 50; attempt += 1) {
    const clash = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
      `SELECT count(*) FROM "${table}" WHERE locale = $1::"Locale" AND slug = $2`,
      locale,
      candidate,
    );
    if (Number(clash[0]?.count ?? 0) === 0) return candidate;
    candidate = `${base}-${attempt}`;
  }
  return `${base}-${Date.now()}`;
}

async function backfillTable(spec: TableSpec) {
  const columns = spec.fields.map((f) => `"${f.name}"`).join(", ");
  const ptRows = await prisma.$queryRawUnsafe<Record<string, string | null>[]>(
    `SELECT "${spec.parentColumn}" AS parent_id, ${columns} FROM "${spec.table}" WHERE locale = 'PT'`,
  );

  const existing = await prisma.$queryRawUnsafe<{ parent_id: string; locale: string }[]>(
    `SELECT "${spec.parentColumn}" AS parent_id, locale::text AS locale FROM "${spec.table}" WHERE locale <> 'PT'`,
  );
  const alreadyThere = new Set(existing.map((r) => `${r.parent_id}:${r.locale}`));

  for (const row of ptRows) {
    const parentId = row.parent_id as string;

    for (const locale of TARGET_LOCALES) {
      if (alreadyThere.has(`${parentId}:${locale}`)) {
        skipped += 1;
        continue;
      }

      const values: Record<string, string | null> = {};
      let missingRequired = false;

      // Primeiro os campos traduzidos; os slugs derivam deles a seguir.
      for (const field of spec.fields.filter((f) => !f.slugOf)) {
        const source = row[field.name];
        if (!source || !source.trim()) {
          values[field.name] = null;
          if (field.required) missingRequired = true;
          continue;
        }
        const translated = await translate(source, locale, Boolean(field.isHtml));
        if (!translated) {
          unresolved.push({ table: spec.table, locale, field: field.name, text: source.slice(0, 80) });
          values[field.name] = null;
          if (field.required) missingRequired = true;
          continue;
        }
        values[field.name] = translated;
      }

      for (const field of spec.fields.filter((f) => f.slugOf)) {
        const from = values[field.slugOf as string];
        values[field.name] = from ? await uniqueSlug(spec.table, slugify(from), locale) : null;
        if (field.required && !values[field.name]) missingRequired = true;
      }

      if (missingRequired) continue;

      if (!isDryRun) {
        const fieldNames = spec.fields.map((f) => f.name);
        const placeholders = fieldNames.map((_, i) => `$${i + 4}`).join(", ");
        await prisma.$executeRawUnsafe(
          `INSERT INTO "${spec.table}" (id, "${spec.parentColumn}", locale, "isAutoTranslated", ${fieldNames
            .map((n) => `"${n}"`)
            .join(", ")})
           VALUES ($1, $2, $3::"Locale", true, ${placeholders})`,
          crypto.randomUUID(),
          parentId,
          locale,
          ...fieldNames.map((n) => values[n]),
        );
      }
      created += 1;
    }
  }
}

async function main() {
  console.log(
    `Base: ${isProd ? "PRODUÇÃO" : "local"} · DeepL: ${process.env.DEEPL_API_KEY ? "ativa" : "não configurada (só memória)"}${
      isDryRun ? " · DRY RUN" : ""
    }\n`,
  );

  for (const spec of TABLES) {
    const before = created;
    try {
      await backfillTable(spec);
    } catch (error) {
      console.error(`  ${spec.table}: erro —`, (error as Error).message);
      continue;
    }
    console.log(`  ${spec.table.padEnd(30)} +${created - before}`);
  }

  console.log(`\n${isDryRun ? "Seriam criadas" : "Criadas"} ${created} traduções (${skipped} já existiam).`);

  if (unresolved.length > 0) {
    // Agrupa por texto: o mesmo texto costuma falhar nos três idiomas.
    const byText = new Map<string, string[]>();
    for (const item of unresolved) {
      const key = `${item.table}.${item.field}: ${item.text}`;
      byText.set(key, [...(byText.get(key) ?? []), item.locale]);
    }
    console.log(`\nSem tradução (${byText.size} textos) — traduz no admin ou define DEEPL_API_KEY:`);
    for (const [text, locales] of byText) console.log(`  [${locales.join("/")}] ${text}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
